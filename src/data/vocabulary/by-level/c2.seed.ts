import type { VocabularyTerm } from '@/features/vocabulary/types/vocabulary.types';

export const loadC2VocabularyTerms = async (): Promise<VocabularyTerm[]> => {
  const res = await fetch('/data/vocabulary/c2.seed.json');
  if (!res.ok) throw new Error(`Failed to load C2 vocabulary: ${res.status}`);
  return res.json() as Promise<VocabularyTerm[]>;
};
