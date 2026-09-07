import { type Express, type Request, type RequestHandler, type Response, Router } from 'express';

const router = Router();

router.get('/export/user-data', async (req: Request, res: Response) => {
  const userId = req.auth?.userId;
  if (!userId) return res.status(401).json({ error: 'unauthorized' });

  const format = (req.query.format as 'json' | 'csv') || 'json';

  // TODO: Wire to real Supabase data layer (profile, progress, vocabulary, etc.)
  // The placeholder below returns minimal identifying info for GDPR compliance.
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
