import { describe, expect, it } from 'vitest';
import { ObservabilityService } from './observability.service';

describe('observability readiness', () => {
  it('builds a safe frontend health contract', () => {
    const health = ObservabilityService.getHealthCheck({});

    expect(health.appVersion).toBe('4.0.1');
    expect(health.checks).toMatchObject({
      aiBackendConfigured: false,
      billingBackendConfigured: false,
      supabaseConfigured: false,
      errorMonitoringConfigured: false,
    });
    expect(JSON.stringify(health)).not.toMatch(/secret|service_role/i);
  });

  it('keeps error monitoring optional', () => {
    const config = ObservabilityService.getErrorMonitoringConfig();

    expect(config.provider).toBe('none');
    expect(config.configured).toBe(false);
    expect(config.sampleRate).toBe(0);
  });
});
// @vitest-environment node
