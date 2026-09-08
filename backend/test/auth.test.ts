import type { NextFunction, Request, Response } from 'express';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { type BackendAuthConfig, createBackendAuth } from '../src/auth.js';

type MockResponse = Record<string, never>;
type FetchImpl = typeof fetch;

const mockFetch = (response: unknown): FetchImpl => (async () => response) as unknown as FetchImpl;

const createMockRequest = (
  headers: Record<string, string> = {},
  body: Record<string, unknown> = {}
): Request =>
  ({
    headers,
    body,
    auth: undefined,
  }) as unknown as Request;

const mockResponse: MockResponse = {};

describe('createBackendAuth', () => {
  describe('requireBackendAuth', () => {
    it('authenticates via internal API secret', async () => {
      const config = {
        internalApiSecret: 'secret-123',
        internalServiceId: 'service-worker',
        internalServiceEmail: 'svc@example.com',
        internalServiceRole: 'service',
      } as unknown as BackendAuthConfig;
      const { requireBackendAuth } = createBackendAuth(config);
      const req = createMockRequest({
        authorization: 'Bearer secret-123',
      });
      const next: NextFunction = () => {};
      await requireBackendAuth(req, mockResponse as unknown as Response, next);
      assert.equal(req.auth?.userId, 'service-worker');
      assert.equal(req.auth?.email, 'svc@example.com');
      assert.equal(req.auth?.role, 'service');
      assert.equal(req.auth?.source, 'internal-secret');
    });

    it('throws 503 when internal secret used without service identity', async () => {
      const config = {
        internalApiSecret: 'secret-123',
      } as unknown as BackendAuthConfig;
      const { requireBackendAuth } = createBackendAuth(config);
      const req = createMockRequest({ authorization: 'Bearer secret-123' }, {});
      let caughtError: (Error & { status?: number; code?: string }) | undefined;
      const next: NextFunction = ((err?: unknown) => {
        caughtError = err as Error & { status?: number; code?: string };
      }) as NextFunction;
      await requireBackendAuth(req, mockResponse as unknown as Response, next);
      assert.ok(caughtError);
      assert.equal(caughtError?.status, 503);
      assert.equal(caughtError?.code, 'internal_service_identity_unavailable');
    });

    it('throws 401 when no token provided and dev auth disabled', async () => {
      const config = {
        allowInsecureDevAuth: false,
      } as unknown as BackendAuthConfig;
      const { requireBackendAuth } = createBackendAuth(config);
      const req = createMockRequest({}, {});
      let caughtError: (Error & { status?: number }) | undefined;
      const next: NextFunction = ((err?: unknown) => {
        caughtError = err as Error & { status?: number };
      }) as NextFunction;
      await requireBackendAuth(req, mockResponse as unknown as Response, next);
      assert.ok(caughtError);
      assert.equal(caughtError?.status, 401);
    });

    it('allows dev bypass when allowInsecureDevAuth is true', async () => {
      const config = {
        allowInsecureDevAuth: true,
      } as unknown as BackendAuthConfig;
      const { requireBackendAuth } = createBackendAuth(config);
      const req = createMockRequest({}, { userId: 'dev-user-1' });
      const next: NextFunction = () => {};
      await requireBackendAuth(req, mockResponse as unknown as Response, next);
      assert.equal(req.auth?.userId, 'dev-user-1');
      assert.equal(req.auth?.source, 'dev-bypass');
    });

    it('uses default dev user when no userId provided', async () => {
      const config = {
        allowInsecureDevAuth: true,
      } as unknown as BackendAuthConfig;
      const { requireBackendAuth } = createBackendAuth(config);
      const req = createMockRequest({}, {});
      const next: NextFunction = () => {};
      await requireBackendAuth(req, mockResponse as unknown as Response, next);
      assert.equal(req.auth?.userId, 'engineeros-dev-user');
    });

    it('validates Supabase token via remote call', async () => {
      const config = {
        supabaseUrl: 'https://test.supabase.co',
        supabaseAnonKey: 'anon-key',
      } as unknown as BackendAuthConfig;
      const mockUser = { id: 'supabase-user-1', email: 'test@example.com' };
      const fetchImpl = mockFetch({
        ok: true,
        json: async () => mockUser,
      });
      const { requireBackendAuth } = createBackendAuth(config, fetchImpl);
      const req = createMockRequest({ authorization: 'Bearer supabase-token' }, {});
      const next: NextFunction = () => {};
      await requireBackendAuth(req, mockResponse as unknown as Response, next);
      assert.equal(req.auth?.userId, 'supabase-user-1');
      assert.equal(req.auth?.source, 'supabase-jwt');
    });

    it('throws 401 for invalid Supabase token', async () => {
      const config = {
        supabaseUrl: 'https://test.supabase.co',
        supabaseAnonKey: 'anon-key',
      } as unknown as BackendAuthConfig;
      const fetchImpl = mockFetch({ ok: false, status: 401 });
      const { requireBackendAuth } = createBackendAuth(config, fetchImpl);
      const req = createMockRequest({ authorization: 'Bearer invalid-token' }, {});
      let caughtError: (Error & { status?: number }) | undefined;
      const next: NextFunction = ((err?: unknown) => {
        caughtError = err as Error & { status?: number };
      }) as NextFunction;
      await requireBackendAuth(req, mockResponse as unknown as Response, next);
      assert.ok(caughtError);
      assert.equal(caughtError?.status, 401);
    });

    it('dev-bypass is blocked when environment is production', async () => {
      const config = {
        allowInsecureDevAuth: true,
        environment: 'production',
      } as unknown as BackendAuthConfig;
      const { requireBackendAuth } = createBackendAuth(config);
      const req = createMockRequest({}, { userId: 'dev-user-1' });
      let caughtError: (Error & { status?: number }) | undefined;
      const next: NextFunction = ((err?: unknown) => {
        caughtError = err as Error & { status?: number };
      }) as NextFunction;
      await requireBackendAuth(req, mockResponse as unknown as Response, next);
      assert.ok(caughtError);
      assert.equal(caughtError?.status, 401);
    });

    it('internal-secret takes priority over dev-bypass when both configured', async () => {
      const config = {
        internalApiSecret: 'secret-123',
        internalServiceId: 'service-priority',
        allowInsecureDevAuth: true,
      } as unknown as BackendAuthConfig;
      const { requireBackendAuth } = createBackendAuth(config);
      const req = createMockRequest(
        {
          authorization: 'Bearer secret-123',
        },
        { userId: 'dev-should-not-appear' }
      );
      const next: NextFunction = () => {};
      await requireBackendAuth(req, mockResponse as unknown as Response, next);
      assert.equal(req.auth?.userId, 'service-priority');
      assert.equal(req.auth?.source, 'internal-secret');
    });
  });

  describe('optionalBackendAuth', () => {
    it('sets auth to undefined on failure instead of throwing', async () => {
      const config = {} as unknown as BackendAuthConfig;
      const { optionalBackendAuth } = createBackendAuth(config);
      const req = createMockRequest({}, {});
      const next: NextFunction = () => {};
      await optionalBackendAuth(req, mockResponse as unknown as Response, next);
      assert.equal(req.auth, undefined);
    });

    it('authenticates when valid token provided', async () => {
      const config = {
        allowInsecureDevAuth: true,
      } as unknown as BackendAuthConfig;
      const { optionalBackendAuth } = createBackendAuth(config);
      const req = createMockRequest({}, {});
      const next: NextFunction = () => {};
      await optionalBackendAuth(req, mockResponse as unknown as Response, next);
      assert.ok(req.auth);
    });
  });
});
