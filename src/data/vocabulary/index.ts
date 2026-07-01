import type { CefrLevel } from '@/features/level-system';
import type { VocabularyTerm } from '@/features/vocabulary/vocabulary.types';

export const loadVocabularyByLevel = async (
  level: CefrLevel
): Promise<VocabularyTerm[]> => {
  switch (level) {
    case 'A1':
      return (await import('./by-level/a1.seed')).A1_VOCABULARY_TERMS;
    case 'A2':
      return (await import('./by-level/a2.seed')).A2_VOCABULARY_TERMS;
    case 'B1':
      return (await import('./by-level/b1.seed')).B1_VOCABULARY_TERMS;
    case 'B2':
      return (await import('./by-level/b2.seed')).B2_VOCABULARY_TERMS;
    case 'C1':
      return (await import('./by-level/c1.seed')).C1_VOCABULARY_TERMS;
    case 'C2':
      return (await import('./by-level/c2.seed')).C2_VOCABULARY_TERMS;
  }
};
