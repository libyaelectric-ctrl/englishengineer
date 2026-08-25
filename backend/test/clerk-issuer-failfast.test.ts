import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createApp } from '../src/app.js';
import type { BackendConfig } from '../types.js';

const minimalProductionConfig = {
  port: 8787,
  appOrigin: 'https://engvox.com',
  environment: 'production',
  version: '4.0.22',
  sentry: { dsn: null, environment: 'production', tracesSampleRate: 0.1 },
  ai: { configured: false },
  auth: {
    internalApiSecret: null,
    allowInsecureDevAuth: false,
    supabaseUrl: null,
    supabaseAnonKey: null,
    supabaseJwtSecret: null,
    clerkIssuer: null, // ← deliberately missing
  },
  billing: { configured: false },
  dodo: { configured: false },
  stripe: { configured: false, supabaseUrl: null, supabaseServiceRoleKey: null },
  supabase: { configured: false },
  vocabulary: { configured: false },
  workspace: { configured: false },
  rateLimit: {
    storeMode: 'upstash' as const,
    windowMs: 60000,
    max: 100,
    upstashUrl: 'https://fake.upstash.io',
    upstashToken: 'fake-token',
  },
} as unknown as BackendConfig;

const productionConfigWithIssuer = {
  ...minimalProductionConfig,
  auth: {
    ...minimalProductionConfig.auth,
    clerkIssuer: 'https://clerk.engvox.com',
  },
} as unknown as BackendConfig;

const developmentConfig = {
  ...minimalProductionConfig,
  environment: 'development',
  auth: {
    ...minimalProductionConfig.auth,
    clerkIssuer: null,
  },
} as unknown as BackendConfig;

describe('CLERK_ISSUER fail-fast', () => {
  it('throws in production when CLERK_ISSUER is not set', () => {
    // Temporarily set NODE_ENV to production to trigger the fail-fast check
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
      assert.throws(
        () => createApp({ config: minimalProductionConfig }),
        (error: Error) => {
          assert.ok(
            error.message.includes('CLERK_ISSUER'),
            `Expected CLERK_ISSUER in error message, got: ${error.message}`
          );
          assert.ok(
            error.message.includes('required in production'),
            `Expected 'required in production' in error message, got: ${error.message}`
          );
          return true;
        }
      );
    } finally {
      process.env.NODE_ENV = originalNodeEnv;
    }
  });

  it('starts normally in production when CLERK_ISSUER is set', () => {
    // Should NOT throw — createApp should succeed
    assert.doesNotThrow(() => {
      const app = createApp({ config: productionConfigWithIssuer });
      assert.ok(app, 'createApp should return an Express app');
    });
  });

  it('starts normally in development when CLERK_ISSUER is not set', () => {
    // Should NOT throw — CLERK_ISSUER is only required in production
    assert.doesNotThrow(() => {
      const app = createApp({ config: developmentConfig });
      assert.ok(app, 'createApp should return an Express app');
    });
  });

  it('error message explains the consequence of missing CLERK_ISSUER', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
      createApp({ config: minimalProductionConfig });
      assert.fail('Expected createApp to throw');
    } catch (error: unknown) {
      const message = (error as Error).message;
      assert.ok(
        message.includes('401'),
        `Error message should mention 401 consequence, got: ${message}`
      );
      assert.ok(
        message.includes('no trailing slash'),
        `Error message should mention trailing slash, got: ${message}`
      );
    } finally {
      process.env.NODE_ENV = originalNodeEnv;
    }
  });
});
