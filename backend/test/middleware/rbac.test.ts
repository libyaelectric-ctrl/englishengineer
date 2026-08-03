import type { NextFunction, Request, Response } from 'express';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { requireRole } from '../../src/middleware/rbac.middleware.js';

type MockResponse = Record<string, never>;

const createMockRequest = (auth?: { role?: string; userId?: string }): Request =>
  ({
    auth,
    headers: {},
  }) as unknown as Request;

const mockResponse: MockResponse = {};

describe('requireRole', () => {
  it('allows admin role to pass any role check', () => {
    const req = createMockRequest({ role: 'admin' });
    let called = false;
    const next: NextFunction = () => {
      called = true;
    };

    requireRole(['editor'])(req, mockResponse as unknown as Response, next);

    assert.equal(called, true);
  });

  it('allows matching role to pass', () => {
    const req = createMockRequest({ role: 'editor' });
    let called = false;
    const next: NextFunction = () => {
      called = true;
    };

    requireRole(['editor', 'viewer'])(req, mockResponse as unknown as Response, next);

    assert.equal(called, true);
  });

  it('passes error for non-matching role', () => {
    const req = createMockRequest({ role: 'viewer' });
    let caughtError: (Error & { status?: number; code?: string }) | undefined;
    const next: NextFunction = ((err?: unknown) => {
      caughtError = err as Error & { status?: number; code?: string };
    }) as NextFunction;

    requireRole(['admin', 'editor'])(req, mockResponse as unknown as Response, next);

    assert.ok(caughtError);
    assert.equal(caughtError?.status, 403);
    assert.equal(caughtError?.code, 'forbidden_role');
    assert.match(caughtError!.message, /Requires one of: admin, editor/);
  });

  it('defaults to "user" role when no role set', () => {
    const req = createMockRequest({});
    let caughtError: (Error & { status?: number }) | undefined;
    const next: NextFunction = ((err?: unknown) => {
      caughtError = err as Error & { status?: number };
    }) as NextFunction;

    requireRole(['admin'])(req, mockResponse as unknown as Response, next);

    assert.ok(caughtError);
    assert.equal(caughtError?.status, 403);
  });

  it('handles undefined auth entirely', () => {
    const req = createMockRequest(undefined);
    let caughtError: (Error & { status?: number }) | undefined;
    const next: NextFunction = ((err?: unknown) => {
      caughtError = err as Error & { status?: number };
    }) as NextFunction;

    requireRole(['admin'])(req, mockResponse as unknown as Response, next);

    assert.ok(caughtError);
    assert.equal(caughtError?.status, 403);
  });

  it('rejects when allowedRoles is empty and role is not admin', () => {
    const req = createMockRequest({ role: 'viewer' });
    let caughtError: (Error & { status?: number }) | undefined;
    const next: NextFunction = ((err?: unknown) => {
      caughtError = err as Error & { status?: number };
    }) as NextFunction;

    requireRole([])(req, mockResponse as unknown as Response, next);

    assert.ok(caughtError);
    assert.equal(caughtError?.status, 403);
  });

  it('always allows admin regardless of allowedRoles', () => {
    const req = createMockRequest({ role: 'admin' });
    let called = false;
    const next: NextFunction = () => {
      called = true;
    };

    requireRole([])(req, mockResponse as unknown as Response, next);

    assert.equal(called, true);
  });
});
