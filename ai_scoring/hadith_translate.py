"""On-demand translation for hadith text the open dataset doesn't publish a
certified edition for (currently: Tajik everywhere; Chinese, Malay, German
everywhere; Russian and French for Jami' at-Tirmidhi specifically).

Reuses the same client/model pattern as academy.py, with a system prompt
tuned for hadith precision: translate faithfully, never touch numbers,
chains, or gradings, never add or drop content. Results are cached by the
caller (translate_cache.py) so each hadith is only ever paid for once per
language, not once per viewer.
"""
from __future__ import annotations
import json
import os
import anthropic

MODEL = "claude-sonnet-5"

# Every non-English UI language. Used for two different things by the
# caller: (1) hadith BODY text, only for languages/books the dataset has no
# certified edition for (ar is never a target there — Arabic readers see
# the original Arabic text directly, not a rendered line under it); and
# (2) chapter/section TITLES, which the dataset only ever publishes in
# English in every edition it has, including the Arabic one — so every
# language other than English needs this for titles, ar included.
LANG_NAMES = {
    "ar": "Arabic", "ru": "Russian", "tj": "Tajik (Cyrillic)", "id": "Indonesian",
    "tr": "Turkish", "zh": "Chinese (Simplified)", "ms": "Malay", "fr": "French", "de": "German",
}

SYSTEM_PROMPT = """You translate hadith text for an Islamic reference website.

You are given a JSON array of hadith texts — each one an already-established
English translation of a hadith, published by a certified translator on
Sunnah.com. Translate each into the target language.

RULES
- Translate faithfully. Do not paraphrase away meaning, do not add
  commentary, do not add or remove any sentence.
- Never alter a name, number, hadith grading, chain-of-narration detail, or
  Quran/hadith reference — carry these across exactly as written.
- Keep standard Islamic terms in their conventional form for the target
  language (Allah, sallallahu 'alayhi wa sallam, radhiyallahu 'anhu, etc.)
- Output a raw JSON array of translated strings, in the SAME order as the
  input, same length. No markdown fence, no commentary, no explanation.
"""

# Per-language style notes distilled from an actual certified, government-
# reviewed published translation (not written by us) — currently: "Мухтасари
# Саҳеҳи Бухорӣ" (Imam az-Zubaydi's abridgment), Tajik translation by
# Abdulhalim Orifi, Dushanbe, ЭР-граф, 2011, ISBN 978-99947-41-86-1. This
# doesn't replace that book as a source (see /hadith/data/tj-certified/ for
# the actual matched, human-translated hadith text where it's available) —
# it just steers the AI translator's own output, for every hadith this book
# doesn't cover, toward the same register a professional Tajik translator
# of hadith actually uses, instead of a cold, unguided AI guess.
LANG_STYLE_NOTES = {
    "tj": """
TAJIK STYLE — matching the conventions of a published, government-reviewed
Tajik hadith translation (Мухтасари Саҳеҳи Бухорӣ, Дар "ЭР-граф", 2011):
- Render "Narrated X:" as "Аз X (р) ривоят аст, ки гуфт:" (or "...ривоят
  мекунад, ки" when the source keeps the verb in present/habitual sense).
  Always attach "(р)" immediately after a Companion's name on first mention
  in a hadith — the standard abbreviation for "радиаллоҳу анҳу", never
  spelled out in full in running text.
- Render "the Prophet" / "Allah's Messenger" as "Паёмбари Худо" and always
  attach "(с)" right after it (standard abbreviation for "саллаллоҳу алайҳи
  ва саллам"), every time the title appears, including in reported speech.
- A Qur'an citation inside a hadith is given as (Tajik surah name: verse or
  verse range), e.g. "(Исро, ояи 78)" or "(Мудассир: 1-5)" — use the
  conventional Tajik surah name, not a transliteration of the Arabic.
- Keep names and place names transliterated (e.g. "ибни", "Абуҳурайра",
  "Зулхулайфа"), never translated or replaced with a local equivalent.
""",
}


def _client() -> anthropic.Anthropic:
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise RuntimeError("ANTHROPIC_API_KEY not configured")
    # A batch of up to MAX_HADITH_ITEMS hadiths (each with a full chain of
    # narrators) can be a genuinely large generation — comfortably past
    # what a 25s timeout allows at realistic model throughput, which was
    # silently turning "the model needed more time" into a hard failure
    # indistinguishable from a real error. The client already caps its
    # own wait per chunk (see HADITH_TRANSLATE_TIMEOUT_MS in hadith/
    # index.html), so this just needs to not be the tighter of the two.
    return anthropic.Anthropic(api_key=api_key, timeout=90.0, max_retries=0)


def translate_hadiths(texts: list[str], lang: str) -> list[str] | None:
    """Translate a batch of hadith texts. Returns None if lang is unsupported
    or the model's output can't be parsed, so the caller can fall back to
    the English text it already has rather than fail the page."""
    language = LANG_NAMES.get(lang)
    if not language or not texts:
        return None

    system = SYSTEM_PROMPT + LANG_STYLE_NOTES.get(lang, "")
    resp = _client().messages.create(
        model=MODEL,
        max_tokens=16000,
        system=system,
        messages=[{"role": "user", "content":
                   f"TARGET LANGUAGE: {language}\n\nJSON array of texts to translate:\n"
                   + json.dumps(texts, ensure_ascii=False)}],
    )
    text = "".join(b.text for b in resp.content if b.type == "text").strip()
    if text.startswith("```"):
        text = text.split("```", 2)[1]
        if text.startswith("json"):
            text = text[4:]
    try:
        out = json.loads(text)
    except (ValueError, TypeError):
        return None
    if not isinstance(out, list) or len(out) != len(texts) or not all(isinstance(x, str) for x in out):
        return None
    return out
