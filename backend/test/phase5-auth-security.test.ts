import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { describe, test } from 'node:test';

import type { AuthConfig } from '../types.js';
import { createBackendAuth, verifyJwtLocally } from '../src/auth.js';
import { ApiError } from '../src/errors.js';

const secret = 'phase5-test-secret-with-enough-entropy';
const now = 1_789_000_000;
const baseConfig: AuthConfig = {
  internalApiSecret: null,
  internalServiceId: null,
  internalServiceEmail: null,
  internalServiceRole: null,
  allowInsecureDevAuth: false,
  supabaseUrl: null,
  supabaseAnonKey: null,
  supabaseJwtSecret: secret,
  supabaseJwtIssuer: 'https://project.supabase.co/auth/v1',
  supabaseJwtAudience: 'authenticated',
  firebaseProjectId: null,
};

const encode = (value: unknown): string => Buffer.from(JSON.stringify(value)).toString('base64url');
const signToken = (
  payload: Record<string, unknown>,
  header: Record<string, unknown> = { alg: 'HS256', typ: 'JWT' },
  signingSecret = secret
): string => {
  const signingInput = `${encode(header)}.${encode(payload)}`;
  const signature = createHmac('sha256', signingSecret).update(signingInput).digest('base64url');
  return `${signingInput}.${signature}`;
};

const validPayload = {
  sub: 'user_123',
  email: 'user@example.com',
  role: 'member',
  iat: now - 30,
  exp: now + 300,
  iss: baseConfig.supabaseJwtIssuer,
  aud: baseConfig.supabaseJwtAudience,
};

describe('Phase 5 local JWT verification', () => {
  test('accepts a signed HS256 JWT with all required claims', async () => {
    const user = await verifyJwtLocally(signToken(validPayload), baseConfig, now);
    assert.deepEqual(user, {
      userId: 'user_123',
      email: 'user@example.com',
      role: 'member',
      source: 'local-jwt',
    });
  });

  test('rejects algorithm, type, issuer, audience and signature substitution', async () => {
    const cases = [
      signToken(validPayload, { alg: 'none', typ: 'JWT' }),
      signToken(validPayload, { alg: 'HS512', typ: 'JWT' }),
      signToken(validPayload, { alg: 'HS256', typ: 'NotJWT' }),
      signToken({ ...validPayload, iss: 'https://attacker.invalid' }),
      signToken({ ...validPayload, aud: 'service-role' }),
      signToken(validPayload, undefined, 'wrong-secret'),
    ];
    for (const token of cases) assert.equal(await verifyJwtLocally(token, baseConfig, now), null);
  });

  test('rejects missing, expired, future-issued and inverted temporal claims', async () => {
    const cases = [
      signToken({ ...validPayload, exp: undefined }),
      signToken({ ...validPayload, iat: undefined }),
      signToken({ ...validPayload, exp: now - 61 }),
      signToken({ ...validPayload, iat: now + 61 }),
      signToken({ ...validPayload, iat: now + 10, exp: now + 5 }),
    ];
    for (const token of cases) assert.equal(await verifyJwtLocally(token, baseConfig, now), null);
  });
});

describe('Phase 5 internal service identity', () => {
  test('ignores caller-controlled identity headers and uses configured service identity', async () => {
    const auth = createBackendAuth({
      ...baseConfig,
      environment: 'production',
      supabaseJwtSecret: null,
      supabaseJwtIssuer: null,
      supabaseJwtAudience: null,
      internalApiSecret: 'internal-secret',
      internalServiceId: 'service_export_worker',
      internalServiceEmail: 'service@example.com',
      internalServiceRole: 'service',
    });
    const request = {
      headers: {
        authorization: 'Bearer internal-secret',
        'x-engineeros-user-id': 'attacker-user',
        'x-engineeros-user-role': 'admin',
      },
      body: { userId: 'body-attacker', role: 'admin' },
      query: {},
      path: '/api/v1/export',
    } as never;
    let error: unknown;
    await auth.requireBackendAuth(request, {} as never, (nextError?: unknown) => {
      error = nextError;
    });
    assert.equal(error, undefined);
    assert.deepEqual((request as { auth?: unknown }).auth, {
      userId: 'service_export_worker',
      email: 'service@example.com',
      role: 'service',
      source: 'internal-secret',
    });
  });

  test('fails closed when a matching internal secret has no configured service identity', async () => {
    const auth = createBackendAuth({
      ...baseConfig,
      environment: 'production',
      supabaseJwtSecret: null,
      supabaseJwtIssuer: null,
      supabaseJwtAudience: null,
      internalApiSecret: 'internal-secret',
    });
    const request = {
      headers: { authorization: 'Bearer internal-secret' },
      body: {},
      query: {},
      path: '/api/v1/export',
    } as never;
    let error: unknown;
    await auth.requireBackendAuth(request, {} as never, (nextError?: unknown) => {
      error = nextError;
    });
    assert.ok(error instanceof ApiError);
    assert.equal(error.status, 503);
    assert.equal(error.code, 'internal_service_identity_unavailable');
  });
});
