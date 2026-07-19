import type { VocabularyMenuProgress } from '../services/vocabulary.menu';
import {
  isLeechWord,
  isVocabularyForgotten,
  isVocabularyProgressDue,
} from '../services/vocabulary.menu';

export interface PrioritizedWord {
  wordId: string;
  priority: number;
  reason: 'leech' | 'forgotten' | 'weak' | 'due' | 'new' | 'maintenance';
}

const PRIORITY = {
  LEECH: 100,
  FORGOTTEN: 80,
  WEAK: 60,
  DUE: 40,
  NEW: 20,
  MAINTENANCE: 10,
} as const;

export const calculateWordPriority = (
  wordId: string,
  progress: VocabularyMenuProgress | undefined,
  now = new Date()
): PrioritizedWord => {
  if (!progress) {
    return { wordId, priority: PRIORITY.NEW, reason: 'new' };
  }

  if (isLeechWord(progress)) {
    return { wordId, priority: PRIORITY.LEECH, reason: 'leech' };
  }

  if (isVocabularyForgotten(progress, now)) {
    return { wordId, priority: PRIORITY.FORGOTTEN, reason: 'forgotten' };
  }

  if (progress.isWeak) {
    return { wordId, priority: PRIORITY.WEAK, reason: 'weak' };
  }

  if (isVocabularyProgressDue(progress, now)) {
    return { wordId, priority: PRIORITY.DUE, reason: 'due' };
  }

  if (progress.status === 'Mastered') {
    return { wordId, priority: PRIORITY.MAINTENANCE, reason: 'maintenance' };
  }

  return { wordId, priority: PRIORITY.NEW, reason: 'new' };
};

export const prioritizeWords = (
  wordIds: string[],
  progressMap: Record<string, VocabularyMenuProgress>,
  now = new Date(),
  limit?: number
): PrioritizedWord[] => {
  const prioritized = wordIds
    .map((id) => calculateWordPriority(id, progressMap[id], now))
    .sort((a, b) => b.priority - a.priority);

  return limit ? prioritized.slice(0, limit) : prioritized;
};

export const getSessionPriorityLabel = (
  reason: PrioritizedWord['reason']
): string => {
  switch (reason) {
    case 'leech':
      return 'Spaced recovery — this word keeps slipping; review it first.';
    case 'forgotten':
      return 'Long gap since last review — re-establish the memory link.';
    case 'weak':
      return 'Recent errors indicate fragile recall.';
    case 'due':
      return 'Scheduled review is ready.';
    case 'new':
      return 'First encounter — build the initial memory trace.';
    case 'maintenance':
      return 'Periodic check to keep mastered material active.';
  }
};
