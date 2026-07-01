import { describe, expect, it } from 'vitest';
import {
  MAIN_NAVIGATION_LABELS,
  NAV_ITEMS,
  SKILL_NAV_ITEMS,
} from './navigation.config';

describe('main navigation configuration', () => {
  it('uses only the five locked main navigation entries', () => {
    expect(MAIN_NAVIGATION_LABELS).toEqual([
      'Home',
      'Learning Hub',
      'Skills',
      'Tools',
      'Profile',
    ]);
  });

  it('keeps all learning skills inside Skills', () => {
    expect(SKILL_NAV_ITEMS.map((item) => item.label)).toEqual([
      'Reading',
      'Writing',
      'Listening',
      'Speaking',
      'Vocabulary',
      'Grammar',
    ]);
  });

  it('does not expose internal or repositioned pages as main entries', () => {
    const labels = NAV_ITEMS.map((item) => item.label);
    expect(labels).not.toEqual(
      expect.arrayContaining([
        'Offline Pack',
        'Beta Program',
        'Gamification',
        'Analytics',
        'AI Copilot',
        'Work Tools',
        'Quick Tools',
      ])
    );
  });
});
