import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { ApiError } from './errors.js';
import { getLearningRepository } from './learning-repository.js';
import { getPersistentPerformanceStats } from './progress-routes.js';
import { ProgressBodySchema, validateBody } from './validation.js';
import type { RouteRegistrar } from './route-registrar.js';
const userIdFrom = (request: Request): string => {
  const userId = request.auth?.userId;
  if (!userId) throw new ApiError(401, 'authentication_required', 'Auth required');
  return userId;
};
export const registerGrammarRoutes = (
  app: RouteRegistrar,
  requireBackendAuth: RequestHandler,
  grammarLimiter: RequestHandler
): void => {
  app.post(
    '/api/grammar/:id/progress',
    requireBackendAuth,
    grammarLimiter,
    validateBody(ProgressBodySchema),
    async (request: Request, response: Response, next: NextFunction) => {
      try {
        const userId = userIdFrom(request);
        const ruleId = request.params.id as string;
        const { result } = request.validatedBody as { result: 'correct' | 'incorrect' };
        const event = await getLearningRepository().recordProgress({
          userId,
          module: 'grammar',
          itemId: ruleId,
          result,
          score: result === 'correct' ? 100 : 0,
          category: 'general',
          metadata: {},
        });
        response.json({ success: true, ruleId, result, updatedAt: event.occurredAt });
      } catch (error) {
        next(error);
      }
    }
  );
  app.get(
    '/api/grammar/stats',
    requireBackendAuth,
    async (request: Request, response: Response, next: NextFunction) => {
      try {
        response.json(await getPersistentPerformanceStats(userIdFrom(request), 'grammar'));
      } catch (error) {
        next(error);
      }
    }
  );
};
