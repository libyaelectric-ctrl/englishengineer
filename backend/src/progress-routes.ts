import type { Express, NextFunction, Request, RequestHandler, Response } from 'express';
import { ApiError } from './errors.js';

export const registerProgressRoutes = (app: Express, progressLimiter: RequestHandler, requireBackendAuth?: RequestHandler): void => {
  app.get(
    '/api/progress/overview',
    ...(requireBackendAuth ? [requireBackendAuth] : []),
    progressLimiter,
    async (request: Request, _response: Response, next: NextFunction) => {
      try {
        const userId = request.auth?.userId;
        if (!userId) throw new ApiError(401, 'authentication_required', 'Auth required');
        throw new ApiError(503, 'progress_overview_unavailable', 'Progress overview is unavailable until the persistent progress repository is configured.');
      } catch (error) {
        next(error);
      }
    }
  );
};
