# AM Academy sprint (brief of 26 Nov 2026) — Steps 1–4: audit, process map, gap analysis, minimal plan
Source brief: `AM_Academy_Claude_Strategy_Brief` (founder, 26 Nov). Hard rules of §1.1 = our existing rules; nothing loosened.

## Step 1. Audit — what actually exists (checked in the repo, 26 Nov)
| Part | Where | State |
|---|---|---|
| Scripts / sources | `docs/content/*.md`, `publish/*.md` | per-video markdown; sources checked against api.quran.com + fawazahmed0/hadith-api |
| Generation (voice, video, voice_change) | Higgsfield MCP, called by Claude in-session | manual; **no job log in the repo** (job ids live only in chat) |
| Assembly | `tools/<video>/build.py` + `cfg.json` + `expect.json` | works; **10 copies of build.py that drift** (tail/skip/cut added to some only; Whisper `initial_prompt` hard-coded per copy — a stale prompt made Whisper invent words in Heart #3) |
| QC — speech | `tr.py`/`trl.py` (Whisper large-v3, no prompt), `qa.py` (per segment), lip-sync ratio gate in build.py | works; caught "Al-Kahib", "don't" dropped, repeated words |
| QC — visual | contact sheets read by Claude | works but manual; caught crosses, uncovered hair, logos |
| Captions | `caption.py` (one Whisper pass, script text, no overlaps) | works |
| Phone/platform plug | `tools/phone/` (real AM Network pages via Playwright) | works |
| Dub fix | `tools/signs3/dub.py` | works (clean line time-aligned onto a take) |
| Publishing | founder uploads by hand; texts in `publish/*.md`; order in `publish/QUEUE.md` | manual by design (owner approves every post) |
| Analytics | screenshots only | **missing**: no metrics file, no 24h/72h/7d cards |
| Dubbing (21 languages) | YouTube auto-dubbing (founder) | not checked yet |

## Step 2. Process map
Idea → (Claude) sources verified → script → **owner OK** → voice lines (seed_audio) → Whisper check → clips (seedance) →
voice_change → Whisper check → build.py (trim by words, narration, crossfades, −16 LUFS) → captions → qa.py → contact sheet →
fixes/reshoots → upload to Higgsfield CDN → publish texts + cover → QUEUE.md → **owner posts** → (missing) metrics 24h/72h/7d.
Manual steps: owner approval, posting, statistics. Error points seen: voice_change drops words; seedance re-voices names;
model draws crosses/uncovered hair; Whisper prompt drift; 520 errors on upload (retry fixed).

## Step 3. Gap analysis vs. Content / Video / Growth engines
- Content engine: research + source check + script structure = done (by hand, in markdown). Topic scoring = missing → add a
  one-line score per idea in the plan (audience, value, hook, difference, cost, Sharia).
- Video engine: done and tested; missing = one shared builder, a generation log, a per-scene status (so a failed scene is
  redone alone — already our practice, but not recorded).
- Growth engine: **missing** — this is the biggest gap and the one the sprint needs.
- Do NOT build: Kubernetes, queues, DB server, dashboard, auto-publishing (owner approves every post).

## Step 4. Minimal plan (proposed, not yet applied to code)
1. `tools/core/build.py` — one copy of the builder; per-video `cfg.json` gets `whisper_prompt`, `cut`, `skip`, `tail`. Old
   folders keep only cfg/expect. (≈1 hour, no credits; re-build one old video to prove identical output.)
2. `sprint/metrics.csv` — one row per video, filled at 24h/72h/7d from YouTube Studio (template added now).
3. `sprint/experiments.md` — test matrix (added now). One variable per test.
4. Script rule for auto-dubbing: short plain-English sentences, no idioms; Arabic names said once clearly and shown on screen.
5. Analytics: start with YouTube Studio CSV export (owner exports; Claude reads). API/OAuth only later, if needed.
