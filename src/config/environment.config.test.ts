import { describe, expect, it } from 'vitest';
import {
  isConfiguredPublicUrl,
  validateEnvironment,
} from './environment.config';

describe('environment validation', () => {
  it('keeps local mode usable without production integrations', () => {
    const result = validateEnvironment({});

    expect(result.mode).toBe('local');
    expect(result.safeConfig.aiProvider).toBe('mock');
    expect(result.safeConfig.authProvider).toBe('local');
    expect(result.errors).toEqual([]);
  });

  it('reports safe configuration booleans instead of secret values', () => {
    const result = validateEnvironment({});

    expect(result.safeConfig).toMatchObject({
      appVersion: '4.0.1',
      hasAiProxyUrl: false,
      hasSupabaseUrl: false,
      hasSupabaseAnonKey: false,
      hasBillingApiUrl: false,
    });
  });

  it('treats placeholder integration URLs as unavailable', () => {
    const result = validateEnvironment({
      VITE_AI_PROVIDER: 'backend',
      VITE_AI_PROXY_URL: 'https://your-backend.example.com/api/ai',
      VITE_BILLING_API_URL: 'https://placeholder.example.com',
    });

    expect(result.safeConfig.hasAiProxyUrl).toBe(false);
    expect(result.safeConfig.hasBillingApiUrl).toBe(false);
    expect(result.safeConfig.billingMode).toBe('local-fallback');
  });

  it('accepts local development and real HTTPS service URLs', () => {
    expect(isConfiguredPublicUrl('http://127.0.0.1:3001')).toBe(true);
    expect(isConfiguredPublicUrl('https://api.engineeros.app')).toBe(true);
    expect(isConfiguredPublicUrl('not-a-url')).toBe(false);
  });
});
// @vitest-environment node
