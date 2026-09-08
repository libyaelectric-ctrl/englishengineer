import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { ApiError } from './errors.js';
import { logger } from './logger.js';
import type { RouteRegistrar } from './route-registrar.js';

const analyticsUnavailable = (): ApiError =>
  new ApiError(
    503,
    'team_analytics_unavailable',
    'Team analytics is unavailable until the persistent analytics repository is configured.'
  );

export const registerTeamAnalyticsRoutes = (
  app: RouteRegistrar,
  requireAuth: RequestHandler,
  rateLimiter: RequestHandler
): void => {
  const unavailableHandler = async (
    req: Request,
    _res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.auth?.userId;
      if (!userId) throw new ApiError(401, 'unauthorized', 'Authentication required.');
      logger.info('Team analytics unavailable', { userId, requestId: req.id });
      throw analyticsUnavailable();
    } catch (error) {
      next(error);
    }
  };

  app.get('/api/team/analytics', requireAuth, rateLimiter, unavailableHandler);
  app.get('/api/team/analytics/export', requireAuth, rateLimiter, unavailableHandler);
};
