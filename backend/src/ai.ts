import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { randomUUID } from 'node:crypto';

import type { PlanId } from '../types.js';
import { AI_CONTRACT_VERSION, createAIService } from './ai-core/index.js';
import { createAiLedger } from './ai-ledger.js';
import type { AiLedger } from './ai-ledger.js';
import type { SubscriptionSnapshot } from './billing-helpers.js';
import { normalizePlanId } from './billing-plan-migration.js';
import { getOrSet } from './cache/redis-cache.service.js';
import { checkUserLimits } from './cost-tracker.js';
import { ApiError } from './errors.js';
import { idempotencyKey } from './middleware/idempotency.middleware.js';
import { requireRole } from './middleware/rbac.middleware.js';
import { DEFAULT_PLAN_LIMITS, PLAN_AI_LIMITS } from './plan-limits.js';
import type { RouteRegistrar } from './route-registrar.js';
import type { SubscriptionRepository } from './subscription-repository.js';
import { CircuitBreaker } from './utils/circuit-breaker.js';
import { AiRequestBodySchema, validateBody } from './validation.js';

export { createAIService, AI_CONTRACT_VERSION };

const aiCircuitBreaker = new CircuitBreaker('AIService', 5, 30000);

export const AI_ROUTES: Record<string, string> = {
  '/api/ai/coach': 'analyzeProgress',
  '/api/ai/writing-review': 'evaluateEngineeringEnglish',
  '/api/ai/assessment-feedback': 'analyzeText',
  '/api/ai/roleplay': 'generatePractice',
  '/api/ai/translate': 'translate',
  '/api/ai/generate-content': 'generateContent',
  '/api/ai/transcribe': 'transcribeAudio',
};

const getPlanLimits = (planId: PlanId) => PLAN_AI_LIMITS[planId] ?? DEFAULT_PLAN_LIMITS;

export { getPlanLimits };

const resolvePlanId = (subscription: SubscriptionSnapshot | null, configured: boolean): PlanId => {
  if (!configured || !subscription) return 'free';
  const status = subscription.status;
  if (status !== 'active' && status !== 'trialing') return 'free';
  return normalizePlanId(subscription.planId);
};

const isBypassUser = (userId: string): boolean => {
  if (process.env.NODE_ENV === 'production') return false;
  if (process.env.ALLOW_INSECURE_DEV_AUTH !== 'true') return false;
  return userId === 'engineeros-dev-user' || userId.startsWith('demo_engineer_');
};

const checkCostLimits = (userId: string) => {
  const limits = checkUserLimits(userId);
  if (!limits.allowed)
    throw new ApiError(429, 'user_rate_limit_exceeded', limits.reason ?? 'Rate limit exceeded.');
};

export { checkCostLimits };

const isLimitReached = (planId: PlanId, count: number) => {
  const limits = getPlanLimits(planId);
  if (limits.daily !== null) return count >= limits.daily;
  return count >= limits.monthly;
};

export { isLimitReached };

const throwLimitError = (planId: PlanId): never => {
  const limits = getPlanLimits(planId);
  const isFree = planId === 'free';
  throw new ApiError(
    429,
    isFree ? 'free_ai_coach_limit_exceeded' : 'monthly_ai_credit_limit_exceeded',
    isFree
      ? `Free plan is limited to ${limits.daily} AI requests per day. Upgrade for more.`
      : `Monthly AI credit limit reached (${limits.monthly}). Upgrade your plan or buy top-up credits.`
  );
};

const countRequestsInWindow = async (
  ledger: { countRecentRequests: (userId: string, planId: PlanId) => Promise<number> },
  userId: string,
  planId: PlanId
): Promise<number> => {
  return ledger.countRecentRequests(userId, planId);
};

