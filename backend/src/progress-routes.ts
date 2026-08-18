import type { Express, NextFunction, Request, RequestHandler, Response } from 'express';

import { ApiError } from './errors.js';

// Simple in-memory store for aggregated progress
const overviewStore = new Map<
  string,
  {
    vocabulary: { total: number; learned: number; mastered: number; struggling: number };
    grammar: { total: number; learned: number; mastered: number; struggling: number };
    reading: { total: number; completed: number; avgScore: number };
    writing: { total: number; submitted: number; avgScore: number };
    listening: { total: number; completed: number; avgScore: number };
    speaking: { total: number; submitted: number; avgScore: number };
    overallLevel: string;
    dailyGoal: { target: number; completed: number };
    weeklyGoal: { target: number; completed: number };
  }
>();

function getOverview(userId: string) {
  if (!overviewStore.has(userId)) {
    overviewStore.set(userId, {
      vocabulary: { total: 120, learned: 74, mastered: 31, struggling: 12 },
      grammar: { total: 85, learned: 52, mastered: 28, struggling: 8 },
      reading: { total: 48, completed: 36, avgScore: 78.5 },
      writing: { total: 24, submitted: 18, avgScore: 72.3 },
      listening: { total: 32, completed: 25, avgScore: 81.2 },
      speaking: { total: 16, submitted: 11, avgScore: 69.8 },
      overallLevel: 'B1',
      dailyGoal: { target: 5, completed: 3 },
      weeklyGoal: { target: 15, completed: 9 },
    });
  }
  return overviewStore.get(userId)!;
}

export const registerProgressRoutes = (
  app: Express,
  progressLimiter: RequestHandler,
  requireBackendAuth?: RequestHandler
): void => {
  app.get(
    '/api/progress/overview',
    ...(requireBackendAuth ? [requireBackendAuth] : []),
    progressLimiter,
    async (request: Request, response: Response, next: NextFunction) => {
      try {
        const userId = request.auth?.userId;
        if (!userId) throw new ApiError(401, 'authentication_required', 'Auth required');

        const overview = getOverview(userId);
        response.json(overview);
      } catch (error) {
        next(error);
      }
    }
  );
};
