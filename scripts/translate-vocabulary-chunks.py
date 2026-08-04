"""
EngVox Vocabulary Translation Pipeline (chunk-based, resumable)

Translates the full vocabulary corpus (14k+ words) into 14 target languages
via small chunks that can be processed by:
  - DeepL API (automatic)          -> mode: deepl
  - Azure Translator (automatic)   -> mode: azure
  - Yandex Translate (automatic)   -> mode: yandex
  - another AI / human translator  -> mode: extract (hand chunks out, merge results)

Data flow:
  data/canonical/vocabulary/vocabulary.normalized.json   (source, 14199 terms)
    -> extract  -> data/translations/chunks/chunk-NNN.json
    -> translate (DeepL, Azure, Yandex, or external AI)
    -> results  -> data/translations/results/chunk-NNN.<lang>.json
    -> merge    -> data/translations/vocabulary-translations.json

Usage:
  python scripts/translate-vocabulary-chunks.py stats
  python scripts/translate-vocabulary-chunks.py extract --priority p1 --chunk-size 300
  python scripts/translate-vocabulary-chunks.py deepl --chunk 001 --lang tr
  python scripts/translate-vocabulary-chunks.py deepl --chunk 001 --lang all
  python scripts/translate-vocabulary-chunks.py azure --chunk 001 --lang tr
  python scripts/translate-vocabulary-chunks.py azure --chunk 001 --lang all
  python scripts/translate-vocabulary-chunks.py yandex --chunk 001 --lang tr
  python scripts/translate-vocabulary-chunks.py yandex --chunk 001 --lang all
  python scripts/translate-vocabulary-chunks.py merge
  python scripts/translate-vocabulary-chunks.py validate --file data/translations/results/chunk-001.ar.json

Priorities:
  p1 = CEFR A1+A2 terms (ship first), p2 = the rest, all = everything
"""

import argparse
import json
import os
import re
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).parent.parent
SOURCE = ROOT / "data" / "canonical" / "vocabulary" / "vocabulary.normalized.json"
TARGET = ROOT / "data" / "translations" / "vocabulary-translations.json"
CHUNKS_DIR = ROOT / "data" / "translations" / "chunks"
RESULTS_DIR = ROOT / "data" / "translations" / "results"

# en is the source language for definitions/examples; tr is the source for meanings
TARGET_LANGUAGES = ["tr", "ar", "de", "es", "pt", "fr", "ru", "zh", "ja", "it", "vi", "pl", "id", "nl"]

DEEPL_LANGUAGES = {
    "tr": "TR", "ar": "AR", "de": "DE", "es": "ES", "pt": "PT-BR",
    "fr": "FR", "ru": "RU", "zh": "ZH", "ja": "JA", "it": "IT",
    "vi": "VI", "pl": "PL", "id": "ID", "nl": "NL",
}

# Azure Translator language codes
AZURE_LANGUAGES = {
    "tr": "tr", "ar": "ar", "de": "de", "es": "es", "pt": "pt-BR",
    "fr": "fr", "ru": "ru", "zh": "zh-Hans", "ja": "ja", "it": "it",
    "vi": "vi", "pl": "pl", "id": "id", "nl": "nl",
}

# Yandex Translate language codes
YANDEX_LANGUAGES = {
    "tr": "tr", "ar": "ar", "de": "de", "es": "es", "pt": "pt",
    "fr": "fr", "ru": "ru", "zh": "zh", "ja": "ja", "it": "it",
    "vi": "vi", "pl": "pl", "id": "id", "nl": "nl",
}

BATCH_SEP = "\n|||SEP|||\n"


def load_source():
    with open(SOURCE, encoding="utf-8") as f:
        terms = json.load(f)
    # Deduplicate by term (case-insensitive); keep first occurrence.
    seen = {}
    for t in terms:
        key = t["term"].strip().lower()
        if key not in seen:
            seen[key] = t
    return list(seen.values())


def load_target():
    if TARGET.exists():
        with open(TARGET, encoding="utf-8") as f:
            return json.load(f)
    return {}


