import { eventBus } from '@/core/events/event-bus';

import { GrammarRepository } from '@/shared/services/grammar.repository';
import { storage } from '@/shared/storage';
import {
  type GrammarReviewStatus,
  type GrammarRuleProgress,
  type GrammarSkillEvidence,
  type GrammarTransferSkill,
} from '@/shared/types/grammar.types';

export type {
  GrammarReviewStatus,
  GrammarTransferSkill,
  GrammarSkillEvidence,
  GrammarRuleProgress,
};

export interface LocalGrammarProgressSummary {
  tracked: number;
  newRules: number;
  learning: number;
  due: number;
  strong: number;
}

const getReviewIsDue = (progress: GrammarRuleProgress, now: Date): boolean =>
  progress.reviewStatus === 'Due' ||
  (progress.nextReviewDate !== null &&
    new Date(progress.nextReviewDate).getTime() <= now.getTime());

const describeStrongWithMissingEvidence = (missingEvidence: GrammarTransferSkill[]): string =>
  `The grammar practice is strong, but mastery still needs ${missingEvidence.join(' and ')} transfer evidence.`;

const describeReviewOverdue = (progress: GrammarRuleProgress): string =>
  progress.incorrectUsages > progress.correctUsages
    ? 'Recent mistakes and the scheduled review date make this rule a current priority.'
    : progress.strength >= 70
      ? 'A maintenance review is due so this strong rule remains reliable.'
      : 'The scheduled practice interval has ended, so this rule is ready for another use.';

const describeReviewNotDue = (progress: GrammarRuleProgress): string => {
  if (progress.reviewStatus === 'New')
    return 'This is the next named topic in your current-level grammar path.';
  if (progress.reviewStatus === 'Strong')
    return 'This rule is strong and does not need urgent review.';
  return progress.incorrectUsages > 0
    ? 'A previous mistake keeps this rule in Learning until correct use becomes consistent.'
    : 'This rule needs more correct uses before it can become Strong.';
};

export const getGrammarReviewReason = (progress: GrammarRuleProgress, now = new Date()): string => {
  const missingEvidence = getMissingGrammarTransferEvidence(progress);
  const reviewIsDue = getReviewIsDue(progress, now);
  const hasStrongPractice =
    progress.correctUsages >= MIN_CORRECT_USAGES_FOR_STRONG &&
    progress.strength >= MIN_STRENGTH_FOR_STRONG;

  if (hasStrongPractice && missingEvidence.length > 0) {
    return describeStrongWithMissingEvidence(missingEvidence);
  }
  if (reviewIsDue) return describeReviewOverdue(progress);
  return describeReviewNotDue(progress);
};

const STORAGE_KEY = 'EngVox_grammar_progress';
const DAY_MS = 24 * 60 * 60 * 1000;
const TRANSFER_MASTERY_SCORE = 80;
const TOTAL_GRAMMAR_RULES = 360;
const STRENGTH_CORRECT_BONUS = 25;
const STRENGTH_INCORRECT_PENALTY = 20;
const MIN_CORRECT_USAGES_FOR_STRONG = 3;
const MIN_STRENGTH_FOR_STRONG = 70;
const REVIEW_DAYS_STRONG = 14;
const REVIEW_DAYS_CORRECT = 3;
const REVIEW_DAYS_DEFAULT = 1;
const initialProgress = (ruleId: string): GrammarRuleProgress => ({
  ruleId,
  exposures: 0,
  correctUsages: 0,
  incorrectUsages: 0,
  strength: 0,
  reviewStatus: 'New',
  lastUsedAt: null,
  nextReviewDate: null,
  skillEvidence: {},
  isPassed: false,
});
const normalizeProgress = (progress: GrammarRuleProgress): GrammarRuleProgress => ({
  ...initialProgress(progress.ruleId),
  ...progress,
  skillEvidence: progress.skillEvidence ?? {},
});
const load = (): Record<string, GrammarRuleProgress> =>
  Object.fromEntries(
    Object.entries(storage.get<Record<string, GrammarRuleProgress>>(STORAGE_KEY) ?? {}).map(
      ([ruleId, progress]) => [ruleId, normalizeProgress(progress)]
    )
  );
const saveOne = (progress: GrammarRuleProgress): GrammarRuleProgress => {
  storage.set(STORAGE_KEY, { ...load(), [progress.ruleId]: progress });
  return progress;
};

export const getMissingGrammarTransferEvidence = (
  progress: GrammarRuleProgress
): GrammarTransferSkill[] =>
  (['reading', 'writing'] as const).filter((skill) => {
    const evidence = progress.skillEvidence[skill];
    return !evidence || evidence.score < TRANSFER_MASTERY_SCORE;
  });

const hasGrammarTransferMastery = (progress: GrammarRuleProgress): boolean =>
  getMissingGrammarTransferEvidence(progress).length === 0;

