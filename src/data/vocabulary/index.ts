import type { CefrLevel } from '@/features/level-system';
import type { VocabularyTerm } from '@/features/vocabulary/types/vocabulary.types';
import { getCachedSeed, setCachedSeed } from '@/shared/utils/indexed-db';

export const loadVocabularyByLevel = async (
  level: CefrLevel
): Promise<VocabularyTerm[]> => {
  const cacheKey = `vocab_seed_${level.toLowerCase()}`;
  const cached = await getCachedSeed<VocabularyTerm[]>(cacheKey);
  if (cached && cached.length > 0) {
    return cached;
  }

  let terms: VocabularyTerm[] = [];
  switch (level) {
    case 'A1':
      terms = await (await import('./by-level/a1.seed')).loadA1VocabularyTerms();
      break;
    case 'A2':
      terms = await (await import('./by-level/a2.seed')).loadA2VocabularyTerms();
      break;
    case 'B1':
      terms = await (await import('./by-level/b1.seed')).loadB1VocabularyTerms();
      break;
    case 'B2':
      terms = await (await import('./by-level/b2.seed')).loadB2VocabularyTerms();
      break;
    case 'C1':
      terms = await (await import('./by-level/c1.seed')).loadC1VocabularyTerms();
      break;
    case 'C2':
      terms = await (await import('./by-level/c2.seed')).loadC2VocabularyTerms();
      break;
  }

  if (terms.length > 0) {
    void setCachedSeed(cacheKey, terms);
  }
  return terms;
};
