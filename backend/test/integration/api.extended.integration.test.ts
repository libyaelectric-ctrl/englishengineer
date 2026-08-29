import assert from 'node:assert/strict';
import type { Server } from 'node:http';
import { after, before, describe, it } from 'node:test';
import request from 'supertest';

import { createApp } from '../../src/app.js';
import { createBackendConfig } from '../../src/config.js';

// --- App instance with dev-auth bypass enabled (mirrors api.integration.test.ts) ---
let server: Server;
let baseUrl: string;

const config = createBackendConfig({
  NODE_ENV: 'development',
  RATE_LIMIT_STORE: 'memory',
  ALLOW_IN_MEMORY_RATE_LIMIT_IN_PRODUCTION: 'true',
  ALLOW_MEMORY_BILLING_REPOSITORY: 'true',
  ALLOW_INSECURE_DEV_AUTH: 'true',
});

const devUser = { 'X-EngineerOS-User-Id': 'engineeros-dev-user' };

before(async () => {
  const app = createApp({ config });
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 0;
  baseUrl = `http://127.0.0.1:${port}`;
});

after(() => {
  if (server) server.close();
});

// --- Second app instance with dev-auth bypass DISABLED, to test the
// unauthenticated path. With ALLOW_INSECURE_DEV_AUTH=true (the config above),
// every request is silently authenticated as the dev-bypass user, so 401s
// can only be observed against a config that does not allow the bypass. ---
let noAuthServer: Server;
let noAuthBaseUrl: string;

const noAuthConfig = createBackendConfig({
  NODE_ENV: 'development',
  RATE_LIMIT_STORE: 'memory',
  ALLOW_IN_MEMORY_RATE_LIMIT_IN_PRODUCTION: 'true',
  ALLOW_MEMORY_BILLING_REPOSITORY: 'true',
  ALLOW_INSECURE_DEV_AUTH: 'false',
});

before(async () => {
  const app = createApp({ config: noAuthConfig });
  noAuthServer = app.listen(0);
  await new Promise((resolve) => noAuthServer.once('listening', resolve));
  const address = noAuthServer.address();
  const port = typeof address === 'object' && address ? address.port : 0;
  noAuthBaseUrl = `http://127.0.0.1:${port}`;
});

after(() => {
  if (noAuthServer) noAuthServer.close();
});

describe('Auth requirement', () => {
  it('GET /api/v1/reading/feed without any credentials returns 401', async () => {
    const res = await request(noAuthBaseUrl).get('/api/v1/reading/feed');
    assert.equal(res.status, 401);
    assert.equal(res.body.error.code, 'authentication_required');
  });
});

describe('Admin routes (RBAC)', () => {
  it('GET /api/v1/admin/stats without any credentials returns 401', async () => {
    const res = await request(noAuthBaseUrl).get('/api/v1/admin/stats');
    assert.equal(res.status, 401);
  });

  // Updated: Dev-bypass now defaults to 'user' role for security.
  // To access admin routes, the role must be explicitly set to 'admin'.
  // This test verifies that dev-bypass without explicit admin role is correctly denied.
  it('GET /api/v1/admin/stats with dev-bypass credentials (user role) returns 403', async () => {
    const res = await request(baseUrl).get('/api/v1/admin/stats').set('Authorization', 'Bearer test-token').set(devUser);
    assert.equal(res.status, 403);
    assert.equal(res.body.error.code, 'forbidden_role');
  });

  // New test: Dev-bypass with explicit admin role should access admin routes
  it('GET /api/v1/admin/stats with dev-bypass admin credentials returns 200', async () => {
    const adminDevUser = {
      'X-EngineerOS-User-Id': 'engineeros-dev-user',
      'X-EngineerOS-User-Role': 'admin',
    };
    const res = await request(baseUrl).get('/api/v1/admin/stats').set(adminDevUser);
    assert.equal(res.status, 200);
  });
});

