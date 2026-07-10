import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { createApp } from '../src/app.js';
import { createBackendConfig } from '../src/config.js';

const servers = [];

afterEach(() => {
  servers.splice(0).forEach((server) => server.close());
});

const STRIPE_ENV = {
  STRIPE_SECRET_KEY: 'sk_test_value',
  STRIPE_PRICE_PRO_MONTHLY: 'price_test',
  STRIPE_WEBHOOK_SECRET: 'whsec_test_secret',
};

const start = async (environment = {}, dependencies = {}) => {
  const config = createBackendConfig({
    NODE_ENV: 'test',
    RATE_LIMIT_STORE: 'memory',
    ALLOW_IN_MEMORY_RATE_LIMIT_IN_PRODUCTION: 'true',
    ...STRIPE_ENV,
    ...environment,
  });
  const app = createApp({ config, ...dependencies });
  const server = app.listen(0);
  servers.push(server);
  await new Promise((resolve) => server.once('listening', resolve));
  const address = server.address();
  return `http://127.0.0.1:${address.port}`;
};

test('webhook rejects request missing Stripe-Signature header', async () => {
  const stripeClient = {
    webhooks: {
      constructEvent: () => {
        throw new Error('No signature');
      },
    },
  };

  const url = await start({}, { stripeClient });

  const response = await fetch(`${url}/api/webhooks/stripe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'checkout.session.completed' }),
  });

  assert.equal(response.status, 400);
  const body = await response.json();
  assert.equal(body.error.code, 'invalid_webhook_signature');
});

test('webhook rejects when STRIPE_WEBHOOK_SECRET is not configured', async () => {
  const url = await start({ STRIPE_WEBHOOK_SECRET: '' });

  const response = await fetch(`${url}/api/webhooks/stripe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'stripe-signature': 'sig_test_fake',
    },
    body: JSON.stringify({ type: 'checkout.session.completed' }),
  });

  assert.equal(response.status, 503);
  const body = await response.json();
  assert.equal(body.error.code, 'stripe_webhook_not_configured');
});

test('webhook rejects invalid signature even with correct event payload', async () => {
  const stripeClient = {
    webhooks: {
      constructEvent: () => {
        throw new Error('Signature verification failed');
      },
    },
  };

  const url = await start({}, { stripeClient });

  const response = await fetch(`${url}/api/webhooks/stripe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'stripe-signature': 'sig_invalid_signature_value',
    },
    body: JSON.stringify({
      id: 'evt_test_123',
      type: 'checkout.session.completed',
      data: { object: {} },
    }),
  });

  assert.equal(response.status, 400);
  const body = await response.json();
  assert.equal(body.error.code, 'invalid_webhook_signature');
});

test('same webhook event idempotent - duplicate delivery returns duplicate=true', async () => {
  const event = {
    id: 'evt_duplicate_test_001',
    type: 'checkout.session.completed',
    data: {
      object: {
        id: 'cs_test_001',
        customer: 'cus_test_001',
        subscription: 'sub_test_001',
        metadata: { userId: 'user_test_001' },
      },
    },
  };
  const stripeClient = { webhooks: { constructEvent: () => event } };
  const url = await start({}, { stripeClient });

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'stripe-signature': 'sig_test_valid',
    },
    body: JSON.stringify(event),
  };

  // First delivery
  const response1 = await fetch(`${url}/api/webhooks/stripe`, options);
  const body1 = await response1.json();
  assert.equal(body1.duplicate, false, 'First delivery should not be duplicate');

  // Second delivery (replay)
  const response2 = await fetch(`${url}/api/webhooks/stripe`, options);
  const body2 = await response2.json();
  assert.equal(body2.duplicate, true, 'Second delivery should be duplicate');
});

test('webhook accepts valid signature and processes checkout event', async () => {
  const event = {
    id: 'evt_valid_test_001',
    type: 'checkout.session.completed',
    data: {
      object: {
        id: 'cs_test_valid',
        customer: 'cus_test_valid',
        subscription: 'sub_test_valid',
        metadata: { userId: 'user_test_valid' },
      },
    },
  };
  const stripeClient = { webhooks: { constructEvent: () => event } };
  const url = await start({}, { stripeClient });

  const response = await fetch(`${url}/api/webhooks/stripe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'stripe-signature': 'sig_test_valid',
    },
    body: JSON.stringify(event),
  });

  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.received, true);
  assert.equal(body.duplicate, false);
});
