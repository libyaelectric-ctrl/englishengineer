import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { ApiError } from '../src/errors.js';
import { createRateLimiter, createUpstashRateLimitStore } from '../src/rate-limit.js';

type MockLimiter = (req: unknown, res: unknown, next: (err?: unknown) => void) => unknown;

const runRequest = (
  rawLimiter: unknown,
  userId: string
): { error: ApiError | null; headers: Map<string, string> } => {
  const limiter = rawLimiter as MockLimiter;
  const headers = new Map<string, string>();
  let error: ApiError | null = null;
  limiter(
    { auth: { userId }, ip: '127.0.0.1' },
    { setHeader: (name: string, value: string) => headers.set(name, value) },
    (nextError?: unknown) => {
      error = (nextError as ApiError) ?? null;
    }
  );
  return { error, headers };
};

const runAsyncRequest = async (
  rawLimiter: unknown,
  userId: string
): Promise<{ error: ApiError | null; headers: Map<string, string> }> => {
  const limiter = rawLimiter as MockLimiter;
  const headers = new Map<string, string>();
  let error: ApiError | null = null;
  await limiter(
    { auth: { userId }, ip: '127.0.0.1' },
    { setHeader: (name: string, value: string) => headers.set(name, value) },
    (nextError?: unknown) => {
      error = (nextError as ApiError) ?? null;
    }
  );
  return { error, headers };
};

describe('In-Memory Rate Limiter', () => {
  it('allows requests within the limit', () => {
    const limiter = createRateLimiter({ windowMs: 1_000, max: 5, scope: 'test' });
    for (let i = 0; i < 5; i++) {
      const result = runRequest(limiter, 'user-within-limit');
      assert.equal(result.error, null, `Request ${i + 1} should be allowed`);
    }
  });

  it('returns 429 when limit is exceeded', () => {
    const limiter = createRateLimiter({ windowMs: 1_000, max: 1, scope: 'test' });
    const first = runRequest(limiter, 'user-exceed');
    const second = runRequest(limiter, 'user-exceed');
    assert.equal(first.error, null);
    assert.equal(second.error?.status, 429);
    assert.equal(second.error?.code, 'rate_limit_exceeded');
  });

  it('sets correct RateLimit headers', () => {
    const limiter = createRateLimiter({ windowMs: 1_000, max: 3, scope: 'test' });
    const first = runRequest(limiter, 'user-headers');
    assert.equal(first.headers.get('RateLimit-Limit'), '3');
    assert.equal(first.headers.get('RateLimit-Remaining'), '2');
    assert.equal(first.headers.get('X-RateLimit-Limit'), '3');
    assert.equal(first.headers.get('X-RateLimit-Remaining'), '2');
  });

  it('remaining count decrements correctly', () => {
    const limiter = createRateLimiter({ windowMs: 1_000, max: 3, scope: 'test' });
    const first = runRequest(limiter, 'user-decrement');
    assert.equal(first.headers.get('RateLimit-Remaining'), '2');
    const second = runRequest(limiter, 'user-decrement');
    assert.equal(second.headers.get('RateLimit-Remaining'), '1');
    const third = runRequest(limiter, 'user-decrement');
    assert.equal(third.headers.get('RateLimit-Remaining'), '0');
  });

  it('different users have independent buckets', () => {
    const limiter = createRateLimiter({ windowMs: 1_000, max: 1, scope: 'test' });
    const first = runRequest(limiter, 'user-a');
    const second = runRequest(limiter, 'user-b');
    assert.equal(first.error, null);
    assert.equal(second.error, null);
  });

  it('window reset allows new requests', () => {
    let currentTime = 0;
    const limiter = createRateLimiter({
      windowMs: 100,
      max: 1,
      scope: 'test',
      now: () => currentTime,
    });
    runRequest(limiter, 'user-reset');
    assert.equal(runRequest(limiter, 'user-reset').error?.status, 429);
    currentTime = 101;
    assert.equal(runRequest(limiter, 'user-reset').error, null);
  });

  it('uses ip as identity when no auth userId is provided', () => {
    const limiter = createRateLimiter({ windowMs: 1_000, max: 1, scope: 'test' });
    const limiterFn = limiter as MockLimiter;
    const state: { error: unknown } = { error: null };
    limiterFn(
      { auth: undefined, ip: '192.168.1.1' },
      { setHeader: (_name: string, _value: string) => {} },
      (nextError?: unknown) => {
        state.error = nextError ?? null;
      }
    );
    assert.equal(state.error, null);
    // Second request with same IP should be blocked
    limiterFn(
      { auth: undefined, ip: '192.168.1.1' },
      { setHeader: (_name: string, _value: string) => {} },
      (nextError?: unknown) => {
        state.error = nextError ?? null;
      }
    );
    assert.equal((state.error as ApiError | null)?.status, 429);
  });

  it('uses "unknown" as identity when no userId or ip', () => {
    const limiter = createRateLimiter({ windowMs: 1_000, max: 1, scope: 'test' });
    const limiterFn = limiter as MockLimiter;
    const headers = new Map<string, string>();
    let error: ApiError | null = null;
    limiterFn(
      { auth: undefined },
      { setHeader: (name: string, value: string) => headers.set(name, value) },
      (nextError?: unknown) => {
        error = (nextError as ApiError) ?? null;
      }
    );
    assert.equal(error, null);
  });

  it('evicts oldest bucket when maxBuckets limit is reached', () => {
    const limiter = createRateLimiter({
      windowMs: 1_000,
      max: 2,
      scope: 'test',
      maxBuckets: 3,
      pruneIntervalMs: 60_000,
      now: () => 10,
    });
    runRequest(limiter, 'oldest');
    runRequest(limiter, 'second');
    runRequest(limiter, 'third');
    runRequest(limiter, 'fourth');
    // fourth should have evicted oldest, so oldest can make a request
    const result = runRequest(limiter, 'oldest');
    assert.equal(result.error, null);
  });
});

