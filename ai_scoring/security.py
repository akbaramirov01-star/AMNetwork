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
    # A malformed env var must not take the whole app down at import time —
    # fail back to the default (and log it) rather than crash the process
    # over a deploy-time typo in one rate-limit knob.
    raw = os.environ.get(name)
    if raw is None:
        return default
    try:
        value = int(raw)
        if value < 1:
            raise ValueError(f"{name} must be positive")
        return value
    except ValueError:
        import logging
        logging.getLogger(__name__).error(
            "invalid %s=%r, falling back to default %r", name, raw, default)
        return default


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
    """Identify the caller for rate-limiting purposes.

    Never accept an arbitrary leftmost X-Forwarded-For — a client can write
    anything there and mint itself a fresh limit bucket per request. Two
    trustworthy ways to find the real caller:

    * TRUSTED_PROXY_CIDRS — walk in from the right while the hop is one of
      our own proxies. Strictest, needs the proxy's ranges.
    * TRUSTED_PROXY_HOPS — count hops from the right instead. Each proxy
      appends the address it actually saw, so with exactly one reverse proxy
      in front (Render, and most PaaS) the rightmost entry is the one that
      proxy wrote, and a client cannot forge it.

    Defaults to 0 — trusting nothing — because a direct-to-internet
    deployment must not let callers forge their own identity. The Dockerfile
    sets TRUSTED_PROXY_HOPS=1, since that image only ever runs behind
    Render's proxy, where request.remote_addr is the same edge address for
    every visitor on earth and would otherwise put the whole internet in one
    per-client quota.
    """
    peer = request.remote_addr or "unknown"
    networks = [ipaddress.ip_network(c.strip()) for c in
                os.environ.get("TRUSTED_PROXY_CIDRS", "").split(",") if c.strip()]
    chain = [v.strip() for v in request.headers.get("X-Forwarded-For", "").split(",") if v.strip()]

    def trusted(value):
        try:
            ip = ipaddress.ip_address(value)
            return any(ip in network for network in networks)
        except ValueError:
            return False

    if networks:
        if trusted(peer):
            for value in reversed(chain):
                if not trusted(value):
                    break
                peer = value
        return peer

    hops = int(os.environ.get("TRUSTED_PROXY_HOPS", "0"))
    if hops > 0 and chain:
        # hops=1 -> chain[-1], the address our own proxy observed.
        return chain[-min(hops, len(chain))]
    return peer


budget = RequestBudget()
import threading
_in_flight = threading.BoundedSemaphore(setting("AI_MAX_CONCURRENT", 3))


class CheapLimiter:
    """A free-but-not-unlimited gate for routes that can be served without
    calling a paid API (e.g. a translation already in cache).

    Those must not spend the AI budget, but they still cost CPU and a SQLite
    read, and this service runs one worker with eight threads — so left
    completely open they are a way to starve /chat and /health. In-process
    and approximate on purpose: it only has to stop a flood, and there is a
    single worker.
    """

    def __init__(self, per_minute):
        self.per_minute = per_minute
        self._lock = threading.Lock()
        self._buckets = {}  # client -> (minute, count)

    def allow(self, client):
        minute = int(time.time() // 60)
        with self._lock:
            if len(self._buckets) > 10000:  # bound memory against IP churn
                self._buckets = {k: v for k, v in self._buckets.items() if v[0] == minute}
            slot, count = self._buckets.get(client, (minute, 0))
            if slot != minute:
                slot, count = minute, 0
            if count >= self.per_minute:
                return False
            self._buckets[client] = (slot, count + 1)
            return True


cheap_limiter = CheapLimiter(setting("CHEAP_PER_MINUTE", 60))


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
