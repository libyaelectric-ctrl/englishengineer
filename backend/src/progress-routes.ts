import type { NextFunction, Request, RequestHandler, Response } from 'express';

import { apiSuccess } from './api-response.js';
import { ApiError } from './errors.js';
import { type ProgressModule, getLearningRepository } from './learning-repository.js';
import type { RouteRegistrar } from './route-registrar.js';
import { aggregateByCategory, averageScore, categorizePerformance } from './utils/stats.js';
import { ListeningScoreBodySchema, ReadingScoreBodySchema, validateBody } from './validation.js';

const READING_CATEGORIES: Record<string, string> = {
  'eng-001': 'mechanical',
  'eng-002': 'civil',
  'eng-003': 'electrical',
  'eng-004': 'chemical',
  'eng-005': 'mechanical',
  'eng-006': 'civil',
  'eng-007': 'electrical',
  'eng-008': 'electrical',
  'eng-009': 'mechanical',
  'eng-010': 'chemical',
};
const LISTENING_CATEGORIES: Record<string, string> = {
  'lst-001': 'professional',
  'lst-002': 'civil',
  'lst-003': 'electrical',
  'lst-004': 'mechanical',
  'lst-005': 'chemical',
  'lst-006': 'civil',
  'lst-007': 'electrical',
  'lst-008': 'professional',
  'lst-009': 'mechanical',
  'lst-010': 'chemical',
};
const userIdFrom = (request: Request): string => {
  const userId = request.auth?.userId;
  if (!userId) throw new ApiError(401, 'authentication_required', 'Auth required');
  return userId;
};
const categoryFor = (module: 'reading' | 'listening', itemId: string): string =>
  (module === 'reading' ? READING_CATEGORIES : LISTENING_CATEGORIES)[itemId] ?? 'general';

const registerScoredProgress = (
  app: RouteRegistrar,
  module: 'reading' | 'listening',
  auth: RequestHandler,
  limiter: RequestHandler
): void => {
  const schema = module === 'reading' ? ReadingScoreBodySchema : ListeningScoreBodySchema;
  app.post(
    `/api/${module}/:id/progress`,
    auth,
    limiter,
    validateBody(schema),
    async (request: Request, response: Response, next: NextFunction) => {
      try {
        const userId = userIdFrom(request);
        const itemId = request.params.id as string;
        const { score = 0 } = request.validatedBody as { score?: number };
        const event = await getLearningRepository().recordProgress({
          userId,
          module,
          itemId,
          result: null,
          score,
          category: categoryFor(module, itemId),
          metadata: {},
        });
        response.json(
          apiSuccess({
            contentId: itemId,
            score,
            status: 'completed',
            updatedAt: event.occurredAt,
          })
        );
      } catch (error) {
        next(error);
      }
    }
  );
};

const registerScoredStats = (
  app: RouteRegistrar,
  module: 'reading' | 'listening',
  auth: RequestHandler
): void => {
  app.get(
    `/api/${module}/stats`,
    auth,
    async (request: Request, response: Response, next: NextFunction) => {
      try {
        const events = await getLearningRepository().listProgress(userIdFrom(request), module);
        const latestByItem = new Map<string, { score: number; category: string }>();
        for (const event of events)
          latestByItem.set(event.itemId, { score: event.score ?? 0, category: event.category });
        const entries = [...latestByItem.values()];
        response.json({
          [module === 'reading' ? 'totalRead' : 'totalListened']: entries.length,
          averageScore: averageScore(entries.map((entry) => entry.score)),
          byCategory: aggregateByCategory(entries),
        });
      } catch (error) {
        next(error);
      }
    }
  );
};

const performanceStats = async (userId: string, module: 'vocabulary' | 'grammar') => {
  const events = await getLearningRepository().listProgress(userId, module);
  const records = events
    .filter(
      (event): event is typeof event & { result: 'correct' | 'incorrect' } => event.result !== null
    )
    .map((event) => ({ itemId: event.itemId, result: event.result }));
  return categorizePerformance(records, 'itemId');
};

const registerAccessStatus = (app: RouteRegistrar, auth: RequestHandler): void => {
  app.get(
    '/api/user/access-status',
    auth,
    async (request: Request, response: Response, next: NextFunction) => {
      try {
        const overview = await getLearningRepository().getOverview(userIdFrom(request));
        const vocabularyLearnedCount = overview.skills.vocabulary.correct;
        const grammarLearnedCount = overview.skills.grammar.correct;
        const readingActivitiesDone = overview.skills.reading.completed;
        const writingActivitiesDone = overview.skills.writing.completed;
        response.json({
          vocabularyLearnedCount,
          grammarLearnedCount,
          readingActivitiesDone,
          writingActivitiesDone,
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

export const registerProgressRoutes = (
  app: RouteRegistrar,
  progressLimiter: RequestHandler,
  requireBackendAuth?: RequestHandler
): void => {
  const auth: RequestHandler = requireBackendAuth ?? ((_request, _response, next) => next());
  registerScoredProgress(app, 'reading', auth, progressLimiter);
  registerScoredProgress(app, 'listening', auth, progressLimiter);
  registerScoredStats(app, 'reading', auth);
  registerScoredStats(app, 'listening', auth);
  registerAccessStatus(app, auth);
  app.get(
    '/api/progress/overview',
    auth,
    progressLimiter,
    async (request: Request, response: Response, next: NextFunction) => {
      try {
        response.json(await getLearningRepository().getOverview(userIdFrom(request)));
      } catch (error) {
        next(error);
      }
    }
  );
};
export const getPersistentPerformanceStats = (
  userId: string,
  module: Extract<ProgressModule, 'vocabulary' | 'grammar'>
) => performanceStats(userId, module);
