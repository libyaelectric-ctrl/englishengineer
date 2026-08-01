import type { Express, NextFunction, Request, RequestHandler, Response } from 'express';

import type { VocabularyLookupQuery } from '../types.js';
import { getOrSet } from './cache/redis-cache.service.js';
import {
  ProgressBodySchema,
  VocabularyLookupQuerySchema,
  validateBody,
  validateQuery,
} from './validation.js';
import type { VocabularyLookupService } from './vocabulary-service.js';

export const registerVocabularyRoutes = (
  app: Express,
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
        const cacheKey = `vocab:${query.word}`;
        const { value: result, fromCache } = await getOrSet(cacheKey, 21600, () =>
          service.lookup(query)
        );
        response.json({ ...result, cached: fromCache });
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
        const _userId = request.auth!.userId;

        const wordId = request.params.id;
        const { result } = request.validatedBody as {
          result: 'correct' | 'incorrect';
        };

        const now = new Date().toISOString();

        response.json({
          success: true,
          wordId,
          result,
          updatedAt: now,
          message:
            result === 'correct'
              ? 'Well done! Keep going.'
              : 'No worries, you will get it next time.',
        });
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
        const _userId = request.auth!.userId;

        response.json({
          total: 0,
          new: 0,
          learning: 0,
          learned: 0,
          mastered: 0,
          struggling: 0,
        });
      } catch (error) {
        next(error);
      }
    }
  );
};
