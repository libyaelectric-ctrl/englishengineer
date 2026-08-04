import type {
  ReviewPriorityCandidate,
  ReviewPriorityItem,
  ReviewPrioritySource,
} from './learning-intelligence.types';

const SOURCE_WEIGHT: Record<ReviewPrioritySource, number> = {
  'repeated-mistake': 100,
  'weak-word': 80,
  'due-item': 60,
  'skill-weakness': 40,
};

const SOURCE_REASON: Record<ReviewPrioritySource, string> = {
  'repeated-mistake': 'Repeated mistake reached the review threshold.',
  'weak-word': 'Weak vocabulary needs controlled recall practice.',
  'due-item': 'Scheduled review is due now.',
  'skill-weakness': 'Independent skill evidence shows a current weakness.',
};

const MISTAKE_REPETITION_THRESHOLD = 3;
const WEAKNESS_SCORE_DIVISOR = 10;

interface ReviewPriorityInput {
  weakWords: number;
  dueToday: number;
  mistakeLog: Array<{
    id: string;
    category: string;
    originalText: string;
    repetitionCount?: number;
  }>;
  focusSkill: { skill: string; weaknessScore: number; label: string };
}

export const buildReviewPrioritiesFromInput = (
  input: ReviewPriorityInput,
  maxItems = 3
): ReviewPriorityItem[] =>
  buildReviewPriorities([
    ...(input.weakWords > 0
      ? [
          {
            id: 'weak-words',
            label: `${input.weakWords} weak vocabulary items`,
            source: 'weak-word' as const,
            severity: input.weakWords,
          },
        ]
      : []),
    ...(input.dueToday > 0
      ? [
          {
            id: 'due-words',
            label: `${input.dueToday} vocabulary reviews due`,
            source: 'due-item' as const,
            severity: input.dueToday,
          },
        ]
      : []),
    ...input.mistakeLog
      .filter((item) => (item.repetitionCount ?? 1) >= MISTAKE_REPETITION_THRESHOLD)
      .map((item) => ({
        id: item.id,
        label: `${item.category}: ${item.originalText}`,
        source: 'repeated-mistake' as const,
        severity: item.repetitionCount,
      })),
    {
      id: `skill-${input.focusSkill.skill}`,
      label: `${input.focusSkill.label} needs the next practice`,
      source: 'skill-weakness' as const,
      severity: Math.round(input.focusSkill.weaknessScore / WEAKNESS_SCORE_DIVISOR),
    },
  ]).slice(0, maxItems);

export const buildReviewPriorities = (
  candidates: ReviewPriorityCandidate[]
): ReviewPriorityItem[] =>
  candidates
    .map((candidate) => ({
      ...candidate,
      priority: SOURCE_WEIGHT[candidate.source] + (candidate.severity ?? 0),
      reason: SOURCE_REASON[candidate.source],
    }))
    .sort((left, right) => right.priority - left.priority || left.label.localeCompare(right.label));
