import { describe, expect, it } from 'vitest';

import { NAV_ITEMS, SKILL_NAV_ITEMS } from './navigation.config';

describe('main navigation configuration', () => {
  it('uses locked main navigation entries', () => {
    expect(NAV_ITEMS.map((item) => item.label)).toEqual([
      'Home',
      'Learning',
      'Skills',
      'Tools',
      'Profile',
      'Team',
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

  it('does not expose internal or repositioned pages as top-level entries', () => {
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
        'Team',
        'Pricing',
        'Translator',
        'Learning Path',
        'Curriculum',
        'Placement Test',
      ])
    );
  });
});
