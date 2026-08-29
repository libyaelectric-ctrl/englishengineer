import { getCachedSeed, setCachedSeed } from '@/shared/utils/indexed-db';

import type { CefrLevel } from '@/features/level-system';
import type { VocabularyTerm } from '@/features/vocabulary/types/vocabulary.types';

/**
 * Runtime-fetch vocabulary loader. Each level's seed data is served as
 * static JSON from public/data/vocabulary/ and fetched on demand; large
 * levels are split into shards that download in parallel. Results are
 * merged in order and cached in IndexedDB for offline access.
 */
const LEVEL_SHARDS: Partial<Record<CefrLevel, number>> = { B1: 4 };

export const loadVocabularyByLevel = async (level: CefrLevel): Promise<VocabularyTerm[]> => {
  const cacheKey = `vocab_seed_${level.toLowerCase()}`;
  const cached = await getCachedSeed<VocabularyTerm[]>(cacheKey);
  if (cached && cached.length > 0) {
    return cached;
  }

  try {
    const slug = level.toLowerCase();
    const shardCount = LEVEL_SHARDS[level] ?? 1;
    const shardUrls = Array.from({ length: shardCount }, (_, shard) =>
      shard === 0
        ? `/data/vocabulary/${slug}.seed.json`
        : `/data/vocabulary/${slug}.seed-${shard}.json`
    );

    const parts = await Promise.all(
      shardUrls.map(async (url) => {
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`Failed to load vocabulary shard ${url}: ${res.status}`);
        }
        return (await res.json()) as VocabularyTerm[];
      })
    );
    const terms = parts.flat();

    if (terms.length > 0) {
      void setCachedSeed(cacheKey, terms);
    }
    return terms;
  } catch (e) {
    console.warn(`Failed to load vocabulary for ${level}:`, e);
    return [];
  }
};
