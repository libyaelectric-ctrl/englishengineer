import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

import { type BackendAuthConfig, createBackendAuth } from '../src/auth.js';

interface MockRequest {
  headers: Record<string, string>;
  auth?: unknown;
}

const hasTokenFile = Boolean(process.env.CLERK_TOKEN_FILE);

describe(
  'live clerk verification against real instance JWKS',
  { skip: !hasTokenFile && 'CLERK_TOKEN_FILE not set' },
  () => {
    it('accepts a real session JWT minted via the Clerk Backend API', async () => {
      const tokenFile = process.env.CLERK_TOKEN_FILE!;
      assert.ok(tokenFile, 'CLERK_TOKEN_FILE must be set');
      const token = readFileSync(tokenFile, 'utf8').trim();
      assert.ok(token.length > 100, 'token looks bogus');

      const { requireBackendAuth } = createBackendAuth(
        {
          clerkIssuer: 'https://clerk.engvox.com',
        } as unknown as BackendAuthConfig,
        fetch
      );

      const errors: unknown[] = [];
      const next = ((err?: unknown) => {
        if (err) errors.push(err);
      }) as never;

      const req: MockRequest = { headers: { authorization: `Bearer ${token}` } };
      await requireBackendAuth(req as never, {} as never, next);

      assert.deepEqual(errors, [], 'requireBackendAuth should not error');
      assert.equal((req.auth as { userId?: string }).userId, 'user_3I3eg5EbuNxzKqplfxKRduDwpYR');
      assert.equal((req.auth as { source?: string }).source, 'clerk-jwt');
      console.log('LIVE-CLERK-VERIFY OK');
    });
  }
);
