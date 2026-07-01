import { VocabularyEntry, VocabularyReviewState } from './vocabulary.types';

export const normalizeVocabularyText = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export const isVocabularyResponseCorrect = (
  entry: VocabularyEntry,
  response: string
): boolean => {
  const normalizedResponse = normalizeVocabularyText(response);
  const accepted = [entry.word, entry.meaning, ...entry.synonyms].map(
    normalizeVocabularyText
  );

  return accepted.some((item) => item === normalizedResponse);
};

export const getTodayDateKey = (): string =>
  new Date().toISOString().split('T')[0];

export const getPreviousDateKey = (dateKey: string): string => {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().split('T')[0];
};

export const isDueForReview = (
  reviewState: VocabularyReviewState,
  now = new Date()
): boolean => new Date(reviewState.nextReview).getTime() <= now.getTime();

export const sortByNextReview = (
  a: VocabularyReviewState,
  b: VocabularyReviewState
): number =>
  new Date(a.nextReview).getTime() - new Date(b.nextReview).getTime();
