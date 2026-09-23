import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';

import { createApp } from '../src/app.js';
import { createBackendConfig, toPublicHealth } from '../src/config.js';
import { projectRefPin } from '../src/store-health.js';

/**
 * The fault this guard exists for, in the words it was found in: two Supabase projects held
 * the same tables, a migration was applied to the one the dashboard opens by default, and it
 * reported success while the running backend kept failing against the other. Nothing in the
 * service could tell which database it was on, because `supabase.configured` only ever meant
 * "a URL and a key are present".
 *
 * `EXPECTED_SUPABASE_PROJECT_REF` makes the intended project a fact the service checks at
 * boot. The cases below pin the two directions: a mismatch must refuse to start in
 * production, and an absent pin must not — a guard that cannot be left off would just be a
 * second way for a deployment to go down.
 */
const PROD = 'https://engvox.com';

const productionConfig = (options: {
  supabaseUrl: string;
  expectedProjectRef?: string;
  nodeEnv?: string;
}) =>
  createBackendConfig({
    NODE_ENV: options.nodeEnv ?? 'production',
    APP_ORIGIN: PROD,
    APP_VERSION: '4.0.22',
    FIREBASE_PROJECT_ID: 'engvox-59b85',
    SUPABASE_URL: options.supabaseUrl,
    SUPABASE_SERVICE_ROLE_KEY: 'service-role-key',
    METRICS_TOKEN: 'metrics-token',
    ALLOW_MEMORY_BILLING_REPOSITORY: 'true',
    UPSTASH_REDIS_REST_URL: 'https://fake.upstash.io',
    UPSTASH_REDIS_REST_TOKEN: 'fake-token',
    ...(options.expectedProjectRef
      ? { EXPECTED_SUPABASE_PROJECT_REF: options.expectedProjectRef }
      : {}),
  });

afterEach(() => {
  process.env.NODE_ENV = 'test';
});

describe('EXPECTED_SUPABASE_PROJECT_REF boot guard', () => {
  it('refuses to start in production when SUPABASE_URL is a different project', () => {
    // The exact shape of the incident: the env points at project A while the deployment says
    // project B is the one being maintained.
    const config = productionConfig({
      supabaseUrl: 'https://abcdefghijklmnopqrst.supabase.co',
      expectedProjectRef: 'yxwvutsrqponmlkjihg',
    });
    process.env.NODE_ENV = 'production';

    assert.throws(
      () => createApp({ config }),
      (error: Error) => {
        assert.match(error.message, /abcdefghijklmnopqrst/);
        assert.match(error.message, /yxwvutsrqponmlkjihg/);
        assert.match(error.message, /Refusing to start/);
        return true;
      }
    );
  });

  it('starts in production when the resolved project is the pinned one', () => {
    const config = productionConfig({
      supabaseUrl: 'https://abcdefghijklmnopqrst.supabase.co',
      expectedProjectRef: 'abcdefghijklmnopqrst',
    });
    process.env.NODE_ENV = 'production';

    assert.doesNotThrow(() => createApp({ config }));
  });

  it('starts in production when nothing is pinned', () => {
    // The pin is opt-in on purpose: an unconfigured guard must not become an outage.
    const config = productionConfig({
      supabaseUrl: 'https://abcdefghijklmnopqrst.supabase.co',
    });
    process.env.NODE_ENV = 'production';

    assert.doesNotThrow(() => createApp({ config }));
    assert.equal(projectRefPin(config).matches, null);
  });

  it('starts outside production even when the pin does not match, and still reports it', () => {
    const config = productionConfig({
      nodeEnv: 'staging',
      supabaseUrl: 'https://abcdefghijklmnopqrst.supabase.co',
      expectedProjectRef: 'yxwvutsrqponmlkjihg',
    });

    assert.doesNotThrow(() => createApp({ config }));
    const check = toPublicHealth(config).checks.supabase;
    assert.equal(check.projectRef, 'abcdefghijklmnopqrst');
    assert.equal(check.expectedProjectRef, 'yxwvutsrqponmlkjihg');
  });

  it('treats a URL with no project ref as a mismatch when one is pinned', () => {
    const config = productionConfig({
      supabaseUrl: 'https://postgrest.internal.example.com',
      expectedProjectRef: 'abcdefghijklmnopqrst',
    });
    process.env.NODE_ENV = 'production';

    assert.throws(() => createApp({ config }), /no project ref/);
  });

  it('normalizes the pin, so a copied ref is not rejected over its case', () => {
    const config = productionConfig({
      supabaseUrl: 'https://abcdefghijklmnopqrst.supabase.co',
      expectedProjectRef: '  ABCDEFGHIJKLMNOPQRST  ',
    });
    process.env.NODE_ENV = 'production';

    assert.equal(projectRefPin(config).expected, 'abcdefghijklmnopqrst');
    assert.equal(projectRefPin(config).matches, true);
    assert.doesNotThrow(() => createApp({ config }));
  });
});
