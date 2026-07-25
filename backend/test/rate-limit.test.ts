import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createRateLimiter,
  createUpstashRateLimitStore,
} from '../src/rate-limit.js';

const runRequest = (limiter, userId) => {
  const headers = new Map();
  let error = null;
  limiter(
    { auth: { userId }, ip: '127.0.0.1' },
    { setHeader: (name, value) => headers.set(name, value) },
    (nextError) => {
      error = nextError ?? null;
    }
  );
  return { error, headers };
};

const runAsyncRequest = async (limiter, userId) => {
  const headers = new Map();
  let error = null;
  await limiter(
    { auth: { userId }, ip: '127.0.0.1' },
    { setHeader: (name, value) => headers.set(name, value) },
    (nextError) => {
      error = nextError ?? null;
    }
  );
  return { error, headers };
};

test('rate limiter keeps headers and returns 429 after the limit', () => {
  const limiter = createRateLimiter({
    windowMs: 1_000,
    max: 1,
    scope: 'test',
  });
  const first = runRequest(limiter, 'user-1');
  const second = runRequest(limiter, 'user-1');

  assert.equal(first.error, null);
  assert.equal(first.headers.get('RateLimit-Limit'), '1');
  assert.equal(first.headers.get('RateLimit-Remaining'), '0');
  assert.equal(second.error?.status, 429);
  assert.equal(second.error?.code, 'rate_limit_exceeded');
});

test('expired current bucket resets cleanly', () => {
  let currentTime = 0;
  const limiter = createRateLimiter({
    windowMs: 100,
    max: 1,
    scope: 'test',
    now: () => currentTime,
  });
  runRequest(limiter, 'user-1');
  assert.equal(runRequest(limiter, 'user-1').error?.status, 429);
  currentTime = 101;
  assert.equal(runRequest(limiter, 'user-1').error, null);
});

test('periodic pruning removes expired buckets before adding new ones', () => {
  let currentTime = 0;
  const limiter = createRateLimiter({
    windowMs: 50,
    max: 1,
    scope: 'test',
    maxBuckets: 2,
    pruneIntervalMs: 50,
    now: () => currentTime,
  });
  runRequest(limiter, 'user-1');
  runRequest(limiter, 'user-2');
  currentTime = 60;
  assert.equal(runRequest(limiter, 'user-3').error, null);
  assert.equal(runRequest(limiter, 'user-1').error, null);
});

test('hard bucket maximum evicts the oldest live identity', () => {
  const limiter = createRateLimiter({
    windowMs: 1_000,
    max: 1,
    scope: 'test',
    maxBuckets: 2,
    pruneIntervalMs: 60_000,
    now: () => 10,
  });
  runRequest(limiter, 'oldest');
  runRequest(limiter, 'second');
  runRequest(limiter, 'third');

  assert.equal(runRequest(limiter, 'oldest').error, null);
});

test('Upstash adapter performs an atomic scoped counter request', async () => {
  let request = null;
  const store = createUpstashRateLimitStore({
    url: 'https://rate-limit.example.test',
    token: 'server-only-token',
    fetchImpl: async (url, init) => {
      request = { url, init };
      return new Response(JSON.stringify({ result: [2, 45_000] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    },
  });

  const result = await store.consume('engineeros:rate-limit:ai:user-1', 60_000);
  const body = JSON.parse(request.init.body);

  assert.deepEqual(result, { count: 2, resetAfterMs: 45_000 });
  assert.equal(request.url, 'https://rate-limit.example.test');
  assert.equal(request.init.headers.Authorization, 'Bearer server-only-token');
  assert.equal(body[0], 'EVAL');
  assert.equal(body[3], 'engineeros:rate-limit:ai:user-1');
  assert.equal(body[4], '60000');
});

test('external limiter shares counts and returns 429 after the limit', async () => {
  let count = 0;
  const limiter = createRateLimiter({
    windowMs: 60_000,
    max: 1,
    scope: 'ai',
    store: {
      consume: async () => ({ count: ++count, resetAfterMs: 30_000 }),
    },
  });

  const first = await runAsyncRequest(limiter, 'user-1');
  const second = await runAsyncRequest(limiter, 'user-1');

  assert.equal(first.error, null);
  assert.equal(first.headers.get('RateLimit-Reset'), '30');
  assert.equal(second.error?.status, 429);
  assert.equal(second.error?.code, 'rate_limit_exceeded');
});

test('external limiter fails closed when its store is unavailable', async () => {
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

  const result = await runAsyncRequest(limiter, 'user-1');
  assert.equal(result.error?.status, 503);
  assert.equal(result.error?.code, 'rate_limit_store_unavailable');
});
