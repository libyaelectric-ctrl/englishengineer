import { VocabularyReviewState } from './vocabulary.types';

export interface DueTodayItem {
  wordId: string;
  reviewState: VocabularyReviewState;
  daysOverdue: number;
}

export const getDueTodayWords = (
  reviewStates: Record<string, VocabularyReviewState>,
  now = new Date()
): DueTodayItem[] => {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return Object.values(reviewStates)
    .filter((state) => {
      const nextReview = new Date(state.nextReview);
      const nextReviewDay = new Date(nextReview.getFullYear(), nextReview.getMonth(), nextReview.getDate());
      return nextReviewDay.getTime() <= today.getTime();
    })
    .map((state) => {
      const nextReview = new Date(state.nextReview);
      const nextReviewDay = new Date(nextReview.getFullYear(), nextReview.getMonth(), nextReview.getDate());
      const diffMs = today.getTime() - nextReviewDay.getTime();
      const daysOverdue = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      return { wordId: state.wordId, reviewState: state, daysOverdue };
    })
    .sort((a, b) => b.daysOverdue - a.daysOverdue);
};

export const getUpcomingReviews = (
  reviewStates: Record<string, VocabularyReviewState>,
  daysAhead = 7,
  now = new Date()
): DueTodayItem[] => {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const futureDate = new Date(today);
  futureDate.setDate(futureDate.getDate() + daysAhead);

  return Object.values(reviewStates)
    .filter((state) => {
      const nextReview = new Date(state.nextReview);
      return nextReview.getTime() > today.getTime() && nextReview.getTime() <= futureDate.getTime();
    })
    .map((state) => {
      const nextReview = new Date(state.nextReview);
      const diffMs = nextReview.getTime() - today.getTime();
      const daysUntil = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      return { wordId: state.wordId, reviewState: state, daysOverdue: -daysUntil };
    })
    .sort((a, b) => a.daysOverdue - b.daysOverdue);
};

export const getReviewStats = (
  reviewStates: Record<string, VocabularyReviewState>,
  now = new Date()
) => {
  const all = Object.values(reviewStates);
  const dueToday = getDueTodayWords(reviewStates, now);
  const mastered = all.filter((s) => s.repetitions >= 5 && s.interval >= 30);
  const learning = all.filter((s) => s.repetitions > 0 && s.repetitions < 5);
  const newWords = all.filter((s) => s.repetitions === 0);

  return {
    total: all.length,
    dueToday: dueToday.length,
    mastered: mastered.length,
    learning: learning.length,
    newWords: newWords.length,
    averageEaseFactor: all.length > 0
      ? Math.round((all.reduce((sum, s) => sum + s.easeFactor, 0) / all.length) * 100) / 100
      : 0,
  };
};
