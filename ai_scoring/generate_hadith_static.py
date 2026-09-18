#!/usr/bin/env python3
"""Build resumable static Tajik hadith translations.

The reader serves these files from /hadith/data/ai/tj/<book>.json and still
prioritises the separately maintained human-certified Tajik Bukhari entries.
Generated text is disclosed in the UI as AI-translated and unverified.
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import time
import urllib.request
from pathlib import Path

from hadith_translate import translate_hadiths

ROOT = Path(__file__).resolve().parents[1]
BOOKS = ("tirmidhi", "muslim", "bukhari")
SOURCE = "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/eng-{book}.json"
OUT_DIR = ROOT / "hadith" / "data" / "ai" / "tj"
CERTIFIED = ROOT / "hadith" / "data" / "tj-certified" / "bukhari.json"
MAX_BATCH_ITEMS = 8
MAX_BATCH_CHARS = 10_000


def load_json(path: Path, default):
    if not path.exists():
        return default
    return json.loads(path.read_text(encoding="utf-8"))


def save_json(path: Path, data: dict[str, str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    ordered = dict(sorted(data.items(), key=lambda pair: int(pair[0])))
    tmp = path.with_suffix(path.suffix + ".tmp")
    tmp.write_text(
        json.dumps(ordered, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    tmp.replace(path)


def fetch_book(book: str) -> list[dict]:
    req = urllib.request.Request(
        SOURCE.format(book=book),
        headers={"User-Agent": "AMNetwork-hadith-translation/1.0"},
    )
    with urllib.request.urlopen(req, timeout=45) as response:
        payload = json.load(response)
    return payload.get("hadiths", [])


def make_batches(items: list[tuple[str, str]]) -> list[list[tuple[str, str]]]:
    batches: list[list[tuple[str, str]]] = []
    current: list[tuple[str, str]] = []
    chars = 0
    for item in items:
        item_chars = len(item[1])
        if current and (len(current) >= MAX_BATCH_ITEMS or chars + item_chars > MAX_BATCH_CHARS):
            batches.append(current)
            current = []
            chars = 0
        current.append(item)
        chars += item_chars
    if current:
        batches.append(current)
    return batches


def translate_with_recovery(batch: list[tuple[str, str]]) -> list[str]:
    texts = [text for _, text in batch]
    for attempt in range(3):
        try:
            translated = translate_hadiths(texts, "tj")
        except Exception as exc:
            print(f"attempt {attempt + 1}/3 failed: {exc}", file=sys.stderr)
            translated = None
        if translated and len(translated) == len(texts) and all(x.strip() for x in translated):
            return [x.strip() for x in translated]
        if attempt < 2:
            time.sleep(5 * (attempt + 1))

    if len(batch) == 1:
        raise RuntimeError(f"translation failed for hadith {batch[0][0]}")

    midpoint = len(batch) // 2
    return translate_with_recovery(batch[:midpoint]) + translate_with_recovery(batch[midpoint:])


def build(book: str, max_items: int | None) -> int:
    output_path = OUT_DIR / f"{book}.json"
    output: dict[str, str] = load_json(output_path, {})
    certified = load_json(CERTIFIED, {}) if book == "bukhari" else {}

    source = fetch_book(book)
    pending: list[tuple[str, str]] = []
    for hadith in source:
        number = str(hadith.get("hadithnumber", ""))
        text = str(hadith.get("text") or "").strip()
        if not number or not text or number in output or number in certified:
            continue
        pending.append((number, text))

    if max_items is not None:
        pending = pending[:max_items]

    print(
        f"{book}: source={len(source)} existing={len(output)} "
        f"certified_skipped={len(certified)} pending_this_run={len(pending)}"
    )
    if not pending:
        return 0

    completed = 0
    batches = make_batches(pending)
    for index, batch in enumerate(batches, start=1):
        translations = translate_with_recovery(batch)
        for (number, _), translation in zip(batch, translations):
            output[number] = translation
        completed += len(batch)
        save_json(output_path, output)
        print(f"{book}: batch {index}/{len(batches)}, saved {completed}/{len(pending)}")

    return completed


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--book", choices=BOOKS, required=True)
    parser.add_argument(
        "--max-items",
        type=int,
        default=None,
        help="Translate at most this many previously missing non-empty records.",
    )
    args = parser.parse_args()

    if not os.environ.get("ANTHROPIC_API_KEY"):
        parser.error("ANTHROPIC_API_KEY is required")
    if args.max_items is not None and args.max_items < 1:
        parser.error("--max-items must be positive")

    completed = build(args.book, args.max_items)
    print(f"completed={completed}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
