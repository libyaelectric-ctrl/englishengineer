import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { describe, test } from 'node:test';

import { createApp } from '../src/app.js';
import { createBackendConfig } from '../src/config.js';
import { createDodoBillingProvider } from '../src/dodo-billing-provider.js';
import { ApiError } from '../src/errors.js';
import { createMemorySubscriptionRepository } from '../src/subscription-repository.js';
import type { DodoConfig } from '../types.js';

const TEST_SECRET = 'whsec_dodo_test_secret';

// Standard Webhooks: the HMAC key is the base64-decoded portion after `whsec_`.
const TEST_HMAC_KEY = Buffer.from(TEST_SECRET.slice('whsec_'.length), 'base64');

const makeConfig = (overrides: Partial<DodoConfig> = {}): DodoConfig => ({
  configured: true,
  apiKey: 'dodo_test_api_key',
  webhookSecret: TEST_SECRET,
  baseUrl: 'https://test.dodopayments.com',
  environment: 'test',
  productJuniorMonthly: 'pdt_junior_monthly',
  productJuniorAnnual: 'pdt_junior_annual',
  productSeniorMonthly: 'pdt_senior_monthly',
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

const signWebhook = (
  payload: string,
  id = 'msg_test_123',
  timestamp = '1720000000'
): { id: string; timestamp: string; signature: string } => {
  const signature = createHmac('sha256', TEST_HMAC_KEY)
    .update(`${id}.${timestamp}.${payload}`)
    .digest('base64');
  return { id, timestamp, signature: `v1,${signature}` };
};

describe('dodo billing provider — checkout', () => {
  test('creates a subscription checkout with the monthly product and metadata', async () => {
    const { impl, calls } = makeFetch([
      {
        body: {
          session_id: 'cks_1',
          checkout_url: 'https://test.checkout.dodopayments.com/session/cks_1',
        },
      },
    ]);
    const repository = createMemorySubscriptionRepository();
    const provider = createDodoBillingProvider({
      config: makeConfig(),
      repository,
      fetchImpl: impl,
    });

    const result = await provider.createCheckoutSession('user-1', {
      email: 'user@example.com',
      successUrl: 'https://app.example.com/billing?billing=success',
      cancelUrl: 'https://app.example.com/billing?billing=cancelled',
      planId: 'junior',
      billingInterval: 'month',
    });

    assert.equal(result.url, 'https://test.checkout.dodopayments.com/session/cks_1');
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, 'https://test.dodopayments.com/checkouts');
    const body = JSON.parse(String(calls[0].init.body)) as Record<string, unknown>;
    assert.deepEqual(body.product_cart, [{ product_id: 'pdt_junior_monthly', quantity: 1 }]);
    assert.deepEqual(body.customer, { email: 'user@example.com' });
    assert.equal(body.return_url, 'https://app.example.com/billing?billing=success');
    assert.equal(body.cancel_url, 'https://app.example.com/billing?billing=cancelled');
    assert.deepEqual(body.metadata, { userId: 'user-1', planId: 'junior', type: 'subscription' });
    const auth = (calls[0].init.headers as Record<string, string>).Authorization;
    assert.equal(auth, 'Bearer dodo_test_api_key');
  });

  test('uses the annual product for yearly billing', async () => {
    const { impl, calls } = makeFetch([
      {
        body: {
          session_id: 'cks_2',
          checkout_url: 'https://test.checkout.dodopayments.com/session/cks_2',
        },
      },
    ]);
    const provider = createDodoBillingProvider({
      config: makeConfig(),
      repository: createMemorySubscriptionRepository(),
      fetchImpl: impl,
    });

    await provider.createCheckoutSession('user-1', {
      email: 'user@example.com',
      successUrl: 'https://app.example.com/s',
      cancelUrl: 'https://app.example.com/c',
      planId: 'junior',
      billingInterval: 'year',
    });

    const body = JSON.parse(String(calls[0].init.body)) as Record<string, unknown>;
    assert.deepEqual(body.product_cart, [{ product_id: 'pdt_junior_annual', quantity: 1 }]);
  });

  test('creates a top-up checkout with the topup product and credits metadata', async () => {
    const { impl, calls } = makeFetch([
      {
        body: {
          session_id: 'cks_3',
          checkout_url: 'https://test.checkout.dodopayments.com/session/cks_3',
        },
      },
    ]);
    const provider = createDodoBillingProvider({
      config: makeConfig(),
      repository: createMemorySubscriptionRepository(),
      fetchImpl: impl,
    });

    const result = await provider.createTopupCheckoutSession('user-1', {
      email: 'user@example.com',
      successUrl: 'https://app.example.com/billing?topup=success',
      cancelUrl: 'https://app.example.com/billing?topup=cancelled',
    });

    assert.equal(result.url, 'https://test.checkout.dodopayments.com/session/cks_3');
    const body = JSON.parse(String(calls[0].init.body)) as Record<string, unknown>;
    assert.deepEqual(body.product_cart, [{ product_id: 'pdt_topup_50', quantity: 1 }]);
    assert.deepEqual(body.metadata, { userId: 'user-1', type: 'topup', credits: '50' });
  });

  test('creates a customer portal session and returns the link as url', async () => {
    const { impl, calls } = makeFetch([
      { body: { link: 'https://customer.dodopayments.com/portal/some-token' } },
    ]);
    const provider = createDodoBillingProvider({
      config: makeConfig(),
      repository: createMemorySubscriptionRepository(),
      fetchImpl: impl,
    });

    const result = await provider.createPortalSession('cus_abc', {
      returnUrl: 'https://app.example.com/billing',
    });

    assert.equal(result.url, 'https://customer.dodopayments.com/portal/some-token');
    const parsed = new URL(calls[0].url);
    assert.equal(parsed.pathname, '/customers/cus_abc/customer-portal/session');
    assert.equal(parsed.searchParams.get('return_url'), 'https://app.example.com/billing');
  });

  test('throws when no product is configured for the plan', async () => {
    const { impl } = makeFetch([]);
    const provider = createDodoBillingProvider({
      config: makeConfig({ productSeniorMonthly: null }),
      repository: createMemorySubscriptionRepository(),
      fetchImpl: impl,
    });

    await assert.rejects(
      provider.createCheckoutSession('user-1', {
        email: 'user@example.com',
        successUrl: 'https://app.example.com/s',
        cancelUrl: 'https://app.example.com/c',
        planId: 'senior',
      }),
      (error: unknown) => error instanceof ApiError && error.code === 'dodo_not_configured'
    );
  });
});

describe('dodo billing provider — webhooks', () => {
  const buildProvider = (config: DodoConfig = makeConfig()) => {
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

  test('rejects a signature produced with the literal whsec string (not the decoded key)', async () => {
    // Regression: Standard Webhooks decodes the base64 key material after
    // `whsec_` before HMAC. Signing with the literal string used to pass the
    // old (self-consistent) verifier but never matches real Dodo deliveries.
    const { provider } = buildProvider();
    const payload = JSON.stringify({ type: 'payment.succeeded', data: {} });
    const id = 'msg_literal_key_test';
    const timestamp = '1720000000';
    const literalSignature = createHmac('sha256', TEST_SECRET)
      .update(`${id}.${timestamp}.${payload}`)
      .digest('base64');

    await assert.rejects(
      provider.processWebhook(Buffer.from(payload), {
        'webhook-id': id,
        'webhook-timestamp': timestamp,
        'webhook-signature': `v1,${literalSignature}`,
      }),
      (error: unknown) => error instanceof ApiError && error.code === 'invalid_webhook_signature'
    );
  });

  test('activates a subscription on subscription.updated', async () => {
    const { repository, provider } = buildProvider();
    const payload = JSON.stringify({
      type: 'subscription.updated',
      data: {
        subscription_id: 'sub_123',
        product_id: 'pdt_junior_monthly',
        status: 'active',
        customer: { customer_id: 'cus_abc', email: 'user@example.com' },
        metadata: { userId: 'user-1', planId: 'junior' },
        next_billing_date: '2024-09-01T00:00:00Z',
        cancel_at_next_billing_date: false,
      },
    });
    const { id, timestamp, signature } = signWebhook(payload);

    const result = await provider.processWebhook(Buffer.from(payload), {
      'webhook-id': id,
      'webhook-timestamp': timestamp,
      'webhook-signature': signature,
    });

    assert.equal(result.received, true);
    assert.equal(result.duplicate, false);
    assert.equal(result.eventId, id);

    const status = await repository.getSubscriptionStatus('user-1');
    assert.ok(status);
    assert.equal(status.planId, 'junior');
    assert.equal(status.status, 'active');
    assert.equal(status.stripeCustomerId, 'cus_abc');
    assert.equal(status.stripeSubscriptionId, 'sub_123');
    assert.equal(status.cancelAtPeriodEnd, false);
    assert.equal(status.currentPeriodEnd, '2024-09-01T00:00:00.000Z');
  });

  test('maps subscription.on_hold to past_due', async () => {
    const { repository, provider } = buildProvider();
    const payload = JSON.stringify({
      type: 'subscription.on_hold',
      data: {
        subscription_id: 'sub_123',
        status: 'on_hold',
        customer: { customer_id: 'cus_abc' },
        metadata: { userId: 'user-1' },
      },
    });
    const { id, timestamp, signature } = signWebhook(payload);

    await provider.processWebhook(Buffer.from(payload), {
      'webhook-id': id,
      'webhook-timestamp': timestamp,
      'webhook-signature': signature,
    });

    const status = await repository.getSubscriptionStatus('user-1');
    assert.equal(status?.status, 'past_due');
  });

  test('maps subscription.cancelled to canceled', async () => {
    const { repository, provider } = buildProvider();
    const payload = JSON.stringify({
      type: 'subscription.cancelled',
      data: {
        subscription_id: 'sub_123',
        status: 'cancelled',
        customer: { customer_id: 'cus_abc' },
        metadata: { userId: 'user-1' },
      },
    });
    const { id, timestamp, signature } = signWebhook(payload);

    await provider.processWebhook(Buffer.from(payload), {
      'webhook-id': id,
      'webhook-timestamp': timestamp,
      'webhook-signature': signature,
    });

    const status = await repository.getSubscriptionStatus('user-1');
    assert.equal(status?.status, 'canceled');
  });

  test('resolves planId from the product id when metadata lacks it', async () => {
    const { repository, provider } = buildProvider();
    const payload = JSON.stringify({
      type: 'subscription.plan_changed',
      data: {
        subscription_id: 'sub_123',
        product_id: 'pdt_junior_annual',
        status: 'active',
        customer: { customer_id: 'cus_abc' },
        metadata: { userId: 'user-1' },
      },
    });
    const { id, timestamp, signature } = signWebhook(payload);

    await provider.processWebhook(Buffer.from(payload), {
      'webhook-id': id,
      'webhook-timestamp': timestamp,
      'webhook-signature': signature,
    });

    const status = await repository.getSubscriptionStatus('user-1');
    assert.equal(status?.planId, 'junior');
  });

  test('grants top-up credits on a one-time payment.succeeded', async () => {
    const { repository, provider } = buildProvider();
    const payload = JSON.stringify({
      type: 'payment.succeeded',
      data: {
        payment_id: 'pay_123',
        status: 'succeeded',
        customer: { customer_id: 'cus_abc' },
        metadata: { userId: 'user-1', type: 'topup', credits: '50' },
      },
    });
    const { id, timestamp, signature } = signWebhook(payload);

    await provider.processWebhook(Buffer.from(payload), {
      'webhook-id': id,
      'webhook-timestamp': timestamp,
      'webhook-signature': signature,
    });

    const status = await repository.getSubscriptionStatus('user-1');
    assert.equal(status?.topupCredits, 50);
  });

  test('marks renewal payment failure as past_due, ignores one-time failures', async () => {
    const { repository, provider } = buildProvider();
    const renewal = JSON.stringify({
      type: 'payment.failed',
      data: {
        payment_id: 'pay_456',
        status: 'failed',
        subscription_id: 'sub_123',
        customer: { customer_id: 'cus_abc' },
        metadata: { userId: 'user-1' },
      },
    });
    const renewalSig = signWebhook(renewal, 'msg_renewal');
    await provider.processWebhook(Buffer.from(renewal), {
      'webhook-id': renewalSig.id,
      'webhook-timestamp': renewalSig.timestamp,
      'webhook-signature': renewalSig.signature,
    });
    assert.equal((await repository.getSubscriptionStatus('user-1'))?.status, 'past_due');

    const oneTime = JSON.stringify({
      type: 'payment.failed',
      data: {
        payment_id: 'pay_789',
        status: 'failed',
        customer: { customer_id: 'cus_abc' },
        metadata: { userId: 'user-1' },
      },
    });
    const oneTimeSig = signWebhook(oneTime, 'msg_onetime');
    await provider.processWebhook(Buffer.from(oneTime), {
      'webhook-id': oneTimeSig.id,
      'webhook-timestamp': oneTimeSig.timestamp,
      'webhook-signature': oneTimeSig.signature,
    });
    // One-time failures must not flip the subscription status.
    assert.equal((await repository.getSubscriptionStatus('user-1'))?.status, 'past_due');
  });

  test('rejects webhooks with an invalid signature', async () => {
    const { provider } = buildProvider();
    const payload = JSON.stringify({ type: 'subscription.updated', data: {} });

    await assert.rejects(
      provider.processWebhook(Buffer.from(payload), {
        'webhook-id': 'msg_bad',
        'webhook-timestamp': '1720000000',
        'webhook-signature': 'v1,not-a-real-signature',
      }),
      (error: unknown) => error instanceof ApiError && error.code === 'invalid_webhook_signature'
    );
  });

  test('rejects webhooks missing signature headers', async () => {
    const { provider } = buildProvider();
    await assert.rejects(
      provider.processWebhook(Buffer.from('{}'), {}),
      (error: unknown) => error instanceof ApiError && error.code === 'invalid_webhook_signature'
    );
  });

  test('deduplicates events by webhook id', async () => {
    const { provider } = buildProvider();
    const payload = JSON.stringify({
      type: 'subscription.updated',
      data: {
        subscription_id: 'sub_123',
        status: 'active',
        customer: { customer_id: 'cus_abc' },
        metadata: { userId: 'user-1' },
      },
    });
    const { id, timestamp, signature } = signWebhook(payload);

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
  });
});

describe('dodo billing provider — app wiring', () => {
  test('BILLING_PROVIDER=dodo registers the dodo webhook route end to end', async () => {
    const config = createBackendConfig({
      NODE_ENV: 'test',
      RATE_LIMIT_STORE: 'memory',
      ALLOW_MEMORY_BILLING_REPOSITORY: 'true',
      BILLING_PROVIDER: 'dodo',
      DODO_PAYMENTS_API_KEY: 'dodo_test_api_key',
      DODO_PAYMENTS_WEBHOOK_KEY: TEST_SECRET,
      DODO_PRODUCT_JUNIOR_MONTHLY: 'pdt_junior_monthly',
    });
    const app = createApp({ config });
    const server = app.listen(0);
    try {
      await new Promise((resolve) => server.once('listening', resolve));
      const address = server.address();
      const port = typeof address === 'object' && address ? address.port : 0;
      const url = `http://127.0.0.1:${port}`;

      const payload = JSON.stringify({
        type: 'subscription.updated',
        data: {
          subscription_id: 'sub_123',
          product_id: 'pdt_junior_monthly',
          status: 'active',
          customer: { customer_id: 'cus_abc' },
          metadata: { userId: 'user-1', planId: 'junior' },
        },
      });
      const { id, timestamp, signature } = signWebhook(payload);

      const response = await fetch(`${url}/api/webhooks/dodo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'webhook-id': id,
          'webhook-timestamp': timestamp,
          'webhook-signature': signature,
        },
        body: payload,
      });

      assert.equal(response.status, 200);
      const body = (await response.json()) as { received: boolean; duplicate: boolean };
      assert.equal(body.received, true);
      assert.equal(body.duplicate, false);
    } finally {
      server.close();
    }
  });
});

describe('dodo billing provider — configuration', () => {
  test('reports unconfigured and throws 503 on session methods', async () => {
    const provider = createDodoBillingProvider({
      config: makeConfig({ configured: false, apiKey: null, baseUrl: null }),
      repository: createMemorySubscriptionRepository(),
      fetchImpl: (async () => {
        throw new Error('fetch should not be called');
      }) as typeof fetch,
    });

    assert.equal(provider.configured, false);
    await assert.rejects(
      provider.createCheckoutSession('user-1', {
        email: 'user@example.com',
        successUrl: 'https://app.example.com/s',
        cancelUrl: 'https://app.example.com/c',
        planId: 'junior',
      }),
      (error: unknown) => error instanceof ApiError && error.code === 'STRIPE_NOT_CONFIGURED'
    );
  });
});
