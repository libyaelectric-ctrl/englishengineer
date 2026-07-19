import { describe, it, expect } from 'vitest';
import { formatDate, formatRelativeTime } from './date.helpers';

describe('date.helpers', () => {
  it('formatDate formats date correctly', () => {
    const date = new Date('2026-01-15T12:00:00');
    const result = formatDate(date);
    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
    expect(result).toContain('Jan');
    expect(result).toContain('15');
  });

  it('formatDate handles invalid date', () => {
    const result = formatDate(new Date('invalid'));
    expect(result).toBe('Invalid Date');
  });

  it('formatDate with custom options', () => {
    const date = new Date('2026-01-15');
    const result = formatDate(date, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    expect(result).toContain('January');
    expect(result).toContain('15');
  });

  it('formatRelativeTime returns string', () => {
    const result = formatRelativeTime(new Date());
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('formatRelativeTime handles past dates', () => {
    const past = new Date(Date.now() - 60000);
    const result = formatRelativeTime(past);
    expect(result).toContain('ago');
  });
});
