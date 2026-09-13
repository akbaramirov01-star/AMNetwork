"""Persistent cache for on-demand content translations (currently: hadith text
not covered by a certified edition).

Keyed by (lang, sha256(source_text)), so the same source text is only ever
paid for once per language — shared across every visitor and every place
that text might appear. Backed by SQLite so it survives worker restarts,
unlike the in-memory per-process caches used elsewhere in this service.
"""
from __future__ import annotations
import hashlib
import os
import sqlite3
import tempfile
from contextlib import closing


class TranslationCache:
    def __init__(self, path=None):
        self.path = path or os.environ.get(
            "TRANSLATE_CACHE_DB_PATH", os.path.join(tempfile.gettempdir(), "amnetwork-translations.sqlite3"))
        with closing(self._connect()) as db:
            db.execute("CREATE TABLE IF NOT EXISTS translations (key TEXT PRIMARY KEY, text TEXT NOT NULL)")

    def _connect(self):
        return sqlite3.connect(self.path, timeout=5, isolation_level=None)

    @staticmethod
    def _key(lang, text):
        return lang + ":" + hashlib.sha256(text.encode("utf-8")).hexdigest()

    def get_many(self, lang: str, texts: list[str]) -> dict[str, str]:
        """Returns {source_text: cached_translation} for whichever inputs are already cached."""
        if not texts:
            return {}
        by_key = {self._key(lang, t): t for t in texts}
        placeholders = ",".join("?" * len(by_key))
        with closing(self._connect()) as db:
            rows = db.execute(
                f"SELECT key, text FROM translations WHERE key IN ({placeholders})",
                list(by_key.keys()),
            ).fetchall()
        return {by_key[k]: v for k, v in rows if k in by_key}

    def set_many(self, lang: str, mapping: dict[str, str]) -> None:
        """mapping: {source_text: translated_text}"""
        if not mapping:
            return
        with closing(self._connect()) as db:
            db.executemany(
                "INSERT INTO translations VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET text=excluded.text",
                [(self._key(lang, src), tr) for src, tr in mapping.items()],
            )


cache = TranslationCache()
