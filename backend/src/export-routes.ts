import type { Express, Request, RequestHandler, Response } from 'express';

/**
 * Mounts the GDPR data-export routes, matching the (app, requireBackendAuth,
 * config) signature used by the other route registrars in app.ts
 * (registerGrammarRoutes, registerTeamAnalyticsRoutes, etc).
 */
export const registerExportRoutes = (
  app: Express,
  requireBackendAuth: RequestHandler,
  _config?: { workspace?: Record<string, unknown> }
): void => {
  app.get('/api/export/user-data', requireBackendAuth, async (req: Request, res: Response) => {
    const userId = req.auth?.userId;
    if (!userId) return res.status(401).json({ error: 'unauthorized' });

    const format = (req.query.format as 'json' | 'csv') || 'json';

    const userData = {
      profile: { id: userId, email: req.auth?.email },
      exportDate: new Date().toISOString(),
      note: 'Full data export pending Supabase data layer integration.',
    };

    if (format === 'csv') {
      const csv = Object.entries(userData)
        .map(([k, v]) => `${k},${JSON.stringify(v)}`)
        .join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="user-data-${userId}.csv"`);
      return res.send(csv);
    }

    res.setHeader('Content-Disposition', `attachment; filename="user-data-${userId}.json"`);
    res.json(userData);
  });
};
