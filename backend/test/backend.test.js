import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { createApp } from '../src/app.js';
import { createBackendConfig, toPublicHealth } from '../src/config.js';
import {
  createMemorySubscriptionRepository,
  createSubscriptionRepository,
} from '../src/subscription-repository.js';

const servers = [];

afterEach(() => {
  servers.splice(0).forEach((server) => server.close());
});

const start = async (environment = {}, dependencies = {}) => {
  const config = createBackendConfig({ NODE_ENV: 'test', ...environment });
  const app = createApp({ config, ...dependencies });
  const server = app.listen(0);
  servers.push(server);
  await new Promise((resolve) => server.once('listening', resolve));
  const address = server.address();
  return `http://127.0.0.1:${address.port}`;
};

test('health returns public configuration status', async () => {
  const url = await start({
    APP_VERSION: '4.0.1',
    NODE_ENV: 'staging',
    ALLOW_MEMORY_BILLING_REPOSITORY: 'true',
  });
  const response = await fetch(`${url}/api/health`);
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.deepEqual(body, {
    ok: true,
    version: '4.0.1',
    environment: 'staging',
    aiConfigured: false,
    stripeConfigured: false,
    supabaseConfigured: false,
    mockMode: true,
  });
});

test('health never exposes secret values', async () => {
  const url = await start({
    AI_PROVIDER: 'openai',
    OPENAI_API_KEY: 'secret-ai-value',
    STRIPE_SECRET_KEY: 'secret-stripe-value',
    STRIPE_PRICE_PRO_MONTHLY: 'price_test',
    SUPABASE_URL: 'https://example.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: 'secret-service-role',
  });
  const text = await (await fetch(`${url}/api/health`)).text();
  assert.doesNotMatch(
    text,
    /secret-ai-value|secret-stripe-value|secret-service-role/
  );
  const body = JSON.parse(text);
  assert.equal(body.aiConfigured, true);
  assert.equal(body.stripeConfigured, true);
  assert.equal(body.supabaseConfigured, true);
});

test('AI route rejects an empty prompt', async () => {
  const url = await start();
  const response = await fetch(`${url}/api/ai/coach`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: '   ' }),
  });
  const body = await response.json();
  assert.equal(response.status, 400);
  assert.equal(body.error.code, 'invalid_prompt');
});

