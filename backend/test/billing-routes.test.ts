import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { Express, Request, Response, NextFunction } from 'express';
import { registerBillingRoutes } from '../src/billing-routes.js';
import type { BillingService } from '../src/billing-service.js';

interface RegisteredRoute {
  method: string;
  path: string;
  handlerCount: number;
}

const createMockApp = () => {
  const registered: RegisteredRoute[] = [];
  return {
    post: (path: string, ...handlers: unknown[]) => {
      registered.push({ method: 'POST', path, handlerCount: handlers.length });
    },
    get: (path: string, ...handlers: unknown[]) => {
      registered.push({ method: 'GET', path, handlerCount: handlers.length });
    },
    registered,
  };
};

const noopMiddleware =
  () => async (_req: Request, _res: Response, next: NextFunction) => next();

describe('Billing Routes', () => {
  it('registers checkout, topup, portal, subscription-status, and webhook routes', () => {
    const app = createMockApp();
    const mockBillingService = {
      createCheckoutSession: async () => ({}),
      createTopupCheckoutSession: async () => ({}),
      createPortalSession: async () => ({}),
      getSubscriptionStatus: async () => ({}),
      processWebhook: async () => ({}),
    };

    registerBillingRoutes(
      app as unknown as Express,
      mockBillingService as unknown as BillingService,
      noopMiddleware(),
      noopMiddleware()
    );

    const paths = app.registered.map((r) => `${r.method} ${r.path}`);
    assert.ok(paths.includes('POST /api/billing/create-checkout-session'));
    assert.ok(paths.includes('POST /api/billing/create-topup-session'));
    assert.ok(
      paths.includes('POST /api/billing/create-customer-portal-session')
    );
    assert.ok(paths.includes('GET /api/billing/subscription-status'));
    assert.ok(paths.includes('GET /subscription-status'));
    assert.ok(paths.includes('POST /api/webhooks/stripe'));
  });

  it('checkout route includes auth, rateLimiter, idempotency, validator, and handler', () => {
    const app = createMockApp();
    registerBillingRoutes(
      app as unknown as Express,
      { createCheckoutSession: async () => ({}) } as unknown as BillingService,
      noopMiddleware(),
      noopMiddleware()
    );

    const checkout = app.registered.find(
      (r) =>
        r.method === 'POST' && r.path === '/api/billing/create-checkout-session'
    );
    assert.ok(checkout);
    assert.equal(
      checkout.handlerCount,
      5,
      'checkout should have 5 middlewares/handlers'
    );
  });

  it('portal route includes auth, rateLimiter, validator, and handler', () => {
    const app = createMockApp();
    registerBillingRoutes(
      app as unknown as Express,
      { createPortalSession: async () => ({}) } as unknown as BillingService,
      noopMiddleware(),
      noopMiddleware()
    );

    const portal = app.registered.find(
      (r) =>
        r.method === 'POST' &&
        r.path === '/api/billing/create-customer-portal-session'
    );
    assert.ok(portal);
    assert.equal(
      portal.handlerCount,
      4,
      'portal should have 4 middlewares/handlers'
    );
  });

  it('subscription status is registered on both api and legacy paths', () => {
    const app = createMockApp();
    registerBillingRoutes(
      app as unknown as Express,
      { getSubscriptionStatus: async () => ({}) } as unknown as BillingService,
      noopMiddleware(),
      noopMiddleware()
    );

    const apiPath = app.registered.find(
      (r) => r.method === 'GET' && r.path === '/api/billing/subscription-status'
    );
    const legacyPath = app.registered.find(
      (r) => r.method === 'GET' && r.path === '/subscription-status'
    );
    assert.ok(apiPath, 'API subscription status route should exist');
    assert.ok(legacyPath, 'Legacy subscription status route should exist');
  });

  it('webhook route does not require auth middleware', () => {
    const app = createMockApp();
    registerBillingRoutes(
      app as unknown as Express,
      { processWebhook: async () => ({}) } as unknown as BillingService,
      noopMiddleware(),
      noopMiddleware()
    );

    const webhook = app.registered.find(
      (r) => r.method === 'POST' && r.path === '/api/webhooks/stripe'
    );
    assert.ok(webhook);
    assert.equal(
      webhook.handlerCount,
      1,
      'webhook should only have the handler (no auth)'
    );
  });
});
