import { describe, expect, it } from 'vitest';
import { OFFLINE_CAPABILITIES } from './offline.data';
import {
  canUseCapability,
  getCapabilityLabel,
  getOfflineSummary,
} from './offline.helpers';

describe('offline capability rules', () => {
  it('allows bundled content while offline', () => {
    const vocabulary = OFFLINE_CAPABILITIES.find(
      (item) => item.id === 'vocabulary'
    );
    expect(vocabulary && canUseCapability(vocabulary, false)).toBe(true);
  });

  it('blocks backend AI while offline', () => {
    const ai = OFFLINE_CAPABILITIES.find((item) => item.id === 'ai-rewrite');
    expect(ai && canUseCapability(ai, false)).toBe(false);
  });

  it('keeps internet-required tools available when online', () => {
    const billing = OFFLINE_CAPABILITIES.find((item) => item.id === 'billing');
    expect(billing && canUseCapability(billing, true)).toBe(true);
  });

  it('uses honest status labels and counts', () => {
    expect(getCapabilityLabel('limited')).toBe('Limited offline');
    expect(getOfflineSummary(OFFLINE_CAPABILITIES)).toEqual({
      available: 7,
      limited: 2,
      internetRequired: 5,
    });
  });
});
// @vitest-environment node
