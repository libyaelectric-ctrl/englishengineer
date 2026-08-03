import type { Express, NextFunction, Request, RequestHandler, Response } from 'express';

import { getAuditLogs } from './audit-log.js';
import { requireRole } from './middleware/rbac.middleware.js';
import { getPerformanceMetrics } from './performance-monitor.js';
import { AdminAuditLogsQuerySchema, validateQuery } from './validation.js';

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
        const perf = getPerformanceMetrics();
        const stats = {
          performance: {
            requestCount: perf.requestCount,
            errorCount: perf.errorCount,
            errorRate: perf.errorRate,
            avgDuration: perf.avgDuration,
            p95Duration: perf.p95Duration,
            p99Duration: perf.p99Duration,
          },
          system: {
            uptime: process.uptime(),
            memoryUsage: process.memoryUsage(),
            version: process.env.APP_VERSION || '2.4.7',
          },
        };
        res.json({ success: true, data: stats });
      } catch (error) {
        next(error);
      }
    }
  );

  app.get(
    '/api/admin/audit-logs',
    requireBackendAuth,
    requireRole(['admin']),
    rateLimiter,
    validateQuery(AdminAuditLogsQuerySchema),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const filters = {
          userId: (req.validatedQuery?.userId as string) || undefined,
          action: (req.validatedQuery?.action as string) || undefined,
          since: (req.validatedQuery?.since as string) || undefined,
          limit: (req.validatedQuery?.limit as number) || 50,
        };
        const logs = await getAuditLogs(filters);
        res.json({ success: true, data: logs });
      } catch (error) {
        next(error);
      }
    }
  );
};
