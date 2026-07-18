import type { VocabularyTerm } from '@/features/vocabulary/types/vocabulary.types';

export const loadA1VocabularyTerms = async (): Promise<VocabularyTerm[]> => {
  const res = await fetch('/data/vocabulary/a1.seed.json');
  if (!res.ok) throw new Error(`Failed to load A1 vocabulary: ${res.status}`);
  return res.json() as Promise<VocabularyTerm[]>;
};