test('AI route explicitly labels safe mock mode', async () => {
  const url = await start({ AI_PROVIDER: 'mock' });
  const response = await fetch(`${url}/api/ai/writing-review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: 'Review this commissioning update.' }),
  });
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.mode, 'mock');
  assert.equal(body.mockMode, true);
  assert.match(body.text, /^\[Mock AI\]/);
});

test('configured AI provider returns a real-mode contract', async () => {
  let providerUrl = null;
  let providerRequest = null;
  const fetchImpl = async (url, init) => {
    providerUrl = url;
    providerRequest = JSON.parse(init.body);
    return new Response(
      JSON.stringify({
        choices: [{ message: { content: 'Provider response' } }],
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  };
  const url = await start(
    { AI_PROVIDER: 'openai', OPENAI_API_KEY: 'test-key' },
    { fetchImpl }
  );
  const response = await fetch(`${url}/api/ai/coach`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: 'Prepare a site coordination response.' }),
  });
  const body = await response.json();
  assert.equal(body.mode, 'real');
  assert.equal(body.mockMode, false);
  assert.equal(body.text, 'Provider response');
  assert.equal(providerUrl, 'https://api.openai.com/v1/chat/completions');
  assert.deepEqual(providerRequest, {
    model: 'gpt-4.1-mini',
    messages: [
      { role: 'user', content: 'Prepare a site coordination response.' },
    ],
  });
});

test('configured provider failure returns a safe unavailable error', async () => {
  const fetchImpl = async () =>
    new Response('provider secret detail', { status: 500 });
  const url = await start(
    { AI_PROVIDER: 'openai', OPENAI_API_KEY: 'test-key' },
    { fetchImpl }
  );
  const response = await fetch(`${url}/api/ai/coach`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: 'Test provider failure.' }),
  });
  const text = await response.text();
  assert.equal(response.status, 502);
  assert.doesNotMatch(text, /provider secret detail|test-key/);
  assert.equal(JSON.parse(text).error.code, 'ai_provider_error');
});

test('billing routes return a free fallback when Stripe is not configured', async () => {
  const url = await start();
  const response = await fetch(
    `${url}/api/billing/subscription-status?userId=user-1`
  );
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.planId, 'free');
  assert.equal(body.status, 'none');
  assert.equal(body.source, 'backend');
});

test('legacy subscription status route returns a free fallback when Stripe is not configured', async () => {
  const url = await start();
  const response = await fetch(`${url}/subscription-status?userId=user-1`);
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.planId, 'free');
  assert.equal(body.status, 'none');
  assert.equal(body.source, 'backend');
});

test('webhook rejects an invalid Stripe signature', async () => {
  const stripeClient = {
    webhooks: {
      constructEvent: () => {
        throw new Error('invalid');
      },
    },
  };
  const url = await start(
    {
      STRIPE_SECRET_KEY: 'sk_test_value',
      STRIPE_PRICE_PRO_MONTHLY: 'price_test',
      STRIPE_WEBHOOK_SECRET: 'whsec_test',
    },
    { stripeClient }
  );
  const response = await fetch(`${url}/api/webhooks/stripe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Stripe-Signature': 'invalid',
    },
    body: JSON.stringify({ id: 'evt_1' }),
  });
  assert.equal(response.status, 400);
  assert.equal((await response.json()).error.code, 'invalid_webhook_signature');
});

test('webhook idempotency marks duplicate events', async () => {
  const event = {
    id: 'evt_duplicate',
    type: 'unhandled',
    data: { object: {} },
  };
  const stripeClient = { webhooks: { constructEvent: () => event } };
  const url = await start(
    {
      STRIPE_SECRET_KEY: 'sk_test_value',
      STRIPE_PRICE_PRO_MONTHLY: 'price_test',
      STRIPE_WEBHOOK_SECRET: 'whsec_test',
    },
    { stripeClient }
  );
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Stripe-Signature': 'valid',
    },
    body: '{}',
  };
  const first = await (
    await fetch(`${url}/api/webhooks/stripe`, options)
  ).json();
  const second = await (
    await fetch(`${url}/api/webhooks/stripe`, options)
  ).json();
  assert.equal(first.duplicate, false);
  assert.equal(second.duplicate, true);
});

test('subscription status can report active and payment-failed backend states', async () => {
  let snapshot = {
    planId: 'pro',
    status: 'active',
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
    stripeCustomerId: 'cus_test',
    stripeSubscriptionId: 'sub_test',
    updatedAt: new Date().toISOString(),
  };
  const repository = {
    getSubscriptionStatus: () => snapshot,
    upsertSubscriptionStatus: (_userId, next) => {
      snapshot = next;
    },
    hasStripeEventBeenProcessed: () => false,
    markStripeEventProcessed: () => undefined,
  };
  const stripeClient = { webhooks: { constructEvent: () => ({}) } };
  const url = await start(
    {
      STRIPE_SECRET_KEY: 'sk_test_value',
      STRIPE_PRICE_PRO_MONTHLY: 'price_test',
    },
    { stripeClient, billingRepository: repository }
  );
  const active = await (
    await fetch(`${url}/api/billing/subscription-status?userId=user-1`)
  ).json();
  assert.equal(active.status, 'active');
  snapshot = { ...snapshot, status: 'past_due' };
  const failed = await (
    await fetch(`${url}/api/billing/subscription-status?userId=user-1`)
  ).json();
  assert.equal(failed.status, 'past_due');
});