const checkRateLimits = async (
  userId: string,
  ledger: {
    countRecentRequests: (userId: string, planId: PlanId) => Promise<number>;
  },
  billingRepository: SubscriptionRepository | null,
  configured: boolean
): Promise<{
  count: number;
  useTopup: boolean;
  subscription: SubscriptionSnapshot | null;
  topupCredits: number;
  planId: PlanId;
}> => {
  checkCostLimits(userId);
  const subscription = billingRepository
    ? await billingRepository.getSubscriptionStatus(userId)
    : null;
  const planId = resolvePlanId(subscription, configured);
  const count = await countRequestsInWindow(ledger, userId, planId);
  if (!isLimitReached(planId, count))
    return { count, useTopup: false, subscription: subscription ?? null, topupCredits: 0, planId };

  const topupCredits = subscription?.topupCredits ?? 0;
  if (topupCredits > 0) return { count, useTopup: true, subscription, topupCredits, planId };

  throwLimitError(planId);
  return { count, useTopup: false, subscription: null, topupCredits: 0, planId } as never;
};

const logAiUsage = async (
  ledger: AiLedger,
  userId: string,
  result: {
    error?: boolean;
    provider?: string;
    durationMs?: number;
    text?: string;
    tokensUsed?: number;
    estimatedTokens?: number;
    requestId?: string;
    promptVersion?: string;
  },
  body: { modeId?: string },
  operation: string,
  requestId: string
) => {
  if (result && !result.error) {
    await ledger.logSession(userId, {
      requestId,
      modeId: body.modeId || 'unknown',
      provider: result.provider || 'mock',
      operation,
      durationMs: result.durationMs || 0,
      resultSummary: result.text ? result.text.slice(0, 100) : '',
      tokensUsed: result.tokensUsed ?? result.estimatedTokens ?? 0,
      metadata: {
        promptVersion: result.promptVersion ?? null,
        requestId,
        operation,
      },
    });
  }
};

