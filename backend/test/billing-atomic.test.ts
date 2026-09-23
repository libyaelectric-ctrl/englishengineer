import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { BILLING_PRICE_CATALOG } from '../src/billing-price-catalog.js';
import { formatMinorAmount, processNormalizedWebhookEvent } from '../src/billing-provider.js';
import { createBillingService } from '../src/billing-service.js';
import { createMemorySubscriptionRepository } from '../src/subscription-repository.js';

const topup = (id: string) => ({
  id,
  type: 'checkout.session.completed',
  data: { customer: 'customer_1', metadata: { userId: 'user_1', type: 'topup', credits: '50' } },
});

test('separately deployed frontend and backend price catalogs match exactly', () => {
  const frontend = JSON.parse(
    readFileSync(
      new URL('../../src/shared/data/billing-price-catalog.json', import.meta.url),
      'utf8'
    )
  );
  assert.deepEqual(BILLING_PRICE_CATALOG, frontend);
});

test('concurrent duplicate top-up is credited exactly once and links the first customer', async () => {
  const repository = createMemorySubscriptionRepository();
  const results = await Promise.all(
    Array.from({ length: 4 }, () => processNormalizedWebhookEvent(repository, topup('event_1')))
  );
  assert.equal(results.filter((result) => !result.duplicate).length, 1);
  const subscription = await repository.getSubscriptionStatus('user_1');
  assert.equal(subscription?.topupCredits, 50);
  assert.equal(subscription?.stripeCustomerId, 'customer_1');
  assert.equal(subscription?.planId, 'free');
});

test('concurrent different top-ups preserve all credits', async () => {
  const repository = createMemorySubscriptionRepository();
  await Promise.all(
    Array.from({ length: 4 }, (_, index) =>
      processNormalizedWebhookEvent(repository, topup('event_' + index))
    )
  );
  assert.equal((await repository.getSubscriptionStatus('user_1'))?.topupCredits, 200);
});

test('failed atomic commit does not consume the event and can be retried', async () => {
  const repository = createMemorySubscriptionRepository();
  const commit = repository.commitWebhook!;
  repository.commitWebhook = async () => {
    throw new Error('database unavailable');
  };
  await assert.rejects(processNormalizedWebhookEvent(repository, topup('retry')));
  assert.equal(await repository.hasStripeEventBeenProcessed('retry'), false);
  assert.equal(await repository.getSubscriptionStatus('user_1'), null);
  repository.commitWebhook = commit;
  await processNormalizedWebhookEvent(repository, topup('retry'));
  assert.equal((await repository.getSubscriptionStatus('user_1'))?.topupCredits, 50);
});

test('minor amounts use the currency precision', () => {
  assert.equal(formatMinorAmount(1999, 'USD'), '$19.99');
  assert.match(formatMinorAmount(1000, 'JPY'), /1,000/);
});

test('invoice provider failures are not returned as an empty history', async () => {
  const repository = createMemorySubscriptionRepository();
  await processNormalizedWebhookEvent(repository, topup('invoice'));
  const service = createBillingService({
    config: { configured: true, webhookSecret: null },
    stripeClient: null,
    repository,
    provider: {
      name: 'dodo',
      configured: true,
      webhookRoutes: [],
      createCheckoutSession: async () => ({ url: '' }),
      createTopupCheckoutSession: async () => ({ url: '' }),
      createPortalSession: async () => ({ url: '' }),
      processWebhook: async () => ({ received: true, duplicate: false, eventId: '' }),
      listInvoices: async () => {
        throw new Error('offline');
      },
    },
  });
  await assert.rejects(service.listInvoices('user_1'), { code: 'BILLING_INVOICES_UNAVAILABLE' });
  assert.equal((await service.getSubscriptionStatus('user_1')).topupCredits, 50);
});
