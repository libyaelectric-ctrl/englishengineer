import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { registerAIRoutes, AI_ROUTES } from '../src/ai.js';

const createMockApp = () => {
  const registered = [];
  return {
    post: (path, ...handlers) => {
      registered.push({ method: 'POST', path, handlerCount: handlers.length });
    },
    registered,
  };
};

const noopMiddleware = () => async (_req, _res, next) => next();

describe('AI Routes', () => {
  it('exports AI_ROUTES mapping with expected paths', () => {
    assert.equal(AI_ROUTES['/api/ai/coach'], 'analyzeProgress');
    assert.equal(AI_ROUTES['/api/ai/writing-review'], 'evaluateEngineeringEnglish');
    assert.equal(AI_ROUTES['/api/ai/assessment-feedback'], 'analyzeText');
    assert.equal(AI_ROUTES['/api/ai/roleplay'], 'generatePractice');
  });

  it('registers a POST route for each entry in AI_ROUTES', () => {
    const app = createMockApp();
    const mockAiService = { complete: async () => ({ text: 'ok', provider: 'mock' }) };
    const mockBillingRepo = { getSubscriptionStatus: async () => ({ planId: 'free', topupCredits: 0 }) };

    registerAIRoutes(app, mockAiService, noopMiddleware(), noopMiddleware(), mockBillingRepo, {});

    const paths = app.registered.map((r) => r.path);
    for (const expectedPath of Object.keys(AI_ROUTES)) {
      assert.ok(paths.includes(expectedPath), `Expected route for ${expectedPath}`);
    }
  });

  it('each registered route has auth, rateLimiter, validator, and handler', () => {
    const app = createMockApp();
    const mockAiService = { complete: async () => ({ text: 'ok', provider: 'mock' }) };
    const mockBillingRepo = { getSubscriptionStatus: async () => ({ planId: 'free', topupCredits: 0 }) };

    registerAIRoutes(app, mockAiService, noopMiddleware(), noopMiddleware(), mockBillingRepo, {});

    for (const route of app.registered) {
      assert.equal(route.handlerCount, 4, `Route ${route.path} should have 4 middleware/handlers`);
    }
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
});
