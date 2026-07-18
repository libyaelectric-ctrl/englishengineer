import type { CefrLevel } from '@/features/level-system';
import type { VocabularyTerm } from '@/features/vocabulary/types/vocabulary.types';

export const loadVocabularyByLevel = async (
  level: CefrLevel
): Promise<VocabularyTerm[]> => {
  switch (level) {
    case 'A1':
      return (await import('./by-level/a1.seed')).loadA1VocabularyTerms();
    case 'A2':
      return (await import('./by-level/a2.seed')).loadA2VocabularyTerms();
    case 'B1':
      return (await import('./by-level/b1.seed')).loadB1VocabularyTerms();
    case 'B2':
      return (await import('./by-level/b2.seed')).loadB2VocabularyTerms();
    case 'C1':
      return (await import('./by-level/c1.seed')).loadC1VocabularyTerms();
    case 'C2':
      return (await import('./by-level/c2.seed')).loadC2VocabularyTerms();
  }
};
