import type { Express, NextFunction, Request, Response } from 'express';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createMemoryAiLedger } from '../src/ai-ledger.js';
import { AI_ROUTES, getPlanLimits, isLimitReached, registerAIRoutes } from '../src/ai.js';
import type { SubscriptionRepository } from '../src/subscription-repository.js';
import type { PlanId } from '../types.js';

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

const noopMiddleware = () => async (_req: Request, _res: Response, next: NextFunction) => next();

describe('AI Routes', () => {
  it('exports AI_ROUTES mapping with expected paths', () => {
    assert.equal(AI_ROUTES['/api/ai/coach'], 'analyzeProgress');
    assert.equal(AI_ROUTES['/api/ai/writing-review'], 'evaluateEngineeringEnglish');
    assert.equal(AI_ROUTES['/api/ai/assessment-feedback'], 'analyzeText');
    assert.equal(AI_ROUTES['/api/ai/roleplay'], 'generatePractice');
  });

  it('registers a POST route for each entry in AI_ROUTES', () => {
    const app = createMockApp();
    const mockAiService = {
      complete: async () => ({ text: 'ok', provider: 'mock' }),
    };
    const mockBillingRepo = {
      getSubscriptionStatus: async () => ({ planId: 'free', topupCredits: 0 }),
    } as unknown as SubscriptionRepository;

    registerAIRoutes(
      app as unknown as Express,
      mockAiService,
      noopMiddleware(),
      noopMiddleware(),
      mockBillingRepo,
      {}
    );

    const paths = app.registered.map((r) => r.path);
    for (const expectedPath of Object.keys(AI_ROUTES)) {
      assert.ok(paths.includes(expectedPath), `Expected route for ${expectedPath}`);
    }
  });

  it('each registered route has auth, rateLimiter, validator, and handler', () => {
    const app = createMockApp();
    const mockAiService = {
      complete: async () => ({ text: 'ok', provider: 'mock' }),
    };
    const mockBillingRepo = {
      getSubscriptionStatus: async () => ({ planId: 'free', topupCredits: 0 }),
    } as unknown as SubscriptionRepository;

    registerAIRoutes(
      app as unknown as Express,
      mockAiService,
      noopMiddleware(),
      noopMiddleware(),
      mockBillingRepo,
      {}
    );

    for (const route of app.registered.filter((r) => r.path in AI_ROUTES)) {
      assert.equal(route.handlerCount, 4, `Route ${route.path} should have 4 middleware/handlers`);
    }
  });

  it('registers a GET /api/ai/analytics route with auth, rateLimiter, and handler', () => {
    const app = createMockApp();
    const mockAiService = {
      complete: async () => ({ text: 'ok', provider: 'mock' }),
    };
    const mockBillingRepo = {
      getSubscriptionStatus: async () => ({ planId: 'free', topupCredits: 0 }),
    } as unknown as SubscriptionRepository;

    registerAIRoutes(
      app as unknown as Express,
      mockAiService,
      noopMiddleware(),
      noopMiddleware(),
      mockBillingRepo,
      {}
    );

    const analytics = app.registered.find((r) => r.path === '/api/ai/analytics');
    assert.ok(analytics, 'Expected GET /api/ai/analytics to be registered');
    assert.equal(analytics.method, 'GET');
    assert.equal(analytics.handlerCount, 3);
  });

  it('registers a GET /api/ai/analytics/admin route with auth, role, rateLimiter, and handler', () => {
    const app = createMockApp();
    const mockAiService = {
      complete: async () => ({ text: 'ok', provider: 'mock' }),
    };
    const mockBillingRepo = {
      getSubscriptionStatus: async () => ({ planId: 'free', topupCredits: 0 }),
    } as unknown as SubscriptionRepository;

    registerAIRoutes(
      app as unknown as Express,
      mockAiService,
      noopMiddleware(),
      noopMiddleware(),
      mockBillingRepo,
      {}
    );

    const admin = app.registered.find((r) => r.path === '/api/ai/analytics/admin');
    assert.ok(admin, 'Expected GET /api/ai/analytics/admin to be registered');
    assert.equal(admin.method, 'GET');
    assert.equal(admin.handlerCount, 4);
  });

  it('exports createAIService from ai-core', async () => {
    const { createAIService } = await import('../src/ai.js');
    assert.equal(typeof createAIService, 'function');
  });

  it('exports AI_CONTRACT_VERSION from ai-core', async () => {
    const { AI_CONTRACT_VERSION } = await import('../src/ai.js');
    assert.equal(typeof AI_CONTRACT_VERSION, 'string');
    assert.ok(AI_CONTRACT_VERSION.length > 0);
  });

  it('isLimitReached enforces the free daily limit', () => {
    assert.equal(isLimitReached('free', 2), false);
    assert.equal(isLimitReached('free', 3), true);
  });

  it('isLimitReached enforces paid monthly limits', () => {
    assert.equal(isLimitReached('senior', 149), false);
    assert.equal(isLimitReached('senior', 150), true);
    assert.equal(isLimitReached('team', 1500), true);
  });

  it('getPlanLimits exposes daily/monthly limits per plan with a free fallback', () => {
    assert.equal(getPlanLimits('free').daily, 3);
    assert.equal(getPlanLimits('junior').monthly, 50);
    assert.equal(getPlanLimits('unknown' as PlanId).daily, 3);
  });

  it('countRecentRequests counts only requests in the plan window', async () => {
    const ledger = createMemoryAiLedger();
    await ledger.logSession('user-a', { operation: 'translate', tokensUsed: 100 });
    await ledger.logSession('user-b', { operation: 'translate', tokensUsed: 100 });

    assert.equal(await ledger.countRecentRequests('user-a', 'free'), 1);
    assert.equal(await ledger.countRecentRequests('user-b', 'free'), 1);
    assert.equal(await ledger.countRecentRequests('nobody', 'free'), 0);
  });
});
