import type { VocabularyTerm } from '@/features/vocabulary/types/vocabulary.types';

export const loadA2VocabularyTerms = async (): Promise<VocabularyTerm[]> => {
  const res = await fetch('/data/vocabulary/a2.seed.json');
  if (!res.ok) throw new Error(`Failed to load A2 vocabulary: ${res.status}`);
  return res.json() as Promise<VocabularyTerm[]>;
};