export const registerAIRoutes = (
  app: RouteRegistrar,
  aiService: {
    complete: (op: string, body: Record<string, unknown>) => Promise<Record<string, unknown>>;
  },
  requireBackendAuth: RequestHandler,
  rateLimiter: RequestHandler,
  billingRepository: SubscriptionRepository,
  config: {
    ai?: { rateLimitWindowMs?: number; rateLimitMax?: number };
    stripe?: Record<string, unknown>;
    supabase?: Record<string, unknown>;
    ledger?: { filePath?: string };
    workspace?: Record<string, unknown>;
    billing?: { provider?: string };
    dodo?: { configured?: boolean };
  },
  _fetchImpl: typeof fetch = fetch
): void => {
  const ledger = createAiLedger({
    ...config,
    workspace: config.workspace,
    ledger: { filePath: config.ledger?.filePath ?? process.env.AI_LEDGER_FILE },
  } as unknown as Parameters<typeof createAiLedger>[0]);
  const configured =
    config.billing?.provider === 'dodo'
      ? config.dodo?.configured === true
      : config.billing?.provider === 'paddle'
        ? false
        : config.stripe?.configured === true;

  const validateOperation = (body: Record<string, unknown>, defaultOp: string) => {
    if (body?.operation !== undefined && body.operation !== defaultOp) {
      throw new ApiError(
        400,
        'invalid_operation',
        'The AI operation must match the requested route.'
      );
    }
  };

  const resolveRateLimits = async (userId: string, bypass: boolean) => {
    if (bypass) return { useTopup: false, subscription: null, topupCredits: 0, planId: 'free' };
    return checkRateLimits(userId, ledger, billingRepository, configured);
  };

  const logUsage = (
    userId: string,
    bypass: boolean,
    result: Record<string, unknown>,
    body: Record<string, unknown>,
    operation: string,
    requestId: string
  ) => {
    if (bypass) return;
    return logAiUsage(
      ledger,
      userId,
      {
        error: result.error as boolean | undefined,
        provider: result.provider as string | undefined,
        durationMs: result.durationMs as number | undefined,
        text: result.text as string | undefined,
        tokensUsed: result.tokensUsed as number | undefined,
        estimatedTokens: result.estimatedTokens as number | undefined,
        requestId: result.requestId as string | undefined,
        promptVersion: result.promptVersion as string | undefined,
      },
      { modeId: body.modeId as string | undefined },
      operation,
      requestId
    );
  };

  const resolveRequestId = (body: Record<string, unknown>, request: Request): string => {
    const fromMeta =
      typeof (body.metadata as { requestId?: unknown } | undefined)?.requestId === 'string'
        ? (body.metadata as { requestId: string }).requestId.trim()
        : '';
    const fromHeader =
      typeof request.headers['x-idempotency-key'] === 'string'
        ? request.headers['x-idempotency-key'].trim()
        : '';
    return fromMeta || fromHeader || request.id || randomUUID();
  };

  const buildAiBody = (body: Record<string, unknown>, requestId: string) => ({
    ...body,
    metadata: {
      ...(typeof body.metadata === 'object' && body.metadata !== null ? body.metadata : {}),
      requestId,
    },
  });

  const buildCacheKey = (
    useTopup: boolean,
    defaultOp: string,
    userId: string,
    requestId: string,
    body: Record<string, unknown>
  ) =>
    useTopup
      ? `ai:${defaultOp}:${userId}:request:${requestId}`
      : `ai:${defaultOp}:${userId}:${JSON.stringify(body)}`;

  const consumeTopupIfNeeded = async (
    useTopup: boolean,
    bypass: boolean,
    userId: string,
    requestId: string,
    result: Record<string, unknown>
  ) => {
    if (!useTopup || bypass || result.error === true || result.mockMode === true) return;
    const consumption = await billingRepository.consumeTopupCredit(userId, requestId);
    if (!consumption.consumed) {
      throw new ApiError(
        429,
        'topup_credit_unavailable',
        'Top-up credits were consumed by another request. Please retry.'
      );
    }
  };

  Object.entries(AI_ROUTES).forEach(([path, defaultOperation]) => {
    app.post(
      path,
      requireBackendAuth,
      rateLimiter,
      idempotencyKey(),
      validateBody(AiRequestBodySchema),
      async (request: Request, response: Response, next: NextFunction) => {
        try {
          const body = request.validatedBody as Record<string, unknown>;
          validateOperation(body, defaultOperation);

          const userId = request.auth?.userId || 'unknown';
          const bypass = isBypassUser(userId);
          const { useTopup } = await resolveRateLimits(userId, bypass);
          const requestId = resolveRequestId(body, request);
          const aiBody = buildAiBody(body, requestId);
          const cacheKey = buildCacheKey(useTopup, defaultOperation, userId, requestId, body);
          const { value: result } = await getOrSet(cacheKey, 3600, () =>
            aiCircuitBreaker.execute(() => aiService.complete(defaultOperation, aiBody))
          );

          await consumeTopupIfNeeded(useTopup, bypass, userId, requestId, result);
          await logUsage(userId, bypass, result, body, defaultOperation, requestId);
          response.json(result);
        } catch (error) {
          next(error);
        }
      }
    );
  });

  app.get(
    '/api/ai/analytics',
    requireBackendAuth,
    rateLimiter,
    async (request: Request, response: Response, next: NextFunction) => {
      try {
        const userId = request.auth?.userId;
        if (!userId) throw new ApiError(401, 'authentication_required', 'Auth required');
        const analytics = await ledger.getUserAnalytics(userId);

        const subscription = billingRepository
          ? await billingRepository.getSubscriptionStatus(userId)
          : null;
        const planId = resolvePlanId(subscription, configured);
        const limits = getPlanLimits(planId);
        const activeLimit = limits.daily ?? limits.monthly;
        const used = await ledger.countRecentRequests(userId, planId);

        response.json({
          userId,
          planId,
          limits: {
            used,
            remaining: Math.max(0, activeLimit - used),
            daily: limits.daily,
            monthly: limits.monthly,
          },
          ...analytics,
        });
      } catch (error) {
        next(error);
      }
    }
  );

  app.get(
    '/api/ai/analytics/admin',
    requireBackendAuth,
    requireRole(['admin']),
    rateLimiter,
    async (_request: Request, response: Response, next: NextFunction) => {
      try {
        const adminAnalytics = await ledger.getAdminAnalytics();
        const { getPromptVersionTelemetry } = await import('./ai-core/prompt-version-telemetry.js');
        response.json({
          success: true,
          data: {
            ...adminAnalytics,
            promptVersionUsage: getPromptVersionTelemetry(),
          },
        });
      } catch (error) {
        next(error);
      }
    }
  );
};
