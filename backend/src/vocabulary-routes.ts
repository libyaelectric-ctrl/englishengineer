import { validateQuery, VocabularyLookupQuerySchema } from './validation.js';
import { getOrSet } from './cache/redis-cache.service.js';
import { ApiError } from './errors.js';
import type { VocabularyLookupService } from './vocabulary-service.js';
import type { VocabularyLookupQuery } from '../types.js';
import type {
  Express,
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from 'express';

interface WordProgressRow {
  word_id: string;
  status: string;
  fail_count: number;
  correct_count: number;
  last_practiced_at: string | null;
  mastered_at: string | null;
}

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
        const { value: result, fromCache } = await getOrSet(
          cacheKey,
          21600,
          () => service.lookup(query)
        );
        response.json({ ...result, cached: fromCache });
      } catch (error) {
        next(error);
      }
    }
  );

  app.post(
    '/api/vocabulary/:id/progress',
    async (request: Request, response: Response, next: NextFunction) => {
      try {
        const userId = request.auth?.userId;
        if (!userId) throw new ApiError(401, 'authentication_required', 'Auth required');

        const wordId = request.params.id;
        const { result } = request.body as { result: 'correct' | 'incorrect' };

        if (result !== 'correct' && result !== 'incorrect') {
          throw new ApiError(400, 'invalid_result', 'result must be "correct" or "incorrect"');
        }

        const now = new Date().toISOString();

        response.json({
          success: true,
          wordId,
          result,
          updatedAt: now,
          message: result === 'correct' ? 'Well done! Keep going.' : 'No worries, you will get it next time.',
        });
      } catch (error) {
        next(error);
      }
    }
  );

  app.get(
    '/api/vocabulary/stats',
    async (request: Request, response: Response, next: NextFunction) => {
      try {
        const userId = request.auth?.userId;
        if (!userId) throw new ApiError(401, 'authentication_required', 'Auth required');

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
