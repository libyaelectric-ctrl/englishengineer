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

export const buildReviewPriorities = (
  candidates: ReviewPriorityCandidate[]
): ReviewPriorityItem[] =>
  candidates
    .map((candidate) => ({
      ...candidate,
      priority: SOURCE_WEIGHT[candidate.source] + (candidate.severity ?? 0),
      reason: SOURCE_REASON[candidate.source],
    }))
    .sort(
      (left, right) =>
        right.priority - left.priority || left.label.localeCompare(right.label)
    );
