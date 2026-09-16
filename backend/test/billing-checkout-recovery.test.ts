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
    const calls: string[] = [];
    let auditWrites = 0;
    const impl = (async (input: string | URL | Request, init?: RequestInit) => {
      const url = String(input);
      const method = (init?.method ?? 'GET').toUpperCase();
      calls.push(`${method} ${url}`);
      if (url.includes('audit_logs')) {
        if (method !== 'POST') return json('[]', 200);
        auditWrites += 1;
        // One transient audit write failure, then the remote is healthy.
        return auditWrites === 1 ? json('{"message":"connection reset"}', 503) : json('[]', 201);
      }
      if (url.includes('/checkouts')) return json(`{"checkout_url":"${CHECKOUT_URL}"}`, 200);
      return json('[]', 200);
    }) as typeof fetch;
    return {
      impl,
      calls,
      auditWrites: () => auditWrites,
      dodoCalls: () => calls.filter((call) => call.includes('/checkouts')).length,
    };
  };

  const waitForReadyAudit = async (): Promise<void> => {
    for (let attempt = 0; attempt < 200; attempt += 1) {
      if (getAuditLogStatus().status === 'ready') return;
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    assert.fail('the audit log never became ready');
  };

  it('lets the customer upgrade once the audit store is healthy again', async () => {
    const stub = createStub();
    // The return-URL policy reads the allowed origins from the process env.
    process.env.CORS_ALLOWED_ORIGINS = 'https://engvox.com';
    // Production: audit logging is required, and the workspace storage is
    // configured, so only the remote's own failure can block a checkout.
    const config = createBackendConfig({
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
    const server = createApp({ config, fetchImpl: stub.impl }).listen(0);

    try {
      await new Promise((resolve) => server.once('listening', resolve));
      const { port } = server.address() as AddressInfo;
      const url = `http://127.0.0.1:${port}${CHECKOUT_PATH}`;
      const sendCheckout = () =>
        fetch(url, {
          method: 'POST',
          headers: {
            Authorization: 'Bearer internal-test-secret',
            'X-Forwarded-Proto': 'https',
            'X-EngineerOS-User-Id': 'user-upgrade',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: 'customer@example.com',
            successUrl: 'https://engvox.com/billing?status=success',
            cancelUrl: 'https://engvox.com/billing?status=cancelled',
            planId: 'junior',
          }),
        });

      await waitForReadyAudit();

      // First attempt: the audit write hits a transient error, so checkout
      // fails closed and no payment session is created.
      const failed = await sendCheckout();
      const failedBody = (await failed.json()) as { error?: { code?: string } };
      assert.equal(failed.status, 503);
      assert.equal(failedBody.error?.code, 'audit_log_unavailable');
      assert.equal(stub.dodoCalls(), 0, 'no payment session was created');

      // Second attempt: the audit store answers again, so the same request goes
      // through instead of repeating the same 503 forever.
      const recovered = await sendCheckout();
      const recoveredBody = (await recovered.json()) as unknown;
      assert.equal(
        recovered.status,
        200,
        JSON.stringify({ body: recoveredBody, audit: getAuditLogStatus() })
      );
      assert.ok(
        JSON.stringify(recoveredBody).includes(CHECKOUT_URL),
        `expected a checkout URL, got ${JSON.stringify(recoveredBody)}`
      );
      assert.equal(stub.dodoCalls(), 1);
      assert.equal(getAuditLogStatus().status, 'ready');
    } finally {
      server.close();
      delete process.env.CORS_ALLOWED_ORIGINS;
    }
  });
});
