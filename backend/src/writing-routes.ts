import { ApiError } from './errors.js';
import { validateBody, WritingSubmitBodySchema } from './validation.js';
import type { Express, Request, Response, NextFunction } from 'express';

export const registerWritingRoutes = (app: Express): void => {
  app.get(
    '/api/writing/prompts',
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
        });
      } catch (error) {
        next(error);
      }
    }
  );

  app.post(
    '/api/writing/submit',
    validateBody(WritingSubmitBodySchema),
    async (request: Request, response: Response, next: NextFunction) => {
      try {
        const userId = request.auth?.userId;
        if (!userId)
          throw new ApiError(401, 'authentication_required', 'Auth required');

        const { promptId, content } = request.validatedBody as {
          promptId?: string;
          content?: string;
        };

        response.json({
          success: true,
          id: 'mock-id',
          score: 0,
          grammarScore: 0,
          vocabularyScore: 0,
          coherenceScore: 0,
          structureScore: 0,
          feedback: {},
          status: 'graded',
          submittedAt: new Date().toISOString(),
        });
      } catch (error) {
        next(error);
      }
    }
  );

  app.get(
    '/api/writing/stats',
    async (request: Request, response: Response, next: NextFunction) => {
      try {
        const userId = request.auth?.userId;
        if (!userId)
          throw new ApiError(401, 'authentication_required', 'Auth required');

        response.json({
          totalSubmissions: 0,
          averageScore: 0,
          byCategory: {},
        });
      } catch (error) {
        next(error);
      }
    }
  );

  app.get(
    '/api/writing/:id',
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
