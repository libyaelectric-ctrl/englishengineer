import type { CefrLevel } from '@/features/level-system';
import type { GrammarRule } from '@/features/grammar/grammar.types';

export const loadGrammarRulesByLevel = async (
  level: CefrLevel
): Promise<GrammarRule[]> => {
  switch (level) {
    case 'A1':
      return (await import('./by-level/a1.seed')).A1_GRAMMAR_RULES;
    case 'A2':
      return (await import('./by-level/a2.seed')).A2_GRAMMAR_RULES;
    case 'B1':
      return (await import('./by-level/b1.seed')).B1_GRAMMAR_RULES;
    case 'B2':
      return (await import('./by-level/b2.seed')).B2_GRAMMAR_RULES;
    case 'C1':
      return (await import('./by-level/c1.seed')).C1_GRAMMAR_RULES;
    case 'C2':
      return (await import('./by-level/c2.seed')).C2_GRAMMAR_RULES;
  }
};
