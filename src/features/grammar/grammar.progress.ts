import { storage } from '@/shared/storage';

export type GrammarReviewStatus = 'New' | 'Learning' | 'Due' | 'Strong';

export interface GrammarRuleProgress {
  ruleId: string;
  exposures: number;
  correctUsages: number;
  incorrectUsages: number;
  strength: number;
  reviewStatus: GrammarReviewStatus;
  lastUsedAt: string | null;
  nextReviewDate: string | null;
}

export interface GrammarProgressSummary {
  tracked: number;
  newRules: number;
  learning: number;
  due: number;
  strong: number;
}

export const getGrammarReviewReason = (
  progress: GrammarRuleProgress,
  now = new Date()
): string => {
  const reviewIsDue =
    progress.reviewStatus === 'Due' ||
    (progress.nextReviewDate !== null &&
      new Date(progress.nextReviewDate).getTime() <= now.getTime());

  if (reviewIsDue && progress.incorrectUsages > progress.correctUsages) {
    return 'Recent mistakes and the scheduled review date make this rule a current priority.';
  }
  if (reviewIsDue) {
    return progress.strength >= 70
      ? 'A maintenance review is due so this strong rule remains reliable.'
      : 'The scheduled practice interval has ended, so this rule is ready for another use.';
  }
  if (progress.reviewStatus === 'New') {
    return 'This is the next named topic in your current-level grammar path.';
  }
  if (progress.reviewStatus === 'Strong') {
    return 'This rule is strong and does not need urgent review.';
  }
  return progress.incorrectUsages > 0
    ? 'A previous mistake keeps this rule in Learning until correct use becomes consistent.'
    : 'This rule needs more correct uses before it can become Strong.';
};

const STORAGE_KEY = 'EngVox_grammar_progress';
const DAY_MS = 24 * 60 * 60 * 1000;
const initialProgress = (ruleId: string): GrammarRuleProgress => ({
  ruleId,
  exposures: 0,
  correctUsages: 0,
  incorrectUsages: 0,
  strength: 0,
  reviewStatus: 'New',
  lastUsedAt: null,
  nextReviewDate: null,
});
const load = (): Record<string, GrammarRuleProgress> =>
  storage.get<Record<string, GrammarRuleProgress>>(STORAGE_KEY) ?? {};
const saveOne = (progress: GrammarRuleProgress): GrammarRuleProgress => {
  storage.set(STORAGE_KEY, { ...load(), [progress.ruleId]: progress });
  return progress;
};

export const GrammarProgressService = {
  getAll(now = new Date()): Record<string, GrammarRuleProgress> {
    return Object.fromEntries(
      Object.keys(load()).map((ruleId) => [ruleId, this.get(ruleId, now)])
    );
  },

  getSummary(totalRules = 360, now = new Date()): GrammarProgressSummary {
    const values = Object.values(this.getAll(now));
    return {
      tracked: values.length,
      newRules: Math.max(0, totalRules - values.length),
      learning: values.filter((item) => item.reviewStatus === 'Learning')
        .length,
      due: values.filter((item) => item.reviewStatus === 'Due').length,
      strong: values.filter((item) => item.reviewStatus === 'Strong').length,
    };
  },

  get(ruleId: string, now = new Date()): GrammarRuleProgress {
    const progress = load()[ruleId] ?? initialProgress(ruleId);
    if (
      progress.nextReviewDate &&
      new Date(progress.nextReviewDate).getTime() <= now.getTime() &&
      progress.reviewStatus !== 'New'
    ) {
      return { ...progress, reviewStatus: 'Due' };
    }
    return progress;
  },
  recordExposure(ruleId: string, now = new Date()): GrammarRuleProgress {
    const current = this.get(ruleId, now);
    return saveOne({
      ...current,
      exposures: current.exposures + 1,
      reviewStatus:
        current.correctUsages > 0 ? current.reviewStatus : 'Learning',
      lastUsedAt: now.toISOString(),
    });
  },
  recordUsage(
    ruleId: string,
    correct: boolean,
    now = new Date()
  ): GrammarRuleProgress {
    const current = this.get(ruleId, now);
    const correctUsages = current.correctUsages + (correct ? 1 : 0);
    const incorrectUsages = current.incorrectUsages + (correct ? 0 : 1);
    const strength = Math.max(
      0,
      Math.min(100, current.strength + (correct ? 25 : -20))
    );
    const strong = correctUsages >= 3 && strength >= 70;
    return saveOne({
      ...current,
      exposures: current.exposures + 1,
      correctUsages,
      incorrectUsages,
      strength,
      reviewStatus: strong ? 'Strong' : 'Learning',
      lastUsedAt: now.toISOString(),
      nextReviewDate: new Date(
        now.getTime() + (strong ? 14 : correct ? 3 : 1) * DAY_MS
      ).toISOString(),
    });
  },
  reset(): void {
    storage.remove(STORAGE_KEY);
  },
};
