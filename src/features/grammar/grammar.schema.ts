import { CEFR_LEVELS } from '@/features/level-system/level-system.types';
import type { GrammarRule } from './grammar.types';

const hasStringField = (obj: Record<string, unknown>, key: string): boolean =>
  typeof obj[key] === 'string';

const hasArrayField = (obj: Record<string, unknown>, key: string): boolean =>
  Array.isArray(obj[key]);

const hasValidCefrLevel = (level: unknown): level is string =>
  typeof level === 'string' && CEFR_LEVELS.includes(level as (typeof CEFR_LEVELS)[number]);

const validateGrammarRuleFields = (rule: Record<string, unknown>): boolean =>
  hasStringField(rule, 'id') &&
  hasStringField(rule, 'title') &&
  hasStringField(rule, 'structure') &&
  hasStringField(rule, 'status') &&
  hasValidCefrLevel(rule.cefrLevel) &&
  hasArrayField(rule, 'skillUse') &&
  hasArrayField(rule, 'canGenerateTaskTypes') &&
  hasArrayField(rule, 'domainFit');

export const isGrammarRule = (value: unknown): value is GrammarRule => {
  if (!value || typeof value !== 'object') return false;
  return validateGrammarRuleFields(value as Record<string, unknown>);
};

export const assertGrammarRules = (values: unknown[]): GrammarRule[] => {
  const invalidIndex = values.findIndex((value) => !isGrammarRule(value));
  if (invalidIndex >= 0) {
    throw new Error(`Invalid grammar rule at index ${invalidIndex}.`);
  }
  return values as GrammarRule[];
};