describe('Upstash Rate Limit Store', () => {
  it('performs atomic scoped counter request', async () => {
    let capturedRequest: { url: string; init: RequestInit } | null = null;
    const store = createUpstashRateLimitStore({
      url: 'https://rate-limit.example.test',
      token: 'server-only-token',
      fetchImpl: async (url, init) => {
        capturedRequest = { url: url as string, init: init as RequestInit };
        return new Response(JSON.stringify({ result: [1, 55_000] }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      },
    });
    const result = await store.consume('engineeros:rate-limit:test:user-1', 60_000);
    assert.deepEqual(result, { count: 1, resetAfterMs: 55_000 });
    assert.equal(capturedRequest!.url, 'https://rate-limit.example.test');
    assert.equal(
      (capturedRequest!.init.headers as Record<string, string>).Authorization,
      'Bearer server-only-token'
    );
    const body = JSON.parse(capturedRequest!.init.body as string);
    assert.equal(body[0], 'EVAL');
    assert.equal(body[3], 'engineeros:rate-limit:test:user-1');
    assert.equal(body[4], '60000');
  });

  it('throws on non-ok response', async () => {
    const store = createUpstashRateLimitStore({
      url: 'https://rate-limit.example.test',
      token: 'token',
      fetchImpl: async () => new Response('error', { status: 500 }),
    });
    await assert.rejects(
      () => store.consume('key', 60_000) as Promise<never>,
      /External rate-limit store returned 500/
    );
  });

  it('throws on malformed response payload', async () => {
    const store = createUpstashRateLimitStore({
      url: 'https://rate-limit.example.test',
      token: 'token',
      fetchImpl: async () =>
        new Response(JSON.stringify({ result: 'invalid' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
    });
    await assert.rejects(() => store.consume('key', 60_000), /malformed data/);
  });

  it('throws on network error', async () => {
    const store = createUpstashRateLimitStore({
      url: 'https://rate-limit.example.test',
      token: 'token',
      fetchImpl: async () => {
        throw new Error('network failure');
      },
    });
    await assert.rejects(() => store.consume('key', 60_000), /network failure/);
  });
});

describe('External Store Rate Limiter', () => {
  it('allows requests within the limit using external store', async () => {
    let count = 0;
    const limiter = createRateLimiter({
      windowMs: 60_000,
      max: 3,
      scope: 'ai',
      store: {
        consume: async () => ({ count: ++count, resetAfterMs: 30_000 }),
      },
    });
    const first = await runAsyncRequest(limiter, 'user-ext');
    const second = await runAsyncRequest(limiter, 'user-ext');
    const third = await runAsyncRequest(limiter, 'user-ext');
    assert.equal(first.error, null);
    assert.equal(second.error, null);
    assert.equal(third.error, null);
  });

  it('returns 429 after external store count exceeds limit', async () => {
    let count = 0;
    const limiter = createRateLimiter({
      windowMs: 60_000,
      max: 1,
      scope: 'ai',
      store: {
        consume: async () => ({ count: ++count, resetAfterMs: 30_000 }),
      },
    });
    const first = await runAsyncRequest(limiter, 'user-ext-exceed');
    const second = await runAsyncRequest(limiter, 'user-ext-exceed');
    assert.equal(first.error, null);
    assert.equal(second.error?.status, 429);
    assert.equal(second.error?.code, 'rate_limit_exceeded');
  });

  it('sets RateLimit-Reset header from external store', async () => {
    let count = 0;
    const limiter = createRateLimiter({
      windowMs: 60_000,
      max: 5,
      scope: 'ai',
      store: {
        consume: async () => ({ count: ++count, resetAfterMs: 45_000 }),
      },
    });
    const result = await runAsyncRequest(limiter, 'user-reset-header');
    assert.equal(result.headers.get('RateLimit-Reset'), '45');
    assert.equal(result.headers.get('X-RateLimit-Reset'), '45');
  });

  it('fails closed when external store throws', async () => {
    const limiter = createRateLimiter({
      windowMs: 60_000,
      max: 10,
      scope: 'billing',
      store: {
        consume: async () => {
          throw new Error('Redis unavailable');
        },
      },
    });
    const result = await runAsyncRequest(limiter, 'user-fail-closed');
    assert.equal(result.error?.status, 503);
    assert.equal(result.error?.code, 'rate_limit_store_unavailable');
  });
});
