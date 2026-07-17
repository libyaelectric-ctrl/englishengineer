import { VocabularyReviewState } from '../types/vocabulary.types';

export const createInitialReviewState = (
  wordId: string
): VocabularyReviewState => ({
  wordId,
  interval: 0,
  easeFactor: 2.5,
  repetitions: 0,
  nextReview: new Date().toISOString(),
  lastReview: null,
});

export const updateSm2ReviewState = (
  previous: VocabularyReviewState,
  quality: number,
  reviewedAt = new Date()
): VocabularyReviewState => {
  const boundedQuality = Math.max(0, Math.min(5, quality));
  const easeFactor = Math.max(
    1.3,
    previous.easeFactor +
      (0.1 - (5 - boundedQuality) * (0.08 + (5 - boundedQuality) * 0.02))
  );

  const repetitions = boundedQuality < 3 ? 0 : previous.repetitions + 1;
  let interval = 1;

  if (boundedQuality < 3) {
    interval = 1;
  } else if (repetitions === 1) {
    interval = 1;
  } else if (repetitions === 2) {
    interval = 6;
  } else {
    interval = Math.round(previous.interval * easeFactor);
  }

  const nextReview = new Date(reviewedAt);
  nextReview.setDate(reviewedAt.getDate() + interval);

  return {
    wordId: previous.wordId,
    interval,
    easeFactor,
    repetitions,
    nextReview: nextReview.toISOString(),
    lastReview: reviewedAt.toISOString(),
  };
};
