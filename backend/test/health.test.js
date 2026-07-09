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
  };

  it('returns ok true with version', () => {
    const health = toPublicHealth(config);
    assert.equal(health.ok, true);
    assert.equal(health.version, '4.0.1');
  });

  it('reports AI configuration', () => {
    const health = toPublicHealth(config);
    assert.equal(health.aiConfigured, true);
  });

  it('reports Stripe configuration', () => {
    const health = toPublicHealth(config);
    assert.equal(health.stripeConfigured, true);
  });

  it('reports environment', () => {
    const health = toPublicHealth(config);
    assert.equal(health.environment, 'test');
  });
});
