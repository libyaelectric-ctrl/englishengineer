import { describe, expect, it } from 'vitest';
import {
  VocabularyProgressService,
  type WordProgress,
  MASTERY_QUIZ_MIN_WORDS,
  READING_WRITING_UNLOCK_THRESHOLD,
} from '../services/vocabulary.progress';

describe('VocabularyProgressService', () => {
  it('addWord creates new word with status new', () => {
    const word = VocabularyProgressService.addWord('hello');
    expect(word.status).toBe('new');
    expect(word.failCount).toBe(0);
    expect(word.masteredAt).toBeNull();
  });

  it('markAsLearned transitions new to learned', () => {
    const word = VocabularyProgressService.addWord('hello');
    const result = VocabularyProgressService.markAsLearned(word);
    expect(result.status).toBe('learned');
    expect(result.lastPracticedAt).toBeTruthy();
  });

  it('markAsLearned does not change non-new words', () => {
    const word: WordProgress = {
      wordId: 'hello',
      status: 'learned',
      failCount: 0,
      lastPracticedAt: null,
      masteredAt: null,
    };
    const result = VocabularyProgressService.markAsLearned(word);
    expect(result.status).toBe('learned');
  });

  it('onQuizCorrect transitions learned to mastered', () => {
    const word: WordProgress = {
      wordId: 'hello',
      status: 'learned',
      failCount: 0,
      lastPracticedAt: null,
      masteredAt: null,
    };
    const result = VocabularyProgressService.onQuizCorrect(word);
    expect(result.status).toBe('mastered');
    expect(result.masteredAt).toBeTruthy();
  });

  it('onQuizCorrect does not change non-learned words', () => {
    const word: WordProgress = {
      wordId: 'hello',
      status: 'new',
      failCount: 0,
      lastPracticedAt: null,
      masteredAt: null,
    };
    const result = VocabularyProgressService.onQuizCorrect(word);
    expect(result.status).toBe('new');
  });

  it('onQuizIncorrect transitions learned to struggling', () => {
    const word: WordProgress = {
      wordId: 'hello',
      status: 'learned',
      failCount: 0,
      lastPracticedAt: null,
      masteredAt: null,
    };
    const result = VocabularyProgressService.onQuizIncorrect(word);
    expect(result.status).toBe('struggling');
    expect(result.failCount).toBe(1);
  });

  it('moveToNew transitions struggling to new', () => {
    const word: WordProgress = {
      wordId: 'hello',
      status: 'struggling',
      failCount: 2,
      lastPracticedAt: null,
      masteredAt: null,
    };
    const result = VocabularyProgressService.moveToNew(word);
    expect(result.status).toBe('new');
    expect(result.failCount).toBe(0);
  });

  it('moveToLearned transitions struggling to learned', () => {
    const word: WordProgress = {
      wordId: 'hello',
      status: 'struggling',
      failCount: 2,
      lastPracticedAt: null,
      masteredAt: null,
    };
    const result = VocabularyProgressService.moveToLearned(word);
    expect(result.status).toBe('learned');
    expect(result.lastPracticedAt).toBeTruthy();
  });

  it('keepStruggling keeps struggling status', () => {
    const word: WordProgress = {
      wordId: 'hello',
      status: 'struggling',
      failCount: 2,
      lastPracticedAt: null,
      masteredAt: null,
    };
    const result = VocabularyProgressService.keepStruggling(word);
    expect(result.status).toBe('struggling');
  });

  it('canStartQuiz requires 100 learned words', () => {
    expect(VocabularyProgressService.canStartQuiz(99)).toBe(false);
    expect(VocabularyProgressService.canStartQuiz(100)).toBe(true);
    expect(VocabularyProgressService.canStartQuiz(200)).toBe(true);
  });

  it('getQuizPoolSize limits to 100', () => {
    expect(VocabularyProgressService.getQuizPoolSize(50)).toBe(50);
    expect(VocabularyProgressService.getQuizPoolSize(100)).toBe(100);
    expect(VocabularyProgressService.getQuizPoolSize(200)).toBe(100);
  });

  it('canAccessReadingWriting requires 200 mastered', () => {
    expect(VocabularyProgressService.canAccessReadingWriting(199)).toBe(false);
    expect(VocabularyProgressService.canAccessReadingWriting(200)).toBe(true);
  });

  it('constants are correct', () => {
    expect(MASTERY_QUIZ_MIN_WORDS).toBe(100);
    expect(READING_WRITING_UNLOCK_THRESHOLD).toBe(200);
  });
});
