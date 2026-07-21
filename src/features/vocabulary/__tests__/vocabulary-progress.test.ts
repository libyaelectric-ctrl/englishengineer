import { describe, expect, it } from 'vitest';
import { VocabularyProgressService, type WordProgress } from '../services/vocabulary.progress';

describe('VocabularyProgressService', () => {
  it('Yeni kelime ekle → new status', () => {
    const word = VocabularyProgressService.addWord('hello');
    expect(word.status).toBe('new');
    expect(word.usedCount).toBe(0);
  });

  it('New → Learned (tek kullanımda)', () => {
    const word = VocabularyProgressService.addWord('hello');
    const result = VocabularyProgressService.onWordUsed(word);
    expect(result.status).toBe('learned');
    expect(result.usedCount).toBe(1);
  });

  it('Learned → Mastered (2. kullanımda)', () => {
    const word: WordProgress = {
      wordId: 'hello', status: 'learned', failCount: 0, usedCount: 1,
      lastPracticedAt: new Date().toISOString(), masteredAt: null,
    };
    const result = VocabularyProgressService.onWordUsed(word);
    expect(result.status).toBe('mastered');
    expect(result.usedCount).toBe(2);
    expect(result.masteredAt).toBeTruthy();
  });

  it('Mastered → havuzdan çıkar', () => {
    const word: WordProgress = {
      wordId: 'hello', status: 'mastered', failCount: 0, usedCount: 2,
      lastPracticedAt: new Date().toISOString(), masteredAt: new Date().toISOString(),
    };
    const result = VocabularyProgressService.removeFromPool(word);
    expect(result.status).toBe('mastered');
  });

  it('5 yanlış → Struggling', () => {
    const word: WordProgress = {
      wordId: 'hello', status: 'new', failCount: 4, usedCount: 0,
      lastPracticedAt: null, masteredAt: null,
    };
    const result = VocabularyProgressService.onIncorrect(word);
    expect(result.status).toBe('struggling');
    expect(result.failCount).toBe(5);
  });
});
