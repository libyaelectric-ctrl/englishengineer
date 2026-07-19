import { describe, it, expect, beforeEach } from 'vitest';
import { getFeatureFlags, isFeatureEnabled } from './feature-flags';
import type { FeatureFlag } from './feature-flags';

describe('FeatureFlagService', () => {
  let service: ReturnType<typeof getFeatureFlags>;

  beforeEach(() => {
    service = getFeatureFlags();
  });

  it('returns enabled flag for allowed plan', () => {
    expect(service.isEnabled('ai_coaching', { plan: 'pro' })).toBe(true);
  });

  it('returns disabled flag for restricted plan', () => {
    expect(service.isEnabled('writing_practice', { plan: 'free' })).toBe(false);
  });

  it('returns disabled flag when feature is disabled', () => {
    expect(service.isEnabled('team_management', { plan: 'team' })).toBe(false);
  });

  it('handles overrides', () => {
    service.setOverride('ai_coaching', false, 'user123');
    expect(service.isEnabled('ai_coaching', { userId: 'user123' })).toBe(false);
    service.clearOverride('ai_coaching', 'user123');
    expect(service.isEnabled('ai_coaching', { userId: 'user123' })).toBe(true);
  });

  it('returns all flags', () => {
    const flags = service.getAllFlags();
    expect(Object.keys(flags)).toContain('ai_coaching');
    expect(Object.keys(flags)).toContain('vocabulary_system');
  });

  it('isFeatureEnabled works as shorthand', () => {
    expect(isFeatureEnabled('ai_coaching', { plan: 'pro' })).toBe(true);
    expect(isFeatureEnabled('team_management', { plan: 'free' })).toBe(false);
  });
});
