// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { CEFR_LEVELS } from '@/features/level-system';
import { GrammarEngine } from './grammar.engine';
import { GrammarRepository } from './grammar.repository';

describe('grammar database integration', () => {
  it('loads 360 unique grammar rules across every CEFR level', async () => {
    const levels = await Promise.all(
      CEFR_LEVELS.map((level) =>
        GrammarRepository.getGrammarRulesByLevel(level)
      )
    );
    const rules = levels.flat();
    expect(rules).toHaveLength(360);
    expect(new Set(rules.map((rule) => rule.id)).size).toBe(360);
    expect(levels.map((rulesAtLevel) => rulesAtLevel.length)).toEqual([
      42, 46, 69, 94, 62, 47,
    ]);
  });

  it('filters repository records by exact CEFR level', async () => {
    const rules = await GrammarRepository.getGrammarRulesByLevel('A1');
    expect(rules.length).toBeGreaterThan(0);
    expect(rules.every((rule) => rule.cefrLevel === 'A1')).toBe(true);
  });

  it('keeps A1 speaking selections at A1', async () => {
    const rules = await GrammarEngine.selectGrammarForTask(
      'speaking',
      'A1',
      'speaking-production'
    );
    expect(rules.length).toBeGreaterThan(0);
    expect(rules.every((rule) => rule.cefrLevel === 'A1')).toBe(true);
  });

  it('uses the requested skill level from an independent profile', async () => {
    const rules = await GrammarEngine.selectGrammarForUserProfile(
      { reading: 'C1', speaking: 'A1' },
      'speaking',
      'speaking-production'
    );
    expect(rules.length).toBeGreaterThan(0);
    expect(rules.some((rule) => ['C1', 'C2'].includes(rule.cefrLevel))).toBe(
      false
    );
  });
});
