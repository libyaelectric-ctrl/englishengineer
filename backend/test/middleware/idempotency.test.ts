import type { NextFunction, Request, Response } from 'express';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createIdempotencyStore,
  idempotencyKey,
} from '../../src/middleware/idempotency.middleware.js';

type MockResponse = {
  statusCode: number;
  body: unknown;
  jsonFn: ((body: unknown) => MockResponse) & {
    bind: (res: MockResponse) => (body: unknown) => MockResponse;
  };
  status(code: number): MockResponse;
  json(body: unknown): MockResponse;
};

const createMockRequest = (headers: Record<string, string> = {}): Request =>
  ({
    headers,
  }) as unknown as Request;

const createMockResponse = (): MockResponse => {
  const res: MockResponse = {
    statusCode: 200,
    body: null,
    jsonFn: Object.assign(
      ((body: unknown) => {
        res.body = body;
        return res;
      }) as ((body: unknown) => MockResponse) & {
        bind: (res: MockResponse) => (body: unknown) => MockResponse;
      },
      {
        bind: (_res: MockResponse) => (body: unknown) => {
          res.body = body;
          return res;
        },
      }
    ),
    status(code) {
      res.statusCode = code;
      return res;
    },
    json(body) {
      res.body = body;
      return res;
    },
  };
  return res;
};

describe('idempotencyKey', () => {
  describe('no idempotency key header', () => {
    it('calls next without caching when no header present', () => {
      const store = createIdempotencyStore('memory');
      const middleware = idempotencyKey({ store });
      const req = createMockRequest({});
      const res = createMockResponse();
      let called = false;
      const next: NextFunction = () => {
        called = true;
      };

      middleware(req, res as unknown as Response, next);

      assert.equal(called, true);
    });
  });

  describe('invalid idempotency key', () => {
    it('rejects key shorter than 16 characters', async () => {
      const store = createIdempotencyStore('memory');
      const middleware = idempotencyKey({ store });
      const req = createMockRequest({ 'x-idempotency-key': 'short' });
      const res = createMockResponse();
      let caughtError: (Error & { status?: number; code?: string }) | undefined;
      const next: NextFunction = ((err?: unknown) => {
        caughtError = err as Error & { status?: number; code?: string };
      }) as NextFunction;

      await middleware(req, res as unknown as Response, next);

      assert.ok(caughtError);
      assert.equal(caughtError?.status, 400);
      assert.equal(caughtError?.code, 'invalid_idempotency_key');
    });

    it('rejects key longer than 256 characters', async () => {
      const store = createIdempotencyStore('memory');
      const middleware = idempotencyKey({ store });
      const req = createMockRequest({ 'x-idempotency-key': 'a'.repeat(257) });
      const res = createMockResponse();
      let caughtError: (Error & { status?: number; code?: string }) | undefined;
      const next: NextFunction = ((err?: unknown) => {
        caughtError = err as Error & { status?: number; code?: string };
      }) as NextFunction;

      await middleware(req, res as unknown as Response, next);

      assert.ok(caughtError);
      assert.equal(caughtError?.status, 400);
      assert.equal(caughtError?.code, 'invalid_idempotency_key');
    });

    it('accepts key of exactly 16 characters', async () => {
      const store = createIdempotencyStore('memory');
      const middleware = idempotencyKey({ store });
      const req = createMockRequest({ 'x-idempotency-key': 'a'.repeat(16) });
      const res = createMockResponse();
      let called = false;
      const next: NextFunction = () => {
        called = true;
      };

      await middleware(req, res as unknown as Response, next);

      assert.equal(called, true);
    });

    it('accepts key of exactly 256 characters', async () => {
      const store = createIdempotencyStore('memory');
      const middleware = idempotencyKey({ store });
      const req = createMockRequest({ 'x-idempotency-key': 'a'.repeat(256) });
      const res = createMockResponse();
      let called = false;
      const next: NextFunction = () => {
        called = true;
      };

      await middleware(req, res as unknown as Response, next);

      assert.equal(called, true);
    });
  });

  describe('first request with valid key', () => {
    it('calls next and patches res.json to cache response', async () => {
      const store = createIdempotencyStore('memory');
      const middleware = idempotencyKey({ store });
      const key = 'test-idempotency-key-1234';
      const req = createMockRequest({ 'x-idempotency-key': key });
      const res = createMockResponse();
      let called = false;
      const next: NextFunction = () => {
        called = true;
      };

      await middleware(req, res as unknown as Response, next);

      assert.equal(called, true);

      res.json({ data: 'first response' });

      const cached = await store.get(key);
      assert.ok(cached);
      assert.equal(cached!.statusCode, 200);
      assert.deepEqual(cached!.body, { data: 'first response' });
    });
  });

  describe('duplicate request with same key', () => {
    it('returns cached response without calling next', async () => {
      const store = createIdempotencyStore('memory');
      const middleware = idempotencyKey({ store });
      const key = 'duplicate-test-key-5678';

      const firstReq = createMockRequest({ 'x-idempotency-key': key });
      const firstRes = createMockResponse();
      let firstNextCalled = false;
      const firstNext: NextFunction = () => {
        firstNextCalled = true;
      };

      await middleware(firstReq, firstRes as unknown as Response, firstNext);
      assert.equal(firstNextCalled, true);

      firstRes.json({ data: 'original response' });

      const secondReq = createMockRequest({ 'x-idempotency-key': key });
      const secondRes = createMockResponse();
      let secondNextCalled = false;
      const secondNext: NextFunction = () => {
        secondNextCalled = true;
      };

      await middleware(secondReq, secondRes as unknown as Response, secondNext);

      assert.equal(secondNextCalled, false);
      assert.equal(secondRes.statusCode, 200);
      assert.deepEqual(secondRes.body, { data: 'original response' });
    });
  });

  describe('custom header name', () => {
    it('reads from custom header name', async () => {
      const store = createIdempotencyStore('memory');
      const middleware = idempotencyKey({ headerName: 'X-Request-Id', store });
      const req = createMockRequest({ 'x-request-id': 'custom-header-key-1234567' });
      const res = createMockResponse();
      let called = false;
      const next: NextFunction = () => {
        called = true;
      };

      await middleware(req, res as unknown as Response, next);

      assert.equal(called, true);
    });
  });

  describe('memory store', () => {
    it('creates a working memory store', async () => {
      const store = createIdempotencyStore('memory');
      const key = 'memory-store-test-1234';

      assert.equal(await store.get(key), null);

      await store.set(key, { statusCode: 201, body: { ok: true }, timestamp: Date.now() });

      const entry = await store.get(key);
      assert.ok(entry);
      assert.equal(entry!.statusCode, 201);
      assert.deepEqual(entry!.body, { ok: true });
    });

    it('supports entries iterator and delete', async () => {
      const store = createIdempotencyStore('memory');
      await store.set('k1', { statusCode: 200, body: 'a', timestamp: 1000 });
      await store.set('k2', { statusCode: 200, body: 'b', timestamp: 2000 });

      assert.ok(store.entries);
      const entries = Array.from(store.entries!());
      assert.equal(entries.length, 2);

      assert.ok(store.delete);
      store.delete('k1');
      assert.equal(await store.get('k1'), null);
      assert.ok(await store.get('k2'));
    });
  });
});