test('vocabulary lookup rejects a missing word', async () => {
  const url = await start();
  const response = await fetch(`${url}/api/vocabulary/lookup?targetLang=tr`);
  const body = await response.json();
  assert.equal(response.status, 400);
  assert.equal(body.error.code, 'missing_word');
});

test('vocabulary lookup handles provider failure safely', async () => {
  const fetchImpl = async () => ({ ok: false, status: 503 });
  const url = await start({}, { fetchImpl });
  const response = await fetch(
    `${url}/api/vocabulary/lookup?word=panel&targetLang=tr`
  );
  const body = await response.json();
  assert.equal(response.status, 502);
  assert.equal(body.error.code, 'vocabulary_provider_unavailable');
});

test('vocabulary lookup reuses a successful cached result', async () => {
  let providerCalls = 0;
  const fetchImpl = async () => {
    providerCalls += 1;
    return {
      ok: true,
      status: 200,
      json: async () => [
        {
          word: 'panel',
          phonetic: '/ˈpæn.əl/',
          meanings: [
            {
              definitions: [
                { definition: 'A board that contains electrical controls.' },
              ],
            },
          ],
        },
      ],
    };
  };
  const url = await start({}, { fetchImpl });
  const endpoint = `${url}/api/vocabulary/lookup?word=panel&targetLang=tr`;
  const first = await (await fetch(endpoint)).json();
  const second = await (await fetch(endpoint)).json();
  assert.equal(first.cached, false);
  assert.equal(second.cached, true);
  assert.equal(second.source, 'Free Dictionary API');
  assert.equal(providerCalls, 1);
});

const productionAuthEnvironment = {
  NODE_ENV: 'production',
  ENGINEEROS_INTERNAL_API_SECRET: 'internal-test-secret',
  ALLOW_MEMORY_BILLING_REPOSITORY: 'true',
  RATE_LIMIT_STORE: 'memory',
  ALLOW_IN_MEMORY_RATE_LIMIT_IN_PRODUCTION: 'true',
};

const internalHeaders = (userId = 'user-authenticated') => ({
  Authorization: 'Bearer internal-test-secret',
  'X-EngineerOS-User-Id': userId,
  'Content-Type': 'application/json',
});

test('production AI and billing routes reject missing authentication', async () => {
  const url = await start(productionAuthEnvironment);
  const aiResponse = await fetch(`${url}/api/ai/coach`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: 'Prepare an update.' }),
  });
  const billingResponse = await fetch(`${url}/api/billing/subscription-status`);
  assert.equal(aiResponse.status, 401);
  assert.equal(billingResponse.status, 401);
});

test('valid internal authentication protects identity and leaves health public', async () => {
  const url = await start(productionAuthEnvironment);
  const response = await fetch(`${url}/api/ai/coach`, {
    method: 'POST',
    headers: internalHeaders(),
    body: JSON.stringify({ prompt: 'Prepare an update.' }),
  });
  assert.equal(response.status, 200);
  assert.equal((await response.json()).mode, 'mock');
  assert.equal((await fetch(`${url}/api/health`)).status, 200);
});

test('AI operation is controlled by the route', async () => {
  const url = await start();
  const response = await fetch(`${url}/api/ai/coach`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: 'Prepare an update.',
      operation: 'unknown',
    }),
  });
  assert.equal(response.status, 400);
  assert.equal((await response.json()).error.code, 'invalid_operation');
});

test('AI prompt size and rate limit are enforced', async () => {
  const url = await start({ AI_RATE_LIMIT_MAX: '1' });
  const oversized = await fetch(`${url}/api/ai/coach`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: 'x'.repeat(20_001) }),
  });
  assert.equal(oversized.status, 413);

  const limitedUrl = await start({ AI_RATE_LIMIT_MAX: '1' });
  const request = () =>
    fetch(`${limitedUrl}/api/ai/coach`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'Valid prompt.' }),
    });
  assert.equal((await request()).status, 200);
  assert.equal((await request()).status, 429);
});

