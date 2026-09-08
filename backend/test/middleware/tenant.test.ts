import type { NextFunction, Request, Response } from 'express';
import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';

import { requireTenantContext } from '../../src/middleware/tenant.middleware.js';

type MockResponse = Record<string, never>;

const UUID_1 = '11111111-1111-4111-8111-111111111111';
const UUID_2 = '22222222-2222-4222-8222-222222222222';
const UUID_3 = '33333333-3333-4333-9333-333333333333';

const createMockRequest = (headers: Record<string, string> = {}, userId = 'test-user'): Request =>
  ({
    headers,
    auth: { userId },
    tenantId: undefined,
  }) as unknown as Request;

const mockResponse: MockResponse = {};

const originalEnv = process.env.NODE_ENV;

afterEach(() => {
  process.env.NODE_ENV = originalEnv;
});

describe('requireTenantContext', () => {
  describe('with X-EngineerOS-Org-Id header', () => {
    it('sets tenantId from the header value', async () => {
      process.env.NODE_ENV = 'test';
      const req = createMockRequest({ 'x-engineeros-org-id': UUID_1 });
      let called = false;
      const next: NextFunction = () => {
        called = true;
      };

      await requireTenantContext(req, mockResponse as unknown as Response, next);

      assert.equal(called, true);
      assert.equal(req.tenantId, UUID_1);
    });
  });

  describe('with X-Corporation-Id header', () => {
    it('sets tenantId from the corporation header', async () => {
      process.env.NODE_ENV = 'test';
      const req = createMockRequest({ 'x-corporation-id': UUID_2 });
      let called = false;
      const next: NextFunction = () => {
        called = true;
      };

      await requireTenantContext(req, mockResponse as unknown as Response, next);

      assert.equal(called, true);
      assert.equal(req.tenantId, UUID_2);
    });
  });

  describe('X-EngineerOS-Org-Id takes priority', () => {
    it('prefers org-id over corporation-id when both present', async () => {
      process.env.NODE_ENV = 'test';
      const req = createMockRequest({
        'x-engineeros-org-id': UUID_1,
        'x-corporation-id': UUID_2,
      });
      let called = false;
      const next: NextFunction = () => {
        called = true;
      };

      await requireTenantContext(req, mockResponse as unknown as Response, next);

      assert.equal(called, true);
      assert.equal(req.tenantId, UUID_1);
    });
  });

  describe('missing tenant header', () => {
    it('returns 400 when no tenant header present', async () => {
      process.env.NODE_ENV = 'development';
      const req = createMockRequest({});
      let caughtError: (Error & { status?: number; code?: string }) | undefined;
      const next: NextFunction = ((err?: unknown) => {
        caughtError = err as Error & { status?: number; code?: string };
      }) as NextFunction;

      await requireTenantContext(req, mockResponse as unknown as Response, next);

      assert.ok(caughtError);
      assert.equal(caughtError?.status, 400);
      assert.equal(caughtError?.code, 'tenant_context_required');
      assert.match(caughtError!.message, /X-EngineerOS-Org-Id is required/);
    });

    it('returns 400 when headers object is empty', async () => {
      process.env.NODE_ENV = 'staging';
      const req = createMockRequest();
      let caughtError: (Error & { status?: number }) | undefined;
      const next: NextFunction = ((err?: unknown) => {
        caughtError = err as Error & { status?: number };
      }) as NextFunction;

      await requireTenantContext(req, mockResponse as unknown as Response, next);

      assert.ok(caughtError);
      assert.equal(caughtError?.status, 400);
    });
  });

  describe('NODE_ENV=test bypass', () => {
    it('sets default tenantId in test environment', async () => {
      process.env.NODE_ENV = 'test';
      const req = createMockRequest({});
      let called = false;
      const next: NextFunction = () => {
        called = true;
      };

      await requireTenantContext(req, mockResponse as unknown as Response, next);

      assert.equal(called, true);
      assert.equal(req.tenantId, '00000000-0000-4000-8000-000000000001');
    });

    it('still respects header in test environment', async () => {
      process.env.NODE_ENV = 'test';
      const req = createMockRequest({ 'x-engineeros-org-id': UUID_3 });
      let called = false;
      const next: NextFunction = () => {
        called = true;
      };

      await requireTenantContext(req, mockResponse as unknown as Response, next);

      assert.equal(called, true);
      assert.equal(req.tenantId, UUID_3);
    });
  });
});
