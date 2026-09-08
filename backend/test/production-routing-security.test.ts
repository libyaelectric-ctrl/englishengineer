import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import request from 'supertest';

import { createApp } from '../src/app.js';
import { createBackendConfig } from '../src/config.js';
import { createMemorySubscriptionRepository } from '../src/subscription-repository.js';

const productionConfig = () =>
  createBackendConfig({
    NODE_ENV: 'production',
    APP_ORIGIN: 'https://engvox.com',
    FIREBASE_PROJECT_ID: 'test-firebase-project',
    RATE_LIMIT_STORE: 'memory',
    ALLOW_IN_MEMORY_RATE_LIMIT_IN_PRODUCTION: 'true',
    ALLOW_MEMORY_BILLING_REPOSITORY: 'true',
    STRIPE_SECRET_KEY: 'sk_test_value',
    STRIPE_WEBHOOK_SECRET: 'whsec_test_value',
  });

describe('production routing security', () => {
  it('keeps private diagnostics fields out of public liveness', async () => {
    const app = createApp({
      config: productionConfig(),
      billingRepository: createMemorySubscriptionRepository(),
      rateLimitStore: null,
      stripeClient: { webhooks: { constructEvent: () => ({}) } } as never,
    });

    const response = await request(app).get('/api/health');
    assert.equal(response.status, 200);
    for (const privateField of ['memory', 'pool', 'nodeVersion', 'responseTimeMs', 'uptime']) {
      assert.equal(response.body[privateField], undefined);
    }
  });

  it('does not redirect the canonical Stripe webhook in production', async () => {
    const app = createApp({
      config: productionConfig(),
      billingRepository: createMemorySubscriptionRepository(),
      rateLimitStore: null,
      stripeClient: {
        webhooks: {
          constructEvent() {
            throw new Error('invalid signature');
          },
        },
      } as never,
    });

    const response = await request(app)
      .post('/api/webhooks/stripe')
      .set('x-forwarded-proto', 'https')
      .set('stripe-signature', 'invalid')
      .set('content-type', 'application/json')
      .send('{}')
      .redirects(0);

    assert.ok(![301, 302, 307, 308].includes(response.status));
    // Production without remote audit storage fail-closes on the required
    // WEBHOOK_RECEIVED audit write BEFORE signature validation (Phase 5
    // policy: audit_log_unavailable 503). The invalid-signature 400 path is
    // covered in stripe-webhook-security.test.ts where audit is disabled.
    // This assertion keeps the routing contract: the canonical webhook path
    // is served in place (no legacy /v1 redirect) and never silently succeeds.
    assert.equal(response.status, 503);
    assert.equal(response.body.error.code, 'audit_log_unavailable');
  });
});