def save_target(data):
    TARGET.parent.mkdir(parents=True, exist_ok=True)
    with open(TARGET, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=1)


def covered_langs(entry):
    if not isinstance(entry, dict):
        return set()
    ok = set()
    for lang, fields in entry.items():
        if isinstance(fields, dict) and all(
            str(fields.get(k, "")).strip() for k in ("meaning", "definition", "example")
        ):
            ok.add(lang)
    return ok


def filter_priority(terms, priority):
    if priority == "all":
        return terms
    if priority == "p1":
        return [t for t in terms if t.get("cefrLevel") in ("A1", "A2")]
    return [t for t in terms if t.get("cefrLevel") not in ("A1", "A2")]


# ---------------------------------------------------------------------------
# commands
# ---------------------------------------------------------------------------

def cmd_stats(_args):
    terms = load_source()
    target = load_target()
    total = len(terms)
    print(f"source terms (deduped): {total}")
    print(f"translated entries in target file: {len(target)}")
    print("\ncoverage per language (terms with meaning+definition+example):")
    for lang in TARGET_LANGUAGES:
        n = sum(1 for t in terms if lang in covered_langs(target.get(t["term"].strip().lower())))
        print(f"  {lang}: {n:>6} / {total}  ({100 * n / total:.1f}%)")
    p1 = [t for t in terms if t.get("cefrLevel") in ("A1", "A2")]
    print(f"\nP1 (A1+A2) terms: {len(p1)}")
    for lang in TARGET_LANGUAGES:
        n = sum(1 for t in p1 if lang in covered_langs(target.get(t["term"].strip().lower())))
        print(f"  {lang}: {n:>6} / {len(p1)}  ({100 * n / len(p1):.1f}%)")


def cmd_extract(args):
    terms = filter_priority(load_source(), args.priority)
    target = load_target()
    todo = []
    for t in terms:
        key = t["term"].strip().lower()
        have = covered_langs(target.get(key))
        missing = [l for l in TARGET_LANGUAGES if l not in have]
        if missing:
            todo.append({
                "term": t["term"],
                "domain": t.get("domain", ""),
                "cefrLevel": t.get("cefrLevel", ""),
                "meaning_tr": t.get("turkishMeaning", ""),
                "definition_en": t.get("definition", ""),
                "example_en": t.get("exampleSentence", ""),
                "missing_langs": missing,
            })

    CHUNKS_DIR.mkdir(parents=True, exist_ok=True)
    existing = [p.stem for p in CHUNKS_DIR.glob("chunk-*.json")]
    start = 1 + max([int(re.sub(r"\D", "", s)) for s in existing], default=0)
    size = args.chunk_size
    written = 0
    for i in range(0, len(todo), size):
        part = todo[i:i + size]
        name = CHUNKS_DIR / f"chunk-{start + written:03d}.json"
        with open(name, "w", encoding="utf-8") as f:
            json.dump(part, f, ensure_ascii=False, indent=1)
        written += 1
    print(f"terms needing translation: {len(todo)}")
    print(f"wrote {written} chunk(s) of up to {size} terms to {CHUNKS_DIR}")


def batch_translate(translator, texts, deepl_lang, source_lang):
    non_empty = [(i, t) for i, t in enumerate(texts) if t and t.strip()]
    if not non_empty:
        return texts[:]
    joined = BATCH_SEP.join(t for _, t in non_empty)
    result = translator.translate_text(joined, target_lang=deepl_lang, source_lang=source_lang)
    parts = result.text.split("|||SEP|||")
    out = texts[:]
    for idx, (orig_i, _) in enumerate(non_empty):
        if idx < len(parts):
            out[orig_i] = parts[idx].strip()
    return out


