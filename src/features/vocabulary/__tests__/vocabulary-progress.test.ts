import { describe, expect, it } from 'vitest';
import { VocabularyProgressService, type WordProgress, MASTERY_SCORE } from '../services/vocabulary.progress';

describe('VocabularyProgressService', () => {
  it('Yeni kelime ekle → new status', () => {
    const word = VocabularyProgressService.addWord('hello');
    expect(word.status).toBe('new');
    expect(word.score).toBe(0);
  });

  it('New → Learned (kişi biliyorum derse)', () => {
    const word = VocabularyProgressService.addWord('hello');
    const result = VocabularyProgressService.markAsLearned(word);
    expect(result.status).toBe('learned');
    expect(result.lastPracticedAt).toBeTruthy();
  });

  it('Learned → Mastered (3 quiz doğru)', () => {
    let word: WordProgress = VocabularyProgressService.addWord('hello');
    word = VocabularyProgressService.markAsLearned(word);

    for (let i = 0; i < MASTERY_SCORE; i++) {
      word = VocabularyProgressService.onQuizCorrect(word);
    }

    expect(word.status).toBe('mastered');
    expect(word.score).toBe(MASTERY_SCORE);
    expect(word.masteredAt).toBeTruthy();
  });

  it('Learned → Struggling (2 quiz yanlış)', () => {
    let word: WordProgress = VocabularyProgressService.addWord('hello');
    word = VocabularyProgressService.markAsLearned(word);

    for (let i = 0; i <= 1; i++) {
      word = VocabularyProgressService.onQuizIncorrect(word);
    }

    expect(word.status).toBe('struggling');
  });

  it('Struggling → Learned (struggling quiz doğru)', () => {
    let word: WordProgress = VocabularyProgressService.addWord('hello');
    word = VocabularyProgressService.markAsLearned(word);
    word = VocabularyProgressService.onQuizIncorrect(word);
    word = VocabularyProgressService.onQuizIncorrect(word);
    expect(word.status).toBe('struggling');

    const result = VocabularyProgressService.onStrugglingQuizCorrect(word);
    expect(result.status).toBe('learned');
    expect(result.score).toBe(1);
  });

  it('500 learned olmadan quiz hazır değil', () => {
    expect(VocabularyProgressService.isQuizReady(499)).toBe(false);
    expect(VocabularyProgressService.isQuizReady(500)).toBe(true);
  });
});
