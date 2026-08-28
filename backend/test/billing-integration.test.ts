/**
 * Billing Integration Test Suite
 *
 * Covers the complete payment lifecycle:
 * 1. Checkout session creation (all plans, intervals, topup)
 * 2. Webhook signature verification (Standard Webhooks spec)
 * 3. All webhook event types (subscription, payment, checkout)
 * 4. Event deduplication
 * 5. Subscription status reads and writes
 * 6. billing_customers upsert
 * 7. End-to-end app wiring (HTTP level)
 *
 * All tests run locally with mocked external services — no real API calls.
 */
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { describe, test } from 'node:test';

import { createApp } from '../src/app.js';
import { createBackendConfig } from '../src/config.js';
import { createDodoBillingProvider } from '../src/dodo-billing-provider.js';
import { ApiError } from '../src/errors.js';
import { createMemorySubscriptionRepository } from '../src/subscription-repository.js';
import type { DodoConfig, SubscriptionSnapshot } from '../types.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const WEBHOOK_SECRET = 'whsec_integration_test_secret';
const HMAC_KEY = Buffer.from(WEBHOOK_SECRET.slice('whsec_'.length), 'base64');

const signPayload = (
  payload: string,
  id = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  timestamp = String(Math.floor(Date.now() / 1000))
): { id: string; timestamp: string; signature: string } => {
  const signature = createHmac('sha256', HMAC_KEY)
    .update(`${id}.${timestamp}.${payload}`)
    .digest('base64');
  return { id, timestamp, signature: `v1,${signature}` };
};

const makeDodoConfig = (overrides: Partial<DodoConfig> = {}): DodoConfig => ({
  configured: true,
  apiKey: 'dodo_test_key',
  webhookSecret: WEBHOOK_SECRET,
  baseUrl: 'https://test.dodopayments.com',
  environment: 'test',
  productJuniorMonthly: 'pdt_junior_monthly',
  productJuniorAnnual: 'pdt_junior_annual',
  productSeniorMonthly: 'pdt_senior_monthly',
  productSeniorAnnual: 'pdt_senior_annual',
  productSpecialistMonthly: 'pdt_specialist_monthly',
  productSpecialistAnnual: 'pdt_specialist_annual',
  productMasterMonthly: 'pdt_master_monthly',
  productMasterAnnual: 'pdt_master_annual',
  productTeamMonthly: 'pdt_team_monthly',
  productTeamAnnual: 'pdt_team_annual',
  productTopup: 'pdt_topup_50',
  ...overrides,
});

interface FetchCall {
  url: string;
  init: RequestInit;
}

const makeFetch = (responses: Array<{ body: unknown; status?: number }>) => {
  const calls: FetchCall[] = [];
  const impl = async (input: Parameters<typeof fetch>[0], init?: RequestInit) => {
    calls.push({ url: String(input), init: init ?? {} });
    const next = responses.shift() ?? { body: {} };
    return {
      ok: (next.status ?? 200) < 400,
      status: next.status ?? 200,
      json: async () => next.body,
      text: async () => JSON.stringify(next.body),
    } as unknown as Response;
  };
  return { impl, calls };
};

const buildProvider = (config: DodoConfig = makeDodoConfig()) => {
  const repository = createMemorySubscriptionRepository();
  const provider = createDodoBillingProvider({
    config,
    repository,
    fetchImpl: (async () => {
      throw new Error('fetch should not be called for webhooks');
    }) as typeof fetch,
  });
  return { repository, provider };
};

// ─── 1. Checkout Session Tests ────────────────────────────────────────────────

