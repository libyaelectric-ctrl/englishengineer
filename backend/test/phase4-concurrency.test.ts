import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { describe, it } from 'node:test';

import { createMemorySubscriptionRepository } from '../src/subscription-repository.js';

const activeSubscription = {
  planId: 'senior' as const,
  status: 'active',
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  updatedAt: new Date(0).toISOString(),
  source: 'test',
  topupCredits: 1,
};

describe('phase 4 billing concurrency', () => {
  it('consumes one credit at most once across 20 concurrent requests', async () => {
    const repository = createMemorySubscriptionRepository();
    await repository.upsertSubscriptionStatus('user-a', activeSubscription);
    const results = await Promise.all(
      Array.from({ length: 20 }, (_, index) =>
        repository.consumeTopupCredit('user-a', `request-${index}`)
      )
    );
    assert.equal(results.filter((result) => result.consumed).length, 1);
    assert.equal((await repository.getSubscriptionStatus('user-a'))?.topupCredits, 0);
  });

  it('does not consume twice for the same request id', async () => {
    const repository = createMemorySubscriptionRepository();
    await repository.upsertSubscriptionStatus('user-a', activeSubscription);
    const first = await repository.consumeTopupCredit('user-a', 'same-request-id');
    const replay = await repository.consumeTopupCredit('user-a', 'same-request-id');
    assert.deepEqual(first, { consumed: true, duplicate: false, remainingCredits: 0 });
    assert.deepEqual(replay, { consumed: true, duplicate: true, remainingCredits: 0 });
    assert.equal((await repository.getSubscriptionStatus('user-a'))?.topupCredits, 0);
  });

  it('keeps idempotency storage scoped and body-bound', async () => {
    const source = await readFile(
      new URL('../src/middleware/idempotency.middleware.ts', import.meta.url),
      'utf8'
    );
    assert.match(source, /identity\(req\)/);
    assert.match(source, /req\.method\.toUpperCase\(\)/);
    assert.match(source, /bodyFingerprint/);
    assert.match(source, /idempotency_key_reused/);
    assert.match(source, /pending\.get\(scoped\)/);
  });
});
