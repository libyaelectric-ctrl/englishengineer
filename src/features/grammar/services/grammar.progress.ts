export type RuleStatus =
  | 'new'
  | 'learning'
  | 'learned'
  | 'mastered'
  | 'struggling';

export interface RuleProgress {
  ruleId: string;
  status: RuleStatus;
  correctCount: number;
  failCount: number;
  quizDates: string[];
  lastPracticedAt: string | null;
  masteredAt: string | null;
}

const MASTERY_REQUIRED = 3;
const QUIZ_THRESHOLD = 50;

const getTodayKey = (): string => new Date().toISOString().split('T')[0];

export const GrammarProgressService = {
  addRule(ruleId: string): RuleProgress {
    return {
      ruleId,
      status: 'new',
      correctCount: 0,
      failCount: 0,
      quizDates: [],
      lastPracticedAt: null,
      masteredAt: null,
    };
  },

  onView(current: RuleProgress): RuleProgress {
    if (current.status === 'new') {
      return {
        ...current,
        status: 'learning',
        lastPracticedAt: new Date().toISOString(),
      };
    }
    return current;
  },

  onQuizCorrect(current: RuleProgress): RuleProgress {
    const now = new Date().toISOString();
    const today = getTodayKey();
    const newCorrect = current.correctCount + 1;
    const newDates = current.quizDates.includes(today)
      ? current.quizDates
      : [...current.quizDates, today];

    if (newCorrect >= MASTERY_REQUIRED && current.status !== 'mastered') {
      return {
        ...current,
        status: 'mastered',
        correctCount: newCorrect,
        quizDates: newDates,
        masteredAt: now,
        lastPracticedAt: now,
      };
    }

    return {
      ...current,
      status:
        current.status === 'new' || current.status === 'learning'
          ? 'learned'
          : current.status,
      correctCount: newCorrect,
      quizDates: newDates,
      lastPracticedAt: now,
    };
  },

  onQuizIncorrect(current: RuleProgress): RuleProgress {
    const now = new Date().toISOString();
    if (current.status === 'mastered') {
      return {
        ...current,
        status: 'learned',
        correctCount: Math.max(0, current.correctCount - 1),
        failCount: current.failCount + 1,
        lastPracticedAt: now,
      };
    }
    if (current.failCount + 1 >= 5) {
      return {
        ...current,
        status: 'struggling',
        failCount: current.failCount + 1,
        lastPracticedAt: now,
      };
    }
    return {
      ...current,
      failCount: current.failCount + 1,
      lastPracticedAt: now,
    };
  },

  onStrugglingQuizCorrect(current: RuleProgress): RuleProgress {
    return {
      ...current,
      status: 'learning',
      lastPracticedAt: new Date().toISOString(),
    };
  },

  isQuizReady(learnedCount: number): boolean {
    return learnedCount >= QUIZ_THRESHOLD;
  },

  getStatusColor(status: RuleStatus): string {
    switch (status) {
      case 'learning':
        return 'yellow';
      case 'learned':
        return 'green';
      case 'mastered':
        return 'gold';
      case 'struggling':
        return 'red';
      default:
        return 'gray';
    }
  },
};
