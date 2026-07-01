import { beforeEach, describe, expect, it } from 'vitest';
import { storage } from './index';

describe('storage namespace controls', () => {
  beforeEach(() => localStorage.clear());

  it('exports only EngineerOS namespace values without prefixes', () => {
    storage.set('learning_state', { xp: 120 });
    localStorage.setItem('unrelated_key', 'private');

    expect(storage.exportAll()).toEqual({ learning_state: { xp: 120 } });
  });

  it('clears EngineerOS data without deleting unrelated browser storage', () => {
    storage.set('theme', 'light');
    localStorage.setItem('unrelated_key', 'keep');

    storage.clear();

    expect(storage.get('theme')).toBeNull();
    expect(localStorage.getItem('unrelated_key')).toBe('keep');
  });
});