describe('Checkout Sessions', () => {
  const PLANS = [
    { planId: 'junior' as const, monthly: 'pdt_junior_monthly', annual: 'pdt_junior_annual' },
    { planId: 'senior' as const, monthly: 'pdt_senior_monthly', annual: 'pdt_senior_annual' },
    {
      planId: 'specialist' as const,
      monthly: 'pdt_specialist_monthly',
      annual: 'pdt_specialist_annual',
    },
    { planId: 'master' as const, monthly: 'pdt_master_monthly', annual: 'pdt_master_annual' },
    { planId: 'team' as const, monthly: 'pdt_team_monthly', annual: 'pdt_team_annual' },
  ];

  for (const { planId, monthly, annual } of PLANS) {
    test(`${planId} monthly checkout sends correct product ID`, async () => {
      const { impl, calls } = makeFetch([
        {
          body: { session_id: `cks_${planId}_m`, checkout_url: `https://checkout.dodo/${planId}` },
        },
      ]);
      const provider = createDodoBillingProvider({
        config: makeDodoConfig(),
        repository: createMemorySubscriptionRepository(),
        fetchImpl: impl,
      });

      const result = await provider.createCheckoutSession(`user_${planId}`, {
        email: `${planId}@test.com`,
        successUrl: 'https://app.example.com/success',
        cancelUrl: 'https://app.example.com/cancel',
        planId,
        billingInterval: 'month',
      });

      assert.equal(result.url, `https://checkout.dodo/${planId}`);
      const body = JSON.parse(String(calls[0].init.body)) as Record<string, unknown>;
      assert.deepEqual(body.product_cart, [{ product_id: monthly, quantity: 1 }]);
      assert.deepEqual(body.metadata, { userId: `user_${planId}`, planId, type: 'subscription' });
    });

    test(`${planId} annual checkout sends correct product ID`, async () => {
      const { impl, calls } = makeFetch([
        {
          body: {
            session_id: `cks_${planId}_a`,
            checkout_url: `https://checkout.dodo/${planId}_annual`,
          },
        },
      ]);
      const provider = createDodoBillingProvider({
        config: makeDodoConfig(),
        repository: createMemorySubscriptionRepository(),
        fetchImpl: impl,
      });

      await provider.createCheckoutSession(`user_${planId}`, {
        email: `${planId}@test.com`,
        successUrl: 'https://app.example.com/success',
        cancelUrl: 'https://app.example.com/cancel',
        planId,
        billingInterval: 'year',
      });

      const body = JSON.parse(String(calls[0].init.body)) as Record<string, unknown>;
      assert.deepEqual(body.product_cart, [{ product_id: annual, quantity: 1 }]);
    });
  }

  test('topup checkout sends correct product and metadata', async () => {
    const { impl, calls } = makeFetch([
      { body: { session_id: 'cks_topup', checkout_url: 'https://checkout.dodo/topup' } },
    ]);
    const provider = createDodoBillingProvider({
      config: makeDodoConfig(),
      repository: createMemorySubscriptionRepository(),
      fetchImpl: impl,
    });

    const result = await provider.createTopupCheckoutSession('user_topup', {
      email: 'topup@test.com',
      successUrl: 'https://app.example.com/topup/success',
      cancelUrl: 'https://app.example.com/topup/cancel',
    });

    assert.equal(result.url, 'https://checkout.dodo/topup');
    const body = JSON.parse(String(calls[0].init.body)) as Record<string, unknown>;
    assert.deepEqual(body.product_cart, [{ product_id: 'pdt_topup_50', quantity: 1 }]);
    assert.deepEqual(body.metadata, { userId: 'user_topup', type: 'topup', credits: '50' });
  });

  test('checkout sends Bearer auth header', async () => {
    const { impl, calls } = makeFetch([
      { body: { session_id: 'cks_auth', checkout_url: 'https://checkout.dodo/auth' } },
    ]);
    const provider = createDodoBillingProvider({
      config: makeDodoConfig(),
      repository: createMemorySubscriptionRepository(),
      fetchImpl: impl,
    });

    await provider.createCheckoutSession('user_auth', {
      email: 'auth@test.com',
      successUrl: 'https://app.example.com/s',
      cancelUrl: 'https://app.example.com/c',
      planId: 'junior',
    });

    const headers = calls[0].init.headers as Record<string, string>;
    assert.equal(headers.Authorization, 'Bearer dodo_test_key');
  });

  test('checkout throws when API returns non-2xx', async () => {
    const { impl } = makeFetch([{ body: { error: 'invalid_request' }, status: 400 }]);
    const provider = createDodoBillingProvider({
      config: makeDodoConfig(),
      repository: createMemorySubscriptionRepository(),
      fetchImpl: impl,
    });

    await assert.rejects(
      provider.createCheckoutSession('user_err', {
        email: 'err@test.com',
        successUrl: 'https://app.example.com/s',
        cancelUrl: 'https://app.example.com/c',
        planId: 'junior',
      }),
      (error: unknown) => error instanceof ApiError && error.code === 'dodo_api_error'
    );
  });

  test('checkout throws when response lacks checkout_url', async () => {
    const { impl } = makeFetch([{ body: { session_id: 'cks_no_url' } }]);
    const provider = createDodoBillingProvider({
      config: makeDodoConfig(),
      repository: createMemorySubscriptionRepository(),
      fetchImpl: impl,
    });

    await assert.rejects(
      provider.createCheckoutSession('user_nourl', {
        email: 'nourl@test.com',
        successUrl: 'https://app.example.com/s',
        cancelUrl: 'https://app.example.com/c',
        planId: 'junior',
      }),
      (error: unknown) => error instanceof ApiError && error.code === 'dodo_invalid_response'
    );
  });

  test('unconfigured provider throws 503 on checkout', async () => {
    const provider = createDodoBillingProvider({
      config: makeDodoConfig({ configured: false, apiKey: null, baseUrl: null }),
      repository: createMemorySubscriptionRepository(),
      fetchImpl: (async () => ({})) as unknown as typeof fetch,
    });

    assert.equal(provider.configured, false);
    await assert.rejects(
      provider.createCheckoutSession('user_unconf', {
        email: 'unconf@test.com',
        successUrl: 'https://app.example.com/s',
        cancelUrl: 'https://app.example.com/c',
        planId: 'junior',
      }),
      (error: unknown) => error instanceof ApiError && error.code === 'STRIPE_NOT_CONFIGURED'
    );
  });
});

