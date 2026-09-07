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
      vocabulary: { total: 0, learned: 0, mastered: 0, struggling: 0 },
      grammar: { total: 0, learned: 0, mastered: 0, struggling: 0 },
      reading: { total: 0, completed: 0, avgScore: 0 },
      writing: { total: 0, submitted: 0, avgScore: 0 },
      listening: { total: 0, completed: 0, avgScore: 0 },
      speaking: { total: 0, submitted: 0, avgScore: 0 },
      overallLevel: 'A1',
      dailyGoal: { target: 5, completed: 0 },
      weeklyGoal: { target: 15, completed: 0 },
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