describe('Vocabulary endpoints', () => {
  it('GET /api/v1/vocabulary/lookup with a valid word returns 200, or 502 if the external dictionary API is network-restricted', async () => {
    // This route calls out to api.dictionaryapi.dev. In network-restricted
    // environments (some CI sandboxes) that call fails and the route
    // correctly surfaces a 502 rather than crashing; both outcomes are
    // acceptable here — the shape assertion only applies on success.
    const res = await request(baseUrl)
      .get('/api/v1/vocabulary/lookup')
      .query({ word: 'concrete', targetLang: 'tr' });
    assert.ok([200, 502, 504].includes(res.status), `unexpected status ${res.status}`);
    if (res.status === 200) {
      assert.equal(res.body.word, 'concrete');
    }
  });

  it('GET /api/v1/vocabulary/lookup without a word returns 400 validation_error', async () => {
    const res = await request(baseUrl).get('/api/v1/vocabulary/lookup');
    assert.equal(res.status, 400);
    assert.equal(res.body.error.code, 'validation_error');
  });

  it('POST /api/v1/vocabulary/:id/progress with valid body returns 200', async () => {
    const res = await request(baseUrl)
      .post('/api/v1/vocabulary/word-1/progress')
      .set('Authorization', 'Bearer test-token').set(devUser)
      .send({ result: 'correct' });
    assert.equal(res.status, 200);
    assert.equal(res.body.wordId, 'word-1');
  });

  it('POST /api/v1/vocabulary/:id/progress with invalid result value returns 400', async () => {
    const res = await request(baseUrl)
      .post('/api/v1/vocabulary/word-1/progress')
      .set('Authorization', 'Bearer test-token').set(devUser)
      .send({ result: 'not-a-valid-enum-value' });
    assert.equal(res.status, 400);
    assert.equal(res.body.error.code, 'validation_error');
  });

  it('GET /api/v1/vocabulary/stats returns 200 with expected shape', async () => {
    const res = await request(baseUrl).get('/api/v1/vocabulary/stats').set('Authorization', 'Bearer test-token').set(devUser);
    assert.equal(res.status, 200);
    assert.ok('mastered' in res.body);
  });
});

describe('Reading endpoints', () => {
  it('GET /api/v1/reading/feed with dev-bypass returns 200', async () => {
    const res = await request(baseUrl).get('/api/v1/reading/feed').set('Authorization', 'Bearer test-token').set(devUser);
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.items));
  });

  it('POST /api/v1/reading/:id/progress with a score returns 200', async () => {
    const res = await request(baseUrl)
      .post('/api/v1/reading/article-1/progress')
      .set('Authorization', 'Bearer test-token').set(devUser)
      .send({ score: 85 });
    assert.equal(res.status, 200);
    assert.equal(res.body.score, 85);
  });

  it('GET /api/v1/reading/stats returns 200', async () => {
    const res = await request(baseUrl).get('/api/v1/reading/stats').set('Authorization', 'Bearer test-token').set(devUser);
    assert.equal(res.status, 200);
  });

  it('POST /api/v1/reading/generate returns static fallback content in mock AI mode', async () => {
    const res = await request(baseUrl)
      .post('/api/v1/reading/generate')
      .set('Authorization', 'Bearer test-token').set(devUser)
      .send({ discipline: 'mechanical', level: 'B2' });
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.item);
    assert.equal(typeof res.body.item.title, 'string');
    assert.ok(res.body.item.title.length > 0);
  });

  it('POST /api/v1/reading/generate reuses the cache on the second identical call', async () => {
    const first = await request(baseUrl)
      .post('/api/v1/reading/generate')
      .set('Authorization', 'Bearer test-token').set(devUser)
      .send({ discipline: 'civil', level: 'B1' });
    const second = await request(baseUrl)
      .post('/api/v1/reading/generate')
      .set('Authorization', 'Bearer test-token').set(devUser)
      .send({ discipline: 'civil', level: 'B1' });
    assert.equal(first.status, 200);
    assert.equal(second.status, 200);
    // In-memory cache must return the exact same item for an identical key.
    assert.equal(first.body.item.id, second.body.item.id);
  });

  it('POST /api/v1/reading/generate returns 400 for an unknown discipline', async () => {
    const res = await request(baseUrl)
      .post('/api/v1/reading/generate')
      .set('Authorization', 'Bearer test-token').set(devUser)
      .send({ discipline: 'alchemy', level: 'B2' });
    assert.equal(res.status, 400);
    assert.equal(res.body.error.code, 'invalid_discipline');
  });
});

describe('Writing endpoints', () => {
  it('GET /api/v1/writing/prompts returns 200', async () => {
    const res = await request(baseUrl).get('/api/v1/writing/prompts').set('Authorization', 'Bearer test-token').set(devUser);
    assert.equal(res.status, 200);
  });

  it('POST /api/v1/writing/submit returns 200 with scores in 0-100 range (mock AI fallback)', async () => {
    const res = await request(baseUrl)
      .post('/api/v1/writing/submit')
      .set('Authorization', 'Bearer test-token').set(devUser)
      .send({ promptId: 'p1', content: 'Test submission' });
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'graded');
    for (const key of [
      'score',
      'grammarScore',
      'vocabularyScore',
      'coherenceScore',
      'structureScore',
    ]) {
      assert.equal(typeof res.body[key], 'number');
      assert.ok(
        res.body[key] >= 0 && res.body[key] <= 100,
        `${key} out of range: ${res.body[key]}`
      );
    }
  });

  it('GET /api/v1/writing/stats returns 200', async () => {
    const res = await request(baseUrl).get('/api/v1/writing/stats').set('Authorization', 'Bearer test-token').set(devUser);
    assert.equal(res.status, 200);
  });
});

