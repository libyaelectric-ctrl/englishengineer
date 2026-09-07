import type { Express, NextFunction, Request, RequestHandler, Response } from 'express';

import { ApiError } from './errors.js';
import { ProgressBodySchema, validateBody } from './validation.js';
import { categorizePerformance } from './utils/stats.js';

interface GrammarRecord {
  ruleId: string;
  result: 'correct' | 'incorrect';
  timestamp: string;
}

// Per-user grammar progress store
const progressStore = new Map<string, GrammarRecord[]>();

function getUserRecords(userId: string): GrammarRecord[] {
  if (!progressStore.has(userId)) {
    progressStore.set(userId, []);
  }
  return progressStore.get(userId)!;
}

export const registerGrammarRoutes = (
  app: Express,
  requireBackendAuth: RequestHandler,
  grammarLimiter: RequestHandler
): void => {
  app.post(
    '/api/grammar/:id/progress',
    requireBackendAuth,
    grammarLimiter,
    validateBody(ProgressBodySchema),
    async (request: Request, response: Response, next: NextFunction) => {
      try {
        const userId = request.auth?.userId;
        if (!userId) throw new ApiError(401, 'authentication_required', 'Auth required');

        const ruleId = request.params.id as string;
        const { result } = request.validatedBody as {
          result: 'correct' | 'incorrect';
        };

        getUserRecords(userId).push({ ruleId, result, timestamp: new Date().toISOString() });

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
        const userId = request.auth?.userId;
        if (!userId) throw new ApiError(401, 'authentication_required', 'Auth required');

        const records = getUserRecords(userId);
        const stats = categorizePerformance(records, 'ruleId');

        response.json({
          total: stats.total,
          correct: stats.correct,
          incorrect: stats.incorrect,
          new: stats.new,
          learning: stats.learning,
          learned: stats.learned,
          mastered: stats.mastered,
          struggling: stats.struggling,
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
        const userId = request.auth?.userId;
        if (!userId) throw new ApiError(401, 'authentication_required', 'Auth required');

        const records = getUserRecords(userId);
        const grammarLearnedCount = records.filter((r) => r.result === 'correct').length;

        response.json({
          vocabularyLearnedCount: 0,
          grammarLearnedCount,
          readingActivitiesDone: 0,
          writingActivitiesDone: 0,
          canAccessReading: grammarLearnedCount >= 5,
          canAccessWriting: grammarLearnedCount >= 10,
          canAccessSpeaking: grammarLearnedCount >= 8,
          canAccessListening: grammarLearnedCount >= 3,
        });
      } catch (error) {
        next(error);
      }
    }
  );
};