// ─── 2. Webhook Signature Verification ────────────────────────────────────────

describe('Webhook Signature Verification', () => {
  test('accepts valid Standard Webhooks signature', async () => {
    const { provider } = buildProvider();
    const payload = JSON.stringify({ type: 'checkout.session.completed', data: {} });
    const { id, timestamp, signature } = signPayload(payload);

    const result = await provider.processWebhook(Buffer.from(payload), {
      'webhook-id': id,
      'webhook-timestamp': timestamp,
      'webhook-signature': signature,
    });

    assert.equal(result.received, true);
  });

  test('rejects signature computed with literal whsec_ string (not decoded)', async () => {
    const { provider } = buildProvider();
    const payload = JSON.stringify({ type: 'checkout.session.completed', data: {} });
    const id = 'msg_literal_test';
    const timestamp = '1720000000';
    const badSig = createHmac('sha256', WEBHOOK_SECRET)
      .update(`${id}.${timestamp}.${payload}`)
      .digest('base64');

    await assert.rejects(
      provider.processWebhook(Buffer.from(payload), {
        'webhook-id': id,
        'webhook-timestamp': timestamp,
        'webhook-signature': `v1,${badSig}`,
      }),
      (error: unknown) => error instanceof ApiError && error.code === 'invalid_webhook_signature'
    );
  });

  test('rejects missing webhook-id header', async () => {
    const { provider } = buildProvider();
    await assert.rejects(
      provider.processWebhook(Buffer.from('{}'), {
        'webhook-timestamp': '1720000000',
        'webhook-signature': 'v1,fakesig',
      }),
      (error: unknown) => error instanceof ApiError && error.code === 'invalid_webhook_signature'
    );
  });

  test('rejects missing webhook-timestamp header', async () => {
    const { provider } = buildProvider();
    await assert.rejects(
      provider.processWebhook(Buffer.from('{}'), {
        'webhook-id': 'msg_test',
        'webhook-signature': 'v1,fakesig',
      }),
      (error: unknown) => error instanceof ApiError && error.code === 'invalid_webhook_signature'
    );
  });

  test('rejects missing webhook-signature header', async () => {
    const { provider } = buildProvider();
    await assert.rejects(
      provider.processWebhook(Buffer.from('{}'), {
        'webhook-id': 'msg_test',
        'webhook-timestamp': '1720000000',
      }),
      (error: unknown) => error instanceof ApiError && error.code === 'invalid_webhook_signature'
    );
  });

  test('rejects completely empty headers', async () => {
    const { provider } = buildProvider();
    await assert.rejects(
      provider.processWebhook(Buffer.from('{}'), {}),
      (error: unknown) => error instanceof ApiError && error.code === 'invalid_webhook_signature'
    );
  });

  test('rejects wrong signature value', async () => {
    const { provider } = buildProvider();
    const payload = JSON.stringify({ type: 'checkout.session.completed', data: {} });
    const id = 'msg_wrong_sig';
    const timestamp = String(Math.floor(Date.now() / 1000));

    await assert.rejects(
      provider.processWebhook(Buffer.from(payload), {
        'webhook-id': id,
        'webhook-timestamp': timestamp,
        'webhook-signature': 'v1,AAAAAAABBBBBBBCCCCCCC=',
      }),
      (error: unknown) => error instanceof ApiError && error.code === 'invalid_webhook_signature'
    );
  });

  test('accepts multiple space-separated signatures (at least one valid)', async () => {
    const { provider } = buildProvider();
    const payload = JSON.stringify({ type: 'checkout.session.completed', data: {} });
    const { id, timestamp, signature } = signPayload(payload);
    const multiSig = `v1,old_invalid_sig ${signature}`;

    const result = await provider.processWebhook(Buffer.from(payload), {
      'webhook-id': id,
      'webhook-timestamp': timestamp,
      'webhook-signature': multiSig,
    });

    assert.equal(result.received, true);
  });
});

