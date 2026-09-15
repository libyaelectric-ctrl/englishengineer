import { describe, expect, it } from 'vitest';

import { getDisplayMessage, pickRandom } from './engmascot.utils';

const mockCopy = {
  thinking: 'Thinking...',
  sleeping: 'Zzz...',
  empty: 'Nothing here',
  idle: ['Hello!', 'Hi there!'],
  ariaGreeting: 'Mascot says',
} as any;

describe('pickRandom', () => {
  it('returns an element from the array', () => {
    const arr = ['a', 'b', 'c'];
    for (let i = 0; i < 20; i++) {
      expect(arr).toContain(pickRandom(arr));
    }
  });

  it('returns the only element for single-item array', () => {
    expect(pickRandom(['only'])).toBe('only');
  });
});

describe('getDisplayMessage', () => {
  it('returns custom message when provided', () => {
    expect(getDisplayMessage('Custom!', 'idle', mockCopy, 'fallback')).toBe('Custom!');
  });

  it('returns thinking copy for thinking state', () => {
    expect(getDisplayMessage(null, 'thinking', mockCopy, 'idle')).toBe('Thinking...');
  });

  it('returns sleeping copy for sleeping state', () => {
    expect(getDisplayMessage(null, 'sleeping', mockCopy, 'idle')).toBe('Zzz...');
  });

  it('returns empty copy for empty state', () => {
    expect(getDisplayMessage(null, 'empty', mockCopy, 'idle')).toBe('Nothing here');
  });

  it('returns idle message for idle state', () => {
    expect(getDisplayMessage(null, 'idle', mockCopy, 'chosen idle')).toBe('chosen idle');
  });

  it('returns null for unknown state', () => {
    expect(getDisplayMessage(null, 'unknown', mockCopy, 'idle')).toBeNull();
  });
});