const canBecomeStrong = (progress: GrammarRuleProgress): boolean =>
  progress.correctUsages >= MIN_CORRECT_USAGES_FOR_STRONG &&
  progress.strength >= MIN_STRENGTH_FOR_STRONG &&
  hasGrammarTransferMastery(progress);

const publishMastery = (ruleId: string, now: Date, progress: GrammarRuleProgress): void => {
  eventBus.publish({
    id: `grammar-mastered-${ruleId}-${Date.now()}`,
    type: 'grammar:mastered',
    timestamp: now.toISOString(),
    payload: {
      ruleId,
      masteredAt: now.toISOString(),
      skillEvidence: progress.skillEvidence,
    },
  });
};

export const GrammarProgressService = {
  getAll(now = new Date()): Record<string, GrammarRuleProgress> {
    return Object.fromEntries(Object.keys(load()).map((ruleId) => [ruleId, this.get(ruleId, now)]));
  },

  getSummary(totalRules = TOTAL_GRAMMAR_RULES, now = new Date()): LocalGrammarProgressSummary {
    const values = Object.values(this.getAll(now));
    return {
      tracked: values.length,
      newRules: Math.max(0, totalRules - values.length),
      learning: values.filter((item) => item.reviewStatus === 'Learning').length,
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
  async isLessonUnlocked(ruleId: string): Promise<boolean> {
    const all = await GrammarRepository.getAllRulesSorted();
    const index = all.findIndex((r) => r.id === ruleId);
    if (index <= 0) return true;
    const prev = this.get(all[index - 1].id);
    return (
      prev.isPassed === true ||
      prev.reviewStatus === 'Strong' ||
      prev.correctUsages >= MIN_CORRECT_USAGES_FOR_STRONG
    );
  },
  recordPass(ruleId: string, now = new Date()): GrammarRuleProgress {
    const current = this.get(ruleId, now);
    return saveOne({
      ...current,
      isPassed: true,
      reviewStatus: current.reviewStatus === 'New' ? 'Learning' : current.reviewStatus,
      lastUsedAt: now.toISOString(),
    });
  },
  recordExposure(ruleId: string, now = new Date()): GrammarRuleProgress {
    const current = this.get(ruleId, now);
    return saveOne({
      ...current,
      exposures: current.exposures + 1,
      reviewStatus: current.correctUsages > 0 ? current.reviewStatus : 'Learning',
      lastUsedAt: now.toISOString(),
    });
  },
  recordUsage(ruleId: string, correct: boolean, now = new Date()): GrammarRuleProgress {
    const current = this.get(ruleId, now);
    const correctUsages = current.correctUsages + (correct ? 1 : 0);
    const incorrectUsages = current.incorrectUsages + (correct ? 0 : 1);
    const strength = Math.max(
      0,
      Math.min(
        100,
        current.strength + (correct ? STRENGTH_CORRECT_BONUS : -STRENGTH_INCORRECT_PENALTY)
      )
    );
    const candidate = { ...current, correctUsages, incorrectUsages, strength };
    const strong = canBecomeStrong(candidate);
    const becameStrong = strong && current.reviewStatus !== 'Strong';
    const nextStatus = strong ? 'Strong' : 'Learning';
    const reviewDays = strong
      ? REVIEW_DAYS_STRONG
      : correct
        ? REVIEW_DAYS_CORRECT
        : REVIEW_DAYS_DEFAULT;
    const result = saveOne({
      ...current,
      exposures: current.exposures + 1,
      correctUsages,
      incorrectUsages,
      strength,
      reviewStatus: nextStatus,
      lastUsedAt: now.toISOString(),
      nextReviewDate: new Date(now.getTime() + reviewDays * DAY_MS).toISOString(),
    });
    if (becameStrong) publishMastery(ruleId, now, result);
    return result;
  },
  recordSkillEvidence(
    ruleId: string,
    skill: GrammarTransferSkill,
    missionId: string,
    score: number,
    now = new Date()
  ): GrammarRuleProgress {
    const current = this.get(ruleId, now);
    const existing = current.skillEvidence[skill];
    const nextEvidence: GrammarSkillEvidence =
      existing && existing.score > score
        ? existing
        : { skill, missionId, score, demonstratedAt: now.toISOString() };
    const candidate = {
      ...current,
      skillEvidence: { ...current.skillEvidence, [skill]: nextEvidence },
      lastUsedAt: now.toISOString(),
    };
    const strong = canBecomeStrong(candidate);
    const becameStrong = strong && current.reviewStatus !== 'Strong';
    const result = saveOne({
      ...candidate,
      reviewStatus: strong ? 'Strong' : candidate.reviewStatus,
      nextReviewDate: strong
        ? new Date(now.getTime() + REVIEW_DAYS_STRONG * DAY_MS).toISOString()
        : candidate.nextReviewDate,
    });
    if (becameStrong) publishMastery(ruleId, now, result);
    return result;
  },
  reset(): void {
    storage.remove(STORAGE_KEY);
  },
};
