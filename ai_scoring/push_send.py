"""Sending the Friday reminder.

Wording matters here. There are two scholarly opinions about which hour
on Friday is the hour in which du'a is answered — from the imam sitting
on the minbar until the prayer ends, and the last hour before Maghrib —
and it is not our place to settle that in a push notification. So the
message reminds people that it is Jumu'ah and that du'a and sadaqah are
encouraged, and points to the page where the hadith itself is quoted
with its source. It never asserts that this minute is that hour.
"""
from __future__ import annotations
import json
import os

MESSAGES = {
    "en": ("Jumu'ah Mubarak", "A blessed Friday. A moment for du'a and for sadaqah."),
    "ar": ("جمعة مباركة", "يوم جمعة مبارك. وقت للدعاء وللصدقة."),
    "ru": ("Джума мубарак", "Благословенной пятницы. Время для дуа и садаки."),
    "tj": ("Ҷумъа муборак", "Ҷумъаи муборак. Вақти дуо ва садақа."),
    "id": ("Jumat Mubarak", "Jumat yang diberkahi. Waktu untuk doa dan sedekah."),
    "tr": ("Cuma mübarek olsun", "Mübarek bir Cuma. Dua ve sadaka için bir an."),
    "zh": ("主麻吉庆", "吉庆的聚礼日。祈祷与施舍的时刻。"),
    "ms": ("Jumaat Mubarak", "Jumaat yang diberkati. Waktu untuk doa dan sedekah."),
    "fr": ("Joumou'a Moubarak", "Un vendredi béni. Un moment pour la du'a et la sadaqa."),
    "de": ("Jumu'a Mubarak", "Ein gesegneter Freitag. Ein Moment für Dua und Sadaqa."),
}


def build_payload(kind: str, lang: str) -> str:
    title, body = MESSAGES.get(lang) or MESSAGES["en"]
    return json.dumps({
        "title": title,
        "body": body,
        "url": "/dua/",
        "tag": kind,
    })


def send(subscription: dict, payload: str) -> tuple[bool, int | None]:
    """Returns (delivered, status_code). A 404/410 means the browser threw
    the subscription away — the caller should delete it rather than retry
    it every week forever."""
    from pywebpush import webpush, WebPushException

    private_key = os.environ.get("VAPID_PRIVATE_KEY")
    subject = os.environ.get("VAPID_SUBJECT", "mailto:contact@amnetwork.io")
    if not private_key:
        raise RuntimeError("VAPID_PRIVATE_KEY not configured")

    try:
        webpush(subscription_info=subscription, data=payload,
                vapid_private_key=private_key, vapid_claims={"sub": subject}, timeout=10)
        return True, 200
    except WebPushException as e:
        status = getattr(getattr(e, "response", None), "status_code", None)
        return False, status
