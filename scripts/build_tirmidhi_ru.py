import concurrent.futures
import json
import os
import re
import time
import urllib.error
import urllib.request

SOURCE_URL = "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/eng-tirmidhi.json"
CC0_SOURCE_URL = "https://i-muslim.com/api/v1/translations/hadith/tirmidhi/ru"
TRANSLATE_URL = "https://amnetwork.onrender.com/hadith/translate"
REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTPUT_PATH = os.path.join(REPO_ROOT, "hadith", "data", "ai", "ru", "tirmidhi.json")
MAX_ITEMS = 36
MAX_BATCH_CHARS = 8000
MAX_PIECE_CHARS = 3600


def get_json(url):
    with urllib.request.urlopen(url, timeout=90) as response:
        return json.load(response)


def split_text(text):
    if len(text) <= MAX_PIECE_CHARS:
        return [text]
    sentences = re.split(r"(?<=[.!?\]])\s+", text)
    pieces = []
    current = ""
    for sentence in sentences:
        if not sentence:
            continue
        if len(sentence) > MAX_PIECE_CHARS:
            if current:
                pieces.append(current)
                current = ""
            pieces.extend(
                sentence[start:start + MAX_PIECE_CHARS]
                for start in range(0, len(sentence), MAX_PIECE_CHARS)
            )
            continue
        candidate = sentence if not current else current + " " + sentence
        if len(candidate) > MAX_PIECE_CHARS:
            pieces.append(current)
            current = sentence
        else:
            current = candidate
    if current:
        pieces.append(current)
    return pieces


def translate(texts):
    payload = json.dumps({"lang": "ru", "texts": texts}, ensure_ascii=False).encode("utf-8")
    request = urllib.request.Request(
        TRANSLATE_URL,
        data=payload,
        headers={"Content-Type": "application/json", "User-Agent": "AMNetwork-static-translation/1.0"},
        method="POST",
    )
    for attempt in range(1, 4):
        try:
            with urllib.request.urlopen(request, timeout=180) as response:
                body = json.load(response)
            result = body.get("translations")
            if not isinstance(result, list) or len(result) != len(texts):
                raise RuntimeError("translation response shape mismatch")
            return result
        except urllib.error.HTTPError as error:
            retry_after = error.headers.get("Retry-After")
            detail = error.read().decode("utf-8", "replace")
            if error.code not in (429, 502, 503) or attempt == 3:
                raise RuntimeError(f"HTTP {error.code}: {detail}") from error
            wait = int(retry_after) if retry_after and retry_after.isdigit() else min(15 * attempt, 60)
            print(f"retry HTTP {error.code} in {wait}s", flush=True)
            time.sleep(wait)
        except (TimeoutError, urllib.error.URLError) as error:
            if attempt == 3:
                raise
            wait = min(15 * attempt, 60)
            print(f"retry network error in {wait}s: {error}", flush=True)
            time.sleep(wait)
    raise RuntimeError("translation retries exhausted")


def translate_resilient(texts):
    try:
        return translate(texts)
    except RuntimeError:
        if len(texts) <= 1:
            raise
        middle = len(texts) // 2
        print(f"splitting failed batch: {len(texts)} -> {middle}+{len(texts) - middle}", flush=True)
        return translate_resilient(texts[:middle]) + translate_resilient(texts[middle:])


def save(data):
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    temp_path = OUTPUT_PATH + ".tmp"
    with open(temp_path, "w", encoding="utf-8", newline="\n") as handle:
        json.dump(data, handle, ensure_ascii=False, indent=2)
        handle.write("\n")
    os.replace(temp_path, OUTPUT_PATH)


def load_cc0_seed():
    payload = get_json(CC0_SOURCE_URL)
    data = payload.get("data", {})
    sources = data.get("sources", {})
    authored = sources.get("authored", {})
    if authored.get("license") != "CC0-1.0":
        raise RuntimeError("i-muslim authored translation is not marked CC0-1.0")

    result = {}
    for item in data.get("items", []):
        text = item.get("text")
        if item.get("source") != "authored" or not isinstance(text, str) or not text.strip():
            continue
        result[str(item["number"])] = text.strip()
    if len(result) != authored.get("count"):
        raise RuntimeError("i-muslim authored translation count mismatch")
    return result


def main():
    source = get_json(SOURCE_URL)
    hadiths = source.get("hadiths", [])
    existing = {}
    if os.path.exists(OUTPUT_PATH):
        with open(OUTPUT_PATH, encoding="utf-8") as handle:
            existing = json.load(handle)

    # Seed from the redistributable Russian corpus published by i-muslim.
    # Its API marks every included row as authored and CC0-1.0. Existing AM
    # Network translations are kept only for citation numbers absent there.
    cc0_seed = load_cc0_seed()
    existing = {**existing, **cc0_seed}
    save(existing)
    print(f"seeded={len(cc0_seed)} combined={len(existing)}", flush=True)

    if os.environ.get("AMN_SEED_ONLY") == "1":
        return

    pending = [
        item for item in hadiths
        if str(item.get("hadithnumber")) not in existing
        and isinstance(item.get("text"), str)
        and item["text"].strip()
    ]
    empty_count = sum(
        1 for item in hadiths
        if not isinstance(item.get("text"), str) or not item["text"].strip()
    )
    total_translatable = len(hadiths) - empty_count
    print(
        f"source={len(hadiths)} translatable={total_translatable} empty={empty_count} "
        f"already={len(existing)} pending={len(pending)}",
        flush=True,
    )

    while pending:
        groups = []
        for _ in range(1):
            if not pending:
                break
            batch = []
            pieces = []
            chars = 0
            while pending:
                item = pending[0]
                item_pieces = split_text(item["text"])
                piece_chars = sum(len(piece) for piece in item_pieces)
                if batch and (
                    len(pieces) + len(item_pieces) > MAX_ITEMS
                    or chars + piece_chars > MAX_BATCH_CHARS
                ):
                    break
                pending.pop(0)
                batch.append((item, len(item_pieces)))
                pieces.extend(item_pieces)
                chars += piece_chars
            groups.append((batch, pieces, chars))

        with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:
            results = list(pool.map(lambda group: translate_resilient(group[1]), groups))

        for (batch, pieces, chars), translated in zip(groups, results):
            cursor = 0
            for item, piece_count in batch:
                number = str(item["hadithnumber"])
                existing[number] = " ".join(translated[cursor:cursor + piece_count]).strip()
                cursor += piece_count
            completed = len(existing)
            print(
                f"translated={completed}/{total_translatable} ({completed / total_translatable:.1%}) "
                f"last={batch[-1][0]['hadithnumber']} pieces={len(pieces)} chars={chars}",
                flush=True,
            )
        save(existing)

    print(f"complete output={OUTPUT_PATH} entries={len(existing)}", flush=True)


if __name__ == "__main__":
    main()
