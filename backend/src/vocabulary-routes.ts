import { validateQuery, VocabularyLookupQuerySchema } from './validation.js';
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
        response.json(
          await service.lookup(request.validatedQuery as unknown as VocabularyLookupQuery)
        );
      } catch (error) {
        next(error);
      }
    }
  );
};
