import type { VocabularyTerm } from '@/features/vocabulary/types/vocabulary.types';

export const loadB2VocabularyTerms = async (): Promise<VocabularyTerm[]> => {
  const res = await fetch('/data/vocabulary/b2.seed.json');
  if (!res.ok) throw new Error(`Failed to load B2 vocabulary: ${res.status}`);
  return res.json() as Promise<VocabularyTerm[]>;
};