def cmd_deepl(args):
    import deepl
    from dotenv import load_dotenv

    load_dotenv()
    api_key = os.getenv("DEEPL_API_KEY")
    if not api_key:
        print("Error: set DEEPL_API_KEY in .env")
        sys.exit(1)
    chunk_path = CHUNKS_DIR / f"chunk-{args.chunk}.json"
    if not chunk_path.exists():
        print(f"Error: {chunk_path} not found (run extract first)")
        sys.exit(1)
    chunk = json.load(open(chunk_path, encoding="utf-8"))
    translator = deepl.Translator(api_key)
    langs = TARGET_LANGUAGES if args.lang == "all" else [args.lang]
    RESULTS_DIR.mkdir(parents=True, exist_ok=True)

    for lang in langs:
        out_path = RESULTS_DIR / f"chunk-{args.chunk}.{lang}.json"
        if out_path.exists() and not args.force:
            print(f"[{lang}] {out_path.name} exists, skip (--force to redo)")
            continue
        deepl_lang = DEEPL_LANGUAGES[lang]
        if lang == "tr":
            # Turkish is the source language for meanings: no API call needed.
            result = {
                c["term"]: {
                    "meaning": c["meaning_tr"],
                    "definition": c["definition_en"],
                    "example": c["example_en"],
                }
                for c in chunk
            }
        else:
            # meanings: TR -> target ; definitions/examples: EN -> target (unless --meanings-only)
            meanings = batch_translate(translator, [c["meaning_tr"] for c in chunk], deepl_lang, "TR")
            if getattr(args, "meanings_only", False):
                defs = [c["definition_en"] for c in chunk]
                exs = [c["example_en"] for c in chunk]
            else:
                defs = batch_translate(translator, [c["definition_en"] for c in chunk], deepl_lang, "EN")
                exs = batch_translate(translator, [c["example_en"] for c in chunk], deepl_lang, "EN")
            result = {
                chunk[i]["term"]: {"meaning": meanings[i], "definition": defs[i], "example": exs[i]}
                for i in range(len(chunk))
            }
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(result, f, ensure_ascii=False, indent=1)
        print(f"[{lang}] wrote {out_path.name} ({len(result)} terms)")


def azure_batch_translate(texts, target_lang, source_lang, api_key, region):
    """Translate a batch of texts using Azure Translator REST API."""
    import requests
    import uuid

    non_empty = [(i, t) for i, t in enumerate(texts) if t and t.strip()]
    if not non_empty:
        return texts[:]

    # Azure Translator API endpoint
    endpoint = f"https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&from={source_lang}&to={target_lang}"

    headers = {
        "Ocp-Apim-Subscription-Key": api_key,
        "Ocp-Apim-Subscription-Region": region,
        "Content-Type": "application/json",
        "X-ClientTraceId": str(uuid.uuid4()),
    }

    body = [{"text": t} for _, t in non_empty]

    response = requests.post(endpoint, headers=headers, json=body, timeout=60)
    response.raise_for_status()
    results = response.json()

    out = texts[:]
    for idx, (orig_i, _) in enumerate(non_empty):
        if idx < len(results) and results[idx].get("translations"):
            out[orig_i] = results[idx]["translations"][0]["text"].strip()
    return out


def cmd_azure(args):
    import requests
    from dotenv import load_dotenv

    load_dotenv()
    api_key = os.getenv("AZURE_TRANSLATOR_KEY")
    region = os.getenv("AZURE_TRANSLATOR_REGION")
    if not api_key or not region:
        print("Error: set AZURE_TRANSLATOR_KEY and AZURE_TRANSLATOR_REGION in .env")
        sys.exit(1)

    chunk_path = CHUNKS_DIR / f"chunk-{args.chunk}.json"
    if not chunk_path.exists():
        print(f"Error: {chunk_path} not found (run extract first)")
        sys.exit(1)
    chunk = json.load(open(chunk_path, encoding="utf-8"))
    langs = TARGET_LANGUAGES if args.lang == "all" else [args.lang]
    RESULTS_DIR.mkdir(parents=True, exist_ok=True)

    for lang in langs:
        out_path = RESULTS_DIR / f"chunk-{args.chunk}.{lang}.json"
        if out_path.exists() and not args.force:
            print(f"[{lang}] {out_path.name} exists, skip (--force to redo)")
            continue
        azure_lang = AZURE_LANGUAGES[lang]
        # meanings: TR -> target ; definitions/examples: EN -> target
        meanings = azure_batch_translate([c["meaning_tr"] for c in chunk], azure_lang, "tr", api_key, region)
        defs = azure_batch_translate([c["definition_en"] for c in chunk], azure_lang, "en", api_key, region)
        exs = azure_batch_translate([c["example_en"] for c in chunk], azure_lang, "en", api_key, region)
        result = {
            chunk[i]["term"]: {"meaning": meanings[i], "definition": defs[i], "example": exs[i]}
            for i in range(len(chunk))
        }
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(result, f, ensure_ascii=False, indent=1)
        print(f"[{lang}] wrote {out_path.name} ({len(result)} terms)")


