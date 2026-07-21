import { validateQuery, VocabularyLookupQuerySchema } from './validation.js';
import { getOrSet } from './cache/redis-cache.service.js';
import type { VocabularyLookupService } from './vocabulary-service.js';
import type { VocabularyLookupQuery } from '../types.js';
import type {
  Express,
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from 'express';

export const registerVocabularyRoutes = (
  app: Express,
  service: VocabularyLookupService,
  rateLimiter: RequestHandler
): void => {
  app.get(
    '/api/vocabulary/lookup',
    rateLimiter,
    validateQuery(VocabularyLookupQuerySchema),
    async (request: Request, response: Response, next: NextFunction) => {
      try {
        const query = request.validatedQuery as unknown as VocabularyLookupQuery;
        const cacheKey = `vocab:${query.word}`;
        const result = await getOrSet(
          cacheKey,
          21600,
          () => service.lookup(query)
        );
        response.json(result);
      } catch (error) {
        next(error);
      }
    }
  );
};
