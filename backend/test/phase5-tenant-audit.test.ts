import assert from 'node:assert/strict';
import { afterEach, describe, test } from 'node:test';

import { getAuditLogStatus, initAuditLog, isAuditLogReady, auditLog } from '../src/audit-log.js';
import { ApiError } from '../src/errors.js';
import {
  requireTenantContext,
  setTenantAccessVerifierForTests,
  validateTenantAccess,
} from '../src/middleware/tenant.middleware.js';

const tenantId = '11111111-1111-4111-8111-111111111111';
const userId = '22222222-2222-4222-8222-222222222222';
const originalNodeEnv = process.env.NODE_ENV;
const originalSupabaseUrl = process.env.SUPABASE_URL;
const originalServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

afterEach(() => {
  process.env.NODE_ENV = 'test';
  setTenantAccessVerifierForTests(null);
  if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = originalNodeEnv;
  if (originalSupabaseUrl === undefined) delete process.env.SUPABASE_URL;
  else process.env.SUPABASE_URL = originalSupabaseUrl;
  if (originalServiceRole === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  else process.env.SUPABASE_SERVICE_ROLE_KEY = originalServiceRole;
});

describe('Phase 5 tenant authorization', () => {
  test('uses the persistent verifier decision and propagates the membership role', async () => {
    process.env.NODE_ENV = 'test';
    setTenantAccessVerifierForTests(async (receivedTenantId, receivedUserId) => {
      assert.equal(receivedTenantId, tenantId);
      assert.equal(receivedUserId, userId);
      return { allowed: true, role: 'manager' };
    });

    const request = {
      headers: { 'x-engineeros-org-id': tenantId },
      auth: { userId },
      body: {},
    } as never;
    let nextError: unknown;
    let nextCalls = 0;
    await requireTenantContext(request, {} as never, (error?: unknown) => {
      nextCalls += 1;
      nextError = error;
    });

    assert.equal(nextError, undefined);
    assert.equal(nextCalls, 1);
    assert.equal((request as { tenantId?: string }).tenantId, tenantId);
    assert.equal(
      (request as { tenantConfig?: { memberRole?: string } }).tenantConfig?.memberRole,
      'manager'
    );
  });

  test('fails with tenant_access_denied for a non-member', async () => {
    process.env.NODE_ENV = 'test';
    setTenantAccessVerifierForTests(async () => ({ allowed: false, reason: 'not a member' }));
    const request = {
      headers: { 'x-engineeros-org-id': tenantId },
      auth: { userId },
      body: {},
    } as never;
    let nextError: unknown;
    await requireTenantContext(request, {} as never, (error?: unknown) => {
      nextError = error;
    });
    assert.ok(nextError instanceof ApiError);
    assert.equal(nextError.status, 403);
    assert.equal(nextError.code, 'tenant_access_denied');
  });

  test('fails closed in production when persistent authorization is not configured', async () => {
    process.env.NODE_ENV = 'production';
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    await assert.rejects(
      () => validateTenantAccess(tenantId, userId),
      (error: unknown) => {
        assert.ok(error instanceof ApiError);
        assert.equal(error.status, 503);
        assert.equal(error.code, 'tenant_authorization_unavailable');
        return true;
      }
    );
  });
});

describe('Phase 5 audit readiness', () => {
  test('marks production unhealthy and blocks audited actions without remote storage', async () => {
    await assert.rejects(() => initAuditLog({ environment: 'production', workspace: {} }));
    assert.deepEqual(getAuditLogStatus(), {
      status: 'failed',
      required: true,
      lastError: 'Remote audit storage is not configured.',
    });
    assert.equal(isAuditLogReady(), false);
    assert.throws(
      () => auditLog({ action: 'test_action', userId, severity: 'info' }),
      (error: unknown) =>
        error instanceof ApiError && error.status === 503 && error.code === 'audit_log_unavailable'
    );
  });

  test('allows explicit disabled local audit mode outside production', async () => {
    await initAuditLog({ environment: 'test', workspace: {} });
    assert.equal(getAuditLogStatus().status, 'disabled');
    assert.equal(isAuditLogReady(), true);
  });
});
