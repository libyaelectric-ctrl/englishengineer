import assert from 'node:assert/strict';
import type { Server } from 'node:http';
import { after, before, describe, it } from 'node:test';

import { createApp } from '../src/app.js';
import { createBackendConfig } from '../src/config.js';

let server: Server | null;
let baseUrl: string;

const start = async (envOverrides: Record<string, string> = {}): Promise<string> => {
  process.env.ALLOW_INSECURE_DEV_AUTH = 'true';
  Object.entries(envOverrides).forEach(([k, v]) => {
    process.env[k] = v;
  });
  const config = createBackendConfig();
  const app = createApp({ config });
  return new Promise((resolve) => {
    server = app.listen(0, () => {
      const address = server!.address();
      const port = typeof address === 'object' && address ? address.port : 0;
      resolve(`http://localhost:${port}`);
    });
  });
};

const stop = () =>
  new Promise<void>((resolve) => {
    if (!server) return resolve();
    server.close(() => resolve());
    server = null;
  });

describe('AI endpoint validation integration', () => {
  before(async () => {
    baseUrl = await start({ AI_PROVIDER: 'mock' });
  });

  after(async () => {
    await stop();
  });

  it('rejects POST with missing prompt', async () => {
    const res = await fetch(`${baseUrl}/api/v1/ai/coach`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.error.code, 'validation_error');
    assert.ok(body.error.details.some((d: { path: string }) => d.path === 'prompt'));
  });

  it('rejects POST with empty prompt', async () => {
    const res = await fetch(`${baseUrl}/api/v1/ai/coach`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: '' }),
    });
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.error.code, 'validation_error');
  });

  it('rejects POST with whitespace-only prompt', async () => {
    const res = await fetch(`${baseUrl}/api/v1/ai/coach`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: '   ' }),
    });
    assert.equal(res.status, 400);
  });

  it('rejects POST with oversized prompt', async () => {
    const res = await fetch(`${baseUrl}/api/v1/ai/coach`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'x'.repeat(20_001) }),
    });
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.error.code, 'validation_error');
  });

  it('rejects POST with invalid operation', async () => {
    const res = await fetch(`${baseUrl}/api/v1/ai/coach`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'Test', operation: 'badOp' }),
    });
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.error.code, 'validation_error');
  });

  it('accepts valid request', async () => {
    const res = await fetch(`${baseUrl}/api/v1/ai/coach`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'Hello AI' }),
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.mode, 'mock');
  });
});

describe('Vocabulary endpoint validation integration', () => {
  before(async () => {
    baseUrl = await start();
  });

  after(async () => {
    await stop();
  });

  it('rejects GET with missing word', async () => {
    const res = await fetch(`${baseUrl}/api/v1/vocabulary/lookup?targetLang=tr`);
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.error.code, 'validation_error');
  });

  it('rejects GET with empty word', async () => {
    const res = await fetch(`${baseUrl}/api/v1/vocabulary/lookup?word=&targetLang=tr`);
    assert.equal(res.status, 400);
  });

  it('rejects GET with invalid targetLang', async () => {
    const res = await fetch(`${baseUrl}/api/v1/vocabulary/lookup?word=hello&targetLang=toolong`);
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.error.code, 'validation_error');
  });

  it('accepts valid request with default targetLang', async () => {
    const fetchImpl = (async () => ({
      ok: true,
      json: async () => [
        {
          word: 'hello',
          phonetic: '/həˈloʊ/',
          meanings: [
            {
              definitions: [{ definition: 'A greeting' }],
            },
          ],
        },
      ],
    })) as unknown as typeof fetch;
    const customConfig = createBackendConfig();
    const app = createApp({ config: customConfig, fetchImpl });
    const customServer = app.listen(0);
    const customAddress = customServer.address();
    const port = typeof customAddress === 'object' && customAddress ? customAddress.port : 0;
    const res = await fetch(`http://localhost:${port}/api/v1/vocabulary/lookup?word=hello`);
    assert.equal(res.status, 200);
    customServer.close();
  });
});

describe('Workspace endpoint validation integration', () => {
  let authHeaders: Record<string, string>;

  before(async () => {
    process.env.ALLOW_INSECURE_DEV_AUTH = 'true';
    process.env.AI_PROVIDER = 'mock';
    const config = createBackendConfig();
    const mockRepository = {
      getWorkspaces: async () => [],
      getWorkspace: async () => null,
      createWorkspace: async () => ({ id: 'mock-id', name: 'Mock' }),
      countWorkspaces: async () => 0,
    } as unknown as NonNullable<Parameters<typeof createApp>[0]>['workspaceRepository'];
    const app = createApp({ config, workspaceRepository: mockRepository });
    server = app.listen(0);
    const address = server.address();
    const port = typeof address === 'object' && address ? address.port : 0;
    baseUrl = `http://localhost:${port}`;
    authHeaders = {
      Authorization: `Bearer dev-backend-secret`,
      'Content-Type': 'application/json',
    };
  });

  after(async () => {
    await stop();
  });

  it('rejects POST /api/workspaces with invalid name type', async () => {
    const res = await fetch(`${baseUrl}/api/workspaces`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ name: 123 }),
    });
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.error.code, 'validation_error');
  });

  it('accepts POST /api/workspaces with valid body', async () => {
    const res = await fetch(`${baseUrl}/api/workspaces`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ name: 'Test Workspace' }),
    });
    assert.equal(res.status, 200);
  });

  it('rejects PUT memory with missing key', async () => {
    const res = await fetch(`${baseUrl}/api/v1/workspaces/fake-id/memory`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ value: 'test' }),
    });
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.error.code, 'validation_error');
  });

  it('rejects POST documents with missing docName', async () => {
    const res = await fetch(`${baseUrl}/api/v1/workspaces/fake-id/documents`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ docContent: 'content' }),
    });
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.error.code, 'validation_error');
  });
});
