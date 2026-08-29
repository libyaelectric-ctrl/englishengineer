import { getCachedSeed, setCachedSeed } from '@/shared/utils/indexed-db';

import type { CefrLevel } from '@/features/level-system';
import type { VocabularyTerm } from '@/features/vocabulary/types/vocabulary.types';

/**
 * Runtime-fetch vocabulary loader. Each level's seed data is served as a
 * static JSON file from public/data/vocabulary/ and fetched on demand.
 * Results are cached in IndexedDB for offline access.
 */
export const loadVocabularyByLevel = async (level: CefrLevel): Promise<VocabularyTerm[]> => {
  const cacheKey = `vocab_seed_${level.toLowerCase()}`;
  const cached = await getCachedSeed<VocabularyTerm[]>(cacheKey);
  if (cached && cached.length > 0) {
    return cached;
  }

  const res = await fetch(`/data/vocabulary/${level.toLowerCase()}.seed.json`);
  if (!res.ok) {
    console.warn(`Failed to load vocabulary for ${level}: ${res.status}`);
    return [];
  }

  const terms: VocabularyTerm[] = await res.json();

  if (terms.length > 0) {
    void setCachedSeed(cacheKey, terms);
  }
  return terms;
};
