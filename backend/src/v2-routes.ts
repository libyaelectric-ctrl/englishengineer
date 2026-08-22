import { type Request, type Response, Router } from 'express';

const v2Router = Router();

v2Router.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', version: 'v2', timestamp: new Date().toISOString() });
});

v2Router.get('/version', (req: Request, res: Response) => {
  res.json({ api: '2.0.0', deprecated: false, sunset: '2027-12-31' });
});

v2Router.use((req: Request, res: Response, next) => {
  res.setHeader('Deprecation', 'false');
  res.setHeader('Link', '<https://eng-vox.vercel.app/api/v2>; rel="successor-version"');
  next();
});

export default v2Router;
