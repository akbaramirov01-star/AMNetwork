# AM Network — AI Scoring API

Turns the rule-based scoring engine in `scorer.py` (already used by `cli.py`
and `demo.py`) into a real HTTP JSON API, so the site's quiz can call a real
backend instead of duplicating the scoring logic in client-side JS.

## Run it locally

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/python api.py
```

Server listens on `http://localhost:8000`.

```bash
curl -X POST http://localhost:8000/score \
  -H "Content-Type: application/json" \
  -d '{"country":"SY","monthly_income_usd":0,"family_size":5,"is_refugee":true,"housing_status":"refugee_camp"}'
```

## Verify it yourself

```bash
.venv/bin/python test_api.py
```

Starts the real server, sends real HTTP requests, and asserts on the real
JSON responses — 11 checks, including a refugee-widow profile scoring
CRITICAL and a wealthy applicant correctly being flagged INELIGIBLE with
fraud/verification flags.

## Deploy it publicly (free tier, ~5 minutes)

A `Dockerfile` is included. Any of these will build and run it for free:

- **Render** (render.com) — "New Web Service" → connect this repo → root
  directory `ai_scoring/` → it auto-detects the Dockerfile.
- **Railway** (railway.app) — same, "Deploy from GitHub" → set root to
  `ai_scoring/`.
- **Fly.io** (fly.io) — `fly launch` from this directory.

All three have a free tier sufficient for a beta. Whichever you pick, copy
the public URL it gives you and set it as the API base in the site's
`ai_scoring/index.html` quiz (currently a client-side JS demo) so the score
comes from this real backend.

## Why this exists

The site's `/ai_scoring/` quiz has, until now, computed a score entirely in
client-side JavaScript — a demo, not the real engine. `scorer.py` is the
actual, more thorough scoring model (8 Asnaf category matching, fraud
detection, confidence levels) but was never exposed anywhere. This API
closes that gap.

Per `CLAUDE.md`: this is assessment/triage only. It does not verify a
recipient's identity or presence — that is the Local Oracle Network's job
(mosque imams, AM Network volunteers, partner NGO reps). The site's copy
should keep saying so.
