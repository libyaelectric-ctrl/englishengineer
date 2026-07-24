import type { CefrLevel } from '@/features/level-system';
import type { GrammarRule } from '@/features/grammar/grammar.types';
import { getCachedSeed, setCachedSeed } from '@/shared/utils/indexed-db';

export const loadGrammarRulesByLevel = async (
  level: CefrLevel
): Promise<GrammarRule[]> => {
  const cacheKey = `grammar_seed_${level.toLowerCase()}`;
  const cached = await getCachedSeed<GrammarRule[]>(cacheKey);
  if (cached && cached.length > 0) {
    return cached;
  }

  let rules: GrammarRule[] = [];
  switch (level) {
    case 'A1':
      rules = await (await import('./by-level/a1.seed')).loadA1GrammarRules();
      break;
    case 'A2':
      rules = await (await import('./by-level/a2.seed')).loadA2GrammarRules();
      break;
    case 'B1':
      rules = await (await import('./by-level/b1.seed')).loadB1GrammarRules();
      break;
    case 'B2':
      rules = await (await import('./by-level/b2.seed')).loadB2GrammarRules();
      break;
    case 'C1':
      rules = await (await import('./by-level/c1.seed')).loadC1GrammarRules();
      break;
    case 'C2':
      rules = await (await import('./by-level/c2.seed')).loadC2GrammarRules();
      break;
  }

  if (rules.length > 0) {
    void setCachedSeed(cacheKey, rules);
  }
  return rules;
};
