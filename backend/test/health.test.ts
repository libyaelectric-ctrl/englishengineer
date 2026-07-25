import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { toPublicHealth } from '../src/config.js';

describe('health endpoint', () => {
  const config = {
    version: '4.0.1',
    environment: 'test',
    ai: { configured: true },
    stripe: { configured: true },
    supabase: { configured: true },
    rateLimit: { storeMode: 'upstash' },
  };

  it('returns ok true with version when all critical services configured', () => {
    const health = toPublicHealth(config);
    assert.equal(health.ok, true);
    assert.equal(health.status, 'ok');
    assert.equal(health.version, '4.0.1');
  });

  it('returns degraded when AI not configured', () => {
    const testConfig = { ...config, ai: { configured: false } };
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
      stripe: { configured: true },
      supabase: { configured: true },
      rateLimit: { configured: true },
    });
  });

  it('reports environment', () => {
    const health = toPublicHealth(config);
    assert.equal(health.environment, 'test');
  });

  it('does not expose secrets', () => {
    const health = toPublicHealth(config);
    const json = JSON.stringify(health);
    assert.ok(!json.includes('secret'));
    assert.ok(!json.includes('service_role'));
    assert.ok(!json.includes('api_key'));
  });
});
