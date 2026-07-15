import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { VocabularyService } from '../vocabulary.service';
import type { VocabularyAnswer } from '../vocabulary.types';

export const VOCABULARY_KEYS = {
  all: ['vocabulary'] as const,
  state: () => [...VOCABULARY_KEYS.all, 'state'] as const,
  entries: () => [...VOCABULARY_KEYS.all, 'entries'] as const,
  summary: () => [...VOCABULARY_KEYS.all, 'summary'] as const,
  due: (limit: number) => [...VOCABULARY_KEYS.all, 'due', limit] as const,
};

export function useVocabularyState() {
  return useQuery({
    queryKey: VOCABULARY_KEYS.state(),
    queryFn: () => VocabularyService.getState(),
  });
}

export function useVocabularyEntries() {
  return useQuery({
    queryKey: VOCABULARY_KEYS.entries(),
    queryFn: () => VocabularyService.getEntries(),
  });
}

export function useVocabularySummary() {
  return useQuery({
    queryKey: VOCABULARY_KEYS.summary(),
    queryFn: () => VocabularyService.getSummary(),
  });
}

export function useVocabularyDue(limit = 12) {
  return useQuery({
    queryKey: VOCABULARY_KEYS.due(limit),
    queryFn: () => VocabularyService.getDueEntries(limit),
  });
}

export function useSubmitVocabularyReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (answers: VocabularyAnswer[]) =>
      Promise.resolve(VocabularyService.submitReview(answers)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VOCABULARY_KEYS.all });
    },
  });
}

export function useAddDiscoveredTerms() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (terms: string[]) =>
      Promise.resolve(VocabularyService.addDiscoveredTerms(terms)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VOCABULARY_KEYS.all });
    },
  });
}
