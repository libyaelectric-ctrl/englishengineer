import { CEFR_LEVELS } from '@/features/level-system/level-system.types';
import type { GrammarRule } from './grammar.types';

export const isGrammarRule = (value: unknown): value is GrammarRule => {
  if (!value || typeof value !== 'object') return false;
  const rule = value as Partial<GrammarRule>;
  return (
    typeof rule.id === 'string' &&
    typeof rule.title === 'string' &&
    typeof rule.cefrLevel === 'string' &&
    CEFR_LEVELS.includes(rule.cefrLevel) &&
    typeof rule.structure === 'string' &&
    Array.isArray(rule.skillUse) &&
    Array.isArray(rule.canGenerateTaskTypes) &&
    Array.isArray(rule.domainFit) &&
    typeof rule.status === 'string'
  );
};

export const assertGrammarRules = (values: unknown[]): GrammarRule[] => {
  const invalidIndex = values.findIndex((value) => !isGrammarRule(value));
  if (invalidIndex >= 0) {
    throw new Error(`Invalid grammar rule at index ${invalidIndex}.`);
  }
  return values as GrammarRule[];
};
