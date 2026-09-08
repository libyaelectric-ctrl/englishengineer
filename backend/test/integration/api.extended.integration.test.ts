import assert from 'node:assert/strict';
import type { Server } from 'node:http';
import { after, before, describe, it } from 'node:test';
import request from 'supertest';

import { createApp } from '../../src/app.js';
import { createBackendConfig } from '../../src/config.js';

let server: Server;
let baseUrl: string;
const devUser = { 'X-EngineerOS-User-Id': 'engineeros-dev-user' };
const authorized = () => ({ Authorization: 'Bearer test-token', ...devUser });
before(async () => {
  const config = createBackendConfig({
    NODE_ENV: 'development',
    RATE_LIMIT_STORE: 'memory',
    ALLOW_MEMORY_BILLING_REPOSITORY: 'true',
    ALLOW_INSECURE_DEV_AUTH: 'true',
  });
  server = createApp({ config }).listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const address = server.address();
  baseUrl = `http://127.0.0.1:${typeof address === 'object' && address ? address.port : 0}`;
});
after(() => server?.close());
describe('persistent learning API', () => {
  it('persists vocabulary and grammar progress', async () => {
    const vocabulary = await request(baseUrl)
      .post('/api/v1/vocabulary/word-1/progress')
      .set(authorized())
      .send({ result: 'correct' });
    assert.equal(vocabulary.status, 200);
    const grammar = await request(baseUrl)
      .post('/api/v1/grammar/rule-1/progress')
      .set(authorized())
      .send({ result: 'incorrect' });
    assert.equal(grammar.status, 200);
    const stats = await request(baseUrl).get('/api/v1/vocabulary/stats').set(authorized());
    assert.equal(stats.status, 200);
    assert.equal(stats.body.total, 1);
    assert.equal(stats.body.correct, 1);
    assert.equal(stats.body.new, 1);
  });
  it('persists reading and listening progress', async () => {
    assert.equal(
      (
        await request(baseUrl)
          .post('/api/v1/reading/eng-001/progress')
          .set(authorized())
          .send({ score: 85 })
      ).status,
      200
    );
    assert.equal(
      (
        await request(baseUrl)
          .post('/api/v1/listening/lst-001/progress')
          .set(authorized())
          .send({ score: 70 })
      ).status,
      200
    );
    assert.equal(
      (await request(baseUrl).get('/api/v1/reading/stats').set(authorized())).status,
      200
    );
    assert.equal(
      (await request(baseUrl).get('/api/v1/listening/stats').set(authorized())).status,
      200
    );
  });
  it('keeps mock writing assessment explicitly unavailable', async () => {
    const response = await request(baseUrl)
      .post('/api/v1/writing/submit')
      .set(authorized())
      .send({ promptId: 'wp-001', content: 'CAD improves iteration speed.' });
    assert.equal(response.status, 503);
    assert.equal(response.body.error.code, 'writing_assessment_unavailable');
  });
  it('persists speaking submission without fabricated grades', async () => {
    const response = await request(baseUrl)
      .post('/api/v1/speaking/submit')
      .set(authorized())
      .send({ missionId: 'sp-001', transcript: 'I coordinated commissioning.' });
    assert.equal(response.status, 202);
    assert.equal(response.body.status, 'not_graded');
    assert.equal(response.body.overallScore, undefined);
  });
  it('returns an aggregated overview and feature gates', async () => {
    const overview = await request(baseUrl).get('/api/v1/progress/overview').set(authorized());
    assert.equal(overview.status, 200);
    assert.equal(overview.body.userId, 'engineeros-dev-user');
    assert.ok(overview.body.skills.vocabulary);
    assert.equal(typeof overview.body.totalActivities, 'number');
    const access = await request(baseUrl).get('/api/v1/user/access-status').set(authorized());
    assert.equal(access.status, 200);
    assert.equal(typeof access.body.canAccessReading, 'boolean');
  });
});
describe('unchanged learning feeds and validation', () => {
  it('serves reading, listening, writing, and speaking content', async () => {
    assert.equal(
      (await request(baseUrl).get('/api/v1/reading/feed').set(authorized())).status,
      200
    );
    assert.equal(
      (await request(baseUrl).get('/api/v1/listening/feed').set(authorized())).status,
      200
    );
    assert.equal(
      (await request(baseUrl).get('/api/v1/writing/prompts').set(authorized())).status,
      200
    );
    assert.equal(
      (await request(baseUrl).get('/api/v1/speaking/prompts').set(authorized())).status,
      200
    );
  });
  it('rejects invalid progress input', async () => {
    const response = await request(baseUrl)
      .post('/api/v1/vocabulary/word-1/progress')
      .set(authorized())
      .send({ result: 'invalid' });
    assert.equal(response.status, 400);
    assert.equal(response.body.error.code, 'validation_error');
  });
  it('keeps team analytics unavailable instead of fabricating data', async () => {
    const response = await request(baseUrl).get('/api/v1/team/analytics').set(authorized());
    assert.equal(response.status, 503);
    assert.equal(response.body.error.code, 'team_analytics_unavailable');
  });
});
