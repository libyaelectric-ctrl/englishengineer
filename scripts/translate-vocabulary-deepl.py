"""
DeepL Vocabulary Translation Script for EngVox (Batch-Optimized)

Translates vocabulary meaning (TR→14 langs), definition (EN→14 langs), example (EN→14 langs).
All words are batched per language to minimize API calls (42 calls total).

Usage:
    DEEPL_API_KEY="your-key" python scripts/translate-vocabulary-deepl.py

Output:
    data/translations/vocabulary-translations.json
"""

import json
import os
import sys
import time
from pathlib import Path

import deepl
from dotenv import load_dotenv

BATCH_SEP = "\n|||SEP|||\n"

DEEPL_LANGUAGES = {
    "en": "EN", "tr": "TR", "ar": "AR", "de": "DE", "es": "ES",
    "pt": "PT-BR", "fr": "FR", "ru": "RU", "zh": "ZH", "ja": "JA",
    "it": "IT", "vi": "VI", "pl": "PL", "id": "ID", "nl": "NL",
}


def batch_translate(translator: deepl.Translator, texts: list[str], target_lang: str, source_lang: str) -> list[str]:
    """Translate list of texts in one API call."""
    non_empty = [(i, t) for i, t in enumerate(texts) if t and t.strip()]
    if not non_empty:
        return texts[:]

    joined = BATCH_SEP.join(t for _, t in non_empty)
    result = translator.translate_text(joined, target_lang=target_lang, source_lang=source_lang)
    parts = result.text.split("|||SEP|||")

    out = texts[:]
    for idx, (orig_i, _) in enumerate(non_empty):
        if idx < len(parts):
            out[orig_i] = parts[idx].strip()
    return out


def main():
    load_dotenv()
    api_key = os.getenv("DEEPL_API_KEY")
    if not api_key:
        print("Error: Set DEEPL_API_KEY")
        sys.exit(1)

    translator = deepl.Translator(api_key)
    try:
        usage = translator.get_usage()
        if usage.character:
            print(f"DeepL: {usage.character.count:,} / {usage.character.limit:,} chars used")
    except deepl.DeepLException as e:
        print(f"DeepL error: {e}")
        sys.exit(1)

    project_root = Path(__file__).parent.parent
    vocab_path = project_root / "src" / "features" / "vocabulary" / "data" / "vocabulary.data.json"
    output_path = project_root / "data" / "translations" / "vocabulary-translations.json"

    with open(vocab_path, "r", encoding="utf-8") as f:
        vocabulary = json.load(f)
    print(f"Loaded {len(vocabulary)} words")

    words = [e["word"] for e in vocabulary]
    meanings_tr = [e.get("meaning", "") for e in vocabulary]
    definitions_en = [e.get("definition", "") for e in vocabulary]
    examples_en = [e.get("example", "") for e in vocabulary]

    target_languages = [lang for lang in DEEPL_LANGUAGES if lang != "en"]
    translations = {}
    total_chars = 0
    start_time = time.time()

    for lang in target_languages:
        deepl_lang = DEEPL_LANGUAGES[lang]
        print(f"\n[{lang}] Translating {len(vocabulary)} words...")

        try:
            # meanings: TR → target
            translated_meanings = batch_translate(translator, meanings_tr, deepl_lang, "TR")
            total_chars += sum(len(m) for m in meanings_tr)
            print(f"  meanings done")

            # definitions + examples: EN → target
            translated_defs = batch_translate(translator, definitions_en, deepl_lang, "EN")
            total_chars += sum(len(d) for d in definitions_en)
            print(f"  definitions done")

            translated_exs = batch_translate(translator, examples_en, deepl_lang, "EN")
            total_chars += sum(len(e) for e in examples_en)
            print(f"  examples done")

            for i, word in enumerate(words):
                translations.setdefault(word, {})
                translations[word][lang] = {
                    "meaning": translated_meanings[i],
                    "definition": translated_defs[i],
                    "example": translated_exs[i],
                }

        except deepl.DeepLException as e:
            print(f"  ERROR ({lang}): {e}")
            if "quota" in str(e).lower():
                print("Quota exceeded. Saving partial results.")
                break

    # English entries (original)
    for i, word in enumerate(words):
        translations.setdefault(word, {})
        translations[word]["en"] = {
            "meaning": definitions_en[i],
            "definition": definitions_en[i],
            "example": examples_en[i],
        }

    # Save
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(translations, f, ensure_ascii=False, indent=2)

    elapsed = time.time() - start_time
    print(f"\nDone in {elapsed:.1f}s")
    print(f"Words: {len(translations)}, Languages: {len(DEEPL_LANGUAGES)}")
    print(f"Total chars: {total_chars:,}")
    print(f"Output: {output_path} ({output_path.stat().st_size / 1024:.1f} KB)")

    # Final usage
    try:
        usage = translator.get_usage()
        if usage.character:
            print(f"DeepL final: {usage.character.count:,} / {usage.character.limit:,} chars")
    except Exception:
        pass


if __name__ == "__main__":
    main()
