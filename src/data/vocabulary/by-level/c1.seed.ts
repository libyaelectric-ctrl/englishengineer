import type { VocabularyTerm } from '@/features/vocabulary/types/vocabulary.types';

export const loadC1VocabularyTerms = async (): Promise<VocabularyTerm[]> => {
  const res = await fetch('/data/vocabulary/c1.seed.json');
  if (!res.ok) throw new Error(`Failed to load C1 vocabulary: ${res.status}`);
  return res.json() as Promise<VocabularyTerm[]>;
};
