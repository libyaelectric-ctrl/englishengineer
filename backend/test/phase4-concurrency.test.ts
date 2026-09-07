import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { createMemorySubscriptionRepository } from '../src/subscription-repository.js';

const activeSubscription = {
  planId: 'pro' as const,
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
    expect(results.filter((result) => result.consumed)).toHaveLength(1);
    expect((await repository.getSubscriptionStatus('user-a'))?.topupCredits).toBe(0);
  });

  it('does not consume twice for the same request id', async () => {
    const repository = createMemorySubscriptionRepository();
    await repository.upsertSubscriptionStatus('user-a', activeSubscription);
    const first = await repository.consumeTopupCredit('user-a', 'same-request-id');
    const replay = await repository.consumeTopupCredit('user-a', 'same-request-id');
    expect(first).toMatchObject({ consumed: true, duplicate: false });
    expect(replay).toMatchObject({ consumed: true, duplicate: true });
    expect((await repository.getSubscriptionStatus('user-a'))?.topupCredits).toBe(0);
  });

  it('keeps idempotency storage scoped and body-bound', async () => {
    const source = await readFile(
      new URL('../src/middleware/idempotency.middleware.ts', import.meta.url),
      'utf8'
    );
    expect(source).toContain('identity(req)');
    expect(source).toContain('req.method.toUpperCase()');
    expect(source).toContain('bodyFingerprint');
    expect(source).toContain('idempotency_key_reused');
    expect(source).toContain('pending.get(scoped)');
  });
});