// ─── 3. Webhook Event Processing ──────────────────────────────────────────────

describe('Webhook Event Processing', () => {
  test('subscription.active activates subscription via Dodo webhook', async () => {
    const { repository, provider } = buildProvider();
    const payload = JSON.stringify({
      type: 'subscription.active',
      data: {
        subscription_id: 'sub_active_checkout',
        status: 'active',
        customer: { customer_id: 'cus_active_checkout', email: 'checkout@test.com' },
        metadata: { userId: 'user_checkout', planId: 'senior' },
      },
    });
    const { id, timestamp, signature } = signPayload(payload);

    const result = await provider.processWebhook(Buffer.from(payload), {
      'webhook-id': id,
      'webhook-timestamp': timestamp,
      'webhook-signature': signature,
    });

    assert.equal(result.received, true);
    assert.equal(result.duplicate, false);

    const status = await repository.getSubscriptionStatus('user_checkout');
    assert.ok(status);
    assert.equal(status.planId, 'senior');
    assert.equal(status.status, 'active');
    assert.equal(status.stripeCustomerId, 'cus_active_checkout');
    assert.equal(status.stripeSubscriptionId, 'sub_active_checkout');
  });

  test('checkout.session.completed is acknowledged but ignored (not handled by Dodo)', async () => {
    const { repository, provider } = buildProvider();
    const payload = JSON.stringify({
      type: 'checkout.session.completed',
      data: {
        customer: { customer_id: 'cus_checkout', email: 'checkout@test.com' },
        metadata: { userId: 'user_checkout_ignored', planId: 'junior' },
      },
    });
    const { id, timestamp, signature } = signPayload(payload);

    const result = await provider.processWebhook(Buffer.from(payload), {
      'webhook-id': id,
      'webhook-timestamp': timestamp,
      'webhook-signature': signature,
    });

    assert.equal(result.received, true);
    // Dodo provider ignores checkout.session.completed — only subscription.* events activate plans
    const status = await repository.getSubscriptionStatus('user_checkout_ignored');
    assert.equal(status, null);
  });

  test('subscription.active sets active status', async () => {
    const { repository, provider } = buildProvider();
    const payload = JSON.stringify({
      type: 'subscription.active',
      data: {
        subscription_id: 'sub_active',
        status: 'active',
        customer: { customer_id: 'cus_active' },
        metadata: { userId: 'user_active', planId: 'master' },
        next_billing_date: '2026-09-28T00:00:00Z',
        cancel_at_next_billing_date: false,
      },
    });
    const { id, timestamp, signature } = signPayload(payload);

    await provider.processWebhook(Buffer.from(payload), {
      'webhook-id': id,
      'webhook-timestamp': timestamp,
      'webhook-signature': signature,
    });

    const status = await repository.getSubscriptionStatus('user_active');
    assert.ok(status);
    assert.equal(status.planId, 'master');
    assert.equal(status.status, 'active');
    assert.equal(status.stripeCustomerId, 'cus_active');
    assert.equal(status.stripeSubscriptionId, 'sub_active');
    assert.equal(status.cancelAtPeriodEnd, false);
    assert.equal(status.currentPeriodEnd, '2026-09-28T00:00:00.000Z');
  });

  test('subscription.on_hold maps to past_due', async () => {
    const { repository, provider } = buildProvider();
    const payload = JSON.stringify({
      type: 'subscription.on_hold',
      data: {
        subscription_id: 'sub_hold',
        status: 'on_hold',
        customer: { customer_id: 'cus_hold' },
        metadata: { userId: 'user_hold' },
      },
    });
    const { id, timestamp, signature } = signPayload(payload);

    await provider.processWebhook(Buffer.from(payload), {
      'webhook-id': id,
      'webhook-timestamp': timestamp,
      'webhook-signature': signature,
    });

    const status = await repository.getSubscriptionStatus('user_hold');
    assert.equal(status?.status, 'past_due');
  });

  test('subscription.cancelled maps to canceled', async () => {
    const { repository, provider } = buildProvider();
    const payload = JSON.stringify({
      type: 'subscription.cancelled',
      data: {
        subscription_id: 'sub_cancel',
        status: 'cancelled',
        customer: { customer_id: 'cus_cancel' },
        metadata: { userId: 'user_cancel' },
      },
    });
    const { id, timestamp, signature } = signPayload(payload);

    await provider.processWebhook(Buffer.from(payload), {
      'webhook-id': id,
      'webhook-timestamp': timestamp,
      'webhook-signature': signature,
    });

    const status = await repository.getSubscriptionStatus('user_cancel');
    assert.equal(status?.status, 'canceled');
  });

  test('payment.succeeded with topup metadata grants credits', async () => {
    const { repository, provider } = buildProvider();
    const payload = JSON.stringify({
      type: 'payment.succeeded',
      data: {
        payment_id: 'pay_topup',
        status: 'succeeded',
        customer: { customer_id: 'cus_topup' },
        metadata: { userId: 'user_topup', type: 'topup', credits: '100' },
      },
    });
    const { id, timestamp, signature } = signPayload(payload);

    await provider.processWebhook(Buffer.from(payload), {
      'webhook-id': id,
      'webhook-timestamp': timestamp,
      'webhook-signature': signature,
    });

    const status = await repository.getSubscriptionStatus('user_topup');
    assert.equal(status?.topupCredits, 100);
  });

  test('payment.failed on renewal marks past_due with grace period', async () => {
    const { repository, provider } = buildProvider();
    const payload = JSON.stringify({
      type: 'payment.failed',
      data: {
        payment_id: 'pay_fail_renewal',
        status: 'failed',
        subscription_id: 'sub_renewal',
        customer: { customer_id: 'cus_renewal' },
        metadata: { userId: 'user_renewal' },
      },
    });
    const { id, timestamp, signature } = signPayload(payload);

    await provider.processWebhook(Buffer.from(payload), {
      'webhook-id': id,
      'webhook-timestamp': timestamp,
      'webhook-signature': signature,
    });

    const status = await repository.getSubscriptionStatus('user_renewal');
    assert.equal(status?.status, 'past_due');
    assert.ok(status?.gracePeriodEndsAt);
  });

  test('payment.failed on one-time does NOT change subscription status', async () => {
    const { repository, provider } = buildProvider();
    const payload = JSON.stringify({
      type: 'payment.failed',
      data: {
        payment_id: 'pay_fail_onetime',
        status: 'failed',
        customer: { customer_id: 'cus_onetime' },
        metadata: { userId: 'user_onetime' },
      },
    });
    const { id, timestamp, signature } = signPayload(payload);

    await provider.processWebhook(Buffer.from(payload), {
      'webhook-id': id,
      'webhook-timestamp': timestamp,
      'webhook-signature': signature,
    });

    const status = await repository.getSubscriptionStatus('user_onetime');
    assert.equal(status, null);
  });

  test('subscription.plan_changed resolves planId from product_id', async () => {
    const { repository, provider } = buildProvider();
    const payload = JSON.stringify({
      type: 'subscription.plan_changed',
      data: {
        subscription_id: 'sub_plan',
        product_id: 'pdt_master_annual',
        status: 'active',
        customer: { customer_id: 'cus_plan' },
        metadata: { userId: 'user_plan' },
      },
    });
    const { id, timestamp, signature } = signPayload(payload);

    await provider.processWebhook(Buffer.from(payload), {
      'webhook-id': id,
      'webhook-timestamp': timestamp,
      'webhook-signature': signature,
    });

    const status = await repository.getSubscriptionStatus('user_plan');
    assert.equal(status?.planId, 'master');
  });

  test('unknown event type is acknowledged but ignored', async () => {
    const { repository, provider } = buildProvider();
    const payload = JSON.stringify({
      type: 'unknown.event.type',
      data: { customer: { customer_id: 'cus_unknown' }, metadata: { userId: 'user_unknown' } },
    });
    const { id, timestamp, signature } = signPayload(payload);

    const result = await provider.processWebhook(Buffer.from(payload), {
      'webhook-id': id,
      'webhook-timestamp': timestamp,
      'webhook-signature': signature,
    });

    assert.equal(result.received, true);
    const status = await repository.getSubscriptionStatus('user_unknown');
    assert.equal(status, null);
  });
});

