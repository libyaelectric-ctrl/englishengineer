import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createBillingService, createStripeClient } from '../src/billing.js';

describe('billing service', () => {
  it('creates billing service', () => {
    const config = {
      stripe: { secretKey: 'sk_test_fake' },
      billing: { repository: 'memory' },
    };
    const stripeClient = createStripeClient(config.stripe);
    const service = createBillingService({
      config,
      stripeClient,
      repository: {},
    });
    assert.ok(service);
  });

  it('has createCheckoutSession method', () => {
    const config = {
      stripe: { secretKey: 'sk_test_fake' },
      billing: { repository: 'memory' },
    };
    const stripeClient = createStripeClient(config.stripe);
    const service = createBillingService({
      config,
      stripeClient,
      repository: {},
    });
    assert.equal(typeof service.createCheckoutSession, 'function');
  });

  it('has getSubscriptionStatus method', () => {
    const config = {
      stripe: { secretKey: 'sk_test_fake' },
      billing: { repository: 'memory' },
    };
    const stripeClient = createStripeClient(config.stripe);
    const service = createBillingService({
      config,
      stripeClient,
      repository: {},
    });
    assert.equal(typeof service.getSubscriptionStatus, 'function');
  });
});
