import { requireRole } from './middleware/rbac.middleware.js';
import { validateQuery, AdminAuditLogsQuerySchema } from './validation.js';
import { getAuditLogs } from './audit-log.js';
import type {
  Express,
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from 'express';

export const registerAdminRoutes = (
  app: Express,
  requireBackendAuth: RequestHandler,
  rateLimiter: RequestHandler
): void => {
  app.get(
    '/api/admin/stats',
    requireBackendAuth,
    requireRole(['admin']),
    rateLimiter,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const stats = {
          totalUsers: 4,
          activeSubscriptions: 2,
          dailyAiUsage: 15,
          revenue: {
            mrr: 38,
            arr: 456,
            activePlans: { free: 2, pro: 2 },
          },
          system: {
            uptime: process.uptime(),
            memoryUsage: process.memoryUsage(),
            version: '4.0.1',
          },
        };
        res.json({ success: true, data: stats });
      } catch (error) {
        next(error);
      }
    }
  );

  app.get(
    '/api/admin/activity',
    requireBackendAuth,
    requireRole(['admin']),
    rateLimiter,
    validateQuery(AdminAuditLogsQuerySchema),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const filters = {
          userId: req.validatedQuery?.userId || undefined,
          action: req.validatedQuery?.action || undefined,
          since: req.validatedQuery?.since || undefined,
          limit: req.validatedQuery?.limit || 50,
        };
        const logs = await getAuditLogs(filters);
        res.json({ success: true, data: logs });
      } catch (error) {
        next(error);
      }
    }
  );
};
