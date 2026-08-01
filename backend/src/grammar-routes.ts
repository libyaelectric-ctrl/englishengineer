import type { Express, NextFunction, Request, RequestHandler, Response } from 'express';

import { ProgressBodySchema, validateBody } from './validation.js';

export const registerGrammarRoutes = (
  app: Express,
  requireBackendAuth: RequestHandler
): void => {
  app.post(
    '/api/grammar/:id/progress',
    requireBackendAuth,
    validateBody(ProgressBodySchema),
    async (request: Request, response: Response, next: NextFunction) => {
      try {
        const _userId = request.auth!.userId;

        const ruleId = request.params.id;
        const { result } = request.validatedBody as {
          result: 'correct' | 'incorrect';
        };

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

  app.get(
    '/api/user/access-status',
    requireBackendAuth,
    async (request: Request, response: Response, next: NextFunction) => {
      try {
        const _userId = request.auth!.userId;

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
