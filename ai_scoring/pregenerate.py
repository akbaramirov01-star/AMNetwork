"""
AM Academy — pre-generate every lesson variant into static JSON.

Why this exists
---------------
Serving lessons from the live API meant one Anthropic call per (lesson,
audience, language) view. That is 720 combinations against a 500-entry in-memory
cache that wipes itself on overflow — and the cache lives in the Render process,
so a cold start throws it all away. The reader paid for that with a 10-40 second
wait, and the first visitor of the day usually saw the "tutor unavailable"
fallback instead of a lesson.

Generating everything once and committing the result turns the AI from a runtime
dependency into a build step: the site then serves lessons as static files from
GitHub Pages with no backend, no cold start, and no per-view cost.

Output layout (under academy/content/):
    <lang>/<audience>.json   {"lessons": {"<module>__<lesson>": "<prose>"}}
    <lang>/chrome.json       {"mods": {...}, "lessons": {...}, "exams": {...}}

Русский is the canonical language and needs no chrome translation, so it only
gets the four audience bundles.

Run it
------
    export ANTHROPIC_API_KEY=sk-ant-...
    python3 ai_scoring/pregenerate.py            # fills in whatever is missing
    python3 ai_scoring/pregenerate.py --force    # regenerate everything
    python3 ai_scoring/pregenerate.py --lang ru --lang en

Existing entries are kept unless --force is passed, so an interrupted run costs
nothing to resume and editing one lesson only regenerates that lesson.
"""

from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from academy import AUDIENCES, LANG_NAMES, explain, translate_chrome  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
CURRICULUM_JS = ROOT / "academy" / "curriculum.js"
OUT = ROOT / "academy" / "content"
CANONICAL_LANG = "ru"          # curriculum.js is written in Russian
AUDIENCE_IDS = ["teen", "student", "working", "senior"]


def load_curriculum() -> list[dict]:
    """Read curriculum.js through Node so the JS file stays the single source."""
    script = (
        f"const c = require({json.dumps(str(CURRICULUM_JS))});"
        "process.stdout.write(JSON.stringify(c.CURRICULUM));"
    )
    try:
        raw = subprocess.run(
            ["node", "-e", script], capture_output=True, check=True, text=True
        ).stdout
    except FileNotFoundError:
        sys.exit("node is required to read curriculum.js — install Node.js and retry")
    except subprocess.CalledProcessError as e:
        sys.exit(f"could not read curriculum.js:\n{e.stderr}")
    return [m for m in json.loads(raw) if m.get("lessons")]


def read_json(path: Path) -> dict:
    if not path.exists():
        return {}
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except ValueError:
        print(f"  ! {path.name} was unreadable — starting it fresh")
        return {}


def write_json(path: Path, data: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(data, ensure_ascii=False, indent=1, sort_keys=True) + "\n",
        encoding="utf-8",
    )


def lesson_chrome(lesson: dict) -> dict:
    """The strings on a lesson page that are not the prose body."""
    return {
        "title": lesson["title"],
        "visual": lesson.get("visual"),
        "sources": [
            {"ref": s.get("ref", ""), "note": s.get("note", "")}
            for s in lesson.get("sources", [])
        ],
        "check": [
            {"q": q["q"], "options": q["options"], "why": q["why"]}
            for q in lesson.get("check", [])
        ],
    }


def call(fn, *args, **kwargs):
    """Anthropic calls fail occasionally; a run of this length shouldn't die on one."""
    for attempt in range(4):
        try:
            return fn(*args, **kwargs)
        except Exception as e:                                  # noqa: BLE001
            if attempt == 3:
                raise
            wait = 2 ** attempt * 3
            print(f"    retry in {wait}s after {type(e).__name__}: {e}")
            time.sleep(wait)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--lang", action="append", dest="langs",
                    help="limit to these languages (repeatable)")
    ap.add_argument("--force", action="store_true",
                    help="regenerate entries that already exist")
    args = ap.parse_args()

    if not os.environ.get("ANTHROPIC_API_KEY"):
        sys.exit("ANTHROPIC_API_KEY is not set")

    langs = args.langs or list(LANG_NAMES)
    unknown = [l for l in langs if l not in LANG_NAMES]
    if unknown:
        sys.exit(f"unknown language(s): {unknown}. Valid: {sorted(LANG_NAMES)}")

    modules = load_curriculum()
    lessons = [(m, l) for m in modules for l in m["lessons"]]
    print(f"{len(modules)} modules · {len(lessons)} lessons · {len(langs)} languages\n")

    made = skipped = 0

    for lang in langs:
        print(f"── {lang} ({LANG_NAMES[lang]})")

        # 1. Lesson prose, one bundle per audience.
        for aud in AUDIENCE_IDS:
            path = OUT / lang / f"{aud}.json"
            bundle = read_json(path)
            body = bundle.setdefault("lessons", {})
            for module, lesson in lessons:
                key = f"{module['id']}__{lesson['id']}"
                if body.get(key) and not args.force:
                    skipped += 1
                    continue
                print(f"   {aud:<8} {key}")
                body[key] = call(
                    explain,
                    core=lesson["core"], sources=lesson.get("sources", []),
                    audience=aud, lang=lang, title=lesson["title"],
                )
                made += 1
                write_json(path, bundle)      # checkpoint after every call
            write_json(path, bundle)

        # 2. Titles, visual cards, source captions, quiz text — language only.
        if lang == CANONICAL_LANG:
            print("   chrome: canonical language, nothing to translate")
            continue

        path = OUT / lang / "chrome.json"
        chrome = read_json(path)
        mods = chrome.setdefault("mods", {})
        lchrome = chrome.setdefault("lessons", {})
        exams = chrome.setdefault("exams", {})

        if not mods or args.force:
            print("   chrome: module titles")
            payload = {m["id"]: {"title": m["title"], "subtitle": m["subtitle"]}
                       for m in modules}
            chrome["mods"] = call(translate_chrome, payload, lang) or {}
            made += 1
            write_json(path, chrome)
        else:
            skipped += 1

        for module, lesson in lessons:
            key = f"{module['id']}__{lesson['id']}"
            if lchrome.get(key) and not args.force:
                skipped += 1
                continue
            print(f"   chrome:  {key}")
            lchrome[key] = call(translate_chrome, lesson_chrome(lesson), lang) or {}
            made += 1
            write_json(path, chrome)

        for module in modules:
            if exams.get(module["id"]) and not args.force:
                skipped += 1
                continue
            print(f"   chrome:  exam {module['id']}")
            src = [{"q": q["q"], "options": q["options"], "why": q["why"]}
                   for q in module.get("exam", [])]
            got = call(translate_chrome, {"exam": src}, lang) or {}
            exams[module["id"]] = got.get("exam", [])
            made += 1
            write_json(path, chrome)

        write_json(path, chrome)

    print(f"\n{made} generated · {skipped} already present")
    print(f"written to {OUT.relative_to(ROOT)}/")


if __name__ == "__main__":
    main()
