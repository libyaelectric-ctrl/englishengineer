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
  'data/canonical/vocabulary/vocabulary.normalized.json'
);
const reportPath = path.join(
  root,
  'data/canonical/vocabulary/vocabulary-validation-report.json'
);
const terms = JSON.parse(await fs.readFile(canonicalPath, 'utf8'));
const report = JSON.parse(await fs.readFile(reportPath, 'utf8'));

assertValidLevels(terms, 'Canonical vocabulary database');
if (terms.length !== 5000) {
  throw new Error(`Expected 5000 vocabulary terms, found ${terms.length}.`);
}
if (duplicateValues(terms, 'id').length > 0) {
  throw new Error('Canonical vocabulary database contains duplicate IDs.');
}
if (duplicateValues(terms, 'normalizedTerm').length > 0) {
  throw new Error(
    'Canonical vocabulary database has duplicate normalized terms.'
  );
}
if (!report.passed) {
  throw new Error('Vocabulary validation report did not pass.');
}

for (const level of CEFR_LEVELS) {
  const seedPath = path.join(
    root,
    `src/data/vocabulary/by-level/${level.toLowerCase()}.seed.ts`
  );
  await fs.access(seedPath);
  if (!terms.some((term) => term.cefrLevel === level)) {
    throw new Error(`Vocabulary level ${level} is empty.`);
  }
}
console.log(
  `Vocabulary verification passed: ${terms.length} unique terms across A1-C2.`
);
