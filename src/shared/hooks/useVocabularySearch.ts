import Fuse from 'fuse.js';

import { useMemo } from 'react';

interface VocabularyTerm {
  id: string;
  term: string;
  definition: string;
  category: string;
  domain: string;
  cefrLevel: string;
  partOfSpeech: string;
}

export function useVocabularySearch(
  terms: VocabularyTerm[],
  query: string,
  filters: { level?: string; category?: string } = {}
) {
  return useMemo(() => {
    let filtered = terms;

    if (filters.level) {
      filtered = filtered.filter((t) => t.cefrLevel === filters.level);
    }
    if (filters.category) {
      filtered = filtered.filter((t) => t.category === filters.category);
    }

    if (!query.trim()) return filtered;

    const fuse = new Fuse(filtered, {
      keys: ['term', 'definition', 'category', 'domain'],
      threshold: 0.4,
      includeScore: true,
    });

    return fuse.search(query).map((r) => r.item);
  }, [terms, query, filters.level, filters.category]);
}
