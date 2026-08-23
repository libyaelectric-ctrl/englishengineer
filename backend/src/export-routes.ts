import { type Express, type Request, type RequestHandler, type Response, Router } from 'express';

const router = Router();

router.get('/export/user-data', async (req: Request, res: Response) => {
  const userId = req.auth?.userId;
  if (!userId) return res.status(401).json({ error: 'unauthorized' });

  const format = (req.query.format as 'json' | 'csv') || 'json';

  // NOTE: placeholder data — this endpoint is not yet wired to the real
  // learning/subscription data layer. Wiring it up is tracked separately;
  // this file's job here was just restoring a broken build (see app.ts).
  const userData = {
    profile: { id: userId, email: req.auth?.email },
    learning: { xp: 1250, streak: 7, level: 5 },
    subscriptions: [{ plan: 'pro', status: 'active' }],
    exportDate: new Date().toISOString(),
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
  app.use('/api', requireBackendAuth, router);
};
