import type { Express, NextFunction, Request, RequestHandler, Response } from 'express';

import { ProgressBodySchema, validateBody } from './validation.js';

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
        if (!userId) throw new Error('Auth required');

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
        if (!userId) throw new Error('Auth required');

        const records = getUserRecords(userId);
        const total = records.length;
        const correctCount = records.filter((r) => r.result === 'correct').length;
        const incorrectCount = records.filter((r) => r.result === 'incorrect').length;

        // Classify rules by performance
        const ruleMap = new Map<string, { correct: number; incorrect: number }>();
        for (const r of records) {
          if (!ruleMap.has(r.ruleId)) ruleMap.set(r.ruleId, { correct: 0, incorrect: 0 });
          const entry = ruleMap.get(r.ruleId)!;
          if (r.result === 'correct') entry.correct++;
          else entry.incorrect++;
        }

        let newCount = 0;
        let learning = 0;
        let learned = 0;
        let mastered = 0;
        let struggling = 0;

        for (const [, stats] of ruleMap) {
          const totalAttempts = stats.correct + stats.incorrect;
          if (totalAttempts === 1 && stats.correct === 1) {
            newCount++;
          } else if (totalAttempts <= 3 && stats.correct >= 1) {
            learning++;
          } else if (stats.correct / totalAttempts >= 0.8) {
            mastered++;
          } else if (stats.correct / totalAttempts >= 0.5) {
            learned++;
          } else {
            struggling++;
          }
        }

        response.json({
          total,
          correct: correctCount,
          incorrect: incorrectCount,
          new: newCount,
          learning,
          learned,
          mastered,
          struggling,
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
        if (!userId) throw new Error('Auth required');

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
