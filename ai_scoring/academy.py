"""
AM Academy — adaptive explanation engine.

The rare thing this does: the FACTS and SOURCES of a lesson are fixed by us and
never touched by the model. Only the *explanation* is re-voiced for who is
reading — a 14-year-old, a student, a working adult, a pensioner.

Every other adaptive-AI course lets the model invent content, which in Islamic
education means invented hadith. Every trustworthy Islamic site ships one static
text for everyone. We do both halves properly.
"""

from __future__ import annotations
import os
import anthropic

MODEL = "claude-sonnet-5"

# Who is reading. Not "beginner/advanced" — that's about knowledge. This is
# about lived reality: the same ruling matters differently to a schoolkid with
# pocket money and a pensioner with 40 years of saved gold.
AUDIENCES = {
    "teen": {
        "label": "Школьник",
        "brief": (
            "A 12-16 year old. Simple everyday words, short sentences. Examples from "
            "pocket money, gifts from relatives, savings in a jar or a first bank card. "
            "No financial jargon at all — if a term is unavoidable, explain it in the "
            "same breath. Warm and encouraging, never condescending. Keep it brief."
        ),
    },
    "student": {
        "label": "Студент",
        "brief": (
            "A 17-25 year old student or first-job earner. Their real questions: student "
            "loans and whether they involve riba, a first salary, savings apps, crypto "
            "holdings, whether they even reach nisab yet. Direct, practical, no lecturing. "
            "They are comfortable with modern financial terms."
        ),
    },
    "working": {
        "label": "Работающий",
        "brief": (
            "A 25-55 year old with income and dependents. Their reality: monthly salary, "
            "a mortgage, business inventory, family savings, calculating zakat for a "
            "household rather than one person. Practical and efficient — they have little "
            "time. Concrete numbers and clear rules of thumb."
        ),
    },
    "senior": {
        "label": "Пожилой",
        "brief": (
            "A 55+ reader, possibly retired. Their reality: gold and jewellery accumulated "
            "over a lifetime, savings held for years, pension income, thinking about "
            "inheritance and leaving things in order. Calm, respectful, unhurried pace. "
            "Plain language with NO English loanwords or app-culture slang. Slightly "
            "longer explanations are fine — clarity matters more than brevity."
        ),
    },
}

LANG_NAMES = {
    "en": "English", "ru": "Russian", "ar": "Arabic", "tj": "Tajik (Cyrillic)",
    "id": "Indonesian", "tr": "Turkish", "zh": "Chinese (Simplified)",
    "ms": "Malay", "de": "German",
}

SYSTEM_PROMPT = """You re-voice a fixed lesson from AM Academy for one specific reader.

THE ONE RULE THAT MATTERS
You are given CANONICAL CONTENT that has already been checked. You may re-word,
re-order, shorten, and choose fresh everyday examples. You may NOT:
- add any religious ruling, fact, number, date, or claim that is not in the canonical content
- change any figure (percentages, weights, thresholds) — carry them across exactly
- invent, alter, renumber, or add any Quran ayah or hadith reference
- state as settled anything the canonical content marks as differing between scholars

If the canonical content does not answer something, say plainly that this lesson
does not cover it and the reader should ask the tutor or a qualified scholar.
Adding a plausible-sounding hadith is the single worst thing you could do here.
Silence is always better than an invented source.

HOW TO WRITE
- Write ONLY the explanation body. No title, no greeting, no sign-off, no
  "in this lesson we will".
- Plain prose in short paragraphs. Use a short bulleted list only where the content
  is genuinely a list.
- Concrete over abstract. One good example beats three sentences of theory.
- Never say "as an AI" or refer to yourself.
- Do not repeat the source references in the body — they are displayed separately
  beside your text. Refer to them naturally instead ("Коран прямо перечисляет
  восемь категорий", not "(Коран 9:60)").
- Target length: roughly the same as the canonical content, or shorter. Never
  padded. No filler sentences.

TONE
Respectful of the subject, never preachy. The reader came to understand something
practical about their own money and their own worship. Serve that.
"""


def _client() -> anthropic.Anthropic:
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise RuntimeError("ANTHROPIC_API_KEY not configured")
    return anthropic.Anthropic(api_key=api_key, timeout=25.0, max_retries=0)


