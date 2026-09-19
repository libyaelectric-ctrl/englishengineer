import { logger } from '@/shared/logger';
import type { VocabularyTerm } from '@/shared/types/vocabulary.types';
import { fetchSeedJson } from '@/shared/utils/data-source';
import { getCachedSeed, setCachedSeed } from '@/shared/utils/indexed-db';

import type { CefrLevel } from '@/features/level-system';

/**
 * Runtime-fetch vocabulary loader. Each level's seed data is served as
 * static JSON from the Storage CDN (`VITE_DATA_CDN_URL`) and fetched on
 * demand; large levels are split into shards that download in parallel.
 * Results are merged in order and cached in IndexedDB for offline access.
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
    const shardPaths = Array.from({ length: shardCount }, (_, shard) =>
      shard === 0
        ? `/data/vocabulary/${slug}.seed.json`
        : `/data/vocabulary/${slug}.seed-${shard}.json`
    );

    const parts = await Promise.all(
      shardPaths.map((path) => fetchSeedJson<VocabularyTerm[]>(path, `${level} vocabulary`))
    );
    const terms = parts.flat();

    if (terms.length > 0) {
      void setCachedSeed(cacheKey, terms);
    }
    return terms;
  } catch (e) {
    logger.w(`Failed to load vocabulary for ${level}:`, e);
    return [];
  }
};
