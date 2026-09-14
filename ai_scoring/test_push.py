"""
Tests for the Friday reminder: who is due, who is not, and who is allowed
to trigger a send.

The parts worth guarding are the ones that would be embarrassing in
production — reminding someone on the wrong day because the server's
Friday is not theirs, sending twice because a cron run retried, or
leaving the dispatch endpoint open so anyone can make the app push to
every subscriber.

Run: python test_push.py
"""
import calendar
import json
import os
import tempfile
import time
import unittest
from unittest.mock import patch

os.environ.setdefault("PUSH_DB_PATH", os.path.join(tempfile.mkdtemp(), "push.sqlite3"))
os.environ.setdefault("SECURITY_DB_PATH", os.path.join(tempfile.mkdtemp(), "limits.sqlite3"))

import api
from push_store import PushStore

FRIDAY_06_UTC = calendar.timegm(time.strptime("2026-09-18 06:00:00", "%Y-%m-%d %H:%M:%S"))


def sub(name):
    return {"endpoint": f"https://push.example/{name}", "keys": {"p256dh": "x", "auth": "y"}}


class PushStoreTests(unittest.TestCase):
    def setUp(self):
        self.store = PushStore(os.path.join(tempfile.mkdtemp(), "push.sqlite3"))

    def names(self, rows):
        return sorted(r["endpoint"].rsplit("/", 1)[-1] for r in rows)

    def test_local_hour_decides_who_is_due(self):
        self.store.save(sub("dushanbe"), ["jumua"], 300, "tj")   # UTC+5 -> 11:00
        self.store.save(sub("london"), ["jumua"], 60, "en")      # UTC+1 -> 07:00
        self.assertEqual(self.names(self.store.due("jumua", 11, 4, now=FRIDAY_06_UTC)), ["dushanbe"])
        self.assertEqual(self.names(self.store.due("jumua", 7, 4, now=FRIDAY_06_UTC)), ["london"])

    def test_local_friday_not_server_friday(self):
        """Auckland is already on Friday while UTC is still Thursday."""
        self.store.save(sub("auckland"), ["jumua"], 720, "en")   # UTC+12
        thursday_2300_utc = calendar.timegm(time.strptime("2026-09-17 23:00:00", "%Y-%m-%d %H:%M:%S"))
        self.assertEqual(time.gmtime(thursday_2300_utc).tm_wday, 3)  # Thursday in UTC
        self.assertEqual(self.names(self.store.due("jumua", 11, 4, now=thursday_2300_utc)), ["auckland"])

    def test_no_reminder_on_other_days(self):
        self.store.save(sub("a"), ["jumua"], 0, "en")
        self.assertEqual(self.store.due("jumua", 6, 4, now=FRIDAY_06_UTC - 86400), [])

    def test_never_sends_twice_in_one_day(self):
        self.store.save(sub("a"), ["jumua"], 0, "en")
        due = self.store.due("jumua", 6, 4, now=FRIDAY_06_UTC)
        self.assertEqual(len(due), 1)
        self.store.mark_sent([d["endpoint"] for d in due], now=FRIDAY_06_UTC)
        self.assertEqual(self.store.due("jumua", 6, 4, now=FRIDAY_06_UTC + 3600), [])
        # but next week is fine
        self.assertEqual(len(self.store.due("jumua", 6, 4, now=FRIDAY_06_UTC + 7 * 86400)), 1)

    def test_resubscribing_updates_rather_than_duplicates(self):
        self.store.save(sub("a"), ["jumua"], 0, "en")
        self.store.save(sub("a"), ["jumua"], 180, "ru")
        self.assertEqual(self.store.count(), 1)
        self.assertEqual(self.names(self.store.due("jumua", 9, 4, now=FRIDAY_06_UTC)), ["a"])


class PushEndpointTests(unittest.TestCase):
    def setUp(self):
        self.client = api.app.test_client()

    def test_subscribe_rejects_junk(self):
        for body in [{}, {"subscription": "nope"}, {"subscription": {"endpoint": "http://insecure/x"},
                                                    "kinds": ["jumua"], "utcOffsetMinutes": 0}]:
            self.assertEqual(self.client.post("/push/subscribe", json=body).status_code, 400)

    def test_subscribe_rejects_unknown_kind_and_silly_offset(self):
        base = {"subscription": sub("a")}
        self.assertEqual(self.client.post("/push/subscribe",
                         json={**base, "kinds": ["spam"], "utcOffsetMinutes": 0}).status_code, 400)
        self.assertEqual(self.client.post("/push/subscribe",
                         json={**base, "kinds": ["jumua"], "utcOffsetMinutes": 99999}).status_code, 400)

    def test_dispatch_requires_the_token(self):
        with patch.dict(os.environ, {"PUSH_DISPATCH_TOKEN": "secret"}):
            self.assertEqual(self.client.post("/push/dispatch").status_code, 403)
            self.assertEqual(self.client.post("/push/dispatch",
                             headers={"X-Dispatch-Token": "wrong"}).status_code, 403)

    def test_dispatch_is_off_until_configured(self):
        with patch.dict(os.environ, {}, clear=False):
            os.environ.pop("PUSH_DISPATCH_TOKEN", None)
            self.assertEqual(self.client.post("/push/dispatch").status_code, 503)

    def test_dropped_subscriptions_are_deleted_not_retried(self):
        """A 410 from the push service means the browser threw the
        subscription away; keeping it would retry it every week forever."""
        with patch.dict(os.environ, {"PUSH_DISPATCH_TOKEN": "secret"}):
            with patch.object(api.push_store, "due", return_value=[
                    {"endpoint": "https://push.example/gone", "subscription": sub("gone"), "lang": "en"}]), \
                 patch.object(api.push_send, "send", return_value=(False, 410)), \
                 patch.object(api.push_store, "delete") as delete, \
                 patch.object(api.push_store, "mark_sent"):
                r = self.client.post("/push/dispatch", headers={"X-Dispatch-Token": "secret"})
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.get_json()["dropped"], 1)
        delete.assert_called_once_with("https://push.example/gone")


if __name__ == "__main__":
    unittest.main()
