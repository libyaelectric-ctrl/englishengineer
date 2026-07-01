import fs from 'node:fs/promises';
import path from 'node:path';
import {
  CEFR_LEVELS,
  assertValidLevels,
  duplicateValues,
} from './learning-database-utils.mjs';

const root = process.cwd();
const canonicalPath = path.join(
  root,
  'data/canonical/grammar/grammar-rules.normalized.json'
);
const reportPath = path.join(
  root,
  'data/canonical/grammar/grammar-validation-report.json'
);
const rules = JSON.parse(await fs.readFile(canonicalPath, 'utf8'));
const report = JSON.parse(await fs.readFile(reportPath, 'utf8'));

assertValidLevels(rules, 'Canonical grammar database');
if (rules.length !== 360) {
  throw new Error(`Expected 360 grammar rules, found ${rules.length}.`);
}
if (duplicateValues(rules, 'id').length > 0) {
  throw new Error('Canonical grammar database contains duplicate IDs.');
}
if (!report.passed) throw new Error('Grammar validation report did not pass.');

for (const level of CEFR_LEVELS) {
  const seedPath = path.join(
    root,
    `src/data/grammar/by-level/${level.toLowerCase()}.seed.ts`
  );
  await fs.access(seedPath);
  if (!rules.some((rule) => rule.cefrLevel === level)) {
    throw new Error(`Grammar level ${level} is empty.`);
  }
}
console.log(
  `Grammar verification passed: ${rules.length} unique rules across A1-C2.`
);
