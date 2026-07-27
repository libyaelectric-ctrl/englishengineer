import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { Express, Request, Response, NextFunction } from 'express';
import { registerAdminRoutes } from '../src/admin-routes.js';

type MockHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => unknown;

interface MockApp {
  get: (path: string, ...handlers: MockHandler[]) => void;
  routes: Record<string, MockHandler[]>;
}

const createMockApp = (): MockApp => {
  const routes: Record<string, MockHandler[]> = {};
  return {
    get: (path: string, ...handlers: MockHandler[]) => {
      routes[`GET ${path}`] = handlers;
    },
    routes,
  };
};

const createMockAuth = () => async (req: Request, _res: Response, next: NextFunction) => {
  req.auth = {
    userId: 'admin-user',
    source: 'internal-secret',
    role: 'admin',
  } as unknown as Request['auth'];
  next();
};

const createMockRateLimiter = () => async (
  _req: Request,
  _res: Response,
  next: NextFunction
) => next();

describe('Admin Routes', () => {
  it('registers stats and activity routes', () => {
    const app = createMockApp();
    registerAdminRoutes(
      app as unknown as Express,
      createMockAuth(),
      createMockRateLimiter()
    );

    assert.ok(app.routes['GET /api/admin/stats']);
    assert.ok(app.routes['GET /api/admin/activity']);
  });

  it('stats endpoint returns dashboard data', async () => {
    const app = createMockApp();
    registerAdminRoutes(
      app as unknown as Express,
      createMockAuth(),
      createMockRateLimiter()
    );

    const handlers = app.routes['GET /api/admin/stats'];
    const routeHandler = handlers[3]; // after auth, requireRole, rateLimiter

    const req = {
      auth: { userId: 'admin-user', role: 'admin' },
    } as unknown as Request;
    let responseBody: Record<string, any> | undefined;
    const res = {
      json: (body: Record<string, any>) => {
        responseBody = body;
      },
    } as unknown as Response;
    const next: NextFunction = () => {};

    await routeHandler(req, res, next);
    assert.equal(responseBody?.success, true);
    assert.ok(responseBody?.data);
    assert.equal(typeof responseBody?.data.totalUsers, 'number');
    assert.ok(responseBody?.data.revenue);
    assert.ok(responseBody?.data.system);
  });

  it('activity endpoint returns audit log entries', async () => {
    const app = createMockApp();
    registerAdminRoutes(
      app as unknown as Express,
      createMockAuth(),
      createMockRateLimiter()
    );

    const handlers = app.routes['GET /api/admin/activity'];
    const routeHandler = handlers[4]; // after auth, requireRole, rateLimiter, validateQuery

    const req = {
      auth: { userId: 'admin-user', role: 'admin' },
      validatedQuery: {},
    } as unknown as Request;
    let responseBody: Record<string, any> | undefined;
    const res = {
      json: (body: Record<string, any>) => {
        responseBody = body;
      },
    } as unknown as Response;
    const next: NextFunction = () => {};

    await routeHandler(req, res, next);
    assert.equal(responseBody?.success, true);
    assert.ok(Array.isArray(responseBody?.data));
  });

  it('activity endpoint respects limit filter', async () => {
    const app = createMockApp();
    registerAdminRoutes(
      app as unknown as Express,
      createMockAuth(),
      createMockRateLimiter()
    );

    const handlers = app.routes['GET /api/admin/activity'];
    const routeHandler = handlers[4];

    const req = {
      auth: { userId: 'admin-user', role: 'admin' },
      validatedQuery: { limit: 5 },
    } as unknown as Request;
    let responseBody: Record<string, any> | undefined;
    const res = {
      json: (body: Record<string, any>) => {
        responseBody = body;
      },
    } as unknown as Response;
    const next: NextFunction = () => {};

    await routeHandler(req, res, next);
    assert.equal(responseBody?.success, true);
    assert.ok(responseBody?.data.length <= 5);
  });
});
