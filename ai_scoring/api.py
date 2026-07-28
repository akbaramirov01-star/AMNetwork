"""
AM Network — AI Scoring HTTP API
Wraps the scorer.py rule-based engine behind a JSON API so the site's
quiz can call a real backend instead of duplicating the logic in JS.

Run locally:   python api.py
Then:          curl -X POST http://localhost:8000/score -H "Content-Type: application/json" -d @sample_request.json
"""

from __future__ import annotations
from flask import Flask, request, jsonify
from flask_cors import CORS

from scorer import (
    RecipientProfile, HousingStatus, EmploymentStatus,
    MedicalStatus, CrisisType, AssetLevel, score_recipient,
)
from assistant import get_reply
from academy import explain as academy_explain, apply_to_case, translate_chrome, AUDIENCES

app = Flask(__name__)
ALLOWED_ORIGINS = [
    "https://amnetwork.io",
    "https://www.amnetwork.io",
    "http://localhost:8000", "http://localhost:8101", "http://127.0.0.1:8101",  # local dev
]
CORS(app, origins=ALLOWED_ORIGINS)
MAX_BODY_BYTES = 32 * 1024  # 32KB is generous for these payloads; blocks large-body abuse
app.config["MAX_CONTENT_LENGTH"] = MAX_BODY_BYTES

ENUM_FIELDS = {
    "asset_level": AssetLevel,
    "housing_status": HousingStatus,
    "employment_status": EmploymentStatus,
    "medical_status": MedicalStatus,
    "crisis_type": CrisisType,
}


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "am-network-ai-scoring", "version": "2.1"})


def _has_non_finite(value) -> bool:
    """True if value is (or contains, recursively) a NaN/Infinity float."""
    if isinstance(value, float):
        return value != value or value in (float("inf"), float("-inf"))  # nan != nan
    if isinstance(value, dict):
        return any(_has_non_finite(v) for v in value.values())
    if isinstance(value, list):
        return any(_has_non_finite(v) for v in value)
    return False


@app.route("/score", methods=["POST"])
def score():
    payload = request.get_json(force=True, silent=True)
    if not payload or not isinstance(payload, dict):
        return jsonify({"error": "invalid JSON body"}), 400
    if not isinstance(payload.get("country"), str) or not payload["country"].strip():
        return jsonify({"error": "missing or invalid required field: country (must be a non-empty string)"}), 400
    if _has_non_finite(payload):
        return jsonify({"error": "numeric fields must be finite (no NaN/Infinity)"}), 400

    kwargs = dict(payload)
    for field, enum_cls in ENUM_FIELDS.items():
        if field in kwargs:
            try:
                kwargs[field] = enum_cls(kwargs[field])
            except (ValueError, TypeError):
                valid = [e.value for e in enum_cls]
                return jsonify({"error": f"invalid {field}: {kwargs[field]!r}. Valid: {valid}"}), 400

    kwargs.setdefault("name", "Applicant")

    try:
        profile = RecipientProfile(**kwargs)
        breakdown = score_recipient(profile)
    except TypeError as e:
        return jsonify({"error": f"invalid field in request: {e}"}), 400
    except (ValueError, AttributeError, ZeroDivisionError) as e:
        app.logger.warning("score: rejected malformed input: %s", e)
        return jsonify({"error": "invalid field value in request"}), 400

    return jsonify({
        "final_score": round(breakdown.final_score, 1),
        "priority_tier": breakdown.priority_tier,
        "recommendation": breakdown.recommendation,
        "confidence_level": breakdown.confidence_level,
        "estimated_monthly_need_usd": breakdown.estimated_monthly_need_usd,
        "asnaf_categories": breakdown.asnaf_categories,
        "recommended_support_types": breakdown.recommended_support_types,
        "fraud_flags": breakdown.fraud_flags,
        "breakdown": {
            "income_score": breakdown.income_score,
            "asset_score": breakdown.asset_score,
            "family_score": breakdown.family_score,
            "housing_score": breakdown.housing_score,
            "employment_score": breakdown.employment_score,
            "health_score": breakdown.health_score,
            "asnaf_score": breakdown.asnaf_score,
            "crisis_score": breakdown.crisis_score,
            "raw_total": breakdown.total,
            "fraud_penalty": breakdown.fraud_penalty,
        },
    })