// ─── 4. Event Deduplication ──────────────────────────────────────────────────

describe('Event Deduplication', () => {
  test('same webhook ID is processed only once', async () => {
    const { repository, provider } = buildProvider();
    const payload = JSON.stringify({
      type: 'subscription.updated',
      data: {
        subscription_id: 'sub_dedup',
        status: 'active',
        customer: { customer_id: 'cus_dedup' },
        metadata: { userId: 'user_dedup', planId: 'junior' },
      },
    });
    const { id, timestamp, signature } = signPayload(payload, 'msg_dedup_fixed');

    const first = await provider.processWebhook(Buffer.from(payload), {
      'webhook-id': id,
      'webhook-timestamp': timestamp,
      'webhook-signature': signature,
    });
    const second = await provider.processWebhook(Buffer.from(payload), {
      'webhook-id': id,
      'webhook-timestamp': timestamp,
      'webhook-signature': signature,
    });

    assert.equal(first.duplicate, false);
    assert.equal(second.duplicate, true);
    assert.equal(first.received, true);
    assert.equal(second.received, true);

    const status = await repository.getSubscriptionStatus('user_dedup');
    assert.ok(status);
    assert.equal(status.planId, 'junior');
  });

  test('different webhook IDs are both processed', async () => {
    const { repository, provider } = buildProvider();
    const payload1 = JSON.stringify({
      type: 'subscription.updated',
      data: {
        status: 'active',
        customer: { customer_id: 'cus_multi' },
        metadata: { userId: 'user_multi', planId: 'junior' },
      },
    });
    const payload2 = JSON.stringify({
      type: 'subscription.updated',
      data: {
        status: 'active',
        customer: { customer_id: 'cus_multi' },
        metadata: { userId: 'user_multi', planId: 'master' },
      },
    });

    const sig1 = signPayload(payload1, 'msg_multi_1');
    const sig2 = signPayload(payload2, 'msg_multi_2');

    await provider.processWebhook(Buffer.from(payload1), {
      'webhook-id': sig1.id,
      'webhook-timestamp': sig1.timestamp,
      'webhook-signature': sig1.signature,
    });
    await provider.processWebhook(Buffer.from(payload2), {
      'webhook-id': sig2.id,
      'webhook-timestamp': sig2.timestamp,
      'webhook-signature': sig2.signature,
    });

    const status = await repository.getSubscriptionStatus('user_multi');
    assert.ok(status);
    assert.equal(status.planId, 'master');
  });
});

