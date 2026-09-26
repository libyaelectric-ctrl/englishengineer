#!/usr/bin/env node
/**
 * Rebuilds the seed fixtures the vitest fetch shim serves (`src/test/setup.ts`).
 *
 * Tests must not reach the Storage CDN. `public/data/**` is gitignored, so a CI checkout has no
 * corpora at all, and every seed request used to leave the machine over the network — slow, flaky,
 * and (as the headerless-brotli incident showed) only as reliable as whatever the CDN felt like
 * returning. The shim now serves a small, committed, deterministic slice of each corpus from
 * `src/test/fixtures/seeds/`, built by this script.
 *
 * The slices are tiny, but they are not simply the first N entries: they must keep the invariants
 * the suites depend on (see `src/test/fixtures/seeds/README.md`). Requirements are listed per file
 * as `{ count, match }`, applied in source order, and the surviving entries are put back into their
 * original order so a slice stays a faithful prefix-like subset of the real file.
 *
 * Usage:
 *   node scripts/build-test-seed-fixtures.mjs --source <dir containing vocabulary/ grammar/ translations/>
 *
 * The source is the published corpus layout, which the fixture directory mirrors. This is a
 * maintenance tool: the fixtures are committed, so it only needs to run when a suite starts using a
 * seed slice the current fixtures cannot satisfy.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';

const argument = (name, fallback) => {
  const index = process.argv.indexOf(`--${name}`);
  const value = index >= 0 ? process.argv[index + 1] : undefined;
  return value && !value.startsWith('--') ? value : fallback;
};

const sourceDir = path.resolve(argument('source', 'public/data'));
const outDir = path.resolve(argument('out', 'src/test/fixtures/seeds'));

/** Every shard the vocabulary loader requests per CEFR level (`LEVEL_SHARDS` in src/data). */
const VOCABULARY_FILES = {
  a1: ['a1.seed.json'],
  a2: ['a2.seed.json'],
  b1: ['b1.seed.json', 'b1.seed-1.json', 'b1.seed-2.json', 'b1.seed-3.json'],
  b2: ['b2.seed.json'],
  c1: ['c1.seed.json'],
  c2: ['c2.seed.json'],
};

const GRAMMAR_FILES = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'].map((level) => `${level}.seed.json`);

const TRANSLATION_FILES = ['en.json', 'tr.json', 'ar.json'];

const any = () => true;
const hasSkill = (skill) => (term) => term.skillUse?.includes(skill) === true;
const canGenerate = (taskType) => (rule) => rule.canGenerateTaskTypes?.includes(taskType) === true;

/** A stateful matcher that accepts at most `count` entries per distinct value of `key`. */
const firstPerGroup = (key, count) => {
  const taken = new Map();
  return (entry) => {
    const used = taken.get(entry[key]) ?? 0;
    if (used >= count) return false;
    taken.set(entry[key], used + 1);
    return true;
  };
};

/** Applies each requirement in order, then restores the source order of the selected entries. */
const slice = (entries, requirements) => {
  const chosen = new Set();
  for (const { count, match } of requirements) {
    let taken = 0;
    for (const entry of entries) {
      if (taken >= count) break;
      if (chosen.has(entry.id) || !match(entry)) continue;
      chosen.add(entry.id);
      taken += 1;
    }
  }
  const kept = entries.filter((entry) => chosen.has(entry.id));
  if (kept.length === 0) throw new Error('a slice may not be empty');
  return kept;
};

/**
 * The A1 slice carries the heaviest load: the vocabulary selection suite wants A1 vocabulary terms,
 * the orchestrator wants at least ten A1 speaking terms, and the domain filters want several
 * domains represented.
 */
const VOCABULARY_REQUIREMENTS = {
  a1: [
    { count: 4, match: any },
    { count: 14, match: hasSkill('speaking') },
    { count: 14, match: hasSkill('vocabulary') },
    { count: 3, match: firstPerGroup('domain', 2) },
  ],
  default: [
    { count: 2, match: any },
    { count: 4, match: firstPerGroup('domain', 1) },
  ],
};

const GRAMMAR_REQUIREMENTS = {
  a1: [
    { count: 3, match: any },
    { count: 6, match: hasSkill('speaking') },
    { count: 6, match: canGenerate('speaking-production') },
  ],
  default: [
    { count: 2, match: any },
    { count: 4, match: hasSkill('speaking') },
  ],
};

const readSource = (relative) => {
  const file = path.join(sourceDir, relative);
  if (!fs.existsSync(file)) {
    throw new Error(`missing ${file} — pass --source with a complete corpus (vocabulary/, grammar/,
    translations/)`);
  }
  return JSON.parse(fs.readFileSync(file, 'utf8'));
};

// Formatted with the repository's own Prettier config, so a regenerated fixture is byte-identical
// to what `npx prettier --check` expects and the script stays idempotent.
const prettier = await import('prettier');
const prettierConfig = (await prettier.resolveConfig(outDir)) ?? {};

const write = async (relative, data) => {
  const file = path.join(outDir, relative);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const body = await prettier.format(JSON.stringify(data), { ...prettierConfig, parser: 'json' });
  fs.writeFileSync(file, body);
  return { file: relative, bytes: Buffer.byteLength(body) };
};

const written = [];

for (const [level, files] of Object.entries(VOCABULARY_FILES)) {
  const requirements = VOCABULARY_REQUIREMENTS[level] ?? VOCABULARY_REQUIREMENTS.default;
  for (const file of files) {
    const terms = readSource(`vocabulary/${file}`);
    written.push(await write(`vocabulary/${file}`, slice(terms, requirements)));
  }
  const speakingAtLevel = readSource(`vocabulary/${files[0]}`).filter(hasSkill('speaking')).length;
  if (level === 'a1' && speakingAtLevel < 14) {
    throw new Error(`the A1 corpus only has ${speakingAtLevel} speaking terms; the slice needs 14`);
  }
}

for (const file of GRAMMAR_FILES) {
  const level = file.split('.')[0];
  const rules = readSource(`grammar/${file}`);
  const requirements = GRAMMAR_REQUIREMENTS[level] ?? GRAMMAR_REQUIREMENTS.default;
  written.push(await write(`grammar/${file}`, slice(rules, requirements)));
}

for (const file of TRANSLATION_FILES) {
  const corpus = readSource(`translations/${file}`);
  const entries = Object.entries(corpus).slice(0, 8);
  if (entries.length === 0) throw new Error(`translations/${file} is empty`);
  const meanings = entries.filter(([, entry]) => entry?.meaning);
  if (meanings.length === 0) {
    throw new Error(`translations/${file} has no entry with a "meaning"`);
  }
  written.push(await write(`translations/${file}`, Object.fromEntries(entries)));
}

for (const { file, bytes } of written) {
  console.log(`${String(bytes).padStart(7)}  ${file}`);
}
const total = written.reduce((sum, { bytes }) => sum + bytes, 0);
console.log(`${String(total).padStart(7)}  total (${written.length} files) from ${sourceDir}`);
