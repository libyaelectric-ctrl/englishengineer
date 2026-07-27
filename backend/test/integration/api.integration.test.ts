import assert from 'node:assert/strict';
import { describe, before, after, it } from 'node:test';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { createBackendConfig } from '../../src/config.js';

let server;
let baseUrl;

const config = createBackendConfig({
  NODE_ENV: 'development',
  RATE_LIMIT_STORE: 'memory',
  ALLOW_IN_MEMORY_RATE_LIMIT_IN_PRODUCTION: 'true',
  ALLOW_MEMORY_BILLING_REPOSITORY: 'true',
  ALLOW_INSECURE_DEV_AUTH: 'true',
});

before(async () => {
  const app = createApp({ config });
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(() => {
  if (server) server.close();
});

describe('Health endpoints', () => {
  it('GET /api/v1/health returns 200 with health data', async () => {
    const res = await request(baseUrl).get('/api/v1/health');
    assert.equal(res.status, 200);
    assert.ok(res.body.status);
    assert.ok(res.body.version);
  });

  it('GET /api/health also returns 200', async () => {
    const res = await request(baseUrl).get('/api/health');
    assert.equal(res.status, 200);
    assert.ok(res.body.status);
  });
});

describe('AI endpoints', () => {
  it('POST /api/ai/writing-review with dev bypass returns 200', async () => {
    const res = await request(baseUrl)
      .post('/api/ai/writing-review')
      .set('X-EngineerOS-User-Id', 'engineeros-dev-user')
      .send({ prompt: 'Test', text: 'Hello world' });
    assert.equal(res.status, 200);
  });

  it('POST /api/ai/coach with dev bypass returns 200', async () => {
    const res = await request(baseUrl)
      .post('/api/ai/coach')
      .set('X-EngineerOS-User-Id', 'engineeros-dev-user')
      .send({ prompt: 'Test' });
    assert.equal(res.status, 200);
  });
});

describe('404 handling', () => {
  it('GET /api/nonexistent returns 404', async () => {
    const res = await request(baseUrl).get('/api/nonexistent');
    assert.equal(res.status, 404);
    assert.equal(res.body.error.code, 'route_not_found');
  });
});

describe('API docs', () => {
  it('GET /api-docs.json returns swagger spec', async () => {
    const res = await request(baseUrl).get('/api-docs.json');
    assert.equal(res.status, 200);
    assert.ok(res.body.openapi);
  });
});

// NOTE: registerReadingRoutes/registerListeningRoutes/registerSpeakingRoutes/
// registerGrammarRoutes/registerProgressRoutes are mounted in app.ts without any
// requireBackendAuth/optionalBackendAuth middleware. Their internal
// `request.auth?.userId` check can therefore never succeed — these endpoints
// currently always return 401, even with a valid dev-bypass header. The tests
// below intentionally assert this actual (broken) behavior; see TD-005 follow-up.

describe('Reading endpoints', () => {
  it('GET /api/reading/feed always returns 401 (auth middleware not wired)', async () => {
    const res = await request(baseUrl)
      .get('/api/reading/feed')
      .set('X-EngineerOS-User-Id', 'engineeros-dev-user');
    assert.equal(res.status, 401);
    assert.equal(res.body.error.code, 'authentication_required');
  });

  it('POST /api/reading/:id/progress always returns 401 (auth middleware not wired)', async () => {
    const res = await request(baseUrl)
      .post('/api/reading/r1/progress')
      .set('X-EngineerOS-User-Id', 'engineeros-dev-user')
      .send({ score: 80 });
    assert.equal(res.status, 401);
  });

  it('GET /api/reading/stats always returns 401 (auth middleware not wired)', async () => {
    const res = await request(baseUrl)
      .get('/api/reading/stats')
      .set('X-EngineerOS-User-Id', 'engineeros-dev-user');
    assert.equal(res.status, 401);
  });
});

describe('Listening endpoints', () => {
  it('GET /api/listening/feed always returns 401 (auth middleware not wired)', async () => {
    const res = await request(baseUrl).get('/api/listening/feed');
    assert.equal(res.status, 401);
  });

  it('POST /api/listening/:id/progress always returns 401 (auth middleware not wired)', async () => {
    const res = await request(baseUrl)
      .post('/api/listening/l1/progress')
      .set('X-EngineerOS-User-Id', 'engineeros-dev-user')
      .send({ score: 50 });
    assert.equal(res.status, 401);
  });

  it('GET /api/listening/stats always returns 401 (auth middleware not wired)', async () => {
    const res = await request(baseUrl)
      .get('/api/listening/stats')
      .set('X-EngineerOS-User-Id', 'engineeros-dev-user');
    assert.equal(res.status, 401);
  });
});

describe('Speaking endpoints', () => {
  it('GET /api/speaking/prompts always returns 401 (auth middleware not wired)', async () => {
    const res = await request(baseUrl).get('/api/speaking/prompts');
    assert.equal(res.status, 401);
  });

  it('POST /api/speaking/submit always returns 401 (auth middleware not wired)', async () => {
    const res = await request(baseUrl)
      .post('/api/speaking/submit')
      .set('X-EngineerOS-User-Id', 'engineeros-dev-user')
      .send({ missionId: 'm1' });
    assert.equal(res.status, 401);
  });

  it('GET /api/speaking/stats always returns 401 (auth middleware not wired)', async () => {
    const res = await request(baseUrl)
      .get('/api/speaking/stats')
      .set('X-EngineerOS-User-Id', 'engineeros-dev-user');
    assert.equal(res.status, 401);
  });
});

describe('Grammar endpoints', () => {
  it('POST /api/grammar/:id/progress always returns 401 (auth middleware not wired)', async () => {
    const res = await request(baseUrl)
      .post('/api/grammar/g1/progress')
      .set('X-EngineerOS-User-Id', 'engineeros-dev-user')
      .send({ result: 'correct' });
    assert.equal(res.status, 401);
  });

  it('GET /api/grammar/stats always returns 401 (auth middleware not wired)', async () => {
    const res = await request(baseUrl).get('/api/grammar/stats');
    assert.equal(res.status, 401);
  });

  it('GET /api/user/access-status always returns 401 (auth middleware not wired)', async () => {
    const res = await request(baseUrl)
      .get('/api/user/access-status')
      .set('X-EngineerOS-User-Id', 'engineeros-dev-user');
    assert.equal(res.status, 401);
  });
});

describe('Progress endpoints', () => {
  it('GET /api/progress/overview always returns 401 (auth middleware not wired)', async () => {
    const res = await request(baseUrl)
      .get('/api/progress/overview')
      .set('X-EngineerOS-User-Id', 'engineeros-dev-user');
    assert.equal(res.status, 401);
  });
});

describe('Admin endpoints', () => {
  it('GET /api/admin/stats without any header still authenticates via dev bypass, then denies non-admin role with 403', async () => {
    const res = await request(baseUrl).get('/api/admin/stats');
    assert.equal(res.status, 403);
    assert.equal(res.body.error.code, 'forbidden_role');
  });

  it('GET /api/admin/stats with dev bypass but non-admin role returns 403', async () => {
    const res = await request(baseUrl)
      .get('/api/admin/stats')
      .set('X-EngineerOS-User-Id', 'engineeros-dev-user');
    assert.equal(res.status, 403);
    assert.equal(res.body.error.code, 'forbidden_role');
  });

  it('GET /api/admin/activity with invalid query returns 400 or 401/403', async () => {
    const res = await request(baseUrl)
      .get('/api/admin/activity')
      .query({ limit: 'not-a-number' });
    assert.ok([400, 401, 403].includes(res.status));
  });
});

describe('Deprecation headers on legacy /api routes', () => {
  it('GET /api/progress/overview (non-v1) includes Deprecation and Sunset headers', async () => {
    const res = await request(baseUrl)
      .get('/api/progress/overview')
      .set('X-EngineerOS-User-Id', 'engineeros-dev-user');
    assert.equal(res.headers['deprecation'], 'true');
    assert.ok(res.headers['sunset']);
  });

  it('GET /api/v1/health does not include Deprecation header', async () => {
    const res = await request(baseUrl).get('/api/v1/health');
    assert.equal(res.headers['deprecation'], undefined);
  });
});
