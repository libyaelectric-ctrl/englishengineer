import { describe, expect, it } from 'vitest';
import {
  VocabularyProgressService,
  type WordProgress,
  MASTERY_REQUIRED_CORRECT,
  STRUGGLING_THRESHOLD,
  MASTERED_DROP_THRESHOLD,
} from '../services/vocabulary.progress';

describe('VocabularyProgressService', () => {
  it('1. New → Learning (otomatik看到)', () => {
    const word = VocabularyProgressService.addWord('hello');
    const result = VocabularyProgressService.onView(word);
    expect(result.status).toBe('learning');
    expect(result.lastPracticedAt).toBeTruthy();
  });

  it('2. Learning → Learned (1 doğru cevap)', () => {
    let word: WordProgress = VocabularyProgressService.addWord('hello');
    word = VocabularyProgressService.onView(word);
    const result = VocabularyProgressService.onQuizCorrect(word);
    expect(result.status).toBe('learned');
    expect(result.correctCount).toBe(1);
  });

  it('3. Learned → Mastered (3 doğru)', () => {
    let word: WordProgress = VocabularyProgressService.addWord('hello');
    word = VocabularyProgressService.onView(word);

    for (let i = 0; i < MASTERY_REQUIRED_CORRECT; i++) {
      word = VocabularyProgressService.onQuizCorrect(word);
    }

    expect(word.status).toBe('mastered');
    expect(word.correctCount).toBe(MASTERY_REQUIRED_CORRECT);
    expect(word.masteredAt).toBeTruthy();
  });

  it('4. Learned → Struggling (2 yanlış cevap)', () => {
    let word: WordProgress = VocabularyProgressService.addWord('hello');
    word = VocabularyProgressService.onView(word);
    word = VocabularyProgressService.onQuizCorrect(word);

    const result1 = VocabularyProgressService.onQuizIncorrect(word);
    expect(result1.status).toBe('learned');
    expect(result1.failCount).toBe(1);

    const result2 = VocabularyProgressService.onQuizIncorrect(result1);
    expect(result2.status).toBe('struggling');
    expect(result2.failCount).toBe(STRUGGLING_THRESHOLD);
  });

  it('5. Struggling → Learned (doğru cevap)', () => {
    let word: WordProgress = VocabularyProgressService.addWord('hello');
    word = VocabularyProgressService.onView(word);
    word = VocabularyProgressService.onQuizCorrect(word);
    word = VocabularyProgressService.onQuizIncorrect(word);
    word = VocabularyProgressService.onQuizIncorrect(word);
    expect(word.status).toBe('struggling');

    const result = VocabularyProgressService.onStrugglingQuizCorrect(word);
    expect(result.status).toBe('learned');
    expect(result.correctCount).toBe(1);
  });

  it('6. Mastered → Learned (3 yanlış cevap)', () => {
    let word: WordProgress = VocabularyProgressService.addWord('hello');
    word = VocabularyProgressService.onView(word);
    for (let i = 0; i < 3; i++)
      word = VocabularyProgressService.onQuizCorrect(word);
    expect(word.status).toBe('mastered');

    const result1 = VocabularyProgressService.onQuizIncorrect(word);
    expect(result1.status).toBe('mastered');
    expect(result1.failCount).toBe(1);

    const result2 = VocabularyProgressService.onQuizIncorrect(result1);
    expect(result2.status).toBe('mastered');
    expect(result2.failCount).toBe(2);

    const result3 = VocabularyProgressService.onQuizIncorrect(result2);
    expect(result3.status).toBe('learned');
    expect(result3.failCount).toBe(MASTERED_DROP_THRESHOLD);
  });

  it('7. 200 kuralı öncesi quiz pasif', () => {
    expect(VocabularyProgressService.isQuizReady(199)).toBe(false);
  });

  it('8. 200 kuralı sonrası quiz aktif', () => {
    expect(VocabularyProgressService.isQuizReady(200)).toBe(true);
  });

  it('9. Struggling eşiği doğru çalışıyor', () => {
    expect(STRUGGLING_THRESHOLD).toBe(2);
  });

  it('10. Mastered drop eşiği doğru çalışıyor', () => {
    expect(MASTERED_DROP_THRESHOLD).toBe(3);
  });
});
