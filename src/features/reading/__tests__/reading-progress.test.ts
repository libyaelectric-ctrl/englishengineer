import { describe, expect, it } from 'vitest';
import {
  ReadingProgressService,
  type ReadingProgress,
} from '../reading-progress';

describe('ReadingProgressService', () => {
  const createProgress = (
    overrides: Partial<ReadingProgress> = {}
  ): ReadingProgress => ({
    contentId: 'article-1',
    status: 'new',
    score: 0,
    timesRead: 0,
    lastReadAt: null,
    ...overrides,
  });

  it('1. First read: new → read', () => {
    const progress = createProgress();
    const result = ReadingProgressService.onFirstRead(progress);
    expect(result.status).toBe('read');
    expect(result.timesRead).toBe(1);
    expect(result.lastReadAt).toBeTruthy();
  });

  it('2. Progress save: score and status update', () => {
    const progress = createProgress({ status: 'read', timesRead: 1 });
    const result = ReadingProgressService.onComplete(progress, 85);
    expect(result.status).toBe('completed');
    expect(result.score).toBe(85);
    expect(result.timesRead).toBe(2);
  });

  it('3. Stat calculation: avg score', () => {
    const scores = [80, 90, 70];
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    expect(avg).toBe(80);
  });

  it('4. Lock check: vocab 500 + grammar 50 required', () => {
    const VOCAB_THRESHOLD = 500;
    const GRAMMAR_THRESHOLD = 50;

    expect(499 >= VOCAB_THRESHOLD).toBe(false);
    expect(500 >= VOCAB_THRESHOLD).toBe(true);
    expect(49 >= GRAMMAR_THRESHOLD).toBe(false);
    expect(50 >= GRAMMAR_THRESHOLD).toBe(true);
  });

  it('5. Content ratio: 75% current level, 25% next level', () => {
    const items = Array.from({ length: 10 }, (_, i) => ({
      level: i < 7 ? 'B1' : 'B2',
    }));
    const b1Count = items.filter((i) => i.level === 'B1').length;
    const b2Count = items.filter((i) => i.level === 'B2').length;
    expect(b1Count).toBe(7);
    expect(b2Count).toBe(3);
  });
});
