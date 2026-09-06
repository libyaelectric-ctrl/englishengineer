import type { NextFunction, Request, Response } from 'express';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { describe, it } from 'node:test';

import { type BackendAuthConfig, createBackendAuth, resetFirebaseJwksCache } from '../src/auth.js';

const subtle = webcrypto.subtle;

type NodeCryptoKey = webcrypto.CryptoKey;

interface JwkWithKid extends JsonWebKey {
  kid?: string;
}

interface JwkSet {
  keys: JwkWithKid[];
}

const base64Url = (value: Uint8Array): string =>
  Buffer.from(value).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

const jsonBase64Url = (value: unknown): string =>
  base64Url(new TextEncoder().encode(JSON.stringify(value)));

interface FirebaseKeyPair {
  privateKey: NodeCryptoKey;
  publicJwk: JwkWithKid;
  kid: string;
}

const createFirebaseKeyPair = async (kid: string): Promise<FirebaseKeyPair> => {
  const { privateKey, publicKey } = await subtle.generateKey(
    {
      name: 'RSASSA-PKCS1-v1_5',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true,
    ['sign', 'verify']
  );
  const publicJwk = (await subtle.exportKey('jwk', publicKey)) as JwkWithKid;
  return { privateKey, publicJwk, kid };
};

const signFirebaseJwt = async (
  keyPair: FirebaseKeyPair,
  claims: Record<string, unknown>
): Promise<string> => {
  const header = { alg: 'RS256', kid: keyPair.kid, typ: 'JWT' };
  const headerB64 = jsonBase64Url(header);
  const payloadB64 = jsonBase64Url(claims);
  const signature = await subtle.sign(
    { name: 'RSASSA-PKCS1-v1_5' },
    keyPair.privateKey,
    new TextEncoder().encode(`${headerB64}.${payloadB64}`)
  );
  return `${headerB64}.${payloadB64}.${base64Url(new Uint8Array(signature))}`;
};

const createJwksFetch = (keys: JwkWithKid[]): typeof fetch =>
  (async () => ({ ok: true, json: async () => ({ keys }) as JwkSet })) as unknown as typeof fetch;

/** Captures the URL(s) requested through a fetch impl, while still serving
 * the given keys — for asserting the exact Google endpoint that gets hit. */
const createJwksFetchSpy = (
  keys: JwkWithKid[]
): { fetchImpl: typeof fetch; calls: string[] } => {
  const calls: string[] = [];
  const fetchImpl = (async (input: unknown) => {
    calls.push(String(input));
    return { ok: true, json: async () => ({ keys }) as JwkSet };
  }) as unknown as typeof fetch;
  return { fetchImpl, calls };
};

const createMockRequest = (headers: Record<string, string> = {}): Request =>
  ({ headers, auth: undefined }) as unknown as Request;

const mockResponse = {} as unknown as Response;

const nowSeconds = (): number => Math.floor(Date.now() / 1000);

const captureNext = (): { next: NextFunction; errors: unknown[] } => {
  const errors: unknown[] = [];
  const next = ((err?: unknown) => {
    if (err) errors.push(err);
  }) as NextFunction;
  return { next, errors };
};

const PROJECT_ID = 'test-firebase-project';
const ISSUER = `https://securetoken.google.com/${PROJECT_ID}`;

const baseClaims = (overrides: Record<string, unknown> = {}): Record<string, unknown> => ({
  sub: 'firebase-uid-1',
  aud: PROJECT_ID,
  iss: ISSUER,
  iat: nowSeconds() - 60,
  exp: nowSeconds() + 3600,
  auth_time: nowSeconds() - 60,
  email: 'engineer@example.com',
  email_verified: true,
  firebase: { sign_in_provider: 'google.com' },
  ...overrides,
});

describe('createBackendAuth with Firebase project', () => {
  const reset = () => resetFirebaseJwksCache();

  it('authenticates a valid Firebase ID token against the Google JWKS', async () => {
    reset();
    const keyPair = await createFirebaseKeyPair('firebase-kid-1');
    const token = await signFirebaseJwt(keyPair, baseClaims());

    const { requireBackendAuth } = createBackendAuth(
      { firebaseProjectId: PROJECT_ID } as unknown as BackendAuthConfig,
      createJwksFetch([{ ...keyPair.publicJwk, kid: keyPair.kid, use: 'sig', alg: 'RS256' }])
    );

    const { next, errors } = captureNext();
    const req = createMockRequest({ authorization: `Bearer ${token}` });
    await requireBackendAuth(req, mockResponse, next);

    assert.deepEqual(errors, []);
    assert.ok(req.auth);
    assert.equal(req.auth?.userId, 'firebase-uid-1');
    assert.equal(req.auth?.email, 'engineer@example.com');
    assert.equal(req.auth?.source, 'firebase-jwt');
  });

  it('propagates custom claims (role) from the ID token', async () => {
    reset();
    const keyPair = await createFirebaseKeyPair('firebase-kid-role');
    const token = await signFirebaseJwt(
      keyPair,
      baseClaims({ sub: 'firebase-uid-admin', role: 'Super Administrator', isSuperUser: true })
    );

    const { requireBackendAuth } = createBackendAuth(
      { firebaseProjectId: PROJECT_ID } as unknown as BackendAuthConfig,
      createJwksFetch([{ ...keyPair.publicJwk, kid: keyPair.kid, use: 'sig', alg: 'RS256' }])
    );

    const { next, errors } = captureNext();
    const req = createMockRequest({ authorization: `Bearer ${token}` });
    await requireBackendAuth(req, mockResponse, next);

    assert.deepEqual(errors, []);
    assert.equal(req.auth?.userId, 'firebase-uid-admin');
    assert.equal(req.auth?.role, 'Super Administrator');
  });

  it('fetches keys from the real, documented Google JWKS endpoint', async () => {
    // Regression test: this URL was previously wrong ("v3/jwks", a path
    // that does not exist) which silently broke every Firebase sign-in —
    // JWKS fetch failed, the auth chain fell through, and every real,
    // valid ID token was rejected with a generic 401. Google's own
    // OIDC discovery document (https://securetoken.google.com/{project}/
    // .well-known/openid-configuration) publishes this exact jwks_uri.
    reset();
    const keyPair = await createFirebaseKeyPair('firebase-kid-url-check');
    const token = await signFirebaseJwt(keyPair, baseClaims());
    const { fetchImpl, calls } = createJwksFetchSpy([
      { ...keyPair.publicJwk, kid: keyPair.kid, use: 'sig', alg: 'RS256' },
    ]);

    const { requireBackendAuth } = createBackendAuth(
      { firebaseProjectId: PROJECT_ID } as unknown as BackendAuthConfig,
      fetchImpl
    );

    const { next, errors } = captureNext();
    await requireBackendAuth(
      createMockRequest({ authorization: `Bearer ${token}` }),
      mockResponse,
      next
    );

    assert.deepEqual(errors, []);
    assert.deepEqual(calls, [
      'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com',
    ]);
  });

  it('rejects a token signed by a different key (unknown kid)', async () => {
    reset();
    const keyPair = await createFirebaseKeyPair('firebase-kid-real');
    const otherPair = await createFirebaseKeyPair('firebase-kid-other');
    const token = await signFirebaseJwt(otherPair, baseClaims({ sub: 'firebase-uid-2' }));

    const { requireBackendAuth } = createBackendAuth(
      { firebaseProjectId: PROJECT_ID } as unknown as BackendAuthConfig,
      createJwksFetch([{ ...keyPair.publicJwk, kid: keyPair.kid, use: 'sig', alg: 'RS256' }])
    );

    const { next, errors } = captureNext();
    await requireBackendAuth(
      createMockRequest({ authorization: `Bearer ${token}` }),
      mockResponse,
      next
    );

    assert.equal(errors.length, 1);
    const error = errors[0] as Error & { status?: number };
    assert.equal(error.status, 401);
  });

  it('rejects an expired Firebase ID token', async () => {
    reset();
    const keyPair = await createFirebaseKeyPair('firebase-kid-expired');
    const token = await signFirebaseJwt(
      keyPair,
      baseClaims({ sub: 'firebase-uid-3', exp: nowSeconds() - 120, iat: nowSeconds() - 600 })
    );

    const { requireBackendAuth } = createBackendAuth(
      { firebaseProjectId: PROJECT_ID } as unknown as BackendAuthConfig,
      createJwksFetch([{ ...keyPair.publicJwk, kid: keyPair.kid, use: 'sig', alg: 'RS256' }])
    );

    const { next, errors } = captureNext();
    await requireBackendAuth(
      createMockRequest({ authorization: `Bearer ${token}` }),
      mockResponse,
      next
    );

    assert.equal(errors.length, 1);
    const error = errors[0] as Error & { status?: number };
    assert.equal(error.status, 401);
  });

  it('rejects a token issued for a different Firebase project (issuer mismatch)', async () => {
    reset();
    const keyPair = await createFirebaseKeyPair('firebase-kid-issuer');
    const token = await signFirebaseJwt(
      keyPair,
      baseClaims({
        sub: 'firebase-uid-4',
        iss: 'https://securetoken.google.com/other-project',
        aud: 'other-project',
      })
    );

    const { requireBackendAuth } = createBackendAuth(
      { firebaseProjectId: PROJECT_ID } as unknown as BackendAuthConfig,
      createJwksFetch([{ ...keyPair.publicJwk, kid: keyPair.kid, use: 'sig', alg: 'RS256' }])
    );

    const { next, errors } = captureNext();
    await requireBackendAuth(
      createMockRequest({ authorization: `Bearer ${token}` }),
      mockResponse,
      next
    );

    assert.equal(errors.length, 1);
    const error = errors[0] as Error & { status?: number };
    assert.equal(error.status, 401);
  });

  it('rejects a token whose audience is not the configured project', async () => {
    reset();
    const keyPair = await createFirebaseKeyPair('firebase-kid-aud');
    const token = await signFirebaseJwt(
      keyPair,
      baseClaims({ sub: 'firebase-uid-5', aud: 'some-other-project' })
    );

    const { requireBackendAuth } = createBackendAuth(
      { firebaseProjectId: PROJECT_ID } as unknown as BackendAuthConfig,
      createJwksFetch([{ ...keyPair.publicJwk, kid: keyPair.kid, use: 'sig', alg: 'RS256' }])
    );

    const { next, errors } = captureNext();
    await requireBackendAuth(
      createMockRequest({ authorization: `Bearer ${token}` }),
      mockResponse,
      next
    );

    assert.equal(errors.length, 1);
    const error = errors[0] as Error & { status?: number };
    assert.equal(error.status, 401);
  });

  it('rejects a token issued in the future', async () => {
    reset();
    const keyPair = await createFirebaseKeyPair('firebase-kid-future');
    const token = await signFirebaseJwt(
      keyPair,
      baseClaims({ sub: 'firebase-uid-6', iat: nowSeconds() + 600 })
    );

    const { requireBackendAuth } = createBackendAuth(
      { firebaseProjectId: PROJECT_ID } as unknown as BackendAuthConfig,
      createJwksFetch([{ ...keyPair.publicJwk, kid: keyPair.kid, use: 'sig', alg: 'RS256' }])
    );

    const { next, errors } = captureNext();
    await requireBackendAuth(
      createMockRequest({ authorization: `Bearer ${token}` }),
      mockResponse,
      next
    );

    assert.equal(errors.length, 1);
    const error = errors[0] as Error & { status?: number };
    assert.equal(error.status, 401);
  });

  it('falls through to Supabase validation when no Firebase project is configured', async () => {
    reset();
    const mockUser = { id: 'supabase-user-1', email: 'supabase@example.com' };
    const { requireBackendAuth } = createBackendAuth(
      {
        supabaseUrl: 'https://test.supabase.co',
        supabaseAnonKey: 'anon-key',
      } as unknown as BackendAuthConfig,
      (async () => ({ ok: true, json: async () => mockUser })) as unknown as typeof fetch
    );

    const { next, errors } = captureNext();
    const req = createMockRequest({ authorization: 'Bearer supabase-token' });
    await requireBackendAuth(req, mockResponse, next);

    assert.deepEqual(errors, []);
    assert.ok(req.auth);
    assert.equal(req.auth?.userId, 'supabase-user-1');
    assert.equal(req.auth?.source, 'supabase-jwt');
  });

  it('rejects a malformed token without attempting signature verification', async () => {
    reset();
    const { requireBackendAuth } = createBackendAuth(
      { firebaseProjectId: PROJECT_ID } as unknown as BackendAuthConfig,
      createJwksFetch([])
    );

    const { next, errors } = captureNext();
    await requireBackendAuth(
      createMockRequest({ authorization: 'Bearer not-a-jwt' }),
      mockResponse,
      next
    );

    assert.equal(errors.length, 1);
    const error = errors[0] as Error & { status?: number };
    assert.equal(error.status, 401);
  });
});
