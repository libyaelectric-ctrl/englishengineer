import { describe, it, expect, beforeEach } from 'vitest';
import { useFeatureFlagsStore } from './feature-flags.store';

describe('Feature Flags Store', () => {
  beforeEach(() => {
    localStorage.clear();
    useFeatureFlagsStore.setState({ flags: {} });
  });

  it('initializes with default flags', () => {
    const { flags } = useFeatureFlagsStore.getState();
    expect(flags).toBeDefined();
    expect(typeof flags).toBe('object');
  });

  it('sets a flag value', () => {
    const { setFlag } = useFeatureFlagsStore.getState();
    setFlag('test-flag', true);
    const { flags } = useFeatureFlagsStore.getState();
    expect(flags['test-flag']).toBe(true);
  });

  it('toggles flag from false to true', () => {
    const { setFlag } = useFeatureFlagsStore.getState();
    setFlag('toggle-test', false);
    setFlag('toggle-test', true);
    const { flags } = useFeatureFlagsStore.getState();
    expect(flags['toggle-test']).toBe(true);
  });

  it('returns false for non-existent flag', () => {
    const enabled = useFeatureFlagsStore
      .getState()
      .isFeatureEnabled('nonexistent');
    expect(enabled).toBe(false);
  });

  it('persists flags to localStorage', () => {
    const { setFlag } = useFeatureFlagsStore.getState();
    setFlag('persist-test', true);
    const stored = localStorage.getItem('feature-flags');
    expect(stored).toBeTruthy();
    if (stored) {
      const parsed = JSON.parse(stored);
      expect(parsed.state.flags['persist-test']).toBe(true);
    }
  });
});
