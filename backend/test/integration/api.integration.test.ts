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
