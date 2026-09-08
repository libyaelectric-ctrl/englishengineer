import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const read = (file) => readFile(path.join(root, file), 'utf8');
const walk = async (directory) => {
  const entries = await readdir(path.join(root, directory), { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const relative = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(relative)));
    else files.push(relative);
  }
  return files;
};
const qualityDebtAudit = await read('scripts/audit-quality-debt.mjs');
assert.match(qualityDebtAudit, /counts\.tsIgnore/);
assert.match(qualityDebtAudit, /suppression baseline increased/);
assert.match(qualityDebtAudit, /complexity suppression baseline increased/);
const preCommitHook = await read('.husky/pre-commit');
assert.match(preCommitHook, /vitest related/);
assert.match(preCommitHook, /--incremental/);
assert.match(preCommitHook, /Pre-commit completed in/);
assert.doesNotMatch(preCommitHook, /--no-verify/);
const vitestConfig = await read('vitest.config.ts');
assert.match(vitestConfig, /maxWorkers:\s*1/);
assert.match(vitestConfig, /pool:\s*'threads'/);
assert.match(vitestConfig, /'json'/);
const changedCoverage = await read('scripts/check-changed-coverage.mjs');
assert.match(changedCoverage, /CHANGED_COVERAGE_THRESHOLD/);
assert.match(changedCoverage, /coverage-final\.json/);
assert.match(changedCoverage, /CHANGED_COVERAGE_OK/);
const qualityWorkflow = await read('.github/workflows/phase8-quality.yml');
assert.match(qualityWorkflow, /CHANGED_COVERAGE_THRESHOLD:\s*80/);
assert.match(qualityWorkflow, /--max-old-space-size=2048/);
assert.match(qualityWorkflow, /vitest-memory\.txt/);
const idService = await read('src/core/ids/id.service.ts');
assert.doesNotMatch(idService, /\brequire\s*\(/);
assert.doesNotMatch(idService, /Math\.random/);
assert.match(idService, /Secure random number generation is unavailable/);
const firebaseHelper = await read('tests/helpers/firebase-login.ts');
assert.match(firebaseHelper, /operation: 'signUp' \| 'signInWithPassword'/);
assert.match(firebaseHelper, /firebaseRequest\(request, 'signUp'\)/);
assert.match(firebaseHelper, /firebaseRequest\(request, 'signInWithPassword'\)/);
assert.match(firebaseHelper, /FIREBASE_E2E_TEST_EMAIL/);
assert.match(firebaseHelper, /FIREBASE_E2E_TEST_PASSWORD/);
assert.doesNotMatch(firebaseHelper, /(?:password|secret).*(?:console|logger)/i);
const authSetup = await read('tests/helpers/auth-setup.ts');
assert.match(authSetup, /indexedDB:\s*true/);
assert.match(authSetup, /hasFirebaseTestConfig/);
const environment = await read('.env.example');
const keys = environment.split(/\r?\n/).filter((line) => /^[A-Z0-9_]+=/.test(line)).map((line) => line.split('=', 1)[0]);
assert.equal(new Set(keys).size, keys.length);
const workflowFiles = await walk('.github/workflows');
let pinnedActionCount = 0;
for (const file of workflowFiles) {
  const source = await read(file);
  for (const match of source.matchAll(/\buses:\s*([^\s#]+)/g)) {
    pinnedActionCount += 1;
    assert.match(match[1], /@[0-9a-f]{40}$/, `Unpinned GitHub Action in ${file}: ${match[1]}`);
  }
}
assert.ok(pinnedActionCount > 0);
const activeFiles = ['README.md', '.env.example', 'playwright.config.ts', ...(await walk('tests')), ...(await walk('docs')).filter((file) => !file.startsWith('docs/archive/'))];
for (const file of activeFiles) assert.doesNotMatch(await read(file), /clerk/i, `Active Clerk reference remains in ${file}`);
console.log(`PHASE8_QUALITY_CONTRACT_OK files=${activeFiles.length}`);
