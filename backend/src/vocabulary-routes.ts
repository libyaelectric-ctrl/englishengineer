import type { NextFunction, Request, RequestHandler, Response } from 'express';

import type { VocabularyLookupQuery } from '../types.js';
import { apiSuccess } from './api-response.js';
import { getOrSet } from './cache/redis-cache.service.js';
import { ApiError } from './errors.js';
import { getLearningRepository } from './learning-repository.js';
import { getPersistentPerformanceStats } from './progress-routes.js';
import type { RouteRegistrar } from './route-registrar.js';
import {
  ProgressBodySchema,
  VocabularyLookupQuerySchema,
  validateBody,
  validateQuery,
} from './validation.js';
import type { VocabularyLookupService } from './vocabulary-service.js';

const userIdFrom = (request: Request): string => {
  const userId = request.auth?.userId;
  if (!userId) throw new ApiError(401, 'authentication_required', 'Auth required');
  return userId;
};
export const registerVocabularyRoutes = (
  app: RouteRegistrar,
  service: VocabularyLookupService,
  rateLimiter: RequestHandler,
  requireBackendAuth: RequestHandler
): void => {
  app.get(
    '/api/vocabulary/lookup',
    rateLimiter,
    validateQuery(VocabularyLookupQuerySchema),
    async (request: Request, response: Response, next: NextFunction) => {
      try {
        const query = request.validatedQuery as unknown as VocabularyLookupQuery;
        const { value: result, fromCache } = await getOrSet(`vocab:${query.word}`, 21600, () =>
          service.lookup(query)
        );
        response.json(apiSuccess({ ...result, cached: fromCache }));
      } catch (error) {
        next(error);
      }
    }
  );
  app.post(
    '/api/vocabulary/:id/progress',
    requireBackendAuth,
    validateBody(ProgressBodySchema),
    async (request: Request, response: Response, next: NextFunction) => {
      try {
        const userId = userIdFrom(request);
        const wordId = request.params.id as string;
        const { result } = request.validatedBody as { result: 'correct' | 'incorrect' };
        const event = await getLearningRepository().recordProgress({
          userId,
          module: 'vocabulary',
          itemId: wordId,
          result,
          score: result === 'correct' ? 100 : 0,
          category: 'general',
          metadata: {},
        });
        response.json(
          apiSuccess({
            wordId,
            result,
            updatedAt: event.occurredAt,
            message:
              result === 'correct'
                ? 'Well done! Keep going.'
                : 'No worries, you will get it next time.',
          })
        );
      } catch (error) {
        next(error);
      }
    }
  );
  app.get(
    '/api/vocabulary/stats',
    requireBackendAuth,
    async (request: Request, response: Response, next: NextFunction) => {
      try {
        response.json(apiSuccess(await getPersistentPerformanceStats(userIdFrom(request), 'vocabulary')));
      } catch (error) {
        next(error);
      }
    }
  );
};
