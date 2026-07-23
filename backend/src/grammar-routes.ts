import { ApiError } from './errors.js';
import type { Express, Request, Response, NextFunction } from 'express';

export const registerGrammarRoutes = (app: Express): void => {
  app.post(
    '/api/grammar/:id/progress',
    async (request: Request, response: Response, next: NextFunction) => {
      try {
        const userId = request.auth?.userId;
        if (!userId)
          throw new ApiError(401, 'authentication_required', 'Auth required');

        const ruleId = request.params.id;
        const { result } = request.body as { result: 'correct' | 'incorrect' };

        if (result !== 'correct' && result !== 'incorrect') {
          throw new ApiError(
            400,
            'invalid_result',
            'result must be "correct" or "incorrect"'
          );
        }

        response.json({
          success: true,
          ruleId,
          result,
          updatedAt: new Date().toISOString(),
        });
      } catch (error) {
        next(error);
      }
    }
  );

  app.get(
    '/api/grammar/stats',
    async (request: Request, response: Response, next: NextFunction) => {
      try {
        const userId = request.auth?.userId;
        if (!userId)
          throw new ApiError(401, 'authentication_required', 'Auth required');

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

  app.get(
    '/api/user/access-status',
    async (request: Request, response: Response, next: NextFunction) => {
      try {
        const userId = request.auth?.userId;
        if (!userId)
          throw new ApiError(401, 'authentication_required', 'Auth required');

        response.json({
          vocabularyLearnedCount: 0,
          grammarLearnedCount: 0,
          readingActivitiesDone: 0,
          writingActivitiesDone: 0,
          canAccessReading: false,
          canAccessWriting: false,
          canAccessSpeaking: false,
          canAccessListening: false,
        });
      } catch (error) {
        next(error);
      }
    }
  );
};
