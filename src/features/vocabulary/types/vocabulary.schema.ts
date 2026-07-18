import { CEFR_LEVELS } from '@/features/level-system/level-system.types';
import type { VocabularyTerm } from './vocabulary.types';

const hasStringField = (obj: Record<string, unknown>, key: string): boolean =>
  typeof obj[key] === 'string';

const hasArrayField = (obj: Record<string, unknown>, key: string): boolean =>
  Array.isArray(obj[key]);

const hasValidCefrLevel = (level: unknown): level is string =>
  typeof level === 'string' && CEFR_LEVELS.includes(level as any);

const validateVocabularyTermFields = (term: Record<string, unknown>): boolean =>
  hasStringField(term, 'id') &&
  hasStringField(term, 'term') &&
  hasStringField(term, 'normalizedTerm') &&
  hasStringField(term, 'definition') &&
  hasStringField(term, 'status') &&
  hasValidCefrLevel(term.cefrLevel) &&
  hasArrayField(term, 'grammarFits') &&
  hasArrayField(term, 'skillUse');

export const isVocabularyTerm = (value: unknown): value is VocabularyTerm => {
  if (!value || typeof value !== 'object') return false;
  return validateVocabularyTermFields(value as Record<string, unknown>);
};

export const assertVocabularyTerms = (values: unknown[]): VocabularyTerm[] => {
  const invalidIndex = values.findIndex((value) => !isVocabularyTerm(value));
  if (invalidIndex >= 0) {
    throw new Error(`Invalid vocabulary term at index ${invalidIndex}.`);
  }
  return values as VocabularyTerm[];
};
