import assert from 'node:assert/strict';
import { rm } from 'node:fs/promises';
import path from 'node:path';
import { afterEach, test } from 'node:test';

import { createApp } from '../src/app.js';
import { createBackendConfig } from '../src/config.js';

const servers: Array<{ close: () => void }> = [];

afterEach(async () => {
  servers.splice(0).forEach((server) => server.close());
  // Clean up any files written during the test run.
  await rm(path.resolve(process.cwd(), 'uploads', 'speaking'), {
    recursive: true,
    force: true,
  }).catch(() => {});
});

const start = async (environment = {}, dependencies = {}) => {
  const config = createBackendConfig({ NODE_ENV: 'test', ...environment });
  const app = createApp({ config, ...dependencies });
  const server = app.listen(0);
  servers.push(server);
  await new Promise((resolve) => server.once('listening', resolve));
  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('Expected server to have a network address');
  }
  return `http://127.0.0.1:${address.port}`;
};

const productionAuthEnvironment = {
  NODE_ENV: 'production',
  CLERK_ISSUER: 'https://clerk.test.example.com',
  ENGINEEROS_INTERNAL_API_SECRET: 'internal-test-secret',
  ALLOW_MEMORY_BILLING_REPOSITORY: 'true',
  RATE_LIMIT_STORE: 'memory',
  ALLOW_IN_MEMORY_RATE_LIMIT_IN_PRODUCTION: 'true',
};

const internalHeaders = (userId = 'speaking-test-user', contentType?: string) => ({
  Authorization: 'Bearer internal-test-secret',
  'X-Forwarded-Proto': 'https',
  'X-EngineerOS-User-Id': userId,
  ...(contentType ? { 'Content-Type': contentType } : {}),
});

test('audio-upload rejects unauthenticated requests', async () => {
  const url = await start(productionAuthEnvironment);
  const response = await fetch(`${url}/api/speaking/audio-upload`, {
    method: 'POST',
    // X-Forwarded-Proto is required here purely to avoid the app's
    // production HTTPS-redirect middleware (which runs before auth and
    // would otherwise 301 this plain-HTTP test request) -- it is NOT
    // an authentication header.
    headers: { 'Content-Type': 'audio/webm', 'X-Forwarded-Proto': 'https' },
    body: Buffer.from([1, 2, 3, 4]),
  });
  assert.equal(response.status, 401);
});

test('audio-upload rejects unsupported content-type', async () => {
  const url = await start(productionAuthEnvironment);
  const response = await fetch(`${url}/api/speaking/audio-upload`, {
    method: 'POST',
    headers: internalHeaders('user-1', 'application/octet-stream'),
    body: Buffer.from([1, 2, 3, 4]),
  });
  assert.equal(response.status, 415);
  const body = await response.json();
  assert.equal(body.error.code, 'unsupported_media_type');
});

test('audio-upload rejects empty audio body', async () => {
  const url = await start(productionAuthEnvironment);
  const response = await fetch(`${url}/api/speaking/audio-upload`, {
    method: 'POST',
    headers: internalHeaders('user-1', 'audio/webm'),
    body: Buffer.alloc(0),
  });
  assert.equal(response.status, 400);
  const body = await response.json();
  assert.equal(body.error.code, 'empty_audio');
});

test('audio-upload accepts a valid audio buffer and returns a playable URL', async () => {
  const url = await start(productionAuthEnvironment);
  const fakeAudioBytes = Buffer.from('fake-webm-audio-bytes-for-test');

  const response = await fetch(`${url}/api/speaking/audio-upload`, {
    method: 'POST',
    headers: internalHeaders('user-1', 'audio/webm'),
    body: fakeAudioBytes,
  });

  assert.equal(response.status, 201);
  const body = await response.json();
  assert.match(body.audioUrl, /^\/uploads\/speaking\/user-1\/[a-f0-9-]+\.webm$/);
  assert.equal(body.sizeBytes, fakeAudioBytes.length);

  // The file should actually be servable back via the static route.
  const playbackResponse = await fetch(`${url}${body.audioUrl}`);
  assert.equal(playbackResponse.status, 200);
  const playedBackBytes = Buffer.from(await playbackResponse.arrayBuffer());
  assert.deepEqual(playedBackBytes, fakeAudioBytes);
});

test('audio-upload rejects a body larger than the size limit', async () => {
  const url = await start(productionAuthEnvironment);
  const oversized = Buffer.alloc(16 * 1024 * 1024, 1); // 16MB > 15MB limit

  const response = await fetch(`${url}/api/speaking/audio-upload`, {
    method: 'POST',
    headers: internalHeaders('user-1', 'audio/webm'),
    body: oversized,
  });

  assert.equal(response.status, 413);
  const body = await response.json();
  assert.equal(body.error.code, 'entity.too.large');
});
