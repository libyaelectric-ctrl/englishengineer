export type WordStatus = 'new' | 'learning' | 'learned' | 'mastered' | 'struggling';

export interface WordProgress {
  wordId: string;
  status: WordStatus;
  failCount: number;
  correctCount: number;
  lastPracticedAt: string | null;
  masteredAt: string | null;
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export const VocabularyProgressService = {
  transitionOnView(current: WordProgress): WordProgress {
    if (current.status === 'new') {
      return { ...current, status: 'learning', lastPracticedAt: new Date().toISOString() };
    }
    return { ...current, lastPracticedAt: new Date().toISOString() };
  },

  transitionOnCorrect(current: WordProgress): WordProgress {
    const now = new Date().toISOString();
    const newCorrect = current.correctCount + 1;

    if (newCorrect >= 3) {
      const lastPracticed = current.lastPracticedAt ? new Date(current.lastPracticedAt).getTime() : 0;
      const sevenDaysAgo = Date.now() - SEVEN_DAYS_MS;
      const noRecentFails = current.failCount === 0 || lastPracticed < sevenDaysAgo;

      if (noRecentFails || current.status === 'mastered') {
        return {
          ...current,
          status: 'mastered',
          correctCount: newCorrect,
          masteredAt: now,
          lastPracticedAt: now,
        };
      }
    }

    if (newCorrect >= 1 && current.status !== 'mastered') {
      return {
        ...current,
        status: 'learned',
        correctCount: newCorrect,
        lastPracticedAt: now,
      };
    }

    return { ...current, correctCount: newCorrect, lastPracticedAt: now };
  },

  transitionOnIncorrect(current: WordProgress): WordProgress {
    const newFail = current.failCount + 1;
    const now = new Date().toISOString();

    let newStatus: WordStatus = current.status;

    if (current.status === 'learned' || current.status === 'mastered') {
      newStatus = 'learning';
    }

    if (newFail >= 5) {
      newStatus = 'struggling';
    }

    return {
      ...current,
      status: newStatus,
      failCount: newFail,
      lastPracticedAt: now,
    };
  },

  resetFailCount(current: WordProgress): WordProgress {
    if (current.status === 'struggling') {
      return { ...current, failCount: 0, status: 'learning' };
    }
    return { ...current, failCount: 0 };
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
