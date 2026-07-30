import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type Stripe from 'stripe';

import {
  type BillingServiceConfig,
  createBillingService,
  createStripeClient,
} from '../src/billing-service.js';
import type { BillingRepository } from '../src/billing-webhook-handlers.js';

const makeConfig = () =>
  ({
    stripe: { secretKey: 'sk_test_fake' },
    billing: { repository: 'memory' },
  }) as unknown as BillingServiceConfig;

describe('billing service', () => {
  it('creates billing service', () => {
    const config = makeConfig();
    const stripeClient = createStripeClient(
      config.stripe as unknown as { configured: boolean; secretKey: string | null }
    );
    const service = createBillingService({
      config,
      stripeClient: stripeClient as unknown as Stripe,
      repository: {} as unknown as BillingRepository,
    });
    assert.ok(service);
  });

  it('has createCheckoutSession method', () => {
    const config = makeConfig();
    const stripeClient = createStripeClient(
      config.stripe as unknown as { configured: boolean; secretKey: string | null }
    );
    const service = createBillingService({
      config,
      stripeClient: stripeClient as unknown as Stripe,
      repository: {} as unknown as BillingRepository,
    });
    assert.equal(typeof service.createCheckoutSession, 'function');
  });

  it('has getSubscriptionStatus method', () => {
    const config = makeConfig();
    const stripeClient = createStripeClient(
      config.stripe as unknown as { configured: boolean; secretKey: string | null }
    );
    const service = createBillingService({
      config,
      stripeClient: stripeClient as unknown as Stripe,
      repository: {} as unknown as BillingRepository,
    });
    assert.equal(typeof service.getSubscriptionStatus, 'function');
  });
});
