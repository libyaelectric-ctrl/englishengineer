import { beforeEach, describe, expect, it } from 'vitest';
import { storage } from './index';
describe('storage namespace controls', () => {
  beforeEach(() => { localStorage.clear(); storage.deactivateSession(); storage.activateSession({ userId: 'test-user', kind: 'firebase' }); });
  it('exports only the active session namespace', () => { storage.set('learning_state', { xp: 120 }); localStorage.setItem('unrelated_key', 'team'); expect(storage.exportAll()).toMatchObject({ learning_state: { xp: 120 } }); expect(storage.exportAll()).not.toHaveProperty('unrelated_key'); });
  it('clears only the active session', () => { storage.set('theme', 'light'); localStorage.setItem('unrelated_key', 'keep'); storage.clear(); expect(storage.get('theme')).toBeNull(); expect(localStorage.getItem('unrelated_key')).toBe('keep'); });
});
