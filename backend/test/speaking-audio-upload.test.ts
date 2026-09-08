import assert from 'node:assert/strict';
import { rm } from 'node:fs/promises';
import path from 'node:path';
import { afterEach, test } from 'node:test';

import { createApp } from '../src/app.js';
import { createBackendConfig } from '../src/config.js';

const servers: Array<{ close: () => void }> = [];

const serviceId = 'speaking-upload-service';
const validWebm = Buffer.from([0x1a, 0x45, 0xdf, 0xa3, 0x42, 0x86, 0x81, 0x01]);

const productionAuthEnvironment = {
  NODE_ENV: 'production',
  FIREBASE_PROJECT_ID: 'test-firebase-project',
  ENGINEEROS_INTERNAL_API_SECRET: 'internal-test-secret',
  ENGINEEROS_INTERNAL_SERVICE_ID: serviceId,
  ENGINEEROS_INTERNAL_SERVICE_EMAIL: 'speaking-service@example.com',
  ENGINEEROS_INTERNAL_SERVICE_ROLE: 'service',
  ALLOW_MEMORY_BILLING_REPOSITORY: 'true',
  RATE_LIMIT_STORE: 'memory',
  ALLOW_IN_MEMORY_RATE_LIMIT_IN_PRODUCTION: 'true',
};

const testAuthEnvironment = {
  ...productionAuthEnvironment,
  NODE_ENV: 'test',
};

afterEach(async () => {
  servers.splice(0).forEach((server) => server.close());
  await rm(path.resolve(process.cwd(), 'uploads', 'speaking'), {
    recursive: true,
    force: true,
  }).catch(() => {});
});

const start = async (
  environment: Record<string, string> = {},
  dependencies: Record<string, unknown> = {}
) => {
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

const internalHeaders = (contentType?: string) => ({
  Authorization: 'Bearer internal-test-secret',
  'X-Forwarded-Proto': 'https',
  ...(contentType ? { 'Content-Type': contentType } : {}),
});

test('audio-upload rejects unauthenticated requests', async () => {
  const url = await start(productionAuthEnvironment);
  const response = await fetch(`${url}/api/v1/speaking/audio-upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'audio/webm', 'X-Forwarded-Proto': 'https' },
    body: validWebm,
  });
  assert.equal(response.status, 401);
});

test('audio-upload rejects unsupported content-type', async () => {
  const url = await start(productionAuthEnvironment);
  const response = await fetch(`${url}/api/v1/speaking/audio-upload`, {
    method: 'POST',
    headers: internalHeaders('application/octet-stream'),
    body: Buffer.from([1, 2, 3, 4]),
  });
  assert.equal(response.status, 415);
  const body = await response.json();
  assert.equal(body.error.code, 'unsupported_media_type');
});

test('audio-upload rejects empty audio body', async () => {
  const url = await start(productionAuthEnvironment);
  const response = await fetch(`${url}/api/v1/speaking/audio-upload`, {
    method: 'POST',
    headers: internalHeaders('audio/webm'),
    body: Buffer.alloc(0),
  });
  assert.equal(response.status, 400);
  const body = await response.json();
  assert.equal(body.error.code, 'empty_audio');
});

test('audio-upload rejects a media body whose signature does not match its content-type', async () => {
  const url = await start(productionAuthEnvironment);
  const response = await fetch(`${url}/api/v1/speaking/audio-upload`, {
    method: 'POST',
    headers: internalHeaders('audio/webm'),
    body: Buffer.from('not-a-webm-container'),
  });
  assert.equal(response.status, 415);
  const body = await response.json();
  assert.equal(body.error.code, 'audio_signature_mismatch');
});

test('production audio fails closed when persistent object storage is unavailable', async () => {
  const url = await start(productionAuthEnvironment);
  const response = await fetch(`${url}/api/v1/speaking/audio-upload`, {
    method: 'POST',
    headers: internalHeaders('audio/webm'),
    body: validWebm,
  });
  assert.equal(response.status, 503);
  const body = await response.json();
  assert.equal(body.error.code, 'audio_storage_unavailable');
});

test('non-production audio accepts a valid signature and uses the configured service identity', async () => {
  const url = await start(testAuthEnvironment);
  const response = await fetch(`${url}/api/v1/speaking/audio-upload`, {
    method: 'POST',
    headers: {
      ...internalHeaders('audio/webm'),
      'X-EngineerOS-User-Id': 'attacker-controlled-user',
    },
    body: validWebm,
  });

  assert.equal(response.status, 201);
  const body = await response.json();
  assert.equal(body.ok, true);
  assert.equal(body.meta.contractVersion, '2026-09-07.v1');
  assert.match(
    body.data.audioUrl,
    new RegExp(`^/uploads/speaking/${serviceId}/[a-f0-9-]+\\.webm$`)
  );
  assert.equal(body.data.sizeBytes, validWebm.length);
  assert.equal(body.data.storage, 'local-fallback');

  const playbackResponse = await fetch(`${url}${body.data.audioUrl}`);
  assert.equal(playbackResponse.status, 200);
  const playedBackBytes = Buffer.from(await playbackResponse.arrayBuffer());
  assert.deepEqual(playedBackBytes, validWebm);
});

test('audio-upload rejects a body larger than the size limit', async () => {
  const url = await start(productionAuthEnvironment);
  const oversized = Buffer.alloc(16 * 1024 * 1024, 1);
  oversized.set(validWebm, 0);

  const response = await fetch(`${url}/api/v1/speaking/audio-upload`, {
    method: 'POST',
    headers: internalHeaders('audio/webm'),
    body: oversized,
  });

  assert.equal(response.status, 413);
  const body = await response.json();
  assert.equal(body.error.code, 'entity.too.large');
});
