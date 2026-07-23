import { ApiError } from './errors.js';
import type { Express, Request, Response, NextFunction } from 'express';

export const registerSpeakingRoutes = (app: Express): void => {
  app.get(
    '/api/speaking/prompts',
    async (request: Request, response: Response, next: NextFunction) => {
      try {
        const userId = request.auth?.userId;
        if (!userId)
          throw new ApiError(401, 'authentication_required', 'Auth required');
        const limit = Number(request.query.limit) || 10;
        const offset = Number(request.query.offset) || 0;
        response.json({ items: [], total: 0, limit, offset });
      } catch (error) {
        next(error);
      }
    }
  );

  app.post(
    '/api/speaking/submit',
    async (request: Request, response: Response, next: NextFunction) => {
      try {
        const userId = request.auth?.userId;
        if (!userId)
          throw new ApiError(401, 'authentication_required', 'Auth required');
        response.json({
          success: true,
          id: 'mock-id',
          overallScore: 0,
          status: 'graded',
          submittedAt: new Date().toISOString(),
        });
      } catch (error) {
        next(error);
      }
    }
  );

  app.get(
    '/api/speaking/stats',
    async (request: Request, response: Response, next: NextFunction) => {
      try {
        const userId = request.auth?.userId;
        if (!userId)
          throw new ApiError(401, 'authentication_required', 'Auth required');
        response.json({ totalSubmissions: 0, averageScore: 0, byCategory: {} });
      } catch (error) {
        next(error);
      }
    }
  );

  app.get(
    '/api/speaking/:id',
    async (request: Request, response: Response, next: NextFunction) => {
      try {
        const userId = request.auth?.userId;
        if (!userId)
          throw new ApiError(401, 'authentication_required', 'Auth required');
        response.json({ notFound: true });
      } catch (error) {
        next(error);
      }
    }
  );
};
