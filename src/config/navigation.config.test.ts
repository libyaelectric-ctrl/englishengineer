import { describe, expect, it } from 'vitest';
import {
  MAIN_NAVIGATION_LABELS,
  NAV_ITEMS,
  SKILL_NAV_ITEMS,
} from './navigation.config';

describe('main navigation configuration', () => {
  it('uses locked main navigation entries including Team', () => {
    expect(MAIN_NAVIGATION_LABELS).toEqual([
      'Home',
      'Skills',
      'Progress',
      'Learning Hub',
      'Tools',
      'Team',
      'Profile',
    ]);
  });

  it('keeps all learning skills inside Skills', () => {
    expect(SKILL_NAV_ITEMS.map((item) => item.label)).toEqual([
      'Vocabulary',
      'Grammar',
      'Reading',
      'Writing',
      'Listening',
      'Speaking',
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
