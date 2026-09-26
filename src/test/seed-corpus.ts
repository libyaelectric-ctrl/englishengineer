/**
 * Detection for the suites that assert on the real seed corpus rather than on the committed
 * fixtures.
 *
 * A handful of assertions are about the corpus itself — how many terms it holds, that no term is
 * duplicated, how the domains are distributed. A small fixture slice cannot stand in for that: the
 * assertions would either fail or quietly become tautologies. Those suites therefore run only when
 * `ENGVOX_TEST_SEED_DIR` names a real corpus copy, and skip with a reason otherwise, which keeps
 * the default suite deterministic and free of network access.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';

/** Presence marker for a corpus copy: the file every corpus has and every slice also has. */
const CORPUS_MARKER = path.join('vocabulary', 'a1.seed.json');

/** The configured corpus directory, or `undefined` when none is configured or it is not a corpus. */
export const seedCorpusDir = (): string | undefined => {
  const dir = process.env.ENGVOX_TEST_SEED_DIR;
  if (!dir) return undefined;
  const resolved = path.resolve(dir);
  return fs.existsSync(path.join(resolved, CORPUS_MARKER)) ? resolved : undefined;
};

/** True when a real corpus was configured for this run. */
export const hasSeedCorpus = (): boolean => seedCorpusDir() !== undefined;

/** Appended to the name of a skipped corpus suite so the skip explains itself in the report. */
export const SEED_CORPUS_REQUIRED =
  '(needs ENGVOX_TEST_SEED_DIR with a real corpus copy; skipped on the fixtures)';
