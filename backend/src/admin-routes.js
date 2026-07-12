import { requireRole } from './middleware/rbac.middleware.js';
import { validateQuery, AdminAuditLogsQuerySchema } from './validation.js';
import { getAuditLogs } from './audit-log.js';

export const registerAdminRoutes = (app, requireBackendAuth, rateLimiter) => {
  // Admin dashboard stats
  app.get(
    '/api/admin/stats',
    requireBackendAuth,
    requireRole(['admin']),
    rateLimiter,
    async (req, res, next) => {
      try {
        // In production, these would come from database
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

  // Activity timeline (audit logs)
  app.get(
    '/api/admin/activity',
    requireBackendAuth,
    requireRole(['admin']),
    rateLimiter,
    validateQuery(AdminAuditLogsQuerySchema),
    async (req, res, next) => {
      try {
        const filters = {
          userId: req.validatedQuery.userId || undefined,
          action: req.validatedQuery.action || undefined,
          since: req.validatedQuery.since || undefined,
          limit: req.validatedQuery.limit || 50,
        };
        const logs = await getAuditLogs(filters);
        res.json({ success: true, data: logs });
      } catch (error) {
        next(error);
      }
    }
  );
};
