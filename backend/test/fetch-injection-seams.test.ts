import type { NextFunction, Request, RequestHandler, Response } from 'express';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createAiLedger } from '../src/ai-ledger.js';
import { AI_CONTRACT_VERSION, registerAIRoutes } from '../src/ai.js';
import { getAuditLogStatus, initAuditLog } from '../src/audit-log.js';
import type { RouteRegistrar } from '../src/route-registrar.js';
import type { SubscriptionRepository } from '../src/subscription-repository.js';
import { createWorkspaceRepository } from '../src/workspace.js';
import type { WorkspaceConfig } from '../types.js';

// Port 9 (discard) on loopback: if the injected fetch is ignored the client
// falls back to global fetch and fails fast instead of reaching the network,
// so every assertion below is hermetic.
const DEAD_URL = 'http://127.0.0.1:9';

const SUPABASE_STUB: WorkspaceConfig = {
  configured: true,
  supabaseUrl: DEAD_URL,
  supabaseServiceRoleKey: 'test-service-role-key',
};

const createCountingFetch = () => {
  const calls: string[] = [];
  const impl = (async (input: string | URL | Request) => {
    calls.push(String(input));
    return new Response('[]', {
      status: 200,
      headers: { 'content-type': 'application/json', 'content-range': '0-0/0' },
    });
  }) as typeof fetch;
  return { impl, calls };
};

const pathsOf = (calls: string[]): string[] => calls.map((url) => new URL(url).pathname);

describe('fetch injection seams', () => {
  it('workspace repository sends its Supabase queries through the injected fetch', async () => {
    const { impl, calls } = createCountingFetch();

    const repository = createWorkspaceRepository({ workspace: SUPABASE_STUB }, impl);
    const workspaces = await repository.getWorkspaces('user-a');

    assert.deepEqual(workspaces, []);
    assert.ok(
      pathsOf(calls).some((path) => path.includes('workspaces')),
      `expected a /rest/v1/workspaces request, saw ${JSON.stringify(calls)}`
    );
  });

  it('AI ledger sends its Supabase queries through the injected fetch', async () => {
    const { impl, calls } = createCountingFetch();

    const ledger = createAiLedger({ workspace: { ...SUPABASE_STUB } }, impl);
    const used = await ledger.countRecentRequests('user-a', 'free');
    await ledger.getUserAnalytics('user-a');

    assert.equal(used, 0);
    assert.ok(
      pathsOf(calls).some((path) => path.includes('ai_sessions')),
      `expected a /rest/v1/ai_sessions request, saw ${JSON.stringify(calls)}`
    );
  });

  it('audit log initialization sends its health check through the injected fetch', async () => {
    const { impl, calls } = createCountingFetch();

    await initAuditLog({ environment: 'test', workspace: { ...SUPABASE_STUB } }, impl);

    assert.equal(getAuditLogStatus().status, 'ready');
    assert.ok(
      pathsOf(calls).some((path) => path.includes('audit_logs')),
      `expected a /rest/v1/audit_logs request, saw ${JSON.stringify(calls)}`
    );
  });

  it('AI routes wire the injected fetch into the ledger they construct', async () => {
    const { impl, calls } = createCountingFetch();
    const captured = new Map<string, RequestHandler[]>();
    const registrar = {
      get: (path: string, ...handlers: RequestHandler[]) => {
        captured.set(`GET ${path}`, handlers);
        return registrar;
      },
      post: (path: string, ...handlers: RequestHandler[]) => {
        captured.set(`POST ${path}`, handlers);
        return registrar;
      },
      put: () => registrar,
      delete: () => registrar,
      use: () => registrar,
    } as unknown as RouteRegistrar;

    const aiService: Parameters<typeof registerAIRoutes>[1] = {
      complete: async () => ({
        contractVersion: AI_CONTRACT_VERSION,
        requestId: 'test-request-id',
        operation: 'analyzeProgress' as const,
        text: 'ok',
        provider: 'mock',
        mode: 'mock',
        mockMode: true,
        durationMs: 1,
        estimatedTokens: 0,
      }),
    };
    const billingRepository = {
      getSubscriptionStatus: async () => ({ planId: 'free', topupCredits: 0 }),
    } as unknown as SubscriptionRepository;
    const authenticate = ((request: Request, _response: Response, next: NextFunction) => {
      request.auth = { userId: 'user-a' } as Request['auth'];
      next();
    }) as RequestHandler;

    registerAIRoutes(
      registrar,
      aiService,
      authenticate,
      ((_request, _response, next) => next()) as RequestHandler,
      billingRepository,
      { workspace: { ...SUPABASE_STUB } },
      impl
    );

    const handlers = captured.get('GET /api/ai/analytics');
    assert.ok(handlers, 'expected GET /api/ai/analytics to be registered');

    const request = { auth: undefined, headers: {} } as unknown as Request;
    let payload: unknown = null;
    const response = {
      json: (body: unknown) => {
        payload = body;
        return response;
      },
      status: () => response,
      setHeader: () => response,
      set: () => response,
    } as unknown as Response;
    let failure: unknown = null;

    for (const handler of handlers) {
      await handler(request, response, ((error?: unknown) => {
        if (error) failure = error;
      }) as NextFunction);
    }

    assert.equal(failure, null, `handler failed: ${String(failure)}`);
    assert.ok(payload, 'expected the analytics handler to respond');
    assert.ok(
      pathsOf(calls).some((path) => path.includes('ai_sessions')),
      `expected the ledger to run through the injected fetch, saw ${JSON.stringify(calls)}`
    );
  });
});
