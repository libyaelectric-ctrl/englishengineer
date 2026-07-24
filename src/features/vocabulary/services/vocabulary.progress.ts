export type WordStatus =
  | 'new'
  | 'learned'
  | 'mastered'
  | 'struggling';

export interface WordProgress {
  wordId: string;
  status: WordStatus;
  failCount: number;
  lastPracticedAt: string | null;
  masteredAt: string | null;
}

export const MASTERY_QUIZ_MIN_WORDS = 100;
export const READING_WRITING_UNLOCK_THRESHOLD = 200;

const getTodayKey = (): string => new Date().toISOString().split('T')[0];

export const VocabularyProgressService = {
  addWord(wordId: string): WordProgress {
    return {
      wordId,
      status: 'new',
      failCount: 0,
      lastPracticedAt: null,
      masteredAt: null,
    };
  },

  markAsLearned(current: WordProgress): WordProgress {
    if (current.status !== 'new') return current;
    return {
      ...current,
      status: 'learned',
      lastPracticedAt: new Date().toISOString(),
    };
  },

  onQuizCorrect(current: WordProgress): WordProgress {
    if (current.status !== 'learned') return current;
    return {
      ...current,
      status: 'mastered',
      masteredAt: new Date().toISOString(),
      lastPracticedAt: new Date().toISOString(),
    };
  },

  onQuizIncorrect(current: WordProgress): WordProgress {
    if (current.status !== 'learned') return current;
    return {
      ...current,
      status: 'struggling',
      failCount: current.failCount + 1,
      lastPracticedAt: new Date().toISOString(),
    };
  },

  moveToNew(current: WordProgress): WordProgress {
    if (current.status !== 'struggling') return current;
    return {
      ...current,
      status: 'new',
      failCount: 0,
      lastPracticedAt: null,
    };
  },

  moveToLearned(current: WordProgress): WordProgress {
    if (current.status !== 'struggling') return current;
    return {
      ...current,
      status: 'learned',
      lastPracticedAt: new Date().toISOString(),
    };
  },

  keepStruggling(current: WordProgress): WordProgress {
    if (current.status !== 'struggling') return current;
    return current;
  },

  canStartQuiz(learnedCount: number): boolean {
    return learnedCount >= MASTERY_QUIZ_MIN_WORDS;
  },

  getQuizPoolSize(totalLearned: number): number {
    return Math.min(totalLearned, 100);
  },

  canAccessReadingWriting(masteredCount: number): boolean {
    return masteredCount >= READING_WRITING_UNLOCK_THRESHOLD;
  },

  getStatusLabel(status: WordStatus): string {
    switch (status) {
      case 'new': return 'New';
      case 'learned': return 'Learned';
      case 'mastered': return 'Mastered';
      case 'struggling': return 'Struggling';
      default: return 'Unknown';
    }
  },

  getStatusColor(status: WordStatus): string {
    switch (status) {
      case 'learned': return 'green';
      case 'mastered': return 'gold';
      case 'struggling': return 'red';
      default: return 'gray';
    }
  },
};
