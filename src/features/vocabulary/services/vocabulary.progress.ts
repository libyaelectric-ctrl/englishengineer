export type WordStatus = 'new' | 'learned' | 'mastered' | 'struggling';

export interface WordProgress {
  wordId: string;
  status: WordStatus;
  score: number;
  quizCount: number;
  lastQuizAt: string | null;
  lastPracticedAt: string | null;
  masteredAt: string | null;
}

export const MASTERY_SCORE = 3;
export const QUIZ_THRESHOLD = 500;
export const STRUGGLING_THRESHOLD = 2;

export const VocabularyProgressService = {
  addWord(wordId: string): WordProgress {
    return {
      wordId,
      status: 'new',
      score: 0,
      quizCount: 0,
      lastQuizAt: null,
      lastPracticedAt: null,
      masteredAt: null,
    };
  },

  markAsLearned(current: WordProgress): WordProgress {
    return {
      ...current,
      status: 'learned',
      lastPracticedAt: new Date().toISOString(),
    };
  },

  onQuizCorrect(current: WordProgress): WordProgress {
    const now = new Date().toISOString();
    const newScore = current.score + 1;

    if (newScore >= MASTERY_SCORE) {
      return {
        ...current,
        status: 'mastered',
        score: newScore,
        quizCount: current.quizCount + 1,
        masteredAt: now,
        lastQuizAt: now,
        lastPracticedAt: now,
      };
    }

    return {
      ...current,
      score: newScore,
      quizCount: current.quizCount + 1,
      lastQuizAt: now,
      lastPracticedAt: now,
    };
  },

  onQuizIncorrect(current: WordProgress): WordProgress {
    const now = new Date().toISOString();
    const newScore = Math.max(0, current.score - 1);

    if (current.score <= STRUGGLING_THRESHOLD && current.status === 'learned') {
      return {
        ...current,
        status: 'struggling',
        score: newScore,
        quizCount: current.quizCount + 1,
        lastQuizAt: now,
        lastPracticedAt: now,
      };
    }

    return {
      ...current,
      score: newScore,
      quizCount: current.quizCount + 1,
      lastQuizAt: now,
      lastPracticedAt: now,
    };
  },

  onStrugglingQuizCorrect(current: WordProgress): WordProgress {
    return {
      ...current,
      status: 'learned',
      score: 1,
      lastPracticedAt: new Date().toISOString(),
    };
  },

  isQuizReady(learnedCount: number): boolean {
    return learnedCount >= QUIZ_THRESHOLD;
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