def yandex_batch_translate(texts, target_lang, source_lang, api_key):
    """Translate a batch of texts using Yandex Translate API v1.5 (legacy)."""
    import requests

    non_empty = [(i, t) for i, t in enumerate(texts) if t and t.strip()]
    if not non_empty:
        return texts[:]

    # Yandex Translate API v1.5 endpoint (legacy)
    endpoint = "https://translate.yandex.net/api/v1.5/tr.json/translate"

    # lang format: "source-target" (e.g., "tr-de")
    lang_pair = f"{source_lang}-{target_lang}"

    # Join texts with a delimiter that won't appear in translations
    joined = BATCH_SEP.join(t for _, t in non_empty)

    data = {
        "key": api_key,
        "text": joined,
        "lang": lang_pair,
    }

    response = requests.post(endpoint, data=data, timeout=60)
    response.raise_for_status()
    results = response.json()

    if results.get("code") != 200:
        raise Exception(f"Yandex API error: {results.get('message', 'Unknown error')}")

    translated_texts = results.get("text", [""])
    parts = translated_texts[0].split("|||SEP|||")

    out = texts[:]
    for idx, (orig_i, _) in enumerate(non_empty):
        if idx < len(parts):
            out[orig_i] = parts[idx].strip()
    return out


def cmd_yandex(args):
    import requests
    from dotenv import load_dotenv

    load_dotenv()
    api_key = os.getenv("YANDEX_API_KEY")
    if not api_key:
        print("Error: set YANDEX_API_KEY in .env")
        sys.exit(1)

    chunk_path = CHUNKS_DIR / f"chunk-{args.chunk}.json"
    if not chunk_path.exists():
        print(f"Error: {chunk_path} not found (run extract first)")
        sys.exit(1)
    chunk = json.load(open(chunk_path, encoding="utf-8"))
    langs = TARGET_LANGUAGES if args.lang == "all" else [args.lang]
    RESULTS_DIR.mkdir(parents=True, exist_ok=True)

    for lang in langs:
        out_path = RESULTS_DIR / f"chunk-{args.chunk}.{lang}.json"
        if out_path.exists() and not args.force:
            print(f"[{lang}] {out_path.name} exists, skip (--force to redo)")
            continue
        yandex_lang = YANDEX_LANGUAGES[lang]
        # meanings: TR -> target ; definitions/examples: EN -> target
        meanings = yandex_batch_translate([c["meaning_tr"] for c in chunk], yandex_lang, "tr", api_key)
        defs = yandex_batch_translate([c["definition_en"] for c in chunk], yandex_lang, "en", api_key)
        exs = yandex_batch_translate([c["example_en"] for c in chunk], yandex_lang, "en", api_key)
        result = {
            chunk[i]["term"]: {"meaning": meanings[i], "definition": defs[i], "example": exs[i]}
            for i in range(len(chunk))
        }
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(result, f, ensure_ascii=False, indent=1)
        print(f"[{lang}] wrote {out_path.name} ({len(result)} terms)")


