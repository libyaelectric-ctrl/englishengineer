import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { registerAdminRoutes } from '../src/admin-routes.js';

const createMockApp = () => {
  const routes = {};
  return {
    get: (path, ...handlers) => {
      routes[`GET ${path}`] = handlers;
    },
    routes,
  };
};

const createMockAuth = () => async (req, _res, next) => {
  req.auth = { userId: 'admin-user', source: 'test', role: 'admin' };
  next();
};

const createMockRateLimiter = () => async (_req, _res, next) => next();

describe('Admin Routes', () => {
  it('registers stats and activity routes', () => {
    const app = createMockApp();
    registerAdminRoutes(app, createMockAuth(), createMockRateLimiter());

    assert.ok(app.routes['GET /api/admin/stats']);
    assert.ok(app.routes['GET /api/admin/activity']);
  });

  it('stats endpoint returns dashboard data', async () => {
    const app = createMockApp();
    registerAdminRoutes(app, createMockAuth(), createMockRateLimiter());

    const handlers = app.routes['GET /api/admin/stats'];
    const routeHandler = handlers[3]; // after auth, requireRole, rateLimiter

    const req = { auth: { userId: 'admin-user', role: 'admin' } };
    let responseBody;
    const res = {
      json: (body) => {
        responseBody = body;
      },
    };
    const next = () => {};

    await routeHandler(req, res, next);
    assert.equal(responseBody.success, true);
    assert.ok(responseBody.data);
    assert.equal(typeof responseBody.data.totalUsers, 'number');
    assert.ok(responseBody.data.revenue);
    assert.ok(responseBody.data.system);
  });

  it('activity endpoint returns audit log entries', async () => {
    const app = createMockApp();
    registerAdminRoutes(app, createMockAuth(), createMockRateLimiter());

    const handlers = app.routes['GET /api/admin/activity'];
    const routeHandler = handlers[4]; // after auth, requireRole, rateLimiter, validateQuery

    const req = {
      auth: { userId: 'admin-user', role: 'admin' },
      validatedQuery: {},
    };
    let responseBody;
    const res = {
      json: (body) => {
        responseBody = body;
      },
    };
    const next = () => {};

    await routeHandler(req, res, next);
    assert.equal(responseBody.success, true);
    assert.ok(Array.isArray(responseBody.data));
  });

  it('activity endpoint respects limit filter', async () => {
    const app = createMockApp();
    registerAdminRoutes(app, createMockAuth(), createMockRateLimiter());

    const handlers = app.routes['GET /api/admin/activity'];
    const routeHandler = handlers[4];

    const req = {
      auth: { userId: 'admin-user', role: 'admin' },
      validatedQuery: { limit: 5 },
    };
    let responseBody;
    const res = {
      json: (body) => {
        responseBody = body;
      },
    };
    const next = () => {};

    await routeHandler(req, res, next);
    assert.equal(responseBody.success, true);
    assert.ok(responseBody.data.length <= 5);
  });
});
