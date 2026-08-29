import type { Express, NextFunction, Request, Response } from 'express';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

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
    // Mimics the real v1RouterAdapter mapping: /api/x -> /api/v1/x, while
    // webhooks stay at /api/webhooks.
    post: (path: string, ...handlers: unknown[]) => {
      const finalPath = path.startsWith('/api/webhooks/')
        ? path
        : `/api/v1${path.startsWith('/api/') ? path.slice(4) : path}`;
      registered.push({ method: 'POST', path: finalPath, handlerCount: handlers.length });
    },
    get: (path: string, ...handlers: unknown[]) => {
      const finalPath = `/api/v1${path.startsWith('/api/') ? path.slice(4) : path}`;
      registered.push({ method: 'GET', path: finalPath, handlerCount: handlers.length });
    },
    registered,
  };
};

const noopMiddleware = () => async (_req: Request, _res: Response, next: NextFunction) => next();

const mockProvider = {
  name: 'stripe',
  configured: true,
  webhookRoutes: [{ path: '/api/webhooks/stripe', signatureHeaders: ['stripe-signature'] }],
};

describe('Billing Routes', () => {
  it('registers checkout, topup, portal, subscription-status, and webhook routes', () => {
    const app = createMockApp();
    const mockBillingService = {
      provider: mockProvider,
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
    assert.ok(paths.includes('POST /api/v1/billing/create-checkout-session'));
    assert.ok(paths.includes('POST /api/v1/billing/create-topup-session'));
    assert.ok(paths.includes('POST /api/v1/billing/create-customer-portal-session'));
    assert.ok(paths.includes('GET /api/v1/billing/subscription-status'));
    assert.ok(paths.includes('GET /api/v1/subscription-status'));
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
      (r) => r.method === 'POST' && r.path === '/api/v1/billing/create-checkout-session'
    );
    assert.ok(checkout);
    assert.equal(checkout.handlerCount, 5, 'checkout should have 5 middlewares/handlers');
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
      (r) => r.method === 'POST' && r.path === '/api/v1/billing/create-customer-portal-session'
    );
    assert.ok(portal);
    assert.equal(portal.handlerCount, 4, 'portal should have 4 middlewares/handlers');
  });

  it('subscription status is registered on the canonical v1 path', () => {
    const app = createMockApp();
    registerBillingRoutes(
      app as unknown as Express,
      { getSubscriptionStatus: async () => ({}) } as unknown as BillingService,
      noopMiddleware(),
      noopMiddleware()
    );

    const apiPath = app.registered.find(
      (r) => r.method === 'GET' && r.path === '/api/v1/billing/subscription-status'
    );
    assert.ok(apiPath, 'API subscription status route should exist');
  });

  it('webhook route does not require auth middleware', () => {
    const app = createMockApp();
    registerBillingRoutes(
      app as unknown as Express,
      {
        provider: mockProvider,
        processWebhook: async () => ({}),
      } as unknown as BillingService,
      noopMiddleware(),
      noopMiddleware()
    );

    const webhook = app.registered.find(
      (r) => r.method === 'POST' && r.path === '/api/webhooks/stripe'
    );
    assert.ok(webhook);
    assert.equal(webhook.handlerCount, 1, 'webhook should only have the handler (no auth)');
  });
});
