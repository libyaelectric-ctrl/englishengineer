import type { NextFunction, Request, Response } from 'express';
import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';

import { csrfProtection, generateCsrfToken } from '../../src/middleware/csrf.middleware.js';

type MockResponse = {
  statusCode: number;
  cookieArgs: { name: string; value: string; options: Record<string, unknown> } | null;
  statusData: { statusCode: number; body: unknown } | null;
  cookie(name: string, value: string, options: Record<string, unknown>): MockResponse;
  status(code: number): MockResponse;
  json(body: unknown): MockResponse;
};

const createMockRequest = (
  overrides: Partial<{
    method: string;
    path: string;
    headers: Record<string, string>;
  }> = {}
): Request =>
  ({
    method: 'GET',
    path: '/api/whatever',
    headers: {},
    ...overrides,
  }) as unknown as Request;

const createMockResponse = (): MockResponse => {
  const res: MockResponse = {
    statusCode: 200,
    cookieArgs: null,
    statusData: null,
    cookie(_name, _value, _options) {
      res.cookieArgs = { name: _name, value: _value, options: _options };
      return res;
    },
    status(code) {
      res.statusCode = code;
      res.statusData = { statusCode: code, body: undefined };
      return res;
    },
    json(body) {
      if (res.statusData) {
        res.statusData.body = body;
      }
      return res;
    },
  };
  return res;
};

const originalEnv = process.env.NODE_ENV;

afterEach(() => {
  process.env.NODE_ENV = originalEnv;
});

