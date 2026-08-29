import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  FEATURE_FLAGS,
  getFlagDetail,
  hashBucket,
  isFeatureEnabled,
  listFlags,
} from './featureFlags';

describe('featureFlags', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('enables default-on flags at 100% rollout', () => {
    expect(isFeatureEnabled('betaFeedbackWidget', 'user-1')).toBe(true);
  });

  it('buckets deterministically for the same user', () => {
    const first = getFlagDetail('commandPalette', 'user-42').bucket;
    expect(getFlagDetail('commandPalette', 'user-42').bucket).toBe(first);
  });

  it('keeps buckets within 0-99', () => {
    for (let i = 0; i < 200; i += 1) {
      const bucket = hashBucket('flag', `user-${i}`);
      expect(bucket).toBeGreaterThanOrEqual(0);
      expect(bucket).toBeLessThanOrEqual(99);
    }
  });

  it('reads env overrides and reports the source', () => {
    vi.stubEnv('VITE_FLAG_BETA_FEEDBACK_WIDGET', 'false');
    expect(getFlagDetail('betaFeedbackWidget', 'user-1')).toMatchObject({
      enabled: false,
      source: 'env',
    });
    vi.stubEnv('VITE_FLAG_MASCOT_ENGAGEMENT', 'true');
    expect(getFlagDetail('mascotEngagement', 'user-1')).toMatchObject({
      enabled: true,
      source: 'env',
    });
  });

  it('returns false for unknown flags', () => {
    expect(isFeatureEnabled('notAFlag' as never, 'user-1')).toBe(false);
  });

  it('lists every registered flag', () => {
    expect(
      listFlags('user-1')
        .map((f) => f.key)
        .sort()
    ).toEqual(Object.keys(FEATURE_FLAGS).sort());
  });
});