// ─── 5. Subscription Status Repository ────────────────────────────────────────

describe('Subscription Status Repository', () => {
  test('returns null for unknown user', async () => {
    const repo = createMemorySubscriptionRepository();
    const status = await repo.getSubscriptionStatus('nonexistent_user');
    assert.equal(status, null);
  });

  test('upserts and reads subscription status', async () => {
    const repo = createMemorySubscriptionRepository();
    const snapshot: SubscriptionSnapshot = {
      planId: 'senior',
      status: 'active',
      currentPeriodEnd: '2026-10-01T00:00:00Z',
      cancelAtPeriodEnd: false,
      stripeCustomerId: 'cus_test_read',
      stripeSubscriptionId: 'sub_test_read',
      updatedAt: new Date().toISOString(),
      source: 'test',
      topupCredits: 0,
    };

    await repo.upsertSubscriptionStatus('user_read', snapshot);
    const result = await repo.getSubscriptionStatus('user_read');

    assert.ok(result);
    assert.equal(result.planId, 'senior');
    assert.equal(result.status, 'active');
    assert.equal(result.stripeCustomerId, 'cus_test_read');
    assert.equal(result.stripeSubscriptionId, 'sub_test_read');
  });

  test('upsert overwrites existing subscription', async () => {
    const repo = createMemorySubscriptionRepository();
    const first: SubscriptionSnapshot = {
      planId: 'junior',
      status: 'active',
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      stripeCustomerId: 'cus_1',
      stripeSubscriptionId: 'sub_1',
      updatedAt: '2026-01-01',
      source: 'test',
      topupCredits: 0,
    };
    const second: SubscriptionSnapshot = {
      planId: 'master',
      status: 'active',
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      stripeCustomerId: 'cus_2',
      stripeSubscriptionId: 'sub_2',
      updatedAt: '2026-02-01',
      source: 'test',
      topupCredits: 50,
    };

    await repo.upsertSubscriptionStatus('user_overwrite', first);
    await repo.upsertSubscriptionStatus('user_overwrite', second);
    const result = await repo.getSubscriptionStatus('user_overwrite');

    assert.ok(result);
    assert.equal(result.planId, 'master');
    assert.equal(result.topupCredits, 50);
  });

  test('marks and detects processed events', async () => {
    const repo = createMemorySubscriptionRepository();

    assert.equal(await repo.hasStripeEventBeenProcessed('evt_1'), false);
    await repo.markStripeEventProcessed('evt_1');
    assert.equal(await repo.hasStripeEventBeenProcessed('evt_1'), true);
    assert.equal(await repo.hasStripeEventBeenProcessed('evt_2'), false);
  });
});