describe('csrfProtection', () => {
  describe('GET requests', () => {
    it('sets csrf cookie when none present', () => {
      process.env.NODE_ENV = 'development';
      const req = createMockRequest({ method: 'GET', path: '/api/data' });
      const res = createMockResponse();
      let called = false;
      const next: NextFunction = () => {
        called = true;
      };

      csrfProtection(req, res as unknown as Response, next);

      assert.equal(called, true);
      assert.ok(res.cookieArgs);
      assert.equal(res.cookieArgs!.name, 'eos_csrf');
      assert.equal(typeof res.cookieArgs!.value, 'string');
      assert.equal(res.cookieArgs!.value.length, 64);
      assert.deepEqual(res.cookieArgs!.options, {
        httpOnly: false,
        secure: false,
        sameSite: 'strict',
        path: '/',
        maxAge: 3600000,
      });
    });

    it('does not overwrite existing csrf cookie', () => {
      process.env.NODE_ENV = 'development';
      const existingToken = generateCsrfToken();
      const req = createMockRequest({
        method: 'GET',
        path: '/api/data',
        headers: { cookie: `eos_csrf=${existingToken}` },
      });
      const res = createMockResponse();
      let called = false;
      const next: NextFunction = () => {
        called = true;
      };

      csrfProtection(req, res as unknown as Response, next);

      assert.equal(called, true);
      assert.equal(res.cookieArgs, null);
    });
  });

  describe('POST requests', () => {
    it('returns 403 when csrf token is missing from both cookie and header', () => {
      process.env.NODE_ENV = 'development';
      const req = createMockRequest({ method: 'POST', path: '/api/data' });
      const res = createMockResponse();
      let called = false;
      const next: NextFunction = () => {
        called = true;
      };

      csrfProtection(req, res as unknown as Response, next);

      assert.equal(called, false);
      assert.equal(res.statusCode, 403);
      assert.deepEqual(res.statusData!.body, {
        error: {
          code: 'csrf_token_missing',
          message: 'CSRF token is required for this request.',
        },
      });
    });

    it('returns 403 when cookie exists but header token is missing', () => {
      process.env.NODE_ENV = 'development';
      const token = generateCsrfToken();
      const req = createMockRequest({
        method: 'POST',
        path: '/api/data',
        headers: { cookie: `eos_csrf=${token}` },
      });
      const res = createMockResponse();
      let called = false;
      const next: NextFunction = () => {
        called = true;
      };

      csrfProtection(req, res as unknown as Response, next);

      assert.equal(called, false);
      assert.equal(res.statusCode, 403);
      assert.equal(
        (res.statusData!.body as { error: { code: string } }).error.code,
        'csrf_token_missing'
      );
    });

    it('returns 403 when header exists but cookie token is missing', () => {
      process.env.NODE_ENV = 'development';
      const token = generateCsrfToken();
      const req = createMockRequest({
        method: 'POST',
        path: '/api/data',
        headers: { 'x-csrf-token': token },
      });
      const res = createMockResponse();
      let called = false;
      const next: NextFunction = () => {
        called = true;
      };

      csrfProtection(req, res as unknown as Response, next);

      assert.equal(called, false);
      assert.equal(res.statusCode, 403);
    });

    it('passes when cookie and header tokens match', () => {
      process.env.NODE_ENV = 'development';
      const token = generateCsrfToken();
      const req = createMockRequest({
        method: 'POST',
        path: '/api/data',
        headers: {
          cookie: `eos_csrf=${token}`,
          'x-csrf-token': token,
        },
      });
      const res = createMockResponse();
      let called = false;
      const next: NextFunction = () => {
        called = true;
      };

      csrfProtection(req, res as unknown as Response, next);

      assert.equal(called, true);
      assert.equal(res.statusCode, 200);
    });

    it('returns 403 when tokens do not match', () => {
      process.env.NODE_ENV = 'development';
      const token1 = generateCsrfToken();
      const token2 = generateCsrfToken();
      const req = createMockRequest({
        method: 'POST',
        path: '/api/data',
        headers: {
          cookie: `eos_csrf=${token1}`,
          'x-csrf-token': token2,
        },
      });
      const res = createMockResponse();
      let called = false;
      const next: NextFunction = () => {
        called = true;
      };

      csrfProtection(req, res as unknown as Response, next);

      assert.equal(called, false);
      assert.equal(res.statusCode, 403);
      assert.equal(
        (res.statusData!.body as { error: { code: string } }).error.code,
        'csrf_token_invalid'
      );
    });
  });

  describe('exempted paths', () => {
    it('bypasses csrf for /api/health on POST', () => {
      process.env.NODE_ENV = 'development';
      const req = createMockRequest({ method: 'POST', path: '/api/health' });
      const res = createMockResponse();
      let called = false;
      const next: NextFunction = () => {
        called = true;
      };

      csrfProtection(req, res as unknown as Response, next);

      assert.equal(called, true);
      assert.equal(res.statusCode, 200);
    });

    it('bypasses csrf for /api/v1/health on POST', () => {
      process.env.NODE_ENV = 'development';
      const req = createMockRequest({ method: 'POST', path: '/api/v1/health' });
      const res = createMockResponse();
      let called = false;
      const next: NextFunction = () => {
        called = true;
      };

      csrfProtection(req, res as unknown as Response, next);

      assert.equal(called, true);
    });

    it('bypasses csrf for /api/webhooks/stripe on POST', () => {
      process.env.NODE_ENV = 'development';
      const req = createMockRequest({ method: 'POST', path: '/api/webhooks/stripe' });
      const res = createMockResponse();
      let called = false;
      const next: NextFunction = () => {
        called = true;
      };

      csrfProtection(req, res as unknown as Response, next);

      assert.equal(called, true);
    });
  });

  describe('timing-safe comparison', () => {
    it('rejects tokens that are close but not identical', () => {
      process.env.NODE_ENV = 'development';
      const base = 'a'.repeat(64);
      const tampered = 'a'.repeat(63) + 'b';
      const req = createMockRequest({
        method: 'POST',
        path: '/api/data',
        headers: {
          cookie: `eos_csrf=${base}`,
          'x-csrf-token': tampered,
        },
      });
      const res = createMockResponse();
      let called = false;
      const next: NextFunction = () => {
        called = true;
      };

      csrfProtection(req, res as unknown as Response, next);

      assert.equal(called, false);
      assert.equal(res.statusCode, 403);
    });

    it('handles non-hex cookie values without throwing', () => {
      process.env.NODE_ENV = 'development';
      const req = createMockRequest({
        method: 'POST',
        path: '/api/data',
        headers: {
          cookie: 'eos_csrf=not-valid-hex!!!',
          'x-csrf-token': 'also-not-valid-hex!!!',
        },
      });
      const res = createMockResponse();
      let called = false;
      const next: NextFunction = () => {
        called = true;
      };

      csrfProtection(req, res as unknown as Response, next);

      assert.equal(called, true);
    });

    it('rejects when cookie is non-hex but header is valid hex', () => {
      process.env.NODE_ENV = 'development';
      const validToken = generateCsrfToken();
      const req = createMockRequest({
        method: 'POST',
        path: '/api/data',
        headers: {
          cookie: 'eos_csrf=not-valid-hex!!!',
          'x-csrf-token': validToken,
        },
      });
      const res = createMockResponse();
      let called = false;
      const next: NextFunction = () => {
        called = true;
      };

      csrfProtection(req, res as unknown as Response, next);

      assert.equal(called, false);
      assert.equal(res.statusCode, 403);
    });
  });

  describe('method handling', () => {
    it('skips validation for PUT without token (exempted path)', () => {
      process.env.NODE_ENV = 'development';
      const req = createMockRequest({ method: 'PUT', path: '/api/health' });
      const res = createMockResponse();
      let called = false;
      const next: NextFunction = () => {
        called = true;
      };

      csrfProtection(req, res as unknown as Response, next);

      assert.equal(called, true);
    });

    it('validates DELETE requests', () => {
      process.env.NODE_ENV = 'development';
      const req = createMockRequest({ method: 'DELETE', path: '/api/data' });
      const res = createMockResponse();
      let called = false;
      const next: NextFunction = () => {
        called = true;
      };

      csrfProtection(req, res as unknown as Response, next);

      assert.equal(called, false);
      assert.equal(res.statusCode, 403);
    });

    it('validates PATCH requests', () => {
      process.env.NODE_ENV = 'development';
      const req = createMockRequest({ method: 'PATCH', path: '/api/data' });
      const res = createMockResponse();
      let called = false;
      const next: NextFunction = () => {
        called = true;
      };

      csrfProtection(req, res as unknown as Response, next);

      assert.equal(called, false);
      assert.equal(res.statusCode, 403);
    });
  });

  describe('NODE_ENV=test bypass', () => {
    it('skips all CSRF checks when NODE_ENV is test', () => {
      process.env.NODE_ENV = 'test';
      const req = createMockRequest({ method: 'POST', path: '/api/data' });
      const res = createMockResponse();
      let called = false;
      const next: NextFunction = () => {
        called = true;
      };

      csrfProtection(req, res as unknown as Response, next);

      assert.equal(called, true);
      assert.equal(res.statusCode, 200);
    });
  });
});

describe('generateCsrfToken', () => {
  it('returns a 64-character hex string', () => {
    const token = generateCsrfToken();
    assert.equal(typeof token, 'string');
    assert.equal(token.length, 64);
    assert.match(token, /^[0-9a-f]{64}$/);
  });

  it('generates unique tokens on each call', () => {
    const token1 = generateCsrfToken();
    const token2 = generateCsrfToken();
    assert.notEqual(token1, token2);
  });
});