MAX_MESSAGE_LEN = 2000
MAX_HISTORY_ITEMS = 20


@app.route("/chat", methods=["POST"])
def chat():
    payload = request.get_json(force=True, silent=True) or {}
    message = (payload.get("message") or "").strip()
    if not message:
        return jsonify({"error": "missing required field: message"}), 400
    if len(message) > MAX_MESSAGE_LEN:
        return jsonify({"error": f"message too long (max {MAX_MESSAGE_LEN} chars)"}), 400

    history = payload.get("history") or []
    if not isinstance(history, list):
        return jsonify({"error": "history must be a list"}), 400
    history = history[-MAX_HISTORY_ITEMS:]
    for item in history:
        if not isinstance(item, dict) or item.get("role") not in ("user", "assistant") or "content" not in item:
            return jsonify({"error": "invalid history item: expected {role, content}"}), 400
        content = item["content"]
        if not isinstance(content, str) or len(content) > MAX_MESSAGE_LEN:
            return jsonify({"error": f"history item content must be a string up to {MAX_MESSAGE_LEN} chars"}), 400

    try:
        reply = get_reply(message, history)
    except RuntimeError as e:
        app.logger.error("chat: not configured: %s", e)
        return jsonify({"error": "assistant not configured yet"}), 503
    except Exception:
        app.logger.exception("chat: unhandled error calling assistant")
        return jsonify({"error": "assistant temporarily unavailable"}), 502

    return jsonify({"reply": reply})


# ── AM Academy ────────────────────────────────────────────────────────────────
MAX_CORE_LEN = 6000
MAX_SITUATION_LEN = 1200
VALID_LANGS = {"en", "ru", "ar", "tj", "id", "tr", "zh", "ms", "de"}

# Adapted lessons are deterministic per (lesson, audience, language) for a given
# canonical text, so cache them: the same reader profile shouldn't re-bill a
# fresh Anthropic call on every page view.
_explain_cache: dict[tuple, str] = {}
MAX_CACHE_ENTRIES = 500


def _read_lesson_request():
    """Shared validation for the two academy endpoints."""
    p = request.get_json(force=True, silent=True) or {}
    core = p.get("core")
    if not isinstance(core, str) or not core.strip():
        return None, (jsonify({"error": "missing required field: core"}), 400)
    if len(core) > MAX_CORE_LEN:
        return None, (jsonify({"error": f"core too long (max {MAX_CORE_LEN} chars)"}), 400)

    audience = p.get("audience", "working")
    if audience not in AUDIENCES:
        return None, (jsonify({"error": f"invalid audience. Valid: {sorted(AUDIENCES)}"}), 400)

    lang = p.get("lang", "en")
    if lang not in VALID_LANGS:
        return None, (jsonify({"error": f"invalid lang. Valid: {sorted(VALID_LANGS)}"}), 400)

    sources = p.get("sources") or []
    if not isinstance(sources, list) or len(sources) > 20:
        return None, (jsonify({"error": "sources must be a list of at most 20 items"}), 400)
    for s in sources:
        if not isinstance(s, dict):
            return None, (jsonify({"error": "each source must be an object"}), 400)

    title = p.get("title", "")
    if not isinstance(title, str) or len(title) > 200:
        return None, (jsonify({"error": "invalid title"}), 400)

    return {"core": core, "sources": sources, "audience": audience,
            "lang": lang, "title": title, "raw": p}, None


