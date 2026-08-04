"""
NLLB-200 Vocabulary Translation Script for EngVox

Translates vocabulary meanings from Turkish to all 15 interface languages.
Uses Meta's NLLB-200 (No Language Left Behind) model running locally.

Usage:
    pip install transformers torch sentencepiece tqdm
    python scripts/translate-vocabulary-nllb.py

Output:
    data/translations/vocabulary-translations.json
"""

import json
import sys
import time
from pathlib import Path
from typing import List

import torch
from tqdm import tqdm
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

# Source language (Turkish in vocabulary.data.json)
SOURCE_LANG = "tur_Latn"

# Batch size
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

        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = self.model.to(self.device)
        print(f"Using device: {self.device}")
        if self.device.type == "cuda":
            print(f"GPU: {torch.cuda.get_device_name(0)}")

        # Build language code to ID mapping using get_added_vocab()
        added_vocab = self.tokenizer.get_added_vocab()
        self.lang_code_to_id = {}
        for lang_code in NLLB_LANGUAGES.values():
            token_id = added_vocab.get(lang_code)
            if token_id is not None:
                self.lang_code_to_id[lang_code] = token_id
            else:
                print(f"  Warning: Language code {lang_code} not found in vocabulary")
        print(f"Language codes loaded: {len(self.lang_code_to_id)}")

    def translate_batch(
        self, texts: List[str], source_lang: str, target_lang: str
    ) -> List[str]:
        """Translate a batch of texts."""
        if not texts:
            return []

        self.tokenizer.src_lang = source_lang

        inputs = self.tokenizer(
            texts,
            return_tensors="pt",
            padding=True,
            truncation=True,
            max_length=MAX_LENGTH,
        ).to(self.device)

        # Get target language ID
        target_lang_id = self.lang_code_to_id.get(target_lang)
        if target_lang_id is None:
            raise ValueError(f"Target language {target_lang} not found in model vocabulary")

        with torch.no_grad():
            outputs = self.model.generate(
                **inputs,
                forced_bos_token_id=target_lang_id,
                max_length=MAX_LENGTH,
                num_beams=4,
                early_stopping=True,
            )

        translations = self.tokenizer.batch_decode(outputs, skip_special_tokens=True)
        return translations


def load_vocabulary(vocab_path: Path) -> List[dict]:
    with open(vocab_path, "r", encoding="utf-8") as f:
        return json.load(f)


def save_translations(translations: dict, output_path: Path):
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
    """Translate all vocabulary meanings in batches."""

    translations = {}

    for lang in target_languages:
        lang_code = NLLB_LANGUAGES[lang]
        print(f"\n--- Translating to {lang} ({lang_code}) ---")

        lang_translations = {}

        # Extract all words and meanings
        words = [entry["word"] for entry in vocabulary]
        meanings = [entry.get("meaning", "") for entry in vocabulary]

        # Translate in batches
        for i in tqdm(range(0, len(meanings), batch_size), desc=f"  {lang}"):
            batch_meanings = meanings[i:i + batch_size]
            batch_words = words[i:i + batch_size]

            # Split comma-separated meanings and translate each part
            all_parts = []
            part_map = []  # (word_idx, part_idx)
            for idx, meaning in enumerate(batch_meanings):
                parts = [p.strip() for p in meaning.split(",") if p.strip()]
                for part_idx, part in enumerate(parts):
                    all_parts.append(part)
                    part_map.append((idx, part_idx))

            if not all_parts:
                continue

            # Batch translate
            try:
                translated_parts = translator.translate_batch(
                    all_parts, SOURCE_LANG, lang_code
                )
            except Exception as e:
                print(f"  Batch error: {e}")
                translated_parts = []
                for part in all_parts:
                    try:
                        result = translator.translate_batch([part], SOURCE_LANG, lang_code)
                        translated_parts.append(result[0])
                    except Exception as e2:
                        print(f"    Single error: {e2}")
                        translated_parts.append(part)  # fallback

            # Reconstruct comma-separated meanings
            word_parts = {}
            for (word_idx, part_idx), translated in zip(part_map, translated_parts):
                if word_idx not in word_parts:
                    word_parts[word_idx] = []
                word_parts[word_idx].append(translated)

            for word_idx in range(len(batch_words)):
                word = batch_words[word_idx]
                if word_idx in word_parts:
                    lang_translations[word] = ", ".join(word_parts[word_idx])
                else:
                    lang_translations[word] = batch_meanings[word_idx]  # fallback

        translations[lang] = lang_translations
        print(f"  Completed {len(lang_translations)} words for {lang}")

    return translations


def main():
    project_root = Path(__file__).parent.parent
    vocab_path = project_root / "src" / "features" / "vocabulary" / "data" / "vocabulary.data.json"
    output_path = project_root / "data" / "translations" / "vocabulary-translations.json"

    if not vocab_path.exists():
        print(f"Error: Vocabulary file not found at {vocab_path}")
        sys.exit(1)

    print(f"Loading vocabulary from: {vocab_path}")
    vocabulary = load_vocabulary(vocab_path)
    print(f"Loaded {len(vocabulary)} vocabulary entries")

    # Target languages (all except Turkish)
    target_languages = [lang for lang in NLLB_LANGUAGES.keys() if lang != "tr"]
    print(f"Target languages: {', '.join(target_languages)}")

    translator = NLLBTranslator()

    print(f"\nStarting batch translation...")
    start_time = time.time()
    translations = translate_vocabulary(translator, vocabulary, target_languages)
    elapsed = time.time() - start_time

    save_translations(translations, output_path)

    print(f"\n=== Summary ===")
    print(f"  Words per language: {len(vocabulary)}")
    print(f"  Languages: {len(target_languages)}")
    print(f"  Total translations: {len(vocabulary) * len(target_languages)}")
    print(f"  Time: {elapsed:.1f}s ({elapsed/60:.1f}min)")
    print(f"  Output: {output_path}")
    print(f"  File size: {output_path.stat().st_size / 1024 / 1024:.1f} MB")


if __name__ == "__main__":
    main()
