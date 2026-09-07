import type { Express, NextFunction, Request, RequestHandler, Response } from 'express';
import { ApiError } from './errors.js';
import { logger } from './logger.js';

const analyticsUnavailable = (): ApiError => new ApiError(503, 'team_analytics_unavailable', 'Team analytics is unavailable until the persistent analytics repository is configured.');

export const registerTeamAnalyticsRoutes = (app: Express, requireAuth: RequestHandler, rateLimiter: RequestHandler): void => {
  const unavailableHandler = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth?.userId;
      if (!userId) throw new ApiError(401, 'unauthorized', 'Authentication required.');
      logger.info('Team analytics unavailable', { userId, requestId: req.id });
      throw analyticsUnavailable();
    } catch (error) {
      next(error);
    }
  };

  // The app adapter mounts /api/* routes under /api/v1. Registering /api/v1/*
  // here would expose the accidental /api/v1/v1/* path.
  app.get('/api/team/analytics', requireAuth, rateLimiter, unavailableHandler);
  app.get('/api/team/analytics/export', requireAuth, rateLimiter, unavailableHandler);
};