@app.route("/academy/explain", methods=["POST"])
def academy_explain_route():
    """Re-voice a fixed lesson for one reader. Facts/sources never change."""
    data, err = _read_lesson_request()
    if err:
        return err

    key = (data["title"], data["audience"], data["lang"], hash(data["core"]))
    if key in _explain_cache:
        return jsonify({"text": _explain_cache[key], "cached": True})

    try:
        text = academy_explain(
            core=data["core"], sources=data["sources"],
            audience=data["audience"], lang=data["lang"], title=data["title"],
        )
    except RuntimeError as e:
        app.logger.error("academy/explain: not configured: %s", e)
        return jsonify({"error": "tutor not configured yet"}), 503
    except Exception:
        app.logger.exception("academy/explain: unhandled error")
        return jsonify({"error": "tutor temporarily unavailable"}), 502

    if len(_explain_cache) >= MAX_CACHE_ENTRIES:
        _explain_cache.clear()
    _explain_cache[key] = text
    return jsonify({"text": text, "cached": False})


MAX_CHROME_BYTES = 9000
_chrome_cache: dict[tuple, dict] = {}


@app.route("/academy/chrome", methods=["POST"])
def academy_chrome_route():
    """Translate a lesson's title and visual-card labels.

    The lesson prose is translated by /academy/explain, but the title and the
    visual block are static strings from curriculum.js and were staying Russian
    whichever language the reader picked. This translates them. Cached hard:
    unlike /explain the result depends only on (content, language), not on who
    is reading, so one call serves every audience.
    """
    p = request.get_json(force=True, silent=True) or {}
    lang = p.get("lang")
    if lang not in VALID_LANGS:
        return jsonify({"error": f"invalid lang. Valid: {sorted(VALID_LANGS)}"}), 400

    chrome = p.get("chrome")
    if not isinstance(chrome, dict) or not chrome:
        return jsonify({"error": "missing required field: chrome (object)"}), 400
    try:
        import json as _json
        raw = _json.dumps(chrome, ensure_ascii=False)
    except (TypeError, ValueError):
        return jsonify({"error": "chrome must be JSON-serialisable"}), 400
    if len(raw.encode("utf-8")) > MAX_CHROME_BYTES:
        return jsonify({"error": f"chrome too large (max {MAX_CHROME_BYTES} bytes)"}), 400

    key = (lang, raw)
    if key in _chrome_cache:
        return jsonify({"chrome": _chrome_cache[key], "cached": True})

    try:
        out = translate_chrome(chrome, lang)
    except RuntimeError as e:
        app.logger.error("academy/chrome: not configured: %s", e)
        return jsonify({"error": "translator not configured yet"}), 503
    except Exception:
        app.logger.exception("academy/chrome: unhandled error")
        return jsonify({"error": "translator temporarily unavailable"}), 502

    if not out:
        # Model returned something unparseable. Say so rather than serving junk;
        # the client falls back to the original text.
        return jsonify({"error": "translation unavailable"}), 502

    if len(_chrome_cache) >= MAX_CACHE_ENTRIES:
        _chrome_cache.clear()
    _chrome_cache[key] = out
    return jsonify({"chrome": out, "cached": False})


@app.route("/academy/apply", methods=["POST"])
def academy_apply_route():
    """Apply a fixed lesson to the reader's own situation. Never cached."""
    data, err = _read_lesson_request()
    if err:
        return err

    situation = (data["raw"].get("situation") or "").strip()
    if not situation:
        return jsonify({"error": "missing required field: situation"}), 400
    if len(situation) > MAX_SITUATION_LEN:
        return jsonify({"error": f"situation too long (max {MAX_SITUATION_LEN} chars)"}), 400

    try:
        text = apply_to_case(
            core=data["core"], sources=data["sources"], situation=situation,
            audience=data["audience"], lang=data["lang"], title=data["title"],
        )
    except RuntimeError as e:
        app.logger.error("academy/apply: not configured: %s", e)
        return jsonify({"error": "tutor not configured yet"}), 503
    except Exception:
        app.logger.exception("academy/apply: unhandled error")
        return jsonify({"error": "tutor temporarily unavailable"}), 502

    return jsonify({"text": text})


if __name__ == "__main__":
    # threaded=True: the Anthropic call in /chat (with web search) can take many
    # seconds; without this, Werkzeug's dev server is single-threaded and one
    # slow /chat request blocks every other visitor's /score, /chat, /health.
    app.run(host="0.0.0.0", port=8000, debug=False, threaded=True)
