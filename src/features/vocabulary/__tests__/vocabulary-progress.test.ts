import { describe, expect, it } from 'vitest';
import { VocabularyProgressService, type WordProgress } from '../services/vocabulary.progress';

const createProgress = (overrides: Partial<WordProgress> = {}): WordProgress => ({
  wordId: 'test-word',
  status: 'new',
  failCount: 0,
  correctCount: 0,
  lastPracticedAt: null,
  masteredAt: null,
  ...overrides,
});

describe('VocabularyProgressService', () => {
  it('New → Learning (otomatik görüntüleme)', () => {
    const progress = createProgress();
    const result = VocabularyProgressService.transitionOnView(progress);
    expect(result.status).toBe('learning');
    expect(result.lastPracticedAt).toBeTruthy();
  });

  it('Learning → Learned (1 doğru cevap)', () => {
    const progress = createProgress({ status: 'learning', correctCount: 0 });
    const result = VocabularyProgressService.transitionOnCorrect(progress);
    expect(result.status).toBe('learned');
    expect(result.correctCount).toBe(1);
  });

  it('Learned → Mastered (3 doğru + 7 gün hatasız)', () => {
    const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString();
    const progress = createProgress({
      status: 'learned',
      correctCount: 2,
      failCount: 0,
      lastPracticedAt: eightDaysAgo,
    });
    const result = VocabularyProgressService.transitionOnCorrect(progress);
    expect(result.status).toBe('mastered');
    expect(result.correctCount).toBe(3);
    expect(result.masteredAt).toBeTruthy();
  });

  it('Learned → Learning (yanlış cevap gerilemesi)', () => {
    const progress = createProgress({ status: 'learned', failCount: 0 });
    const result = VocabularyProgressService.transitionOnIncorrect(progress);
    expect(result.status).toBe('learning');
    expect(result.failCount).toBe(1);
  });

  it('5 yanlış → Struggling', () => {
    const progress = createProgress({ status: 'learning', failCount: 4 });
    const result = VocabularyProgressService.transitionOnIncorrect(progress);
    expect(result.status).toBe('struggling');
    expect(result.failCount).toBe(5);
  });
});
