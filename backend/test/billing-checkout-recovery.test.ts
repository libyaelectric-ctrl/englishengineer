import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import { describe, it } from 'node:test';

import { createApp } from '../src/app.js';
import { getAuditLogStatus } from '../src/audit-log.js';
import { createBackendConfig } from '../src/config.js';

/**
 * The customer-visible half of the audit-log recovery defect.
 *
 * The frontend turns an `audit_log_unavailable` response into "Billing could not
 * be started because the service is temporarily unavailable. Please try again
 * in a few minutes." Before the audit log could recover, that advice could
 * never come true: one transient remote error wedged the state at `failed`, and
 * every later checkout answered the same 503 until the process restarted.
 *
 * This lives in its own file because the recovery attempt is throttled by a
 * module-level cooldown: a fresh module state is what lets the second request
 * below actually observe the recovery path.
 */
describe('billing checkout recovers with the audit store', () => {
  const CHECKOUT_PATH = '/api/v1/billing/create-checkout-session';
  const CHECKOUT_URL = 'https://checkout.dodopayments.com/session/test';

  const json = (body: string, status: number): Response =>
    new Response(body, {
      status,
      headers: { 'content-type': 'application/json', 'content-range': '0-0/0' },
    });

  const createStub = () => {
    const calls: Array<{ method: string; path: string }> = [];
    let auditWrites = 0;
    let auditDown = false;
    let blips = 0;
    const impl = (async (input: string | URL | Request, init?: RequestInit) => {
      const path = new URL(String(input)).pathname;
      const method = (init?.method ?? 'GET').toUpperCase();
      calls.push({ method, path });
      if (path.endsWith('/audit_logs')) {
        // A down store rejects a probe immediately rather than answering 503:
        // supabase-js retries a 503 four times with backoff, which would
        // dominate this suite without testing anything extra.
        if (method !== 'POST') {
          return auditDown ? json('{"message":"invalid api key"}', 401) : json('[]', 200);
        }
        auditWrites += 1;
        // A blip is a scripted number of failed write attempts; an outage lasts
        // until the test says the remote is healthy again.
        if (auditDown) return json('{"message":"connection reset"}', 503);
        if (blips > 0) {
          blips -= 1;
          return json('{"message":"connection reset"}', 503);
        }
        return json('[]', 201);
      }
      if (path.endsWith('/checkouts')) return json(`{"checkout_url":"${CHECKOUT_URL}"}`, 200);
      return json('[]', 200);
    }) as typeof fetch;
    return {
      impl,
      calls,
      auditWrites: () => auditWrites,
      failNextWrites: (count: number) => {
        blips = count;
      },
      setDown: (value: boolean) => {
        auditDown = value;
      },
      dodoCalls: () => calls.filter((call) => call.path.endsWith('/checkouts')).length,
    };
  };

  /** Production, so audit logging is required and only the remote can block a checkout. */
  const createTestConfig = () =>
    createBackendConfig({
      NODE_ENV: 'production',
      FIREBASE_PROJECT_ID: 'test-firebase-project',
      ENGINEEROS_INTERNAL_API_SECRET: 'internal-test-secret',
      ENGINEEROS_INTERNAL_SERVICE_ID: 'service-test-worker',
      ALLOW_MEMORY_BILLING_REPOSITORY: 'true',
      RATE_LIMIT_STORE: 'memory',
      ALLOW_IN_MEMORY_RATE_LIMIT_IN_PRODUCTION: 'true',
      BILLING_PROVIDER: 'dodo',
      DODO_PAYMENTS_API_KEY: 'dodo_test_key',
      DODO_PAYMENTS_WEBHOOK_KEY: 'whsec_test',
      DODO_PRODUCT_JUNIOR_MONTHLY: 'pdt_junior_monthly',
      SUPABASE_URL: 'http://127.0.0.1:9',
      SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
    });

  const waitForAuditStatus = async (status: 'ready' | 'failed'): Promise<void> => {
    for (let attempt = 0; attempt < 200; attempt += 1) {
      if (getAuditLogStatus().status === status) return;
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    assert.fail(`the audit log never became ${status}; it is ${getAuditLogStatus().status}`);
  };

  /** Starts the real app and hands back the checkout request for its port. */
  const startApp = async (stub: ReturnType<typeof createStub>) => {
    // The return-URL policy reads the allowed origins from the process env.
    process.env.CORS_ALLOWED_ORIGINS = 'https://engvox.com';
    const server = createApp({ config: createTestConfig(), fetchImpl: stub.impl }).listen(0);
    await new Promise((resolve) => server.once('listening', resolve));
    const { port } = server.address() as AddressInfo;
    const url = `http://127.0.0.1:${port}${CHECKOUT_PATH}`;
    const sendCheckout = (userId = 'user-upgrade') =>
      fetch(url, {
        method: 'POST',
        headers: {
          Authorization: 'Bearer internal-test-secret',
          'X-Forwarded-Proto': 'https',
          'X-EngineerOS-User-Id': userId,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'customer@example.com',
          successUrl: 'https://engvox.com/billing?status=success',
          cancelUrl: 'https://engvox.com/billing?status=cancelled',
          planId: 'junior',
        }),
      });

    return {
      sendCheckout,
      stop: () => {
        server.close();
        delete process.env.CORS_ALLOWED_ORIGINS;
      },
    };
  };

  it('lets the customer upgrade once the audit store is healthy again', async () => {
    const stub = createStub();
    const { sendCheckout, stop } = await startApp(stub);

    try {
      await waitForAuditStatus('ready');
      const callsBeforeCheckout = stub.calls.length;

      // One transient write failure: the request is retried against the same
      // client, so the customer never sees the error at all.
      stub.failNextWrites(1);
      const blipped = await sendCheckout();
      assert.equal(blipped.status, 200, JSON.stringify({ audit: getAuditLogStatus() }));
      assert.equal(stub.dodoCalls(), 1, 'the payment session was created');
      assert.equal(
        stub.calls.slice(callsBeforeCheckout).filter((call) => call.method === 'GET').length,
        0,
        'the write was retried instead of the client being rebuilt'
      );

      // A real outage: every write fails, so checkout fails closed and no
      // payment session is created.
      stub.setDown(true);
      const failed = await sendCheckout();
      const failedBody = (await failed.json()) as { error?: { code?: string } };
      assert.equal(failed.status, 503);
      assert.equal(failedBody.error?.code, 'audit_log_unavailable');
      assert.equal(stub.dodoCalls(), 1, 'no second payment session was created');

      // The store answers again, so the same request goes through instead of
      // repeating the same 503 forever.
      stub.setDown(false);
      const recovered = await sendCheckout();
      const recoveredBody = (await recovered.json()) as { data?: { url?: string } };
      assert.equal(
        recovered.status,
        200,
        JSON.stringify({ body: recoveredBody, audit: getAuditLogStatus() })
      );
      assert.equal(recoveredBody.data?.url, CHECKOUT_URL);
      assert.equal(stub.dodoCalls(), 2);
      assert.equal(getAuditLogStatus().status, 'ready');
    } finally {
      stop();
    }
  });

  it('lets the customer upgrade as soon as the store answers after a failed start', async () => {
    const stub = createStub();
    // The store is unreachable while the app starts, which is the ordering a
    // backend that comes up before its audit storage runs into.
    stub.setDown(true);
    const { sendCheckout, stop } = await startApp(stub);

    try {
      await waitForAuditStatus('failed');

      // Down: checkout fails closed and no payment session is created.
      const failed = await sendCheckout('user-cold-start');
      const failedBody = (await failed.json()) as { error?: { code?: string } };
      assert.equal(failed.status, 503);
      assert.equal(failedBody.error?.code, 'audit_log_unavailable');
      assert.equal(stub.dodoCalls(), 0, 'no payment session was created');

      // Back: the customer's next attempt goes through instead of being refused
      // for a cooldown window, and its own audit write is what proves the store.
      stub.setDown(false);
      const recovered = await sendCheckout('user-cold-start');
      const recoveredBody = (await recovered.json()) as { data?: { url?: string } };
      assert.equal(
        recovered.status,
        200,
        JSON.stringify({ body: recoveredBody, audit: getAuditLogStatus() })
      );
      assert.equal(recoveredBody.data?.url, CHECKOUT_URL);
      assert.equal(stub.dodoCalls(), 1);
      assert.equal(getAuditLogStatus().status, 'ready');
    } finally {
      stop();
    }
  });
});
