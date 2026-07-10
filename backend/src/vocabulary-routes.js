import { validateQuery, VocabularyLookupQuerySchema } from './validation.js';

export const registerVocabularyRoutes = (app, service, rateLimiter) => {
  app.get(
    '/api/vocabulary/lookup',
    rateLimiter,
    validateQuery(VocabularyLookupQuerySchema),
    async (request, response, next) => {
      try {
        response.json(await service.lookup(request.validatedQuery));
      } catch (error) {
        next(error);
      }
    }
  );
};
