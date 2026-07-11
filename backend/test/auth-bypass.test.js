import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { createApp } from '../src/app.js';
import { createBackendConfig } from '../src/config.js';

const servers = [];

afterEach(() => {
  servers.splice(0).forEach((server) => server.close());
});

const start = async (environment = {}, dependencies = {}) => {
  const config = createBackendConfig({
    NODE_ENV: 'production',
    RATE_LIMIT_STORE: 'memory',
    ALLOW_IN_MEMORY_RATE_LIMIT_IN_PRODUCTION: 'true',
    ALLOW_MEMORY_BILLING_REPOSITORY: 'true',
    ...environment,
  });
  const app = createApp({ config, ...dependencies });
  const server = app.listen(0);
  servers.push(server);
  await new Promise((resolve) => server.once('listening', resolve));
  const address = server.address();
  return `http://127.0.0.1:${address.port}`;
};

test('insecure dev auth is blocked in production by default', async () => {
  const url = await start({
    NODE_ENV: 'production',
    ALLOW_INSECURE_DEV_AUTH: 'false',
  });

  // Try to access an authenticated endpoint (e.g., AI Writing Review) using headers bypass
  const response = await fetch(`${url}/api/ai/writing-review`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-EngineerOS-User-Id': 'demo_user_123',
    },
    body: JSON.stringify({ prompt: 'Test' }),
  });

  assert.equal(response.status, 401);
  const body = await response.json();
  assert.equal(body.error.code, 'authentication_required');
});

test('config warns when allowInsecureDevAuth is true in production', () => {
  const originalWarn = console.warn;
  let warningMessage = '';
  console.warn = (msg) => { warningMessage = msg; };
  try {
    createBackendConfig({
      NODE_ENV: 'production',
      ALLOW_INSECURE_DEV_AUTH: 'true',
      RATE_LIMIT_STORE: 'memory',
      ALLOW_IN_MEMORY_RATE_LIMIT_IN_PRODUCTION: 'true',
    });
    assert.ok(warningMessage.includes('allowInsecureDevAuth cannot be true in production'));
  } finally {
    console.warn = originalWarn;
  }
});

test('demo engineer profiles are blocked from creating checkout sessions in the backend', async () => {
  // Turn on insecure dev auth for this test setup so we can pass the auth guard,
  // but verify the billing service blocks the demo user.
  const url = await start({
    NODE_ENV: 'development',
    ALLOW_INSECURE_DEV_AUTH: 'true',
    STRIPE_SECRET_KEY: 'sk_test_mock',
    STRIPE_PRICE_PRO_MONTHLY: 'price_mock',
  });

  const response = await fetch(`${url}/api/billing/create-checkout-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-EngineerOS-User-Id': 'demo_engineer_abc123',
    },
    body: JSON.stringify({
      email: 'demo@engineer.com',
      successUrl: 'http://localhost:3000/success',
      cancelUrl: 'http://localhost:3000/cancel',
      planId: 'pro',
    }),
  });

  assert.equal(response.status, 403);
  const body = await response.json();
  assert.equal(body.error.code, 'FORBIDDEN_DEMO_ACTION');
});

test('demo engineer profiles are blocked from creating billing portal sessions in the backend', async () => {
  const url = await start({
    NODE_ENV: 'development',
    ALLOW_INSECURE_DEV_AUTH: 'true',
    STRIPE_SECRET_KEY: 'sk_test_mock',
    STRIPE_PRICE_PRO_MONTHLY: 'price_mock',
  });

  const response = await fetch(
    `${url}/api/billing/create-customer-portal-session`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-EngineerOS-User-Id': 'demo_engineer_abc123',
      },
      body: JSON.stringify({
        returnUrl: 'http://localhost:3000/profile',
      }),
    }
  );

  assert.equal(response.status, 403);
  const body = await response.json();
  assert.equal(body.error.code, 'FORBIDDEN_DEMO_ACTION');
});
