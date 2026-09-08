import assert from 'node:assert/strict';
import { setImmediate as waitForImmediate } from 'node:timers/promises';
import type { NextFunction, Request, Response } from 'express';
import { describe, it } from 'node:test';

import { ApiError } from '../src/errors.js';
import {
  createIdempotencyStore,
  idempotencyKey,
} from '../src/middleware/idempotency.middleware.js';

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

  it('does not send a successful response when persistence fails', async () => {
    const persistenceError = new ApiError(
      503,
      'idempotency_store_unavailable',
      'Idempotency unavailable.'
    );
    const store = {
      async get() {
        return null;
      },
      async set() {
        throw persistenceError;
      },
    };
    const middleware = idempotencyKey({ store });
    const request = {
      headers: { 'x-idempotency-key': 'request-key-00000001' },
      method: 'POST',
      originalUrl: '/api/v1/ai/translate',
      body: { prompt: 'hello' },
      auth: { userId: 'user-a' },
    } as unknown as Request;
    let successfulBodySent = false;
    const response = {
      statusCode: 200,
      json() {
        successfulBodySent = true;
        return response;
      },
      setHeader() {
        return response;
      },
      status(code: number) {
        response.statusCode = code;
        return response;
      },
      once() {
        return response;
      },
    } as unknown as Response;
    const nextCalls: unknown[] = [];
    const next = ((error?: unknown) => {
      nextCalls.push(error);
    }) as NextFunction;

    await middleware(request, response, next);
    assert.equal(nextCalls.length, 1);
    response.json({ ok: true });
    await waitForImmediate();

    assert.equal(successfulBodySent, false);
    assert.equal(nextCalls.length, 2);
    assert.equal(nextCalls[1], persistenceError);
  });
});
