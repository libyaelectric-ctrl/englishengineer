import { getCachedSeed, setCachedSeed } from '@/shared/utils/indexed-db';

import type { CefrLevel } from '@/features/level-system';
import type { VocabularyTerm } from '@/features/vocabulary/types/vocabulary.types';

export const loadVocabularyByLevel = async (level: CefrLevel): Promise<VocabularyTerm[]> => {
  const cacheKey = `vocab_seed_${level.toLowerCase()}`;
  const cached = await getCachedSeed<VocabularyTerm[]>(cacheKey);
  if (cached && cached.length > 0) {
    return cached;
  }

  let terms: VocabularyTerm[] = [];
  switch (level) {
    case 'A1':
      terms = (await import('./by-level/a1.seed')).A1_VOCABULARY_TERMS;
      break;
    case 'A2':
      terms = (await import('./by-level/a2.seed')).A2_VOCABULARY_TERMS;
      break;
    case 'B1':
      terms = (await import('./by-level/b1.seed')).B1_VOCABULARY_TERMS;
      break;
    case 'B2':
      terms = (await import('./by-level/b2.seed')).B2_VOCABULARY_TERMS;
      break;
    case 'C1':
      terms = (await import('./by-level/c1.seed')).C1_VOCABULARY_TERMS;
      break;
    case 'C2':
      terms = (await import('./by-level/c2.seed')).C2_VOCABULARY_TERMS;
      break;
  }

  if (terms.length > 0) {
    void setCachedSeed(cacheKey, terms);
  }
  return terms;
};
