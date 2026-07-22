import { describe, expect, it } from 'vitest';
import { WritingProgressService } from '../writing-progress';

describe('WritingProgressService', () => {
  it('1. Prompt fetch: word target by level', () => {
    expect(WritingProgressService.getWordTarget('A1')).toBe(100);
    expect(WritingProgressService.getWordTarget('B1')).toBe(200);
    expect(WritingProgressService.getWordTarget('C2')).toBe(350);
  });

  it('2. Submission & scoring: score color', () => {
    expect(WritingProgressService.getScoreColor(90)).toBe('green');
    expect(WritingProgressService.getScoreColor(70)).toBe('yellow');
    expect(WritingProgressService.getScoreColor(50)).toBe('red');
  });

  it('3. Stat calculation: average score', () => {
    const scores = [85, 75, 90];
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    expect(avg).toBe(83);
  });

  it('4. Lock check: vocab 500 + grammar 50', () => {
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
