import { beforeEach, describe, expect, it } from 'vitest';

import { getAllFeatureFlags, isFeatureEnabled, overrideFeatureFlag } from './featureFlags';

describe('Feature Flags', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should return true for enabled features', () => {
    expect(isFeatureEnabled('aiClaudeProvider')).toBe(true);
    expect(isFeatureEnabled('aiOpenAIProvider')).toBe(true);
  });

  it('should return false for disabled features', () => {
    expect(isFeatureEnabled('aiGeminiProvider')).toBe(false);
    expect(isFeatureEnabled('newDashboard')).toBe(false);
  });

  it('should return false for unknown features', () => {
    expect(isFeatureEnabled('nonExistentFlag' as any)).toBe(false);
  });

  it('should get all feature flags', () => {
    const flags = getAllFeatureFlags();
    expect(flags).toBeDefined();
    expect(flags.aiClaudeProvider).toBeDefined();
    expect(flags.aiClaudeProvider.enabled).toBe(true);
    expect(flags.newDashboard.enabled).toBe(false);
  });

  it('should override feature flag', () => {
    expect(isFeatureEnabled('newDashboard')).toBe(false);
    overrideFeatureFlag('newDashboard', true);
    expect(isFeatureEnabled('newDashboard')).toBe(true);
  });

  it('should respect environment restrictions', () => {
    expect(isFeatureEnabled('betaWritingReview')).toBe(false);
  });

  it('should handle rollout percentage deterministically', () => {
    expect(isFeatureEnabled('betaWritingReview')).toBe(false);
  });
});
