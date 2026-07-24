import { describe, expect, it } from 'vitest';
import {
  isTurkishQuizAnswerCorrect,
  selectRandomQuizItems,
} from './learned-quiz';

describe('learned vocabulary quiz helpers', () => {
  it('selects ten distinct words without shuffling the full pool', () => {
    const pool = Array.from({ length: 1_000 }, (_, index) => `word-${index}`);
    const selected = selectRandomQuizItems(pool);

    expect(selected).toHaveLength(10);
    expect(new Set(selected)).toHaveLength(10);
  });

  it('accepts Turkish input despite case, whitespace, and accents', () => {
    expect(isTurkishQuizAnswerCorrect('  YUKSEKLIK ', 'yükseklik')).toBe(true);
    expect(isTurkishQuizAnswerCorrect('bus   hattı', 'bara / bus hattı')).toBe(
      true
    );
  });

  it('accepts a configured slash or comma meaning alternative', () => {
    expect(isTurkishQuizAnswerCorrect('şalter', 'anahtar / şalter')).toBe(
      true
    );
    expect(isTurkishQuizAnswerCorrect('sorun', 'problem, sorun')).toBe(true);
  });
});
