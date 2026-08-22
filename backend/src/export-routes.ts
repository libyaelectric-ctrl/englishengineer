import { type Request, type Response, Router } from 'express';

const router = Router();

router.get('/export/user-data', async (req: Request, res: Response) => {
  const userId = req.auth?.userId;
  if (!userId) return res.status(401).json({ error: 'unauthorized' });

  const format = (req.query.format as 'json' | 'csv') || 'json';

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

export default router;
