import assert from 'node:assert/strict';
import { test } from 'node:test';
import type Stripe from 'stripe';
import request from 'supertest';

import { createApp } from '../src/app.js';
import { createBackendConfig } from '../src/config.js';
import { createMemorySubscriptionRepository } from '../src/subscription-repository.js';

test('checkout accepts the configured app and www alias but rejects foreign return origins', async () => {
  const config = createBackendConfig({
    NODE_ENV: 'staging',
    APP_ORIGIN: 'https://engvox.com',
    ENGINEEROS_INTERNAL_API_SECRET: 'origin-test-secret',
    ENGINEEROS_INTERNAL_SERVICE_ID: 'origin-test-user',
    STRIPE_SECRET_KEY: 'sk_test_origin',
    STRIPE_PRICE_JUNIOR_MONTHLY: 'price_origin',
    RATE_LIMIT_STORE: 'memory',
  });
  let calls = 0;
  const stripeClient = {
    checkout: {
      sessions: {
        create: async () => {
          calls += 1;
          return { url: 'https://checkout.stripe.com/test' };
        },
      },
    },
  };
  const app = createApp({
    config,
    stripeClient: stripeClient as unknown as Stripe,
    billingRepository: createMemorySubscriptionRepository(),
  });
  for (const origin of [
    'https://engvox.com',
    'https://www.engvox.com',
    'https://engvox.com.attacker.example',
  ]) {
    const response = await request(app)
      .post('/api/v1/billing/create-checkout-session')
      .set('Authorization', 'Bearer origin-test-secret')
      .send({
        email: 'engineer@example.com',
        planId: 'junior',
        successUrl: `${origin}/billing?billing=success`,
        cancelUrl: `${origin}/billing?billing=cancelled`,
      });
    assert.equal(
      response.status,
      origin.endsWith('.example') ? 400 : 200,
      JSON.stringify(response.body)
    );
    if (response.status === 400) assert.equal(response.body.error.code, 'invalid_return_url');
  }
  assert.equal(calls, 2);
});
