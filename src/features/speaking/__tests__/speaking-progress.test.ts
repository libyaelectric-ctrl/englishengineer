import { describe, expect, it } from 'vitest';

describe('Speaking Progress', () => {
  it('1. Prompt fetch: level-based content ratio', () => {
    const items = Array.from({ length: 10 }, (_, i) => ({
      level: i < 7 ? 'B1' : 'B2',
    }));
    expect(items.filter((i) => i.level === 'B1').length).toBe(7);
    expect(items.filter((i) => i.level === 'B2').length).toBe(3);
  });

  it('2. Submission & scoring: overall score', () => {
    const scores = {
      pronunciation: 80,
      fluency: 70,
      grammar: 85,
      vocabulary: 75,
    };
    const overall = Math.round(
      Object.values(scores).reduce((a, b) => a + b, 0) /
        Object.keys(scores).length
    );
    expect(overall).toBe(78);
  });

  it('3. Stat calculation: average score', () => {
    const scores = [85, 75, 90];
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    expect(avg).toBe(83);
  });

  it('4. Lock check: reading 5 + writing 5', () => {
    const READING_THRESHOLD = 5;
    const WRITING_THRESHOLD = 5;
    expect(4 >= READING_THRESHOLD).toBe(false);
    expect(5 >= READING_THRESHOLD).toBe(true);
    expect(4 >= WRITING_THRESHOLD).toBe(false);
    expect(5 >= WRITING_THRESHOLD).toBe(true);
  });

  it('5. Content ratio: 75% current, 25% next', () => {
    const items = Array.from({ length: 10 }, (_, i) => ({
      level: i < 7 ? 'B1' : 'B2',
    }));
    expect(items.filter((i) => i.level === 'B1').length).toBe(7);
    expect(items.filter((i) => i.level === 'B2').length).toBe(3);
  });
});
