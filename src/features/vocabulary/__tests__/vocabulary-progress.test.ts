import { describe, expect, it } from 'vitest';
import { VocabularyProgressService, type WordProgress, MASTERY_REQUIRED_CORRECT } from '../services/vocabulary.progress';

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

  it('4. Learned → Struggling (yanlış cevap)', () => {
    let word: WordProgress = VocabularyProgressService.addWord('hello');
    word = VocabularyProgressService.onView(word);
    word = VocabularyProgressService.onQuizCorrect(word);
    const result = VocabularyProgressService.onQuizIncorrect(word);
    expect(result.status).toBe('struggling');
  });

  it('5. Struggling → Learned (doğru cevap)', () => {
    let word: WordProgress = VocabularyProgressService.addWord('hello');
    word = VocabularyProgressService.onView(word);
    word = VocabularyProgressService.onQuizCorrect(word);
    word = VocabularyProgressService.onQuizIncorrect(word);
    expect(word.status).toBe('struggling');

    const result = VocabularyProgressService.onStrugglingQuizCorrect(word);
    expect(result.status).toBe('learned');
    expect(result.correctCount).toBe(1);
  });

  it('6. Mastered → Learned (yanlış cevap)', () => {
    let word: WordProgress = VocabularyProgressService.addWord('hello');
    word = VocabularyProgressService.onView(word);
    for (let i = 0; i < 3; i++) word = VocabularyProgressService.onQuizCorrect(word);
    expect(word.status).toBe('mastered');

    const result = VocabularyProgressService.onQuizIncorrect(word);
    expect(result.status).toBe('learned');
    expect(result.correctCount).toBe(2);
  });

  it('7. 36 kuralı öncesi quiz pasif', () => {
    expect(VocabularyProgressService.isQuizReady(35)).toBe(false);
  });

  it('8. 36 kuralı sonrası quiz aktif', () => {
    expect(VocabularyProgressService.isQuizReady(36)).toBe(true);
  });
});
