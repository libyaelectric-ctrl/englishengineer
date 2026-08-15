import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SOURCE = join(ROOT, 'data', 'translations', 'vocabulary-translations.json');
const OUT_DIR = join(ROOT, 'src', 'data', 'translations', 'by-lang');

const SUPPORTED_LANGS = [
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

console.log('Loading corpus...');
const corpus = JSON.parse(readFileSync(SOURCE, 'utf8'));
const terms = Object.keys(corpus);

rmSync(OUT_DIR, { recursive: true, force: true });
mkdirSync(OUT_DIR, { recursive: true });

for (const lang of SUPPORTED_LANGS) {
  const langMap = {};
  for (const term of terms) {
    const entry = corpus[term]?.[lang];
    if (entry) langMap[term] = entry;
  }
  const serialized = JSON.stringify(langMap);
  const outPath = join(OUT_DIR, `${lang}.json`);
  writeFileSync(outPath, serialized);
  const kb = Math.round(Buffer.byteLength(serialized) / 1024);
  console.log(`${lang}.json — ${kb} KB, ${Object.keys(langMap).length} terms`);
}
console.log('Done. Files in src/data/translations/by-lang/');