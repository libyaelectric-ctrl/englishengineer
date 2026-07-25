import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { auditLog, getAuditLogs, AUDIT_ACTIONS } from '../src/audit-log.js';

describe('audit-log', () => {
  it('auditLog returns a record with id and timestamp', () => {
    const record = auditLog({
      action: AUDIT_ACTIONS.AUTH_LOGIN,
      userId: 'user-1',
      details: { method: 'password' },
    });

    assert.ok(record.id.startsWith('audit_'));
    assert.ok(record.timestamp);
    assert.equal(record.action, 'auth_login');
    assert.equal(record.userId, 'user-1');
  });

  it('auditLog stores record retrievable via getAuditLogs', async () => {
    auditLog({
      action: AUDIT_ACTIONS.AI_REQUEST,
      userId: 'user-ai',
      details: { operation: 'evaluateEngineeringEnglish' },
    });

    const logs = await getAuditLogs({ userId: 'user-ai' });
    assert.ok(logs.length > 0);
    assert.equal(logs[logs.length - 1].userId, 'user-ai');
  });

  it('getAuditLogs filters by action', async () => {
    auditLog({ action: AUDIT_ACTIONS.AUTH_SIGNUP, userId: 'user-signup' });
    auditLog({ action: AUDIT_ACTIONS.AUTH_LOGIN, userId: 'user-login' });

    const signupLogs = await getAuditLogs({ action: 'auth_signup' });
    assert.ok(signupLogs.every((l) => l.action === 'auth_signup'));
  });

  it('getAuditLogs applies limit', async () => {
    for (let i = 0; i < 5; i++) {
      auditLog({ action: AUDIT_ACTIONS.AI_REQUEST, userId: `user-${i}` });
    }

    const limited = await getAuditLogs({ limit: 2 });
    assert.ok(limited.length <= 2);
  });

  it('AUDIT_ACTIONS contains all expected action constants', () => {
    assert.equal(AUDIT_ACTIONS.CHECKOUT_CREATED, 'checkout_created');
    assert.equal(AUDIT_ACTIONS.WEBHOOK_RECEIVED, 'webhook_received');
    assert.equal(AUDIT_ACTIONS.AUTH_LOGIN, 'auth_login');
    assert.equal(AUDIT_ACTIONS.AI_REQUEST, 'ai_request');
    assert.equal(AUDIT_ACTIONS.RATE_LIMIT_EXCEEDED, 'rate_limit_exceeded');
    assert.equal(AUDIT_ACTIONS.ADMIN_ACCESS, 'admin_access');
  });
});
