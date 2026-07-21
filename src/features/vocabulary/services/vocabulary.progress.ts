export type WordStatus = 'new' | 'learned' | 'mastered' | 'struggling';

export interface WordProgress {
  wordId: string;
  status: WordStatus;
  failCount: number;
  usedCount: number;
  lastPracticedAt: string | null;
  masteredAt: string | null;
}

export const VocabularyProgressService = {
  addWord(wordId: string): WordProgress {
    return {
      wordId,
      status: 'new',
      failCount: 0,
      usedCount: 0,
      lastPracticedAt: null,
      masteredAt: null,
    };
  },

  onWordUsed(current: WordProgress): WordProgress {
    const now = new Date().toISOString();
    const newUsed = current.usedCount + 1;

    if (current.status === 'new') {
      return {
        ...current,
        status: 'learned',
        usedCount: newUsed,
        lastPracticedAt: now,
      };
    }

    if (current.status === 'learned' && newUsed >= 2) {
      return {
        ...current,
        status: 'mastered',
        usedCount: newUsed,
        masteredAt: now,
        lastPracticedAt: now,
      };
    }

    return { ...current, usedCount: newUsed, lastPracticedAt: now };
  },

  onIncorrect(current: WordProgress): WordProgress {
    const newFail = current.failCount + 1;
    const now = new Date().toISOString();

    if (newFail >= 5) {
      return { ...current, status: 'struggling', failCount: newFail, lastPracticedAt: now };
    }

    return { ...current, failCount: newFail, lastPracticedAt: now };
  },

  removeFromPool(current: WordProgress): WordProgress {
    return { ...current, status: 'mastered', masteredAt: new Date().toISOString() };
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
