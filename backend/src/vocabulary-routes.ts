import type { Express, NextFunction, Request, RequestHandler, Response } from 'express';

import type { VocabularyLookupQuery } from '../types.js';
import { getOrSet } from './cache/redis-cache.service.js';
import {
  ProgressBodySchema,
  VocabularyLookupQuerySchema,
  validateBody,
  validateQuery,
} from './validation.js';
import type { VocabularyLookupService } from './vocabulary-service.js';

interface VocabularyRecord {
  wordId: string;
  result: 'correct' | 'incorrect';
  timestamp: string;
}

// Per-user vocabulary progress store
const progressStore = new Map<string, VocabularyRecord[]>();

function getUserRecords(userId: string): VocabularyRecord[] {
  if (!progressStore.has(userId)) {
    progressStore.set(userId, []);
  }
  return progressStore.get(userId)!;
}

export const registerVocabularyRoutes = (
  app: Express,
  service: VocabularyLookupService,
  rateLimiter: RequestHandler,
  requireBackendAuth: RequestHandler
): void => {
  app.get(
    '/api/vocabulary/lookup',
    rateLimiter,
    validateQuery(VocabularyLookupQuerySchema),
    async (request: Request, response: Response, next: NextFunction) => {
      try {
        const query = request.validatedQuery as unknown as VocabularyLookupQuery;
        const cacheKey = `vocab:${query.word}`;
        const { value: result, fromCache } = await getOrSet(cacheKey, 21600, () =>
          service.lookup(query)
        );
        response.json({ ...result, cached: fromCache });
      } catch (error) {
        next(error);
      }
    }
  );

  app.post(
    '/api/vocabulary/:id/progress',
    requireBackendAuth,
    validateBody(ProgressBodySchema),
    async (request: Request, response: Response, next: NextFunction) => {
      try {
        const userId = request.auth?.userId;
        if (!userId) throw new Error('Auth required');

        const wordId = request.params.id as string;
        const { result } = request.validatedBody as {
          result: 'correct' | 'incorrect';
        };

        const now = new Date().toISOString();
        getUserRecords(userId).push({ wordId, result, timestamp: now });

        response.json({
          success: true,
          wordId,
          result,
          updatedAt: now,
          message:
            result === 'correct'
              ? 'Well done! Keep going.'
              : 'No worries, you will get it next time.',
        });
      } catch (error) {
        next(error);
      }
    }
  );

  app.get(
    '/api/vocabulary/stats',
    requireBackendAuth,
    async (request: Request, response: Response, next: NextFunction) => {
      try {
        const userId = request.auth?.userId;
        if (!userId) throw new Error('Auth required');

        const records = getUserRecords(userId);
        const total = records.length;
        const correctCount = records.filter((r) => r.result === 'correct').length;

        // Classify words by performance
        const wordMap = new Map<string, { correct: number; incorrect: number }>();
        for (const r of records) {
          if (!wordMap.has(r.wordId)) wordMap.set(r.wordId, { correct: 0, incorrect: 0 });
          const entry = wordMap.get(r.wordId)!;
          if (r.result === 'correct') entry.correct++;
          else entry.incorrect++;
        }

        let newCount = 0;
        let learning = 0;
        let learned = 0;
        let mastered = 0;
        let struggling = 0;

        for (const [, stats] of wordMap) {
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
          incorrect: records.length - correctCount,
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
};
