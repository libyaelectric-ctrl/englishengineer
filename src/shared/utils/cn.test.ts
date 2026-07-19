import { describe, it, expect } from 'vitest';
import { cn } from './cn';

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles conditional classes', () => {
    const isActive = false;
    expect(cn('foo', isActive && 'bar', 'baz')).toBe('foo baz');
  });

  it('merges tailwind classes', () => {
    expect(cn('p-4', 'p-8')).toBe('p-8');
  });

  it('handles empty input', () => {
    expect(cn()).toBe('');
  });
});
