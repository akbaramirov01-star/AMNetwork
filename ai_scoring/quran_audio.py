"""
AM Network — Quran Foundation audio proxy
Fetches the reciter list and chapter recitation audio URLs from the Quran
Foundation Content API server-side, since the OAuth2 client secret must
never reach the browser. Every other piece of Quran content (Arabic text,
translations) still goes straight from the browser to Quran.com's older,
still-open endpoints — this proxy exists only for the two endpoints that
now require app credentials: chapter reciters and chapter recitation audio.
"""
from __future__ import annotations
import os
import time
import requests

TOKEN_URL = os.environ.get("QURAN_TOKEN_URL", "https://prelive-oauth2.quran.foundation/oauth2/token")
API_BASE = os.environ.get("QURAN_API_BASE", "https://apis-prelive.quran.foundation/content/api/v4")
CLIENT_ID = os.environ.get("QURAN_CLIENT_ID")
CLIENT_SECRET = os.environ.get("QURAN_CLIENT_SECRET")
REQUEST_TIMEOUT = 10


class QuranAudioError(Exception):
    """Raised for any failure talking to the Quran Foundation API — callers
    should turn this into a 502 rather than leak upstream details."""


_token_cache = {"token": None, "expires_at": 0.0}


def _get_token() -> str:
    now = time.time()
    if _token_cache["token"] and _token_cache["expires_at"] > now + 30:
        return _token_cache["token"]
    if not CLIENT_ID or not CLIENT_SECRET:
        raise QuranAudioError("QURAN_CLIENT_ID/QURAN_CLIENT_SECRET not configured")
    try:
        res = requests.post(
            TOKEN_URL,
            auth=(CLIENT_ID, CLIENT_SECRET),
            data={"grant_type": "client_credentials", "scope": "content"},
            timeout=REQUEST_TIMEOUT,
        )
        res.raise_for_status()
        data = res.json()
    except requests.RequestException as e:
        raise QuranAudioError(f"token request failed: {e}") from e
    token = data.get("access_token")
    if not token:
        raise QuranAudioError("token response missing access_token")
    _token_cache["token"] = token
    _token_cache["expires_at"] = now + data.get("expires_in", 3600)
    return token


def _api_get(path: str) -> dict:
    token = _get_token()
    try:
        res = requests.get(
            API_BASE + path,
            headers={"x-auth-token": token, "x-client-id": CLIENT_ID},
            timeout=REQUEST_TIMEOUT,
        )
        res.raise_for_status()
        return res.json()
    except requests.RequestException as e:
        raise QuranAudioError(f"content api request failed: {e}") from e


def get_reciters() -> dict:
    return _api_get("/resources/chapter_reciters?language=en")


def get_chapter_audio(reciter_id: int, chapter_id: int) -> dict:
    return _api_get(f"/chapter_recitations/{reciter_id}/{chapter_id}")
