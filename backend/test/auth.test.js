import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { createBackendAuth } from '../src/auth.js';

const signFakeJwt = (payload, secret) => {
  const header = { alg: 'HS256', typ: 'JWT' };
  const headerB64 = Buffer.from(JSON.stringify(header)).toString('base64url');
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${headerB64}.${payloadB64}`)
    .digest('base64url');
  return `${headerB64}.${payloadB64}.${signature}`;
};

describe('backend auth', () => {
  it('creates auth module', () => {
    const config = {
      supabaseUrl: 'https://test.supabase.co',
      supabaseServiceRoleKey: 'test-key',
    };
    const auth = createBackendAuth(config, fetch);
    assert.ok(auth);
    assert.ok(auth.requireBackendAuth);
    assert.ok(auth.optionalBackendAuth);
  });

  it('requireBackendAuth is function', () => {
    const config = {
      supabaseUrl: 'https://test.supabase.co',
      supabaseServiceRoleKey: 'test-key',
    };
    const auth = createBackendAuth(config, fetch);
    assert.equal(typeof auth.requireBackendAuth, 'function');
  });

  it('optionalBackendAuth is function', () => {
    const config = {
      supabaseUrl: 'https://test.supabase.co',
      supabaseServiceRoleKey: 'test-key',
    };
    const auth = createBackendAuth(config, fetch);
    assert.equal(typeof auth.optionalBackendAuth, 'function');
  });

  it('verifies a valid HS256 JWT locally when secret is provided', async () => {
    const secret = 'super-secret-key-for-supabase-jwt-test-12345';
    const config = {
      supabaseUrl: 'https://test.supabase.co',
      supabaseAnonKey: 'test-key',
      supabaseJwtSecret: secret,
    };

    const payload = {
      sub: 'user-uuid-1234',
      email: 'test@engineeros.com',
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour in future
    };

    const token = signFakeJwt(payload, secret);
    const mockRequest = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    };

    // We pass a dummy fetch that throws an error to guarantee NO fetch calls are made
    const dummyFetch = () => {
      throw new Error('fetch should not be called');
    };

    const auth = createBackendAuth(config, dummyFetch);
    
    // We execute requireBackendAuth to trigger authenticate pipeline
    let reqAuth = null;
    const middleware = auth.requireBackendAuth;
    await middleware(mockRequest, {}, (err) => {
      assert.ifError(err);
      reqAuth = mockRequest.auth;
    });

    assert.ok(reqAuth);
    assert.equal(reqAuth.userId, 'user-uuid-1234');
    assert.equal(reqAuth.email, 'test@engineeros.com');
    assert.equal(reqAuth.source, 'local-jwt');
  });

  it('falls back to remote fetch validation if signature is invalid or secret mismatch', async () => {
    const secret = 'super-secret-key-for-supabase-jwt-test-12345';
    const config = {
      supabaseUrl: 'https://test.supabase.co',
      supabaseAnonKey: 'test-key',
      supabaseJwtSecret: secret,
    };

    const payload = {
      sub: 'user-uuid-1234',
      email: 'test@engineeros.com',
      exp: Math.floor(Date.now() / 1000) + 3600,
    };

    // Sign with WRONG secret
    const token = signFakeJwt(payload, 'wrong-secret-key');
    const mockRequest = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    };

    let fetchCalled = false;
    const mockFetch = async () => {
      fetchCalled = true;
      return new Response(JSON.stringify({ id: 'user-uuid-1234', email: 'test@engineeros.com' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    };

    const auth = createBackendAuth(config, mockFetch);
    
    let reqAuth = null;
    const middleware = auth.requireBackendAuth;
    await middleware(mockRequest, {}, (err) => {
      assert.ifError(err);
      reqAuth = mockRequest.auth;
    });

    assert.ok(reqAuth);
    assert.equal(reqAuth.userId, 'user-uuid-1234');
    assert.equal(reqAuth.source, 'supabase-jwt');
    assert.equal(fetchCalled, true);
  });
});
