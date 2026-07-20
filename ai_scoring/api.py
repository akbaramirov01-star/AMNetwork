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

app = Flask(__name__)
CORS(app)  # the site is static (GitHub Pages) and calls this from a different origin

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


@app.route("/score", methods=["POST"])
def score():
    payload = request.get_json(force=True, silent=True)
    if not payload or "country" not in payload:
        return jsonify({"error": "missing required field: country"}), 400

    kwargs = dict(payload)
    for field, enum_cls in ENUM_FIELDS.items():
        if field in kwargs:
            try:
                kwargs[field] = enum_cls(kwargs[field])
            except ValueError:
                valid = [e.value for e in enum_cls]
                return jsonify({"error": f"invalid {field}: {kwargs[field]!r}. Valid: {valid}"}), 400

    kwargs.setdefault("name", "Applicant")

    try:
        profile = RecipientProfile(**kwargs)
    except TypeError as e:
        return jsonify({"error": f"invalid field in request: {e}"}), 400

    breakdown = score_recipient(profile)

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

    try:
        reply = get_reply(message, history)
    except RuntimeError as e:
        app.logger.error("chat: not configured: %s", e)
        return jsonify({"error": "assistant not configured yet"}), 503
    except Exception:
        app.logger.exception("chat: unhandled error calling assistant")
        return jsonify({"error": "assistant temporarily unavailable"}), 502

    return jsonify({"reply": reply})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=False)
