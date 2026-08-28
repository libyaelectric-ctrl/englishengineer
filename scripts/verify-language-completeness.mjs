import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const EXPECTED_LANGS = [
  'en',
  'tr',
  'ar',
  'de',
  'es',
  'pt',
  'fr',
  'ru',
  'zh',
  'ja',
  'it',
  'vi',
  'pl',
  'id',
  'nl',
];

// ─── 1. Check by-lang JSON files ────────────────────────────────
const byLangDir = path.join(root, 'src/data/translations/by-lang');
const byLangFiles = (await fs.readdir(byLangDir)).filter((f) => f.endsWith('.json'));
const byLangLangs = byLangFiles.map((f) => f.replace('.json', ''));

const missingByLang = EXPECTED_LANGS.filter((lang) => !byLangLangs.includes(lang));
const extraByLang = byLangLangs.filter((lang) => !EXPECTED_LANGS.includes(lang));

// ─── 2. Check translation .ts files ─────────────────────────────
const translationsDir = path.join(root, 'src/features/localization/translations');
const translationFiles = (await fs.readdir(translationsDir)).filter((f) =>
  f.endsWith('.translations.ts')
);

const translationErrors = [];

for (const file of translationFiles) {
  const content = await fs.readFile(path.join(translationsDir, file), 'utf8');

  // Extract language keys from the translation object
  // Pattern: en: { ... }, tr: { ... }, etc.
  const langPattern = /(\w+):\s*\{/g;
  const foundLangs = new Set();
  let match;
  while ((match = langPattern.exec(content)) !== null) {
    const lang = match[1];
    if (EXPECTED_LANGS.includes(lang)) {
      foundLangs.add(lang);
    }
  }

  const missing = EXPECTED_LANGS.filter((lang) => !foundLangs.has(lang));
  if (missing.length > 0) {
    translationErrors.push({ file, missing });
  }
}

// ─── 3. Report ──────────────────────────────────────────────────
let hasErrors = false;

console.log('=== Language Completeness Verification ===\n');

// By-lang check
if (missingByLang.length > 0) {
  hasErrors = true;
  console.log(`❌ Missing by-lang JSON files: ${missingByLang.join(', ')}`);
} else {
  console.log(`✅ by-lang JSON files: ${byLangLangs.length}/${EXPECTED_LANGS.length} complete`);
}

if (extraByLang.length > 0) {
  console.log(`⚠️  Extra by-lang files (not in expected list): ${extraByLang.join(', ')}`);
}

// Translation files check
if (translationErrors.length > 0) {
  hasErrors = true;
  console.log('\n❌ Missing languages in translation files:');
  for (const { file, missing } of translationErrors) {
    console.log(`   ${file}: missing ${missing.join(', ')}`);
  }
} else {
  console.log(
    `✅ Translation files: ${translationFiles.length} files, all ${EXPECTED_LANGS.length} languages present`
  );
}

console.log('');

if (hasErrors) {
  console.log('❌ Language completeness check FAILED');
  process.exit(1);
} else {
  console.log(`✅ ${EXPECTED_LANGS.length}/${EXPECTED_LANGS.length} languages complete`);
}
