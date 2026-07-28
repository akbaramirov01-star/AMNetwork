# AM Academy

Five modules, twenty lessons. `curriculum.js` is the single source of truth:
the facts, figures and scripture references in each lesson's `core` and
`sources` are written and checked by a human, and nothing generated downstream
is allowed to add to them or alter a single number.

## How a lesson reaches the reader

A lesson has two halves, and they are produced differently on purpose.

**The prose** is re-voiced for whoever is reading — a 12-year-old, a student, a
working adult with a mortgage, a pensioner with forty years of saved gold. Same
rulings, same figures, same sources; different words and different examples.
That adaptation is the one genuinely rare thing here, and the reason the model
is fenced in so tightly: in Islamic education, a model free to improvise is a
model free to invent hadith.

**Everything else on the page** — the title, the visual cards, the source
captions, the quiz — is a fixed string translated into the reader's language.

## Pre-generated, not live

Both halves are generated ahead of time by `ai_scoring/pregenerate.py` and
committed under `content/`:

    content/<lang>/<audience>.json   {"lessons": {"<module>__<lesson>": "<prose>"}}
    content/<lang>/chrome.json       {"mods": {...}, "lessons": {...}, "exams": {...}}

Russian is canonical, so it needs the four audience bundles but no `chrome.json`.

The page loads the two bundles it needs and everything after that is instant.
`ai_scoring/api.py` stays available as the fallback for any variant not yet
generated — if a bundle is missing the reader still gets a lesson, just after a
round trip.

This matters more than it sounds. Serving lessons live meant one Anthropic call
per (lesson, audience, language) view against a 500-entry in-memory cache that
wiped itself on overflow — with 720 combinations it thrashed, and the cache
lived in the Render process, so a cold start threw it away. The first visitor of
the day usually waited half a minute and then saw the "tutor unavailable"
fallback. Generating once costs roughly ten dollars and removes the backend from
the reader's path entirely.

## Regenerating

**From GitHub** — Actions → *Pre-generate AM Academy lessons* → Run workflow.
Needs the `ANTHROPIC_API_KEY` repository secret. It commits the result itself.

**Locally**

    export ANTHROPIC_API_KEY=sk-ant-...
    pip install anthropic
    python3 ai_scoring/pregenerate.py                # fills in what is missing
    python3 ai_scoring/pregenerate.py --force        # regenerate everything
    python3 ai_scoring/pregenerate.py --lang ru --lang en

Existing entries are kept unless `--force` is passed, and the script checkpoints
after every call — an interrupted run resumes for free, and editing one lesson
regenerates only that lesson.

## After editing curriculum.js

Changing a lesson's `core` does **not** invalidate the generated prose
automatically. Delete the affected entries, or run with `--force` for the
lessons you touched. Changing a `title`, `visual`, `check` or `exam` means the
`chrome.json` files are stale in the same way.
