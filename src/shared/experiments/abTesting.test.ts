import { describe, expect, it } from 'vitest';

import { assignVariant } from './abTesting';

describe('abTesting', () => {
  it('assigns deterministically for the same user', () => {
    const first = assignVariant('quizFeedbackStyle', 'user-7');
    expect(first).not.toBeNull();
    expect(assignVariant('quizFeedbackStyle', 'user-7')).toBe(first);
  });

  it('only returns registered variants', () => {
    for (let i = 0; i < 100; i += 1) {
      const variant = assignVariant('landingHeroCopy', `user-${i}`);
      if (variant !== null) {
        expect(['control', 'treatment']).toContain(variant);
      }
    }
  });

  it('returns null for unknown experiments', () => {
    expect(assignVariant('notAnExperiment' as never, 'user-1')).toBeNull();
  });
});
