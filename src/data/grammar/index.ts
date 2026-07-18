import type { CefrLevel } from '@/features/level-system';
import type { GrammarRule } from '@/features/grammar/grammar.types';

export const loadGrammarRulesByLevel = async (
  level: CefrLevel
): Promise<GrammarRule[]> => {
  switch (level) {
    case 'A1':
      return (await import('./by-level/a1.seed')).loadA1GrammarRules();
    case 'A2':
      return (await import('./by-level/a2.seed')).loadA2GrammarRules();
    case 'B1':
      return (await import('./by-level/b1.seed')).loadB1GrammarRules();
    case 'B2':
      return (await import('./by-level/b2.seed')).loadB2GrammarRules();
    case 'C1':
      return (await import('./by-level/c1.seed')).loadC1GrammarRules();
    case 'C2':
      return (await import('./by-level/c2.seed')).loadC2GrammarRules();
  }
};
