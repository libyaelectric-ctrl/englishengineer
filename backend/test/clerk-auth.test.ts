import type { NextFunction, Request, Response } from 'express';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { describe, it } from 'node:test';

import { type BackendAuthConfig, createBackendAuth } from '../src/auth.js';

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

interface ClerkKeyPair {
  privateKey: NodeCryptoKey;
  publicJwk: JwkWithKid;
  kid: string;
}

const createClerkKeyPair = async (kid: string): Promise<ClerkKeyPair> => {
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

const signClerkJwt = async (
  keyPair: ClerkKeyPair,
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

describe('createBackendAuth with Clerk issuer', () => {
  it('authenticates a valid Clerk session JWT against the instance JWKS', async () => {
    const keyPair = await createClerkKeyPair('clerk-kid-1');
    const issuer = 'https://clerk.test.clerk.accounts.dev';
    const token = await signClerkJwt(keyPair, {
      sub: 'clerk-user-1',
      iss: issuer,
      exp: nowSeconds() + 3600,
      nbf: nowSeconds() - 60,
      email: 'clerk@example.com',
    });

    const { requireBackendAuth } = createBackendAuth(
      { clerkIssuer: issuer } as unknown as BackendAuthConfig,
      createJwksFetch([{ ...keyPair.publicJwk, kid: keyPair.kid, use: 'sig', alg: 'RS256' }])
    );

    const { next, errors } = captureNext();
    const req = createMockRequest({ authorization: `Bearer ${token}` });
    await requireBackendAuth(req, mockResponse, next);

    assert.deepEqual(errors, []);
    assert.ok(req.auth);
    assert.equal(req.auth?.userId, 'clerk-user-1');
    assert.equal(req.auth?.email, 'clerk@example.com');
    assert.equal(req.auth?.source, 'clerk-jwt');
  });

  it('rejects a token signed by a different key (unknown kid)', async () => {
    const keyPair = await createClerkKeyPair('clerk-kid-real');
    const otherPair = await createClerkKeyPair('clerk-kid-other');
    const issuer = 'https://clerk.test.clerk.accounts.dev';
    const token = await signClerkJwt(otherPair, {
      sub: 'clerk-user-2',
      iss: issuer,
      exp: nowSeconds() + 3600,
    });

    const { requireBackendAuth } = createBackendAuth(
      { clerkIssuer: issuer } as unknown as BackendAuthConfig,
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

  it('rejects an expired Clerk session JWT', async () => {
    const keyPair = await createClerkKeyPair('clerk-kid-expired');
    const issuer = 'https://clerk.test.clerk.accounts.dev';
    const token = await signClerkJwt(keyPair, {
      sub: 'clerk-user-3',
      iss: issuer,
      exp: nowSeconds() - 120,
      nbf: nowSeconds() - 600,
    });

    const { requireBackendAuth } = createBackendAuth(
      { clerkIssuer: issuer } as unknown as BackendAuthConfig,
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

  it('rejects a token issued by a different Clerk instance', async () => {
    const keyPair = await createClerkKeyPair('clerk-kid-issuer');
    const token = await signClerkJwt(keyPair, {
      sub: 'clerk-user-4',
      iss: 'https://other.clerk.accounts.dev',
      exp: nowSeconds() + 3600,
    });

    const { requireBackendAuth } = createBackendAuth(
      { clerkIssuer: 'https://clerk.test.clerk.accounts.dev' } as unknown as BackendAuthConfig,
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

  it('falls through to Supabase validation when no Clerk issuer is configured', async () => {
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
    const { requireBackendAuth } = createBackendAuth(
      { clerkIssuer: 'https://clerk.test.clerk.accounts.dev' } as unknown as BackendAuthConfig,
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
