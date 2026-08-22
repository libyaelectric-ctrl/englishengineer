import { type Request, type Response, Router } from 'express';

const router = Router();

interface AnalyticsEvent {
  event: string;
  userId?: string;
  properties?: Record<string, unknown>;
  timestamp: string;
}

const events: AnalyticsEvent[] = [];

router.post('/analytics/event', (req: Request, res: Response) => {
  const event: AnalyticsEvent = {
    event: req.body.event,
    userId: req.body.userId,
    properties: req.body.properties,
    timestamp: new Date().toISOString(),
  };
  events.push(event);
  if (events.length > 10000) events.shift();
  res.json({ success: true });
});

router.get('/analytics/events', (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 100;
  res.json(events.slice(-limit));
});

export default router;