test('billing derives ownership from authenticated identity', async () => {
  let requestedUserId = null;
  const repository = {
    async getSubscriptionStatus(userId) {
      requestedUserId = userId;
      return null;
    },
    async upsertSubscriptionStatus() {},
    async hasStripeEventBeenProcessed() {
      return false;
    },
    async markStripeEventProcessed() {},
  };
  const url = await start(
    {
      ...productionAuthEnvironment,
      STRIPE_SECRET_KEY: 'sk_test_value',
      STRIPE_PRICE_PRO_MONTHLY: 'price_test',
    },
    { stripeClient: {}, billingRepository: repository }
  );
  const response = await fetch(
    `${url}/api/billing/subscription-status?userId=another-user`,
    { headers: internalHeaders('owner-user') }
  );
  assert.equal(response.status, 403);
  assert.equal(requestedUserId, null);

  const owned = await fetch(`${url}/api/billing/subscription-status`, {
    headers: internalHeaders('owner-user'),
  });
  assert.equal(owned.status, 200);
  assert.equal(requestedUserId, 'owner-user');
});

test('checkout rejects a mismatched body user and accepts the authenticated user', async () => {
  let checkoutUserId = null;
  const stripeClient = {
    checkout: {
      sessions: {
        create: async (payload) => {
          checkoutUserId = payload.client_reference_id;
          return { url: 'https://checkout.example/session' };
        },
      },
    },
  };
  const url = await start(
    {
      ...productionAuthEnvironment,
      STRIPE_SECRET_KEY: 'sk_test_value',
      STRIPE_PRICE_PRO_MONTHLY: 'price_test',
    },
    { stripeClient }
  );
  const payload = {
    userId: 'other-user',
    email: 'engineer@example.com',
    successUrl: 'https://app.example/success',
    cancelUrl: 'https://app.example/cancel',
    planId: 'pro',
  };
  const rejected = await fetch(`${url}/api/billing/create-checkout-session`, {
    method: 'POST',
    headers: internalHeaders('owner-user'),
    body: JSON.stringify(payload),
  });
  assert.equal(rejected.status, 403);

  const accepted = await fetch(`${url}/api/billing/create-checkout-session`, {
    method: 'POST',
    headers: internalHeaders('owner-user'),
    body: JSON.stringify({ ...payload, userId: 'owner-user' }),
  });
  assert.equal(accepted.status, 200);
  assert.equal(checkoutUserId, 'owner-user');
});

test('memory billing repository is bounded and production-guarded', async () => {
  assert.throws(
    () =>
      createSubscriptionRepository({
        environment: 'production',
        allowMemoryRepository: false,
      }),
    /Persistent billing repository is required/
  );

  let time = 1_000;
  const repository = createMemorySubscriptionRepository({
    eventTtlMs: 100,
    eventCacheMax: 2,
    now: () => time,
  });
  await repository.markStripeEventProcessed('evt_1');
  await repository.markStripeEventProcessed('evt_2');
  await repository.markStripeEventProcessed('evt_3');
  assert.equal(repository.getProcessedEventCount(), 2);
  assert.equal(await repository.hasStripeEventBeenProcessed('evt_1'), false);
  time += 101;
  assert.equal(await repository.hasStripeEventBeenProcessed('evt_3'), false);
});