def explain(core: str, sources: list[dict], audience: str, lang: str,
            title: str = "") -> str:
    """Re-voice `core` for `audience` in `lang`. Facts and sources stay fixed."""
    aud = AUDIENCES.get(audience) or AUDIENCES["working"]
    language = LANG_NAMES.get(lang, "English")

    src_lines = []
    for s in sources or []:
        ref = s.get("ref", "")
        note = s.get("note", "")
        src_lines.append(f"- {ref}" + (f" — {note}" if note else ""))
    src_block = "\n".join(src_lines) if src_lines else "(none)"

    user_msg = f"""LESSON TITLE: {title}

CANONICAL CONTENT (the fixed, checked facts — do not add to these):
{core}

SOURCES ATTACHED TO THIS LESSON (shown to the reader separately; do not restate
them as citations in your text, and never add to this list):
{src_block}

WRITE FOR THIS READER:
{aud['brief']}

WRITE IN: {language}

Now write the explanation body only."""

    resp = _client().messages.create(
        model=MODEL,
        max_tokens=1400,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_msg}],
    )
    return "".join(b.text for b in resp.content if b.type == "text").strip()


CHROME_SYSTEM = """You translate short UI strings for an AM Academy lesson.

You are given a JSON object holding a lesson title, the labels of a visual card
block, source captions and quiz questions. Translate every string value into the
requested language and return the SAME JSON structure with the SAME keys, the
SAME array lengths and the SAME order.

RULES
- Translate only. Do not rephrase into something else, do not expand, do not add
  or remove any item from any list.
- Carry every number, unit, percentage, weight and scripture reference across
  EXACTLY as written ("85 г" stays 85 grams; "2:275" stays 2:275; "2.5%" stays
  2.5%). Convert the unit word to the target language, never the value.
- Islamic terms keep their standard form in the target language (zakat, nisab,
  riba, gharar, sadaqah, waqf, murabaha, ijara, mudaraba, musharaka, salam,
  istisna, takaful).
- Keep each string about as short as the original — these render inside small
  cards.
- Output raw JSON only. No markdown fence, no commentary, no explanation.
"""


def translate_chrome(payload: dict, lang: str) -> dict:
    """Translate a lesson's title + visual labels. Returns {} if anything is off,
    so the caller can safely fall back to the original Russian."""
    import json

    language = LANG_NAMES.get(lang)
    if not language:
        return {}

    resp = _client().messages.create(
        model=MODEL,
        max_tokens=4000,
        system=CHROME_SYSTEM,
        messages=[{"role": "user", "content":
                   f"TARGET LANGUAGE: {language}\n\nJSON:\n"
                   + json.dumps(payload, ensure_ascii=False)}],
    )
    text = "".join(b.text for b in resp.content if b.type == "text").strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    try:
        out = json.loads(text)
    except (ValueError, TypeError):
        return {}
    return out if isinstance(out, dict) else {}


APPLY_SYSTEM = """You help one reader work out how a fixed AM Academy lesson applies
to the situation they just described.

RULES
- Reason ONLY from the canonical lesson content given to you. Do not introduce
  rulings, numbers or sources that are not in it.
- Never invent or cite a hadith or ayah that is not in the provided sources.
- Where the person's situation genuinely falls outside what the lesson covers, or
  depends on a point where scholars differ, say so plainly and recommend they ask
  a qualified scholar. Do not guess a ruling to sound helpful.
- You are not issuing a fatwa. You are showing how the material they just read
  lines up with what they told you.
- If they give numbers, do the arithmetic carefully and show it simply.
- Be concise and concrete. Speak to their situation, not in generalities.
- Answer in the reader's language. No greeting, no sign-off.
"""


def apply_to_case(core: str, sources: list[dict], situation: str,
                  audience: str, lang: str, title: str = "") -> str:
    """Apply the fixed lesson to the reader's own described situation."""
    aud = AUDIENCES.get(audience) or AUDIENCES["working"]
    language = LANG_NAMES.get(lang, "English")

    src_block = "\n".join(
        f"- {s.get('ref','')}" + (f" — {s.get('note','')}" if s.get("note") else "")
        for s in (sources or [])
    ) or "(none)"

    user_msg = f"""LESSON: {title}

CANONICAL LESSON CONTENT (reason only from this):
{core}

SOURCES FOR THIS LESSON (do not add any others):
{src_block}

READER PROFILE: {aud['brief']}

WHAT THE READER SAYS ABOUT THEIR SITUATION:
{situation}

WRITE IN: {language}

Show them how this lesson applies to what they described."""

    resp = _client().messages.create(
        model=MODEL,
        max_tokens=1000,
        system=APPLY_SYSTEM,
        messages=[{"role": "user", "content": user_msg}],
    )
    return "".join(b.text for b in resp.content if b.type == "text").strip()
