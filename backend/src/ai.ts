import type { Express, NextFunction, Request, RequestHandler, Response } from 'express';

import type { PlanId } from '../types.js';
import { AI_CONTRACT_VERSION, createAIService } from './ai-core/index.js';
import { createAiLedger } from './ai-ledger.js';
import type { AiLedger } from './ai-ledger.js';
import type { SubscriptionSnapshot } from './billing-helpers.js';
import { normalizePlanId } from './billing-plan-migration.js';
import { getOrSet } from './cache/redis-cache.service.js';
import { checkUserLimits } from './cost-tracker.js';
import { ApiError } from './errors.js';
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

const PLAN_AI_LIMITS: Record<PlanId, { daily: number | null; monthly: number }> = {
  free: { daily: 3, monthly: 0 },
  junior: { daily: null, monthly: 50 },
  senior: { daily: null, monthly: 150 },
  specialist: { daily: null, monthly: 300 },
  master: { daily: null, monthly: 600 },
  team: { daily: null, monthly: 1500 },
};

const DEFAULT_PLAN_LIMITS: { daily: number | null; monthly: number } = { daily: 3, monthly: 0 };

const getPlanLimits = (planId: PlanId) => PLAN_AI_LIMITS[planId] ?? DEFAULT_PLAN_LIMITS;

export { getPlanLimits };

const resolvePlanId = (subscription: SubscriptionSnapshot | null, configured: boolean): PlanId => {
  if (!configured || !subscription) return 'free';
  const status = subscription.status;
  if (status !== 'active' && status !== 'trialing') return 'free';
  return normalizePlanId(subscription.planId);
};

const AI_WINDOW_MS = 24 * 60 * 60 * 1000;
const AI_MONTH_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

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

const getWindowMs = (planId: PlanId) => {
  const limits = getPlanLimits(planId);
  return limits.daily !== null ? AI_WINDOW_MS : AI_MONTH_WINDOW_MS;
};

export { getWindowMs };

const countRequestsInWindow = async (
  ledger: { countRecentRequests: (userId: string, planId: PlanId) => Promise<number> },
  userId: string,
  planId: PlanId,
  windowMs: number
): Promise<number> => {
  void windowMs;
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
  const windowMs = getWindowMs(planId);
  const count = await countRequestsInWindow(ledger, userId, planId, windowMs);
  if (!isLimitReached(planId, count))
    return { count, useTopup: false, subscription: subscription ?? null, topupCredits: 0, planId };

  const topupCredits = subscription?.topupCredits ?? 0;
  if (topupCredits > 0) return { count, useTopup: true, subscription, topupCredits, planId };

  throwLimitError(planId);
  return { count, useTopup: false, subscription: null, topupCredits: 0, planId };
};

const decrementTopup = async (
  billingRepository: SubscriptionRepository | null,
  userId: string,
  subscription: SubscriptionSnapshot | null,
  topupCredits: number
) => {
  if (!billingRepository || topupCredits <= 0 || !subscription) return;
  await billingRepository.upsertSubscriptionStatus(userId, {
    ...subscription,
    topupCredits: topupCredits - 1,
    updatedAt: new Date().toISOString(),
    source: 'ai_billing_decrement',
  });
};

const logAiUsage = (
  ledger: AiLedger,
  userId: string,
  result: {
    error?: boolean;
    provider?: string;
    durationMs?: number;
    text?: string;
    tokensUsed?: number;
    promptVersion?: string;
  },
  body: { modeId?: string },
  operation: string
) => {
  if (result && !result.error) {
    ledger.logSession(userId, {
      modeId: body.modeId || 'unknown',
      provider: result.provider || 'mock',
      operation,
      durationMs: result.durationMs || 0,
      resultSummary: result.text ? result.text.slice(0, 100) : '',
      tokensUsed: result.tokensUsed ?? 0,
      metadata: {
        promptVersion: result.promptVersion ?? null,
        operation,
      },
    });
  }
};

export const registerAIRoutes = (
  app: Express,
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
  },
  _fetchImpl: typeof fetch = fetch
): void => {
  const ledger = createAiLedger(config as unknown as Parameters<typeof createAiLedger>[0]);
  const configured = Boolean(
    config.stripe && (config.stripe as Record<string, unknown>).configured
  );

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
    operation: string
  ) => {
    if (bypass) return;
    logAiUsage(
      ledger,
      userId,
      {
        error: result.error as boolean | undefined,
        provider: result.provider as string | undefined,
        durationMs: result.durationMs as number | undefined,
        text: result.text as string | undefined,
        tokensUsed: result.tokensUsed as number | undefined,
        promptVersion: result.promptVersion as string | undefined,
      },
      { modeId: body.modeId as string | undefined },
      operation
    );
  };

  Object.entries(AI_ROUTES).forEach(([path, defaultOperation]) => {
    app.post(
      path,
      requireBackendAuth,
      rateLimiter,
      validateBody(AiRequestBodySchema),
      async (request: Request, response: Response, next: NextFunction) => {
        try {
          const body = request.validatedBody as Record<string, unknown>;
          validateOperation(body, defaultOperation);

          const userId = request.auth?.userId || 'unknown';
          const bypass = isBypassUser(userId);

          const { useTopup, subscription, topupCredits } = await resolveRateLimits(userId, bypass);

          const cacheKey = `ai:${defaultOperation}:${userId}:${JSON.stringify(body)}`;
          const { value: result } = await getOrSet(cacheKey, 3600, () =>
            aiCircuitBreaker.execute(() => aiService.complete(defaultOperation, body))
          );

          if (useTopup && !bypass) {
            await decrementTopup(billingRepository, userId, subscription, topupCredits);
          }
          logUsage(userId, bypass, result, body, defaultOperation);
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
        response.json({ userId, ...analytics });
      } catch (error) {
        next(error);
      }
    }
  );
};
