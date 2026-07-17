import { ApiError } from './errors.js';
import { createAiLedger } from './ai-ledger.js';
import { validateBody, AiRequestBodySchema } from './validation.js';
import { createAIService, AI_CONTRACT_VERSION } from './ai-core/index.js';

export { createAIService, AI_CONTRACT_VERSION };

export const AI_ROUTES: Record<string, string> = {
  '/api/ai/coach': 'analyzeProgress',
  '/api/ai/writing-review': 'evaluateEngineeringEnglish',
  '/api/ai/assessment-feedback': 'analyzeText',
  '/api/ai/roleplay': 'generatePractice',
};

export const registerAIRoutes = (
  app: any,
  aiService: any,
  requireBackendAuth: any,
  rateLimiter: any,
  billingRepository: any,
  config: Record<string, any>,
  fetchImpl: typeof fetch = fetch
): void => {
  const ledger = createAiLedger(config);

  Object.entries(AI_ROUTES).forEach(([path, defaultOperation]) => {
    app.post(
      path,
      requireBackendAuth,
      rateLimiter,
      validateBody(AiRequestBodySchema),
      async (request: any, response: any, next: any) => {
        try {
          const body = request.validatedBody;

          if (
            body.operation !== undefined &&
            body.operation !== defaultOperation
          ) {
            throw new ApiError(
              400,
              'invalid_operation',
              'The AI operation must match the requested route.'
            );
          }

          const userId = request.auth?.userId || 'unknown';

          let subscription: any = null;
          if (billingRepository) {
            subscription =
              await billingRepository.getSubscriptionStatus(userId);
          }

          const planId = subscription?.planId || 'free';
          const topupCredits = subscription?.topupCredits || 0;

          let count = 0;
          const isBypassUser =
            userId === 'engineeros-dev-user' ||
            userId.startsWith('demo_engineer_');

          let useTopup = false;
          if (!isBypassUser) {
            count = await ledger.countRecentRequests(userId, planId);

            const freeLimitReached = planId === 'free' && count >= 3;
            const paidLimitReached = planId !== 'free' && count >= 300;

            if (freeLimitReached || paidLimitReached) {
              if (topupCredits > 0) {
                useTopup = true;
              } else {
                if (planId === 'free') {
                  throw new ApiError(
                    429,
                    'free_ai_coach_limit_exceeded',
                    'Free plan accounts are limited to 3 AI Coach requests per day. Please upgrade to Pro.'
                  );
                } else {
                  throw new ApiError(
                    429,
                    'monthly_ai_credit_limit_exceeded',
                    'Monthly AI credit limit reached (300/300). Please contact support or upgrade.'
                  );
                }
              }
            }
          }

          const result = await aiService.complete(defaultOperation, body);

          if (useTopup && billingRepository && !isBypassUser) {
            await billingRepository.upsertSubscriptionStatus(userId, {
              ...subscription,
              topupCredits: topupCredits - 1,
              updatedAt: new Date().toISOString(),
              source: 'ai_billing_decrement',
            });
          }

          if (result && !result.error && !isBypassUser) {
            ledger.logSession(userId, {
              modeId: body.modeId || 'unknown',
              provider: result.provider || 'mock',
              operation: defaultOperation,
              durationMs: result.durationMs || 0,
              resultSummary: result.text ? result.text.slice(0, 100) : '',
            });
          }

          response.json(result);
        } catch (error) {
          next(error);
        }
      }
    );
  });
};
