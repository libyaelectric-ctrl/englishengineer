import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createBackendAuth, extractAuthenticatedUser } from '../src/auth.js';

const mockFetch = (response) => async () => response;

const createMockRequest = (headers = {}, body = {}) => ({
  headers,
  body,
  auth: undefined,
});

describe('createBackendAuth', () => {
  describe('requireBackendAuth', () => {
    it('authenticates via internal API secret', async () => {
      const config = { internalApiSecret: 'secret-123' };
      const { requireBackendAuth } = createBackendAuth(config);
      const req = createMockRequest(
        {
          authorization: 'Bearer secret-123',
          'x-engineeros-user-id': 'user-1',
        },
        {}
      );
      const next = () => {};
      await requireBackendAuth(req, {}, next);
      assert.equal(req.auth.userId, 'user-1');
      assert.equal(req.auth.source, 'internal-secret');
    });

    it('throws 400 when internal secret used without user ID', async () => {
      const config = { internalApiSecret: 'secret-123' };
      const { requireBackendAuth } = createBackendAuth(config);
      const req = createMockRequest({ authorization: 'Bearer secret-123' }, {});
      let caughtError;
      const next = (err) => {
        caughtError = err;
      };
      await requireBackendAuth(req, {}, next);
      assert.ok(caughtError);
      assert.equal(caughtError.status, 400);
    });

    it('throws 401 when no token provided and dev auth disabled', async () => {
      const config = { allowInsecureDevAuth: false };
      const { requireBackendAuth } = createBackendAuth(config);
      const req = createMockRequest({}, {});
      let caughtError;
      const next = (err) => {
        caughtError = err;
      };
      await requireBackendAuth(req, {}, next);
      assert.ok(caughtError);
      assert.equal(caughtError.status, 401);
    });

    it('allows dev bypass when allowInsecureDevAuth is true', async () => {
      const config = { allowInsecureDevAuth: true };
      const { requireBackendAuth } = createBackendAuth(config);
      const req = createMockRequest({}, { userId: 'dev-user-1' });
      const next = () => {};
      await requireBackendAuth(req, {}, next);
      assert.equal(req.auth.userId, 'dev-user-1');
      assert.equal(req.auth.source, 'dev-bypass');
    });

    it('uses default dev user when no userId provided', async () => {
      const config = { allowInsecureDevAuth: true };
      const { requireBackendAuth } = createBackendAuth(config);
      const req = createMockRequest({}, {});
      const next = () => {};
      await requireBackendAuth(req, {}, next);
      assert.equal(req.auth.userId, 'engineeros-dev-user');
    });

    it('validates Supabase token via remote call', async () => {
      const config = {
        supabaseUrl: 'https://test.supabase.co',
        supabaseAnonKey: 'anon-key',
      };
      const mockUser = { id: 'supabase-user-1', email: 'test@example.com' };
      const fetchImpl = mockFetch({
        ok: true,
        json: async () => mockUser,
      });
      const { requireBackendAuth } = createBackendAuth(config, fetchImpl);
      const req = createMockRequest(
        { authorization: 'Bearer supabase-token' },
        {}
      );
      const next = () => {};
      await requireBackendAuth(req, {}, next);
      assert.equal(req.auth.userId, 'supabase-user-1');
      assert.equal(req.auth.source, 'supabase-jwt');
    });

    it('throws 401 for invalid Supabase token', async () => {
      const config = {
        supabaseUrl: 'https://test.supabase.co',
        supabaseAnonKey: 'anon-key',
      };
      const fetchImpl = mockFetch({ ok: false, status: 401 });
      const { requireBackendAuth } = createBackendAuth(config, fetchImpl);
      const req = createMockRequest(
        { authorization: 'Bearer invalid-token' },
        {}
      );
      let caughtError;
      const next = (err) => {
        caughtError = err;
      };
      await requireBackendAuth(req, {}, next);
      assert.ok(caughtError);
      assert.equal(caughtError.status, 401);
    });
  });

  describe('optionalBackendAuth', () => {
    it('sets auth to null on failure instead of throwing', async () => {
      const config = {};
      const { optionalBackendAuth } = createBackendAuth(config);
      const req = createMockRequest({}, {});
      const next = () => {};
      await optionalBackendAuth(req, {}, next);
      assert.equal(req.auth, null);
    });

    it('authenticates when valid token provided', async () => {
      const config = { allowInsecureDevAuth: true };
      const { optionalBackendAuth } = createBackendAuth(config);
      const req = createMockRequest({}, {});
      const next = () => {};
      await optionalBackendAuth(req, {}, next);
      assert.ok(req.auth);
    });
  });
});

describe('extractAuthenticatedUser', () => {
  it('returns auth from request if present', () => {
    const req = { auth: { userId: 'user-1', source: 'test' } };
    const user = extractAuthenticatedUser(req);
    assert.equal(user.userId, 'user-1');
  });

  it('returns null if no auth on request', () => {
    const req = {};
    const user = extractAuthenticatedUser(req);
    assert.equal(user, null);
  });
});
