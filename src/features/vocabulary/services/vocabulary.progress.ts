export type WordStatus = 'new' | 'learning' | 'learned' | 'mastered' | 'struggling';

export interface WordProgress {
  wordId: string;
  status: WordStatus;
  correctCount: number;
  failCount: number;
  quizDates: string[];
  lastQuizAt: string | null;
  lastPracticedAt: string | null;
  masteredAt: string | null;
}

export const MASTERY_REQUIRED_CORRECT = 3;
export const QUIZ_THRESHOLD = 500;

const getTodayKey = (): string => new Date().toISOString().split('T')[0];

export const VocabularyProgressService = {
  addWord(wordId: string): WordProgress {
    return {
      wordId,
      status: 'new',
      correctCount: 0,
      failCount: 0,
      quizDates: [],
      lastQuizAt: null,
      lastPracticedAt: null,
      masteredAt: null,
    };
  },

  onView(current: WordProgress): WordProgress {
    if (current.status === 'new') {
      return { ...current, status: 'learning', lastPracticedAt: new Date().toISOString() };
    }
    return current;
  },

  onQuizCorrect(current: WordProgress): WordProgress {
    const now = new Date().toISOString();
    const today = getTodayKey();
    const newCorrect = current.correctCount + 1;
    const newDates = current.quizDates.includes(today)
      ? current.quizDates
      : [...current.quizDates, today];

    if (newCorrect >= MASTERY_REQUIRED_CORRECT && current.status !== 'mastered') {
      return {
        ...current,
        status: 'mastered',
        correctCount: newCorrect,
        quizDates: newDates,
        masteredAt: now,
        lastQuizAt: now,
        lastPracticedAt: now,
      };
    }

    if (current.status === 'mastered') {
      return { ...current, correctCount: newCorrect, quizDates: newDates, lastQuizAt: now };
    }

    return {
      ...current,
      status: current.status === 'new' || current.status === 'learning' ? 'learned' : current.status,
      correctCount: newCorrect,
      quizDates: newDates,
      lastQuizAt: now,
      lastPracticedAt: now,
    };
  },

  onQuizIncorrect(current: WordProgress): WordProgress {
    const now = new Date().toISOString();

    if (current.status === 'mastered') {
      return {
        ...current,
        status: 'learned',
        correctCount: Math.max(0, current.correctCount - 1),
        failCount: current.failCount + 1,
        lastQuizAt: now,
        lastPracticedAt: now,
      };
    }

    return {
      ...current,
      status: 'struggling',
      failCount: current.failCount + 1,
      lastQuizAt: now,
      lastPracticedAt: now,
    };
  },

  onStrugglingQuizCorrect(current: WordProgress): WordProgress {
    return {
      ...current,
      status: 'learned',
      lastPracticedAt: new Date().toISOString(),
    };
  },

  onStrugglingQuizIncorrect(current: WordProgress): WordProgress {
    return {
      ...current,
      failCount: current.failCount + 1,
      lastPracticedAt: new Date().toISOString(),
    };
  },

  isQuizReady(learnedCount: number): boolean {
    return learnedCount >= QUIZ_THRESHOLD;
  },

  getUniqueQuizDays(quizDates: string[]): number {
    return new Set(quizDates).size;
  },

  getStatusColor(status: WordStatus): string {
    switch (status) {
      case 'learning': return 'yellow';
      case 'learned': return 'green';
      case 'mastered': return 'gold';
      case 'struggling': return 'red';
      default: return 'gray';
    }
  },
};