describe('Listening endpoints', () => {
  it('GET /api/v1/listening/feed returns 200', async () => {
    const res = await request(baseUrl).get('/api/v1/listening/feed').set('Authorization', 'Bearer test-token').set(devUser);
    assert.equal(res.status, 200);
  });

  it('POST /api/v1/listening/:id/progress with a score returns 200', async () => {
    const res = await request(baseUrl)
      .post('/api/v1/listening/clip-1/progress')
      .set('Authorization', 'Bearer test-token').set(devUser)
      .send({ score: 70 });
    assert.equal(res.status, 200);
    assert.equal(res.body.score, 70);
  });

  it('GET /api/v1/listening/stats returns 200', async () => {
    const res = await request(baseUrl).get('/api/v1/listening/stats').set('Authorization', 'Bearer test-token').set(devUser);
    assert.equal(res.status, 200);
  });
});

describe('Speaking endpoints', () => {
  it('GET /api/v1/speaking/prompts returns 200', async () => {
    const res = await request(baseUrl).get('/api/v1/speaking/prompts').set('Authorization', 'Bearer test-token').set(devUser);
    assert.equal(res.status, 200);
  });

  it('POST /api/v1/speaking/submit returns 200', async () => {
    const res = await request(baseUrl).post('/api/v1/speaking/submit').set('Authorization', 'Bearer test-token').set(devUser).send({});
    assert.equal(res.status, 200);
  });

  it('GET /api/v1/speaking/stats returns 200', async () => {
    const res = await request(baseUrl).get('/api/v1/speaking/stats').set('Authorization', 'Bearer test-token').set(devUser);
    assert.equal(res.status, 200);
  });

  it('POST /api/v1/speaking/audio-upload with an unsupported content-type returns 415', async () => {
    const res = await request(baseUrl)
      .post('/api/v1/speaking/audio-upload')
      .set('Authorization', 'Bearer test-token').set(devUser)
      .set('Content-Type', 'text/plain')
      .send('not audio');
    assert.equal(res.status, 415);
    assert.equal(res.body.error.code, 'unsupported_media_type');
  });
});

describe('Grammar endpoints', () => {
  it('POST /api/v1/grammar/:id/progress returns 200', async () => {
    const res = await request(baseUrl)
      .post('/api/v1/grammar/rule-1/progress')
      .set('Authorization', 'Bearer test-token').set(devUser)
      .send({ result: 'incorrect' });
    assert.equal(res.status, 200);
    assert.equal(res.body.ruleId, 'rule-1');
  });

  it('GET /api/v1/grammar/stats returns 200', async () => {
    const res = await request(baseUrl).get('/api/v1/grammar/stats').set('Authorization', 'Bearer test-token').set(devUser);
    assert.equal(res.status, 200);
  });

  it('GET /api/v1/user/access-status returns 200 with feature gates', async () => {
    const res = await request(baseUrl).get('/api/v1/user/access-status').set('Authorization', 'Bearer test-token').set(devUser);
    assert.equal(res.status, 200);
    assert.ok('canAccessReading' in res.body);
  });
});

describe('Progress overview', () => {
  it('GET /api/v1/progress/overview returns 200 with per-skill breakdown', async () => {
    const res = await request(baseUrl).get('/api/v1/progress/overview').set('Authorization', 'Bearer test-token').set(devUser);
    assert.equal(res.status, 200);
    assert.ok(res.body.vocabulary);
    assert.equal(res.body.overallLevel, 'B1');
  });
});

describe('Billing endpoints', () => {
  it('GET /api/v1/billing/subscription-status returns 200', async () => {
    const res = await request(baseUrl).get('/api/v1/billing/subscription-status').set('Authorization', 'Bearer test-token').set(devUser);
    assert.equal(res.status, 200);
  });

  it('POST /api/webhooks/stripe with an unparseable body does not crash the server (500/400 handled gracefully)', async () => {
    const res = await request(baseUrl)
      .post('/api/webhooks/stripe')
      .set('Content-Type', 'application/json')
      .send('not-json-at-all');
    // Stripe signature verification or JSON parsing should reject this
    // before any billing logic runs; we only assert it fails safely
    // (4xx/5xx) rather than crashing the process or returning 2xx.
    assert.ok(res.status >= 400);
  });
});
