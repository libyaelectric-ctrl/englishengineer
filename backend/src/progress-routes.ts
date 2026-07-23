import { ApiError } from './errors.js';
import type { Express, Request, Response, NextFunction } from 'express';

export const registerProgressRoutes = (app: Express): void => {
  app.get(
    '/api/progress/overview',
    async (request: Request, response: Response, next: NextFunction) => {
      try {
        const userId = request.auth?.userId;
        if (!userId)
          throw new ApiError(401, 'authentication_required', 'Auth required');

        response.json({
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
      } catch (error) {
        next(error);
      }
    }
  );
};