test('Stripe signature verification receives a raw Buffer', async () => {
  let receivedRawBuffer = false;
  const stripeClient = {
    webhooks: {
      constructEvent: (rawBody) => {
        receivedRawBuffer = Buffer.isBuffer(rawBody);
        return { id: 'evt_raw', type: 'unhandled', data: { object: {} } };
      },
    },
  };
  const url = await start(
    {
      STRIPE_SECRET_KEY: 'sk_test_value',
      STRIPE_PRICE_PRO_MONTHLY: 'price_test',
      STRIPE_WEBHOOK_SECRET: 'whsec_test',
    },
    { stripeClient }
  );
  const response = await fetch(`${url}/api/webhooks/stripe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Stripe-Signature': 'valid',
    },
    body: '{}',
  });
  assert.equal(response.status, 200);
  assert.equal(receivedRawBuffer, true);
});

test('security headers are present without restricting health', async () => {
  const url = await start();
  const response = await fetch(`${url}/api/health`);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(response.headers.get('x-frame-options'), 'SAMEORIGIN');
  assert.equal(response.headers.get('x-powered-by'), null);
});

test('Anthropic request and response contracts are parsed consistently', async () => {
  let requestBody = null;
  const fetchImpl = async (_url, init) => {
    requestBody = JSON.parse(init.body);
    return new Response(
      JSON.stringify({
        content: [{ type: 'text', text: 'Anthropic response' }],
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  };
  const url = await start(
    {
      AI_PROVIDER: 'anthropic',
      AI_MODEL: 'claude-test-model',
      ANTHROPIC_API_KEY: 'test-key',
    },
    { fetchImpl }
  );
  const response = await fetch(`${url}/api/ai/coach`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: 'Prepare a commissioning update.' }),
  });
  assert.equal(response.status, 200);
  assert.equal((await response.json()).text, 'Anthropic response');
  assert.equal(requestBody.model, 'claude-test-model');
  assert.equal(
    requestBody.messages[0].content,
    'Prepare a commissioning update.'
  );
});

test('real AI provider rejects an explicitly empty model', () => {
  assert.throws(
    () =>
      createBackendConfig({
        NODE_ENV: 'test',
        AI_PROVIDER: 'openai',
        AI_MODEL: '',
        OPENAI_API_KEY: 'test-key',
      }),
    /AI_MODEL must not be empty/
  );
});

test('Anthropic requires an explicit model while OpenAI keeps its stable default', () => {
  assert.throws(
    () =>
      createBackendConfig({
        NODE_ENV: 'test',
        AI_PROVIDER: 'anthropic',
        ANTHROPIC_API_KEY: 'test-key',
      }),
    /AI_MODEL must not be empty/
  );
  const openAI = createBackendConfig({
    NODE_ENV: 'test',
    AI_PROVIDER: 'openai',
    OPENAI_API_KEY: 'test-key',
  });
  assert.equal(openAI.ai.model, 'gpt-4.1-mini');
});

test('production selects Supabase billing persistence when configured', () => {
  const config = createBackendConfig({
    NODE_ENV: 'production',
    SUPABASE_URL: 'https://project.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: 'service-role-test-key',
    RATE_LIMIT_STORE: 'memory',
    ALLOW_IN_MEMORY_RATE_LIMIT_IN_PRODUCTION: 'true',
  });
  assert.equal(config.stripe.repositoryMode, 'supabase');
  assert.equal(config.stripe.allowMemoryRepository, false);
});

test('production requires an explicitly configured external rate-limit store', () => {
  assert.throws(
    () => createBackendConfig({ NODE_ENV: 'production' }),
    /UPSTASH_REDIS_REST_URL/
  );
  assert.throws(
    () =>
      createBackendConfig({
        NODE_ENV: 'production',
        RATE_LIMIT_STORE: 'memory',
      }),
    /ALLOW_IN_MEMORY_RATE_LIMIT_IN_PRODUCTION/
  );
});

test('production accepts Upstash rate limiting without exposing its token', () => {
  const config = createBackendConfig({
    NODE_ENV: 'production',
    RATE_LIMIT_STORE: 'upstash',
    UPSTASH_REDIS_REST_URL: 'https://rate-limit.example.test/',
    UPSTASH_REDIS_REST_TOKEN: 'server-only-token',
  });

  assert.equal(config.rateLimit.storeMode, 'upstash');
  assert.equal(config.rateLimit.upstashUrl, 'https://rate-limit.example.test');
  assert.equal(toPublicHealth(config).upstashToken, undefined);
});
