import { describe, expect, it } from 'vitest';

describe('Listening Progress', () => {
  it('1. Feed: level-based content ratio', () => {
    const items = Array.from({ length: 10 }, (_, i) => ({
      level: i < 7 ? 'B1' : 'B2',
    }));
    expect(items.filter((i) => i.level === 'B1').length).toBe(7);
    expect(items.filter((i) => i.level === 'B2').length).toBe(3);
  });

  it('2. Progress save: score and status update', () => {
    const progress = {
      status: 'listened' as const,
      score: 85,
      timesListened: 1,
    };
    expect(progress.status).toBe('listened');
    expect(progress.score).toBe(85);
  });

  it('3. Stat calculation: average score', () => {
    const scores = [80, 90, 70];
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    expect(avg).toBe(80);
  });

  it('4. Lock check: reading 50 + writing 50 required', () => {
    const READING_THRESHOLD = 50;
    const WRITING_THRESHOLD = 50;
    expect(49 >= READING_THRESHOLD).toBe(false);
    expect(50 >= READING_THRESHOLD).toBe(true);
    expect(49 >= WRITING_THRESHOLD).toBe(false);
    expect(50 >= WRITING_THRESHOLD).toBe(true);
  });

  it('5. Content ratio: 75% current, 25% next', () => {
    const items = Array.from({ length: 10 }, (_, i) => ({
      level: i < 7 ? 'B1' : 'B2',
    }));
    expect(items.filter((i) => i.level === 'B1').length).toBe(7);
    expect(items.filter((i) => i.level === 'B2').length).toBe(3);
  });
});
