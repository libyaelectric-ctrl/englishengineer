import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { createApp } from '../src/app.js';
import { validateBillingReturnUrl } from '../src/billing-return-url.js';
import { createBackendConfig } from '../src/config.js';

const servers: Array<{ close: () => void }> = [];
afterEach(() => servers.splice(0).forEach((server) => server.close()));
const start = async () => {
  const config = createBackendConfig({ NODE_ENV: 'test', AI_PROVIDER: 'mock' });
  const server = createApp({ config }).listen(0);
  servers.push(server);
  await new Promise((resolve) => server.once('listening', resolve));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Expected network address');
  return `http://127.0.0.1:${address.port}`;
};
const jsonPost = (url: string, body: Record<string, unknown>) => fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

test('billing return URLs require an exact allowlisted production origin', () => {
  const policy = { environment: 'production' as const, allowedOrigins: ['https://app.engvox.test'] };
  assert.equal(validateBillingReturnUrl('https://app.engvox.test/billing?state=ok', 'returnUrl', policy), 'https://app.engvox.test/billing?state=ok');
  for (const candidate of ['https://evil.example/steal', 'http://app.engvox.test/billing', 'javascript:alert(1)', 'https://user:password@app.engvox.test/billing']) {
    assert.throws(() => validateBillingReturnUrl(candidate, 'returnUrl', policy), (error: unknown) => typeof error === 'object' && error !== null && 'code' in error && error.code === 'invalid_return_url');
  }
});

test('mock writing assessment fails explicitly instead of emitting a fabricated grade', async () => {
  const baseUrl = await start();
  const response = await jsonPost(`${baseUrl}/api/v1/writing/submit`, { promptId: 'wp-001', content: 'CAD improves iteration speed and drawing consistency.' });
  const body = await response.json();
  assert.equal(response.status, 503);
  assert.equal(body.error.code, 'writing_assessment_unavailable');
  assert.equal(body.status, undefined);
  assert.equal(body.score, undefined);
});

test('speaking submission is explicitly ungraded while speech metrics are unavailable', async () => {
  const baseUrl = await start();
  const response = await jsonPost(`${baseUrl}/api/v1/speaking/submit`, { missionId: 'sp-001', transcript: 'I coordinated the commissioning plan and resolved the cable routing conflict.' });
  const body = await response.json();
  assert.equal(response.status, 202);
  assert.equal(body.status, 'not_graded');
  assert.equal(body.reason, 'speech_assessment_pipeline_not_configured');
  assert.equal(body.overallScore, undefined);
});

test('team analytics uses the canonical route and rejects fabricated analytics', async () => {
  const baseUrl = await start();
  const canonical = await fetch(`${baseUrl}/api/v1/team/analytics`);
  assert.equal(canonical.status, 503);
  assert.equal((await canonical.json()).error.code, 'team_analytics_unavailable');
  assert.equal((await fetch(`${baseUrl}/api/v1/v1/team/analytics`)).status, 404);
});

test('progress overview fails explicitly until persistent aggregation is configured', async () => {
  const baseUrl = await start();
  const response = await fetch(`${baseUrl}/api/v1/progress/overview`);
  assert.equal(response.status, 503);
  assert.equal((await response.json()).error.code, 'progress_overview_unavailable');
});
