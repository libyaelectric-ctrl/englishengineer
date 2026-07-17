import { CEFR_LEVELS } from '@/features/level-system/level-system.types';
import type { VocabularyTerm } from './vocabulary.types';

export const isVocabularyTerm = (value: unknown): value is VocabularyTerm => {
  if (!value || typeof value !== 'object') return false;
  const term = value as Partial<VocabularyTerm>;
  return (
    typeof term.id === 'string' &&
    typeof term.term === 'string' &&
    typeof term.normalizedTerm === 'string' &&
    typeof term.cefrLevel === 'string' &&
    CEFR_LEVELS.includes(term.cefrLevel) &&
    typeof term.definition === 'string' &&
    Array.isArray(term.grammarFits) &&
    Array.isArray(term.skillUse) &&
    typeof term.status === 'string'
  );
};

export const assertVocabularyTerms = (values: unknown[]): VocabularyTerm[] => {
  const invalidIndex = values.findIndex((value) => !isVocabularyTerm(value));
  if (invalidIndex >= 0) {
    throw new Error(`Invalid vocabulary term at index ${invalidIndex}.`);
  }
  return values as VocabularyTerm[];
};
