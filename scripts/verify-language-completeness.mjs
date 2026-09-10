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

const fileExists = async (targetPath) => {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
};

const readDirIfExists = async (targetPath) => {
  if (!(await fileExists(targetPath))) return [];
  return fs.readdir(targetPath);
};

const extractTopLevelLanguageKeys = (content) => {
  const exportMatch = content.match(/=\s*\{/m);
  if (!exportMatch || exportMatch.index === undefined) return new Set();

  const langs = new Set();
  let depth = 0;
  let inString = false;
  let quote = '';
  let escaped = false;
  let token = '';
  let readingKey = true;

  for (let index = exportMatch.index + exportMatch[0].length - 1; index < content.length; index += 1) {
    const char = content[index];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === quote) {
        inString = false;
      }
      if (depth === 1 && readingKey) token += char;
      continue;
    }

    if (char === '\'' || char === '"' || char === '`') {
      inString = true;
      quote = char;
      if (depth === 1 && readingKey) token += char;
      continue;
    }

    if (char === '{') {
      depth += 1;
      token = '';
      readingKey = depth === 1;
      continue;
    }

    if (char === '}') {
      if (depth === 1) break;
      depth -= 1;
      token = '';
      readingKey = depth === 1;
      continue;
    }

    if (depth !== 1) continue;

    if (char === ':') {
      const key = token.trim().replace(/^['"`]|['"`]$/g, '');
      if (EXPECTED_LANGS.includes(key)) langs.add(key);
      token = '';
      readingKey = false;
      continue;
    }

    if (char === ',') {
      token = '';
      readingKey = true;
      continue;
    }

    if (readingKey && /[\w'"`]/.test(char)) token += char;
  }

  return langs;
};

const missingRequiredDirs = [];
const byLangDir = path.join(root, 'src/data/translations/by-lang');
const translationsDir = path.join(root, 'src/features/localization/translations');

// ─── 1. Check by-lang JSON files when that data source exists ───
const byLangFiles = (await readDirIfExists(byLangDir)).filter((file) => file.endsWith('.json'));
const byLangLangs = byLangFiles.map((file) => file.replace('.json', ''));
const missingByLang =
  byLangFiles.length > 0 ? EXPECTED_LANGS.filter((lang) => !byLangLangs.includes(lang)) : [];
const extraByLang = byLangLangs.filter((lang) => !EXPECTED_LANGS.includes(lang));

// ─── 2. Check translation .ts files ─────────────────────────────
if (!(await fileExists(translationsDir))) {
  missingRequiredDirs.push('src/features/localization/translations');
}

const translationFiles = (await readDirIfExists(translationsDir)).filter((file) =>
  file.endsWith('.translations.ts')
);

const translationErrors = [];

for (const file of translationFiles) {
  const content = await fs.readFile(path.join(translationsDir, file), 'utf8');
  const foundLangs = extractTopLevelLanguageKeys(content);
  const missing = EXPECTED_LANGS.filter((lang) => !foundLangs.has(lang));
  if (missing.length > 0) {
    translationErrors.push({ file, missing });
  }
}

// ─── 3. Report ──────────────────────────────────────────────────
let hasErrors = false;

console.log('=== Language Completeness Verification ===\n');

if (missingRequiredDirs.length > 0) {
  hasErrors = true;
  console.log(`❌ Missing required directories: ${missingRequiredDirs.join(', ')}`);
}

if (byLangFiles.length === 0) {
  console.log('ℹ️  by-lang JSON source not present; skipping optional by-lang file check');
} else if (missingByLang.length > 0) {
  hasErrors = true;
  console.log(`❌ Missing by-lang JSON files: ${missingByLang.join(', ')}`);
} else {
  console.log(`✅ by-lang JSON files: ${byLangLangs.length}/${EXPECTED_LANGS.length} complete`);
}

if (extraByLang.length > 0) {
  console.log(`⚠️  Extra by-lang files (not in expected list): ${extraByLang.join(', ')}`);
}

if (translationErrors.length > 0) {
  hasErrors = true;
  console.log('\n❌ Missing top-level languages in translation files:');
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
