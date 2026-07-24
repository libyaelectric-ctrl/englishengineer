import { repairVocabularyText } from './vocabulary.menu';

export const LEARNED_QUIZ_MINIMUM = 100;
export const LEARNED_QUIZ_SIZE = 10;

const normalizeQuizText = (value: string): string =>
  repairVocabularyText(value)
    .trim()
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase('tr-TR')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ı/g, 'i');

const meaningAlternatives = (meaning: string): string[] =>
  meaning
    .split(/\s*[/;,]\s*/)
    .map(normalizeQuizText)
    .filter(Boolean);

export const isTurkishQuizAnswerCorrect = (
  answer: string,
  turkishMeaning: string
): boolean => {
  const normalizedAnswer = normalizeQuizText(answer);
  return (
    normalizedAnswer.length > 0 &&
    meaningAlternatives(turkishMeaning).includes(normalizedAnswer)
  );
};

/** Select a unique random sample without copying or shuffling the full pool. */
export const selectRandomQuizItems = <T>(
  items: readonly T[],
  count = LEARNED_QUIZ_SIZE,
  random = Math.random
): T[] => {
  const selectedCount = Math.min(count, items.length);
  const swaps = new Map<number, number>();
  const sample: T[] = [];

  for (let index = 0; index < selectedCount; index += 1) {
    const target = index + Math.floor(random() * (items.length - index));
    const targetValue = swaps.get(target) ?? target;
    const indexValue = swaps.get(index) ?? index;
    swaps.set(target, indexValue);
    sample.push(items[targetValue]);
  }

  return sample;
};
