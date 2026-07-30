import assert from 'node:assert/strict';
import test from 'node:test';

import { createBillingService } from '../src/billing-service.js';
import { createMemorySubscriptionRepository } from '../src/subscription-repository.js';

test('getSubscriptionStatus returns a safe free snapshot when Stripe is not configured', async () => {
  const repository = createMemorySubscriptionRepository();
  const service = createBillingService({
    config: { configured: false } as unknown as Parameters<
      typeof createBillingService
    >[0]['config'],
    stripeClient: null,
    repository,
  });

  const status = await service.getSubscriptionStatus('user-1');

  assert.equal(status.planId, 'free');
  assert.equal(status.status, 'none');
  assert.equal(status.source, 'backend');
});
