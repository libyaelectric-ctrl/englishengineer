"""
DeepL Grammar Translation Script for EngVox

Translates grammar rules and examples to all 15 interface languages.
Uses DeepL API with rotating API keys for maximum quota.

Usage:
    pip install deepl python-dotenv
    python scripts/translate-grammar-deepl.py

Environment:
    DEEPL_API_KEY_1, DEEPL_API_KEY_2, DEEPL_API_KEY_3 - DeepL API keys

Output:
    data/translations/grammar-translations.json
"""

import json
import os
import sys
import time
from pathlib import Path
from typing import Dict, List, Optional

import deepl
from dotenv import load_dotenv

# DeepL language codes
DEEPL_LANGUAGES = {
    "en": "EN",
    "tr": "TR",
    "ar": "AR",
    "de": "DE",
    "es": "ES",
    "pt": "PT-BR",
    "fr": "FR",
    "ru": "RU",
    "zh": "ZH",
    "ja": "JA",
    "it": "IT",
    "vi": "VI",
    "pl": "PL",
    "id": "ID",
    "nl": "NL",
}


class DeepLTranslator:
    """Translates text using DeepL API with rotating keys."""

    def __init__(self, api_keys: List[str]):
        if not api_keys:
            raise ValueError("At least one DeepL API key is required")

        self.translators = [deepl.Translator(key) for key in api_keys]
        self.current_index = 0
        self.char_counts = [0] * len(api_keys)

        # Test each key
        for i, translator in enumerate(self.translators):
            try:
                result = translator.translate_text("Test", target_lang="DE")
                print(f"API key {i+1}: Active")
            except deepl.DeepLException as e:
                print(f"API key {i+1}: Error - {e}")

    def get_next_translator(self) -> deepl.Translator:
        """Get the next available translator (round-robin)."""
        translator = self.translators[self.current_index]
        self.current_index = (self.current_index + 1) % len(self.translators)
        return translator

    def translate_text(self, text: str, target_lang: str) -> str:
        """Translate text to target language."""
        if not text or not text.strip():
            return text

        translator = self.get_next_translator()
        try:
            result = translator.translate_text(
                text,
                target_lang=DEEPL_LANGUAGES.get(target_lang, target_lang.upper()),
                source_lang="EN"
            )
            return result.text
        except deepl.DeepLException as e:
            print(f"  Translation error: {e}")
            return text  # Fallback to original


def load_grammar_data(grammar_path: Path) -> List[dict]:
    """Load grammar data from JSON file."""
    with open(grammar_path, "r", encoding="utf-8") as f:
        return json.load(f)


def save_translations(translations: dict, output_path: Path):
    """Save translations to JSON file."""
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(translations, f, ensure_ascii=False, indent=2)
    print(f"Saved translations to: {output_path}")


def translate_grammar(
    translator: DeepLTranslator,
    grammar_rules: List[dict],
    target_languages: List[str],
) -> dict:
    """Translate all grammar rules to target languages."""

    translations = {}
    total = len(grammar_rules)

    for i, rule in enumerate(grammar_rules):
        rule_id = rule.get("id", rule.get("name", f"rule_{i}"))
        title = rule.get("title", rule.get("name", ""))
        description = rule.get("description", "")
        examples = rule.get("examples", [])

        print(f"[{i+1}/{total}] Translating: {rule_id}")

        rule_translations = {}

        for lang in target_languages:
            if lang == "en":
                # English is the source
                rule_translations[lang] = {
                    "title": title,
                    "description": description,
                    "examples": examples,
                }
                continue

            try:
                translated_title = translator.translate_text(title, lang)
                translated_desc = translator.translate_text(description, lang)
                translated_examples = [
                    translator.translate_text(ex, lang) for ex in examples
                ]

                rule_translations[lang] = {
                    "title": translated_title,
                    "description": translated_desc,
                    "examples": translated_examples,
                }
            except Exception as e:
                print(f"  Error translating to {lang}: {e}")
                rule_translations[lang] = {
                    "title": title,
                    "description": description,
                    "examples": examples,
                }

        translations[rule_id] = rule_translations

        # Progress update every 10 rules
        if (i + 1) % 10 == 0:
            print(f"Progress: {i+1}/{total} rules translated")

    return translations


def main():
    """Main entry point."""
    # Load environment
    load_dotenv()

    # Get API keys
    api_keys = []
    for i in range(1, 4):
        key = os.getenv(f"DEEPL_API_KEY_{i}")
        if key:
            api_keys.append(key)

    if not api_keys:
        print("Error: No DeepL API keys found.")
        print("Set DEEPL_API_KEY_1, DEEPL_API_KEY_2, DEEPL_API_KEY_3 in .env file")
        sys.exit(1)

    print(f"Found {len(api_keys)} DeepL API key(s)")

    # Paths
    project_root = Path(__file__).parent.parent
    grammar_path = project_root / "data" / "canonical" / "grammar" / "grammar-normalized.json"
    output_path = project_root / "data" / "translations" / "grammar-translations.json"

    # Check if grammar file exists
    if not grammar_path.exists():
        print(f"Error: Grammar file not found at {grammar_path}")
        print("Please run grammar normalization first.")
        sys.exit(1)

    # Load grammar data
    print(f"Loading grammar from: {grammar_path}")
    grammar_rules = load_grammar_data(grammar_path)
    print(f"Loaded {len(grammar_rules)} grammar rules")

    # Target languages (all except English which is the source)
    target_languages = [lang for lang in DEEPL_LANGUAGES.keys() if lang != "en"]

    # Initialize translator
    translator = DeepLTranslator(api_keys)

    # Translate grammar
    print(f"\nTranslating to {len(target_languages)} languages...")
    start_time = time.time()
    translations = translate_grammar(translator, grammar_rules, target_languages)
    elapsed = time.time() - start_time
    print(f"\nTranslation completed in {elapsed:.1f} seconds")

    # Save translations
    save_translations(translations, output_path)

    # Summary
    print(f"\nSummary:")
    print(f"  Rules translated: {len(translations)}")
    print(f"  Languages: {', '.join(target_languages)}")
    print(f"  Output: {output_path}")
    print(f"  File size: {output_path.stat().st_size / 1024 / 1024:.1f} MB")


if __name__ == "__main__":
    main()
