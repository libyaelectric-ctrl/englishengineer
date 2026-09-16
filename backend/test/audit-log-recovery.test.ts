import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { auditLog, getAuditLogStatus, initAuditLog } from '../src/audit-log.js';
import { ApiError } from '../src/errors.js';
import type { WorkspaceConfig } from '../types.js';

// The recovery attempt is throttled by a module-level cooldown, so a test that
// wants to observe that attempt must not have made a recent one. The route-level
// counterpart of this defect therefore lives in its own file
// (billing-checkout-recovery.test.ts), where the cooldown starts fresh.

// Port 9 (discard) on loopback: if the injected fetch were ignored the client
// would fall back to global fetch and fail fast instead of reaching the
// network, so every assertion below is hermetic.
const DEAD_URL = 'http://127.0.0.1:9';

const SUPABASE_STUB: WorkspaceConfig = {
  configured: true,
  supabaseUrl: DEAD_URL,
  supabaseServiceRoleKey: 'test-service-role-key',
};

const json = (body: string, status: number): Response =>
  new Response(body, {
    status,
    headers: { 'content-type': 'application/json', 'content-range': '0-0/0' },
  });

const isAuditUnavailable = (error: unknown): boolean =>
  error instanceof ApiError && error.status === 503 && error.code === 'audit_log_unavailable';

describe('audit log survives a transient remote failure', () => {
  it('accepts the next audit write once the remote recovers', async () => {
    let writes = 0;
    const impl = (async (_input: string | URL | Request, init?: RequestInit) => {
      const method = (init?.method ?? 'GET').toUpperCase();
      if (method !== 'POST') return json('[]', 200);
      writes += 1;
      // The first write hits a transient remote error; every later write
      // succeeds, exactly as it would after a Supabase blip or cold start.
      return writes === 1 ? json('{"message":"connection reset"}', 503) : json('[]', 201);
    }) as typeof fetch;

    await initAuditLog({ environment: 'production', workspace: { ...SUPABASE_STUB } }, impl);
    assert.equal(getAuditLogStatus().status, 'ready');

    // 1. The failing write still fails closed — billing must not proceed
    //    without an audit trail.
    await assert.rejects(
      () => auditLog({ action: 'checkout_created', userId: undefined }),
      isAuditUnavailable
    );

    // 2. The remote is healthy again. Because production audit logging is
    //    required, billing checkout is the caller that must not stay wedged:
    //    a permanently failed audit state turns every later checkout into a
    //    503 and the customer is told to "try again in a few minutes" forever.
    await auditLog({ action: 'checkout_created', userId: undefined });

    assert.equal(writes, 2, 'the recovered write reached the remote');
    assert.equal(getAuditLogStatus().status, 'ready');
  });

  it('still fails closed while the remote stays broken', async () => {
    let writes = 0;
    const impl = (async (_input: string | URL | Request, init?: RequestInit) => {
      const method = (init?.method ?? 'GET').toUpperCase();
      if (method !== 'POST') return json('[]', 200);
      writes += 1;
      return json('{"message":"still down"}', 503);
    }) as typeof fetch;

    await initAuditLog({ environment: 'production', workspace: { ...SUPABASE_STUB } }, impl);

    for (let attempt = 0; attempt < 3; attempt += 1) {
      await assert.rejects(
        () => auditLog({ action: 'checkout_created', userId: undefined }),
        isAuditUnavailable
      );
    }

    assert.equal(getAuditLogStatus().status, 'failed');
    assert.ok(writes >= 1, 'the remote was actually attempted');
  });
});
