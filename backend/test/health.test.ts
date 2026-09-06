import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createBackendConfig, toPublicHealth } from '../src/config.js';

type BackendConfig = ReturnType<typeof createBackendConfig>;

describe('health endpoint', () => {
  const config = {
    version: '4.0.1',
    environment: 'test',
    ai: { configured: true },
    billing: { configured: true },
    stripe: { configured: true },
    supabase: { configured: true },
    rateLimit: { storeMode: 'upstash' },
    auth: { firebaseProjectId: 'demo-project' },
  } as unknown as BackendConfig;

  it('returns ok true with version when all critical services configured', () => {
    const health = toPublicHealth(config);
    assert.equal(health.ok, true);
    assert.equal(health.status, 'ok');
    assert.equal(health.version, '4.0.1');
  });

  it('returns degraded when AI not configured', () => {
    const testConfig = {
      ...config,
      ai: { configured: false },
    } as unknown as BackendConfig;
    const health = toPublicHealth(testConfig);
    assert.equal(health.ok, false);
    assert.equal(health.status, 'degraded');
  });

  it('returns degraded when Supabase not configured', () => {
    const testConfig = { ...config, supabase: { configured: false } };
    const health = toPublicHealth(testConfig);
    assert.equal(health.ok, false);
    assert.equal(health.status, 'degraded');
  });

  it('reports checks object with service status', () => {
    const health = toPublicHealth(config);
    assert.deepEqual(health.checks, {
      ai: { configured: true },
      billing: { configured: true },
      supabase: { configured: true },
      rateLimit: { configured: true },
      auth: { configured: true, firebaseProjectId: 'demo-project' },
    });
  });

  it('reports environment', () => {
    const health = toPublicHealth(config);
    assert.equal(health.environment, 'test');
  });

  it('reports the configured firebase project id (not a secret, matches frontend .env)', () => {
    const health = toPublicHealth(config);
    assert.equal(health.checks.auth.firebaseProjectId, 'demo-project');
  });

  it('reports auth as unconfigured with a null project id when nothing is set', () => {
    const testConfig = {
      ...config,
      auth: { firebaseProjectId: null },
    } as unknown as BackendConfig;
    const health = toPublicHealth(testConfig);
    assert.equal(health.checks.auth.configured, false);
    assert.equal(health.checks.auth.firebaseProjectId, null);
  });

  it('does not expose secrets', () => {
    const health = toPublicHealth(config);
    const json = JSON.stringify(health);
    assert.ok(!json.includes('secret'));
    assert.ok(!json.includes('service_role'));
    assert.ok(!json.includes('api_key'));
  });
});
