import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => readFile(path.join(repositoryRoot, relativePath), 'utf8');

const walkSourceFiles = async (relativeDirectory) => {
  const directory = path.join(repositoryRoot, relativeDirectory);
  const results = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const relativePath = path.join(relativeDirectory, entry.name);
    if (entry.isDirectory()) results.push(...(await walkSourceFiles(relativePath)));
    else if (/\.(?:ts|tsx)$/.test(entry.name)) results.push(relativePath);
  }
  return results;
};

const getImports = (source) =>
  [...source.matchAll(/from\s+['"]([^'"]+)['"]/g)].map((match) => match[1]);

const app = await read('backend/src/app.ts');
assert.doesNotMatch(app, /v1RouterAdapter as unknown as Express/);
assert.match(app, /const v1RouterAdapter: RouteRegistrar/);
for (const name of await readdir(path.join(repositoryRoot, 'backend/src'))) {
  if (!name.endsWith('.ts') || name === 'app.ts') continue;
  const source = await read(`backend/src/${name}`);
  if (/register[A-Za-z]+Routes/.test(source)) {
    assert.doesNotMatch(source, /app: Express/, `${name} still requires Express`);
  }
}

const plan = await read('docs/REFACTORING-PLAN.md');
for (const boundary of ['Mission', 'Progress', 'Gamification', 'ContentPool']) {
  assert.ok(plan.includes(boundary));
}

for (const domain of ['mission', 'progress', 'gamification', 'content-pool']) {
  await read(`src/core/learning/domains/${domain}.domain.ts`);
}
const learningStore = await read('src/core/learning/learning.store.ts');
assert.match(learningStore, /LEARNING_PERSISTENCE_VERSION/);
assert.match(learningStore, /migratePersistedLearningState/);
const persistence = await read('src/core/learning/learning.persistence.ts');
assert.match(persistence, /LEARNING_PERSISTENCE_VERSION = 2/);
const persistenceTest = await read('src/core/learning/learning.persistence.test.ts');
assert.match(persistenceTest, /without losing user progress/);
assert.match(persistenceTest, /is idempotent/);

const [backendResponse, frontendResponse, speakingRoute, speakingClient] = await Promise.all([
  read('backend/src/api-response.ts'),
  read('src/shared/types/api-response.ts'),
  read('backend/src/speaking-routes.ts'),
  read('src/features/speaking/audio-upload/speaking-audio-upload.service.ts'),
]);
for (const source of [backendResponse, frontendResponse]) {
  assert.match(source, /2026-09-07\.v1/);
}
assert.match(speakingRoute, /apiSuccess\(/);
assert.match(speakingClient, /unwrapApiSuccess/);

for (const file of await walkSourceFiles('src/core')) {
  const source = await read(file);
  for (const imported of getImports(source)) {
    assert.ok(!imported.startsWith('@/features/'), `${file} imports ${imported}`);
  }
}

const featureDirectories = (
  await readdir(path.join(repositoryRoot, 'src/features'), {
    withFileTypes: true,
  })
)
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);
let featureToFeature = 0;
for (const feature of featureDirectories) {
  const files = await readdir(path.join(repositoryRoot, 'src/features', feature), {
    withFileTypes: true,
  });
  for (const entry of files) {
    if (!/\.(?:ts|tsx)$/.test(entry.name)) continue;
    const source = await read(`src/features/${feature}/${entry.name}`);
    featureToFeature += getImports(source).filter(
      (imported) =>
        imported.startsWith('@/features/') && !imported.includes(`@/features/${feature}`)
    ).length;
  }
}
let sharedToFeature = 0;
for (const file of await walkSourceFiles('src/shared')) {
  const source = await read(file);
  sharedToFeature += getImports(source).filter((imported) =>
    imported.startsWith('@/features/')
  ).length;
}
assert.ok(featureToFeature <= 51, `feature-to-feature coupling grew to ${featureToFeature}`);
assert.ok(sharedToFeature <= 9, `shared-to-feature coupling grew to ${sharedToFeature}`);

console.log(
  `PHASE6_ARCHITECTURE_CONTRACT_OK feature_to_feature=${featureToFeature} shared_to_feature=${sharedToFeature}`
);
