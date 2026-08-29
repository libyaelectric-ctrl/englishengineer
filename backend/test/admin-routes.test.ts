import type { Express, NextFunction, Request, Response } from 'express';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { registerAdminRoutes } from '../src/admin-routes.js';

type MockHandler = (req: Request, res: Response, next: NextFunction) => unknown;

interface MockApp {
  get: (path: string, ...handlers: MockHandler[]) => void;
  routes: Record<string, MockHandler[]>;
}

const createMockApp = (): MockApp => {
  const routes: Record<string, MockHandler[]> = {};
  return {
    get: (path: string, ...handlers: MockHandler[]) => {
      // The adapter strips /api prefix and registers on v1Router.
      // normalize so assertions can use the full public path.
      const fullPath = path.startsWith('/api/v1') ? path
        : path.startsWith('/api') ? path.replace('/api', '/api/v1')
        : `/api/v1${path}`;
      routes[`GET ${fullPath}`] = handlers;
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

const createMockRateLimiter = () => async (_req: Request, _res: Response, next: NextFunction) =>
  next();

describe('Admin Routes', () => {
  it('registers stats and audit-logs routes', () => {
    const app = createMockApp();
    registerAdminRoutes(app as unknown as Express, createMockAuth(), createMockRateLimiter());

    assert.ok(app.routes['GET /api/v1/admin/stats']);
    assert.ok(app.routes['GET /api/v1/admin/audit-logs']);
  });

  it('stats endpoint returns performance and system data', async () => {
    const app = createMockApp();
    registerAdminRoutes(app as unknown as Express, createMockAuth(), createMockRateLimiter());

    const handlers = app.routes['GET /api/v1/admin/stats'];
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
    assert.ok(responseBody?.data.performance);
    assert.equal(typeof responseBody?.data.performance.requestCount, 'number');
    assert.ok(responseBody?.data.system);
    assert.equal(typeof responseBody?.data.system.uptime, 'number');
  });

  it('audit-logs endpoint returns audit log entries', async () => {
    const app = createMockApp();
    registerAdminRoutes(app as unknown as Express, createMockAuth(), createMockRateLimiter());

    const handlers = app.routes['GET /api/v1/admin/audit-logs'];
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

  it('audit-logs endpoint respects limit filter', async () => {
    const app = createMockApp();
    registerAdminRoutes(app as unknown as Express, createMockAuth(), createMockRateLimiter());

    const handlers = app.routes['GET /api/v1/admin/audit-logs'];
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
