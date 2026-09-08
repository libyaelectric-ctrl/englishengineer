import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { ApiError } from '../src/errors.js';
import { createIdempotencyStore } from '../src/middleware/idempotency.middleware.js';

const config = {
  rateLimit: {
    upstashUrl: 'https://redis.invalid',
    upstashToken: 'test-token',
    storeTimeoutMs: 100,
  },
};

const assertUnavailable = (error: unknown): boolean => {
  assert.ok(error instanceof ApiError);
  assert.equal(error.status, 503);
  assert.equal(error.code, 'idempotency_store_unavailable');
  return true;
};

describe('Redis idempotency store', () => {
  it('fails closed when Redis rejects a read', async () => {
    const fetchImpl = async () => new Response('unavailable', { status: 503 });
    const store = createIdempotencyStore('redis', config, fetchImpl as typeof fetch);
    await assert.rejects(() => store.get('request-key'), assertUnavailable);
  });

  it('fails closed when Redis rejects a write', async () => {
    const fetchImpl = async () => new Response('unavailable', { status: 503 });
    const store = createIdempotencyStore('redis', config, fetchImpl as typeof fetch);
    await assert.rejects(
      () =>
        store.set('request-key', {
          statusCode: 200,
          body: { ok: true },
          timestamp: Date.now(),
          fingerprint: 'fingerprint',
        }),
      assertUnavailable
    );
  });

  it('rejects malformed Redis payloads instead of treating them as misses', async () => {
    const fetchImpl = async () =>
      new Response(JSON.stringify({ unexpected: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    const store = createIdempotencyStore('redis', config, fetchImpl as typeof fetch);
    await assert.rejects(() => store.get('request-key'), assertUnavailable);
  });
});
