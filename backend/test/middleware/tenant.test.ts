import type { NextFunction, Request, Response } from 'express';
import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';

import { requireTenantContext } from '../../src/middleware/tenant.middleware.js';

type MockResponse = Record<string, never>;

const createMockRequest = (headers: Record<string, string> = {}): Request =>
  ({
    headers,
    tenantId: undefined,
  }) as unknown as Request;

const mockResponse: MockResponse = {};

const originalEnv = process.env.NODE_ENV;

afterEach(() => {
  process.env.NODE_ENV = originalEnv;
});

describe('requireTenantContext', () => {
  describe('with X-EngineerOS-Org-Id header', () => {
    it('sets tenantId from the header value', () => {
      process.env.NODE_ENV = 'development';
      const req = createMockRequest({ 'x-engineeros-org-id': 'org-abc-123' });
      let called = false;
      const next: NextFunction = () => {
        called = true;
      };

      requireTenantContext(req, mockResponse as unknown as Response, next);

      assert.equal(called, true);
      assert.equal(req.tenantId, 'org-abc-123');
    });
  });

  describe('with X-Corporation-Id header', () => {
    it('sets tenantId from the corporation header', () => {
      process.env.NODE_ENV = 'development';
      const req = createMockRequest({ 'x-corporation-id': 'corp-xyz-789' });
      let called = false;
      const next: NextFunction = () => {
        called = true;
      };

      requireTenantContext(req, mockResponse as unknown as Response, next);

      assert.equal(called, true);
      assert.equal(req.tenantId, 'corp-xyz-789');
    });
  });

  describe('X-EngineerOS-Org-Id takes priority', () => {
    it('prefers org-id over corporation-id when both present', () => {
      process.env.NODE_ENV = 'development';
      const req = createMockRequest({
        'x-engineeros-org-id': 'org-primary',
        'x-corporation-id': 'corp-secondary',
      });
      let called = false;
      const next: NextFunction = () => {
        called = true;
      };

      requireTenantContext(req, mockResponse as unknown as Response, next);

      assert.equal(called, true);
      assert.equal(req.tenantId, 'org-primary');
    });
  });

  describe('missing tenant header', () => {
    it('returns 400 when no tenant header present', () => {
      process.env.NODE_ENV = 'development';
      const req = createMockRequest({});
      let caughtError: (Error & { status?: number; code?: string }) | undefined;
      const next: NextFunction = ((err?: unknown) => {
        caughtError = err as Error & { status?: number; code?: string };
      }) as NextFunction;

      requireTenantContext(req, mockResponse as unknown as Response, next);

      assert.ok(caughtError);
      assert.equal(caughtError?.status, 400);
      assert.equal(caughtError?.code, 'tenant_context_required');
      assert.match(caughtError!.message, /tenant identification header/);
    });

    it('returns 400 when headers object is empty', () => {
      process.env.NODE_ENV = 'staging';
      const req = createMockRequest();
      let caughtError: (Error & { status?: number }) | undefined;
      const next: NextFunction = ((err?: unknown) => {
        caughtError = err as Error & { status?: number };
      }) as NextFunction;

      requireTenantContext(req, mockResponse as unknown as Response, next);

      assert.ok(caughtError);
      assert.equal(caughtError?.status, 400);
    });
  });

  describe('NODE_ENV=test bypass', () => {
    it('sets default tenantId in test environment', () => {
      process.env.NODE_ENV = 'test';
      const req = createMockRequest({});
      let called = false;
      const next: NextFunction = () => {
        called = true;
      };

      requireTenantContext(req, mockResponse as unknown as Response, next);

      assert.equal(called, true);
      assert.equal(req.tenantId, 'test-tenant');
    });

    it('still respects header in test environment', () => {
      process.env.NODE_ENV = 'test';
      const req = createMockRequest({ 'x-engineeros-org-id': 'real-org' });
      let called = false;
      const next: NextFunction = () => {
        called = true;
      };

      requireTenantContext(req, mockResponse as unknown as Response, next);

      assert.equal(called, true);
      assert.equal(req.tenantId, 'real-org');
    });
  });
});