def validate_result_file(path, chunk_path=None):
    """Returns (ok_entries, list_of_problems)."""
    data = json.load(open(path, encoding="utf-8"))
    problems = []
    if not isinstance(data, dict):
        return {}, ["top level must be an object keyed by term"]
    expected_terms = None
    if chunk_path and Path(chunk_path).exists():
        expected_terms = {c["term"] for c in json.load(open(chunk_path, encoding="utf-8"))}
    ok = {}
    for term, fields in data.items():
        if expected_terms is not None and term not in expected_terms:
            problems.append(f"unexpected term: {term}")
        if not isinstance(fields, dict):
            problems.append(f"{term}: value must be an object")
            continue
        bad = [k for k in ("meaning", "definition", "example")
               if not str(fields.get(k, "")).strip()]
        if bad:
            problems.append(f"{term}: empty fields {bad}")
            continue
        if re.search(r"@@|{[a-z]+}|\|\|\|", json.dumps(fields)):
            problems.append(f"{term}: contains placeholder/separator leftovers")
            continue
        ok[term] = fields
    if expected_terms is not None:
        missing = expected_terms - set(data.keys())
        if missing:
            problems.append(f"missing {len(missing)} terms, e.g. {sorted(missing)[:5]}")
    return ok, problems


def cmd_validate(args):
    chunk_id = re.search(r"chunk-(\d+)", args.file)
    chunk_path = CHUNKS_DIR / f"chunk-{chunk_id.group(1)}.json" if chunk_id else None
    ok, problems = validate_result_file(args.file, chunk_path)
    print(f"valid entries: {len(ok)}")
    for p in problems[:20]:
        print("  PROBLEM:", p)
    if len(problems) > 20:
        print(f"  ... and {len(problems) - 20} more")
    sys.exit(0 if not problems else 1)


def cmd_merge(_args):
    target = load_target()
    files = sorted(RESULTS_DIR.glob("chunk-*.*.json"))
    if not files:
        print(f"no result files in {RESULTS_DIR}")
        return
    added = 0
    for path in files:
        lang = path.stem.rsplit(".", 1)[-1]
        if lang not in TARGET_LANGUAGES:
            print(f"skip {path.name}: unknown lang '{lang}'")
            continue
        chunk_id = re.search(r"chunk-(\d+)", path.name).group(1)
        ok, problems = validate_result_file(path, CHUNKS_DIR / f"chunk-{chunk_id}.json")
        if problems:
            print(f"skip {path.name}: {len(problems)} problem(s), run validate for details")
            continue
        for term, fields in ok.items():
            key = term.strip().lower()
            target.setdefault(key, {})[lang] = fields
            added += 1
        print(f"merged {path.name}: {len(ok)} terms x {lang}")
    save_target(target)
    print(f"\nadded {added} term-language entries; total terms in file: {len(target)}")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="cmd", required=True)

    sub.add_parser("stats")

    p = sub.add_parser("extract")
    p.add_argument("--priority", choices=["p1", "p2", "all"], default="p1")
    p.add_argument("--chunk-size", type=int, default=300)

    p = sub.add_parser("deepl")
    p.add_argument("--chunk", required=True, help="chunk number, e.g. 001")
    p.add_argument("--lang", required=True, help="target lang code or 'all'")
    p.add_argument("--force", action="store_true")
    p.add_argument(
        "--meanings-only",
        action="store_true",
        help="translate only meanings (quota saver); keep EN definition/example",
    )

    p = sub.add_parser("azure")
    p.add_argument("--chunk", required=True, help="chunk number, e.g. 001")
    p.add_argument("--lang", required=True, help="target lang code or 'all'")
    p.add_argument("--force", action="store_true")

    p = sub.add_parser("yandex")
    p.add_argument("--chunk", required=True, help="chunk number, e.g. 001")
    p.add_argument("--lang", required=True, help="target lang code or 'all'")
    p.add_argument("--force", action="store_true")

    p = sub.add_parser("validate")
    p.add_argument("--file", required=True)

    sub.add_parser("merge")

    args = parser.parse_args()
    {"stats": cmd_stats, "extract": cmd_extract, "deepl": cmd_deepl, "azure": cmd_azure, "yandex": cmd_yandex,
     "validate": cmd_validate, "merge": cmd_merge}[args.cmd](args)


if __name__ == "__main__":
    main()
