import assert from 'node:assert/strict';
import { afterEach, beforeEach, test } from 'node:test';

import { createApp } from '../src/app.js';
import { validateBillingReturnUrl } from '../src/billing-return-url.js';
import { createBackendConfig } from '../src/config.js';
import {
  createMemoryLearningRepository,
  resetLearningRepositoryForTests,
  setLearningRepositoryForTests,
} from '../src/learning-repository.js';

const servers: Array<{ close: () => void }> = [];
beforeEach(() => setLearningRepositoryForTests(createMemoryLearningRepository()));
afterEach(() => {
  resetLearningRepositoryForTests();
  servers.splice(0).forEach((server) => server.close());
});
const start = async () => {
  const config = createBackendConfig({ NODE_ENV: 'test', AI_PROVIDER: 'mock' });
  const server = createApp({ config }).listen(0);
  servers.push(server);
  await new Promise((resolve) => server.once('listening', resolve));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Expected network address');
  return `http://127.0.0.1:${address.port}`;
};
const jsonPost = (url: string, body: Record<string, unknown>) =>
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
test('billing return URLs require an exact allowlisted production origin', () => {
  const policy = {
    environment: 'production' as const,
    allowedOrigins: ['https://app.engvox.test'],
  };
  assert.equal(
    validateBillingReturnUrl('https://app.engvox.test/billing?state=ok', 'returnUrl', policy),
    'https://app.engvox.test/billing?state=ok'
  );
  for (const candidate of [
    'https://evil.example/steal',
    'http://app.engvox.test/billing',
    'javascript:alert(1)',
    'https://user:password@app.engvox.test/billing',
  ])
    assert.throws(() => validateBillingReturnUrl(candidate, 'returnUrl', policy));
});
test('mock writing assessment fails explicitly instead of emitting a fabricated grade', async () => {
  const response = await jsonPost(`${await start()}/api/v1/writing/submit`, {
    promptId: 'wp-001',
    content: 'CAD improves iteration speed.',
  });
  const body = await response.json();
  assert.equal(response.status, 503);
  assert.equal(body.error.code, 'writing_assessment_unavailable');
  assert.equal(body.score, undefined);
});
test('speaking submission remains ungraded and is persisted', async () => {
  const baseUrl = await start();
  const submitted = await jsonPost(`${baseUrl}/api/v1/speaking/submit`, {
    missionId: 'sp-001',
    transcript: 'I coordinated commissioning.',
  });
  const body = await submitted.json();
  assert.equal(submitted.status, 202);
  assert.equal(body.data.status, 'not_graded');
  assert.equal(body.data.overallScore, undefined);
  const stored = await (await fetch(`${baseUrl}/api/v1/speaking/${body.data.id}`)).json();
  assert.equal(stored.id, body.data.id);
  assert.equal(stored.status, 'not_graded');
});
test('team analytics rejects fabricated analytics', async () => {
  const baseUrl = await start();
  const canonical = await fetch(`${baseUrl}/api/v1/team/analytics`);
  assert.equal(canonical.status, 503);
  assert.equal((await canonical.json()).error.code, 'team_analytics_unavailable');
  assert.equal((await fetch(`${baseUrl}/api/v1/v1/team/analytics`)).status, 404);
});
test('progress overview returns persistent aggregation', async () => {
  const baseUrl = await start();
  await jsonPost(`${baseUrl}/api/v1/vocabulary/word-1/progress`, { result: 'correct' });
  const response = await fetch(`${baseUrl}/api/v1/progress/overview`);
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.skills.vocabulary.correct, 1);
  assert.equal(body.totalActivities, 1);
});
