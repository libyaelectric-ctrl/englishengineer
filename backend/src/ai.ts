import { ApiError } from './errors.js';
import { createAiLedger } from './ai-ledger.js';
import { validateBody, AiRequestBodySchema } from './validation.js';
import { createAIService, AI_CONTRACT_VERSION } from './ai-core/index.js';
import { checkUserLimits } from './cost-tracker.js';
import { getOrSet } from './cache/redis-cache.service.js';
import type {
  Express,
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from 'express';
import type { SubscriptionRepository } from './subscription-repository.js';
import type { SubscriptionSnapshot } from './billing-helpers.js';
import type { AiLedger } from './ai-ledger.js';

export { createAIService, AI_CONTRACT_VERSION };

export const AI_ROUTES: Record<string, string> = {
  '/api/ai/coach': 'analyzeProgress',
  '/api/ai/writing-review': 'evaluateEngineeringEnglish',
  '/api/ai/assessment-feedback': 'analyzeText',
  '/api/ai/roleplay': 'generatePractice',
};

const isBypassUser = (userId: string): boolean => {
  if (process.env.NODE_ENV === 'production') return false;
  if (process.env.ALLOW_INSECURE_DEV_AUTH !== 'true') return false;
  return (
    userId === 'engineeros-dev-user' || userId.startsWith('demo_engineer_')
  );
};

const checkCostLimits = (userId: string) => {
  const limits = checkUserLimits(userId);
  if (!limits.allowed)
    throw new ApiError(
      429,
      'user_rate_limit_exceeded',
      limits.reason ?? 'Rate limit exceeded.'
    );
};

const isLimitReached = (planId: string, count: number) =>
  planId === 'free' ? count >= 3 : count >= 300;

const throwLimitError = (planId: string): never => {
  const free = planId === 'free';
  throw new ApiError(
    429,
    free ? 'free_ai_coach_limit_exceeded' : 'monthly_ai_credit_limit_exceeded',
    free
      ? 'Free plan accounts are limited to 3 AI Coach requests per day. Please upgrade to Pro.'
      : 'Monthly AI credit limit reached (300/300). Please contact support or upgrade.'
  );
};

const checkRateLimits = async (
  userId: string,
  planId: string,
  ledger: {
    countRecentRequests: (userId: string, planId: string) => Promise<number>;
  },
  billingRepository: SubscriptionRepository | null
): Promise<{
  count: number;
  useTopup: boolean;
  subscription: SubscriptionSnapshot | null;
  topupCredits: number;
}> => {
  checkCostLimits(userId);
  const count = await ledger.countRecentRequests(userId, planId);
  if (!isLimitReached(planId, count))
    return { count, useTopup: false, subscription: null, topupCredits: 0 };

  const subscription = billingRepository
    ? await billingRepository.getSubscriptionStatus(userId)
    : null;
  const topupCredits = subscription?.topupCredits ?? 0;
  if (topupCredits > 0)
    return { count, useTopup: true, subscription, topupCredits };

  throwLimitError(planId);
  // Unreachable — throwLimitError always throws, but TS needs an explicit return path
  return { count, useTopup: false, subscription: null, topupCredits: 0 };
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
    });
  }
};

export const registerAIRoutes = (
  app: Express,
  aiService: {
    complete: (
      op: string,
      body: Record<string, unknown>
    ) => Promise<Record<string, unknown>>;
  },
  requireBackendAuth: RequestHandler,
  rateLimiter: RequestHandler,
  billingRepository: SubscriptionRepository,
  config: Record<string, unknown>,
  _fetchImpl: typeof fetch = fetch
): void => {
  const ledger = createAiLedger(config);

  const validateOperation = (
    body: Record<string, unknown>,
    defaultOp: string
  ) => {
    if (body?.operation !== undefined && body.operation !== defaultOp) {
      throw new ApiError(
        400,
        'invalid_operation',
        'The AI operation must match the requested route.'
      );
    }
  };

  const resolveRateLimits = async (userId: string, bypass: boolean) => {
    if (bypass) return { useTopup: false, subscription: null, topupCredits: 0 };
    return checkRateLimits(userId, 'free', ledger, billingRepository);
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

          const { useTopup, subscription, topupCredits } =
            await resolveRateLimits(userId, bypass);

          const cacheKey = `ai:${defaultOperation}:${userId}:${JSON.stringify(body)}`;
          const { value: result } = await getOrSet(cacheKey, 3600, () =>
            aiService.complete(defaultOperation, body)
          );

          if (useTopup && !bypass) {
            await decrementTopup(
              billingRepository,
              userId,
              subscription,
              topupCredits
            );
          }
          logUsage(userId, bypass, result, body, defaultOperation);
          response.json(result);
        } catch (error) {
          next(error);
        }
      }
    );
  });
};