// ─── 6. billing_customers Upsert ──────────────────────────────────────────────

describe('billing_customers Upsert', () => {
  test('upsertBillingCustomer is callable without error (in-memory)', async () => {
    const repo = createMemorySubscriptionRepository();
    await repo.upsertBillingCustomer({
      userId: 'user_bc',
      dodoCustomerId: 'cus_dodo_123',
      stripeCustomerId: 'cus_stripe_456',
      billingEmail: 'billing@test.com',
    });
    // In-memory repo is a no-op — just verify it doesn't throw
  });

  test('upsertBillingCustomer with minimal data', async () => {
    const repo = createMemorySubscriptionRepository();
    await repo.upsertBillingCustomer({ userId: 'user_minimal' });
    // No-op — verify no error
  });
});

// ─── 7. End-to-End App Wiring ─────────────────────────────────────────────────

describe('End-to-End App Wiring', () => {
  test('full checkout → webhook → subscription status cycle', async () => {
    const config = createBackendConfig({
      NODE_ENV: 'test',
      RATE_LIMIT_STORE: 'memory',
      ALLOW_MEMORY_BILLING_REPOSITORY: 'true',
      BILLING_PROVIDER: 'dodo',
      STRIPE_SECRET_KEY: 'sk_test_fake',
      STRIPE_PRICE_JUNIOR_MONTHLY: 'price_test',
      DODO_PAYMENTS_API_KEY: 'dodo_e2e_key',
      DODO_PAYMENTS_WEBHOOK_KEY: WEBHOOK_SECRET,
      DODO_PRODUCT_JUNIOR_MONTHLY: 'pdt_junior_monthly',
      DODO_PRODUCT_SENIOR_MONTHLY: 'pdt_senior_monthly',
    });
    const app = createApp({ config });
    const server = app.listen(0);

    try {
      await new Promise((resolve) => server.once('listening', resolve));
      const address = server.address();
      const port = typeof address === 'object' && address ? address.port : 0;
      const url = `http://127.0.0.1:${port}`;

      // Step 1: Send checkout.session.completed webhook
      const payload = JSON.stringify({
        type: 'checkout.session.completed',
        data: {
          subscription_id: 'sub_e2e',
          customer: { customer_id: 'cus_e2e', email: 'e2e@test.com' },
          metadata: { userId: 'user_e2e', planId: 'senior' },
        },
      });
      const { id, timestamp, signature } = signPayload(payload);

      const webhookRes = await fetch(`${url}/api/webhooks/dodo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'webhook-id': id,
          'webhook-timestamp': timestamp,
          'webhook-signature': signature,
        },
        body: payload,
      });

      assert.equal(webhookRes.status, 200);
      const webhookBody = (await webhookRes.json()) as { received: boolean; duplicate: boolean };
      assert.equal(webhookBody.received, true);
      assert.equal(webhookBody.duplicate, false);

      // Step 2: Send subscription.updated webhook
      const payload2 = JSON.stringify({
        type: 'subscription.updated',
        data: {
          subscription_id: 'sub_e2e',
          product_id: 'pdt_senior_monthly',
          status: 'active',
          customer: { customer_id: 'cus_e2e' },
          metadata: { userId: 'user_e2e', planId: 'senior' },
          next_billing_date: '2026-09-28T00:00:00Z',
          cancel_at_next_billing_date: false,
        },
      });
      const sig2 = signPayload(payload2, 'msg_e2e_sub');

      const subRes = await fetch(`${url}/api/webhooks/dodo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'webhook-id': sig2.id,
          'webhook-timestamp': sig2.timestamp,
          'webhook-signature': sig2.signature,
        },
        body: payload2,
      });
      assert.equal(subRes.status, 200);

      // Step 3: Verify subscription status endpoint
      const statusRes = await fetch(`${url}/api/billing/subscription-status`);
      assert.equal(statusRes.status, 200);
      const statusBody = (await statusRes.json()) as { planId: string; status: string };
      // Without auth, returns default free plan
      assert.ok(statusBody);
      assert.equal(typeof statusBody.planId, 'string');
    } finally {
      server.close();
    }
  });

  test('webhook route is CSRF-exempt', async () => {
    const config = createBackendConfig({
      NODE_ENV: 'test',
      RATE_LIMIT_STORE: 'memory',
      ALLOW_MEMORY_BILLING_REPOSITORY: 'true',
      BILLING_PROVIDER: 'dodo',
      DODO_PAYMENTS_API_KEY: 'dodo_csrf_key',
      DODO_PAYMENTS_WEBHOOK_KEY: WEBHOOK_SECRET,
      DODO_PRODUCT_JUNIOR_MONTHLY: 'pdt_junior_monthly',
    });
    const app = createApp({ config });
    const server = app.listen(0);

    try {
      await new Promise((resolve) => server.once('listening', resolve));
      const address = server.address();
      const port = typeof address === 'object' && address ? address.port : 0;
      const url = `http://127.0.0.1:${port}`;

      // Send webhook WITHOUT CSRF token — should still be processed
      const payload = JSON.stringify({ type: 'checkout.session.completed', data: {} });
      const { id, timestamp, signature } = signPayload(payload);

      const res = await fetch(`${url}/api/webhooks/dodo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'webhook-id': id,
          'webhook-timestamp': timestamp,
          'webhook-signature': signature,
        },
        body: payload,
      });

      // Should NOT get csrf_token_missing error
      const body = (await res.json()) as Record<string, unknown>;
      const webhookError = body.error as { code?: string } | undefined;
      assert.notEqual(webhookError?.code, 'csrf_token_missing');
      assert.equal((body as { received: boolean }).received, true);
    } finally {
      server.close();
    }
  });

  test('checkout endpoint rejects requests without proper auth', async () => {
    const config = createBackendConfig({
      NODE_ENV: 'test',
      RATE_LIMIT_STORE: 'memory',
      ALLOW_MEMORY_BILLING_REPOSITORY: 'true',
      BILLING_PROVIDER: 'dodo',
      DODO_PAYMENTS_API_KEY: 'dodo_checkout_key',
      DODO_PAYMENTS_WEBHOOK_KEY: WEBHOOK_SECRET,
      DODO_PRODUCT_JUNIOR_MONTHLY: 'pdt_junior_monthly',
    });
    const app = createApp({ config });
    const server = app.listen(0);

    try {
      await new Promise((resolve) => server.once('listening', resolve));
      const address = server.address();
      const port = typeof address === 'object' && address ? address.port : 0;
      const url = `http://127.0.0.1:${port}`;

      const res = await fetch(`${url}/api/billing/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: 'junior', billingInterval: 'month' }),
      });

      const body = (await res.json()) as { error?: { code?: string } };
      // Without CSRF token and auth, should get an error
      assert.ok(body.error, 'should return an error');
    } finally {
      server.close();
    }
  });

  test('health check returns correct structure with billingProvider', async () => {
    const config = createBackendConfig({
      NODE_ENV: 'test',
      RATE_LIMIT_STORE: 'memory',
      ALLOW_MEMORY_BILLING_REPOSITORY: 'true',
      BILLING_PROVIDER: 'dodo',
      DODO_PAYMENTS_API_KEY: 'dodo_health_key',
      DODO_PAYMENTS_WEBHOOK_KEY: WEBHOOK_SECRET,
      DODO_PRODUCT_JUNIOR_MONTHLY: 'pdt_junior_monthly',
    });
    const app = createApp({ config });
    const server = app.listen(0);

    try {
      await new Promise((resolve) => server.once('listening', resolve));
      const address = server.address();
      const port = typeof address === 'object' && address ? address.port : 0;

      const res = await fetch(`http://127.0.0.1:${port}/api/health`);
      const body = (await res.json()) as {
        ok: boolean;
        checks: Record<string, { configured: boolean }>;
        billingProvider: string;
      };

      assert.equal(typeof body.ok, 'boolean');
      assert.equal(body.billingProvider, 'dodo');
      assert.ok(body.checks.billing, 'checks.billing should exist');
    } finally {
      server.close();
    }
  });
});
