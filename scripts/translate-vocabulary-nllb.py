"""
NLLB-200 Vocabulary Translation Script for EngVox

Translates vocabulary meanings, definitions, and examples to all 15 interface languages.
Uses Meta's NLLB-200 (No Language Left Behind) model running locally.

Usage:
    pip install transformers torch sentencepiece
    python scripts/translate-vocabulary-nllb.py

Output:
    data/translations/vocabulary-translations.json
"""

import json
import os
import sys
import time
from pathlib import Path
from typing import Dict, List, Optional

import torch
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer

# NLLB language codes mapped to our interface language IDs
NLLB_LANGUAGES = {
    "en": "eng_Latn",
    "tr": "tur_Latn",
    "ar": "arb_Arab",
    "de": "deu_Latn",
    "es": "spa_Latn",
    "pt": "por_Latn",
    "fr": "fra_Latn",
    "ru": "rus_Cyrl",
    "zh": "zho_Hans",
    "ja": "jpn_Jpan",
    "it": "ita_Latn",
    "vi": "vie_Latn",
    "pl": "pol_Latn",
    "id": "ind_Latn",
    "nl": "nld_Latn",
}

# Source language for meanings (Turkish in the vocabulary data)
SOURCE_LANG = "tur_Latn"

# Batch size for translation (adjust based on GPU memory)
BATCH_SIZE = 32

# Maximum sequence length
MAX_LENGTH = 128


class NLLBTranslator:
    """Translates text using Meta's NLLB-200 model."""

    def __init__(self, model_name: str = "facebook/nllb-200-distilled-600M"):
        print(f"Loading NLLB model: {model_name}")
        print("This may take a few minutes on first run...")

        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModelForSeq2SeqLM.from_pretrained(model_name)

        # Use GPU if available
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = self.model.to(self.device)
        print(f"Using device: {self.device}")

    def translate_batch(
        self, texts: List[str], source_lang: str, target_lang: str
    ) -> List[str]:
        """Translate a batch of texts from source to target language."""
        if not texts:
            return []

        # Set source language
        self.tokenizer.src_lang = source_lang

        # Tokenize
        inputs = self.tokenizer(
            texts,
            return_tensors="pt",
            padding=True,
            truncation=True,
            max_length=MAX_LENGTH,
        ).to(self.device)

        # Generate translations
        with torch.no_grad():
            outputs = self.model.generate(
                **inputs,
                forced_bos_token_id=self.tokenizer.lang_code_to_id[target_lang],
                max_length=MAX_LENGTH,
                num_beams=4,
                early_stopping=True,
            )

        # Decode translations
        translations = self.tokenizer.batch_decode(outputs, skip_special_tokens=True)
        return translations

    def translate_meaning(
        self, meaning: str, target_lang: str
    ) -> str:
        """Translate a single meaning from Turkish to target language."""
        # Turkish meanings are often comma-separated
        parts = [p.strip() for p in meaning.split(",")]
        translated_parts = self.translate_batch(
            parts, SOURCE_LANG, NLLB_LANGUAGES[target_lang]
        )
        return ", ".join(translated_parts)


def load_vocabulary(vocab_path: Path) -> List[dict]:
    """Load vocabulary data from JSON file."""
    with open(vocab_path, "r", encoding="utf-8") as f:
        return json.load(f)


def save_translations(translations: dict, output_path: Path):
    """Save translations to JSON file."""
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(translations, f, ensure_ascii=False, indent=2)
    print(f"Saved translations to: {output_path}")


def translate_vocabulary(
    translator: NLLBTranslator,
    vocabulary: List[dict],
    target_languages: List[str],
    batch_size: int = BATCH_SIZE,
) -> dict:
    """Translate all vocabulary entries to target languages."""

    translations = {}
    total = len(vocabulary)

    for i, entry in enumerate(vocabulary):
        word = entry["word"]
        meaning = entry.get("meaning", "")

        print(f"[{i+1}/{total}] Translating: {word}")

        word_translations = {}

        for lang in target_languages:
            if lang == "tr":
                # Turkish is already the source
                word_translations[lang] = meaning
                continue

            try:
                translated = translator.translate_meaning(meaning, lang)
                word_translations[lang] = translated
            except Exception as e:
                print(f"  Error translating to {lang}: {e}")
                word_translations[lang] = meaning  # Fallback to Turkish

        translations[word] = word_translations

        # Progress update every 100 words
        if (i + 1) % 100 == 0:
            print(f"Progress: {i+1}/{total} words translated")

    return translations


def main():
    """Main entry point."""
    # Paths
    project_root = Path(__file__).parent.parent
    vocab_path = project_root / "src" / "features" / "vocabulary" / "data" / "vocabulary.data.json"
    output_path = project_root / "data" / "translations" / "vocabulary-translations.json"

    # Check if vocabulary file exists
    if not vocab_path.exists():
        print(f"Error: Vocabulary file not found at {vocab_path}")
        sys.exit(1)

    # Load vocabulary
    print(f"Loading vocabulary from: {vocab_path}")
    vocabulary = load_vocabulary(vocab_path)
    print(f"Loaded {len(vocabulary)} vocabulary entries")

    # Target languages (all except Turkish which is the source)
    target_languages = [lang for lang in NLLB_LANGUAGES.keys() if lang != "tr"]

    # Initialize translator
    translator = NLLBTranslator()

    # Translate vocabulary
    print(f"\nTranslating to {len(target_languages)} languages...")
    start_time = time.time()
    translations = translate_vocabulary(translator, vocabulary, target_languages)
    elapsed = time.time() - start_time
    print(f"\nTranslation completed in {elapsed:.1f} seconds")

    # Save translations
    save_translations(translations, output_path)

    # Summary
    print(f"\nSummary:")
    print(f"  Words translated: {len(translations)}")
    print(f"  Languages: {', '.join(target_languages)}")
    print(f"  Output: {output_path}")
    print(f"  File size: {output_path.stat().st_size / 1024 / 1024:.1f} MB")


if __name__ == "__main__":
    main()
