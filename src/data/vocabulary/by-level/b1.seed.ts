import type { VocabularyTerm } from '@/features/vocabulary/types/vocabulary.types';

export const loadB1VocabularyTerms = async (): Promise<VocabularyTerm[]> => {
  const res = await fetch('/data/vocabulary/b1.seed.json');
  if (!res.ok) throw new Error(`Failed to load B1 vocabulary: ${res.status}`);
  return res.json() as Promise<VocabularyTerm[]>;
};
