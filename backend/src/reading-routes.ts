import { ApiError } from './errors.js';
import { validateBody, ReadingScoreBodySchema } from './validation.js';
import type { Express, Request, Response, NextFunction } from 'express';

export const registerReadingRoutes = (app: Express): void => {
  app.get(
    '/api/reading/feed',
    async (request: Request, response: Response, next: NextFunction) => {
      try {
        const userId = request.auth?.userId;
        if (!userId)
          throw new ApiError(401, 'authentication_required', 'Auth required');

        const limit = Number(request.query.limit) || 10;
        const offset = Number(request.query.offset) || 0;

        response.json({
          items: [],
          total: 0,
          limit,
          offset,
          message: 'Reading feed — 75% current level, 25% next level',
        });
      } catch (error) {
        next(error);
      }
    }
  );

  app.post(
    '/api/reading/:id/progress',
    validateBody(ReadingScoreBodySchema),
    async (request: Request, response: Response, next: NextFunction) => {
      try {
        const userId = request.auth?.userId;
        if (!userId)
          throw new ApiError(401, 'authentication_required', 'Auth required');

        const contentId = request.params.id;
        const { score } = request.validatedBody as { score?: number };

        response.json({
          success: true,
          contentId,
          score: score ?? 0,
          status: 'completed',
          updatedAt: new Date().toISOString(),
        });
      } catch (error) {
        next(error);
      }
    }
  );

  app.get(
    '/api/reading/stats',
    async (request: Request, response: Response, next: NextFunction) => {
      try {
        const userId = request.auth?.userId;
        if (!userId)
          throw new ApiError(401, 'authentication_required', 'Auth required');

        response.json({
          totalRead: 0,
          averageScore: 0,
          byCategory: {},
        });
      } catch (error) {
        next(error);
      }
    }
  );
};
