"""Web Push subscriptions, stored per device.

Deliberately minimal about what it keeps: the endpoint URL and keys the
browser hands us, which reminders the person asked for, and their UTC
offset so a "Friday afternoon" reminder lands on their Friday afternoon
rather than ours. No account, no name, no location, no history.

Same ephemeral-disk caveat as the rest of this service: point
PUSH_DB_PATH at a Render persistent disk, or subscriptions are lost on
redeploy and people quietly stop receiving what they signed up for.
"""
from __future__ import annotations
import json
import os
import sqlite3
import tempfile
import time
from contextlib import closing

VALID_KINDS = {"jumua"}  # room to grow (ramadan, …) without a schema change


class PushStore:
    def __init__(self, path=None):
        self.path = path or os.environ.get(
            "PUSH_DB_PATH", os.path.join(tempfile.gettempdir(), "amnetwork-push.sqlite3"))
        with closing(self._connect()) as db:
            db.execute("""CREATE TABLE IF NOT EXISTS subscriptions (
                endpoint TEXT PRIMARY KEY,
                subscription TEXT NOT NULL,
                kinds TEXT NOT NULL,
                utc_offset INTEGER NOT NULL,
                lang TEXT NOT NULL DEFAULT 'en',
                created INTEGER NOT NULL,
                last_sent INTEGER NOT NULL DEFAULT 0
            )""")

    def _connect(self):
        return sqlite3.connect(self.path, timeout=5, isolation_level=None)

    def save(self, subscription: dict, kinds: list[str], utc_offset: int, lang: str) -> None:
        endpoint = subscription.get("endpoint")
        if not endpoint:
            raise ValueError("subscription has no endpoint")
        kinds = sorted({k for k in kinds if k in VALID_KINDS})
        if not kinds:
            raise ValueError("no valid reminder kinds")
        with closing(self._connect()) as db:
            db.execute(
                "INSERT INTO subscriptions (endpoint, subscription, kinds, utc_offset, lang, created)"
                " VALUES (?,?,?,?,?,?)"
                " ON CONFLICT(endpoint) DO UPDATE SET subscription=excluded.subscription,"
                " kinds=excluded.kinds, utc_offset=excluded.utc_offset, lang=excluded.lang",
                (endpoint, json.dumps(subscription), ",".join(kinds), int(utc_offset), lang, int(time.time())),
            )

    def delete(self, endpoint: str) -> None:
        with closing(self._connect()) as db:
            db.execute("DELETE FROM subscriptions WHERE endpoint = ?", (endpoint,))

    def due(self, kind: str, local_hour: int, weekday: int | None, now: int | None = None) -> list[dict]:
        """Subscriptions whose *local* clock is at local_hour right now, and —
        when weekday is given — whose local date falls on that weekday
        (0=Monday, as per time.gmtime's tm_wday). Skips anyone already sent
        to in the last 12 hours so a retried cron run cannot double-send."""
        now = int(time.time() if now is None else now)
        out = []
        with closing(self._connect()) as db:
            rows = db.execute(
                "SELECT endpoint, subscription, utc_offset, lang FROM subscriptions"
                " WHERE kinds LIKE ? AND last_sent < ?",
                (f"%{kind}%", now - 12 * 3600),
            ).fetchall()
        for endpoint, sub, offset, lang in rows:
            local = time.gmtime(now + offset * 60)
            if local.tm_hour != local_hour:
                continue
            if weekday is not None and local.tm_wday != weekday:
                continue
            out.append({"endpoint": endpoint, "subscription": json.loads(sub), "lang": lang})
        return out

    def mark_sent(self, endpoints: list[str], now: int | None = None) -> None:
        if not endpoints:
            return
        now = int(time.time() if now is None else now)
        with closing(self._connect()) as db:
            db.executemany("UPDATE subscriptions SET last_sent = ? WHERE endpoint = ?",
                           [(now, e) for e in endpoints])

    def count(self) -> int:
        with closing(self._connect()) as db:
            return db.execute("SELECT COUNT(*) FROM subscriptions").fetchone()[0]


store = PushStore()
