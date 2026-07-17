import { validateQuery, VocabularyLookupQuerySchema } from './validation.js';
import type { VocabularyLookupService } from './vocabulary-service.js';
import type { Request, Response, NextFunction } from 'express';

export const registerVocabularyRoutes = (
  app: any,
  service: VocabularyLookupService,
  rateLimiter: any
): void => {
  app.get(
    '/api/vocabulary/lookup',
    rateLimiter,
    validateQuery(VocabularyLookupQuerySchema),
    async (request: Request, response: Response, next: NextFunction) => {
      try {
        response.json(await service.lookup((request as any).validatedQuery));
      } catch (error) {
        next(error);
      }
    }
  );
};
