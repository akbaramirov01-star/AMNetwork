"""Atomic, fail-closed request budgets for one deployment / shared SQLite file.

No prompts or raw IP addresses are stored. For multiple service instances use a
shared limiter before scaling; an ephemeral filesystem resets on replacement.
"""
from contextlib import closing
from functools import wraps
import hashlib
import ipaddress
import os
import sqlite3
import tempfile
import time
import uuid

from flask import jsonify, request


def setting(name, default):
    value = int(os.environ.get(name, default))
    if value < 1:
        raise ValueError(f"{name} must be positive")
    return value


class RequestBudget:
    def __init__(self, path=None):
        self.path = path or os.environ.get(
            "SECURITY_DB_PATH", os.path.join(tempfile.gettempdir(), "amnetwork-limits.sqlite3"))
        self.daily = setting("AI_DAILY_LIMIT", 200)
        self.minute = setting("AI_GLOBAL_PER_MINUTE", 30)
        self.client_minute = setting("AI_CLIENT_PER_MINUTE", 6)
        self.client_hour = setting("AI_CLIENT_PER_HOUR", 60)
        self.concurrent = setting("AI_MAX_CONCURRENT", 3)
        with closing(self.connect()) as db:
            db.execute("CREATE TABLE IF NOT EXISTS counters (key TEXT PRIMARY KEY, n INTEGER NOT NULL, expires INTEGER NOT NULL)")
            db.execute("CREATE TABLE IF NOT EXISTS leases (id TEXT PRIMARY KEY, expires INTEGER NOT NULL)")

    def connect(self):
        return sqlite3.connect(self.path, timeout=2, isolation_level=None)

    def acquire(self, client, now=None):
        now = int(time.time() if now is None else now)
        # Group IPv6 addresses by /64 to prevent trivial privacy-address rotation.
        try:
            address = ipaddress.ip_address(client)
            if address.version == 6:
                client = str(ipaddress.ip_network(f"{address}/64", strict=False))
        except ValueError:
            client = "unknown"
        digest = hashlib.sha256(client.encode()).hexdigest()
        rules = [("global-day", 86400, self.daily), ("global-minute", 60, self.minute),
                 ("client-minute:" + digest, 60, self.client_minute),
                 ("client-hour:" + digest, 3600, self.client_hour)]
        with closing(self.connect()) as db:
            db.execute("BEGIN IMMEDIATE")
            db.execute("DELETE FROM counters WHERE expires <= ?", (now,))
            db.execute("DELETE FROM leases WHERE expires <= ?", (now,))
            counters = []
            for name, window, limit in rules:
                key = f"{name}:{now // window}"
                expires = (now // window + 1) * window
                row = db.execute("SELECT n FROM counters WHERE key = ?", (key,)).fetchone()
                if row and row[0] >= limit:
                    db.rollback()
                    return None, max(1, expires - now)
                counters.append((key, expires))
            if db.execute("SELECT COUNT(*) FROM leases").fetchone()[0] >= self.concurrent:
                db.rollback()
                return None, 5
            for key, expires in counters:
                db.execute("INSERT INTO counters VALUES (?, 1, ?) ON CONFLICT(key) DO UPDATE SET n=n+1", (key, expires))
            lease = uuid.uuid4().hex
            # Reclaim abandoned reservations after a worker crash. The SDK's
            # network timeout is 25s; the fixed production worker also has a
            # process-local semaphore so lease expiry cannot add live threads.
            db.execute("INSERT INTO leases VALUES (?, ?)", (lease, now + 90))
            db.commit()
            return lease, 0

    def release(self, lease):
        with closing(self.connect()) as db:
            db.execute("DELETE FROM leases WHERE id = ?", (lease,))


def client_address():
    """Trust forwarded addresses only from explicitly configured proxy networks.

    Defaults to socket address, conservatively sharing a limit behind a proxy.
    Walk from the trusted side; never accept arbitrary leftmost X-Forwarded-For.
    """
    peer = request.remote_addr or "unknown"
    networks = [ipaddress.ip_network(c.strip()) for c in
                os.environ.get("TRUSTED_PROXY_CIDRS", "").split(",") if c.strip()]

    def trusted(value):
        try:
            ip = ipaddress.ip_address(value)
            return any(ip in network for network in networks)
        except ValueError:
            return False

    if networks and trusted(peer):
        chain = request.headers.get("X-Forwarded-For", "").split(",")
        for value in reversed(chain):
            if not trusted(peer):
                break
            peer = value.strip()
    return peer


budget = RequestBudget()
import threading
_in_flight = threading.BoundedSemaphore(setting("AI_MAX_CONCURRENT", 3))


def limited_ai(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        if os.environ.get("AI_ENABLED", "true").lower() != "true":
            return jsonify(error="AI temporarily unavailable"), 503
        if not _in_flight.acquire(blocking=False):
            response = jsonify(error="AI busy. Please try again later.", retry_after=5)
            response.status_code = 429
            response.headers["Retry-After"] = "5"
            return response
        try:
            lease, retry = budget.acquire(client_address())
        except (sqlite3.Error, ValueError):
            _in_flight.release()
            # A broken limiter must never turn into unlimited billable requests.
            return jsonify(error="AI temporarily unavailable"), 503
        if not lease:
            _in_flight.release()
            response = jsonify(error="Too many requests. Please try again later.", retry_after=retry)
            response.status_code = 429
            response.headers["Retry-After"] = str(retry)
            return response
        try:
            return view(*args, **kwargs)
        finally:
            _in_flight.release()
            try:
                budget.release(lease)
            except sqlite3.Error:
                pass  # Lease expires; never retry a paid operation here.
    return wrapped
