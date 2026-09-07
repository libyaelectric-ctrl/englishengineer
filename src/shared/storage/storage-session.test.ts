import { beforeEach, describe, expect, it } from 'vitest';
import { storage } from './index';
describe('session-scoped storage isolation', () => {
  beforeEach(() => { localStorage.clear(); storage.deactivateSession(); });
  it('blocks sensitive reads and writes before identity is known', () => { expect(storage.set('workspace', { secret: 'a' })).toBe(false); expect(storage.get('workspace')).toBeNull(); });
  it('isolates Firebase users on the same browser', () => { storage.activateSession({ userId: 'user-a', kind: 'firebase' }); storage.set('workspace', { owner: 'a' }); storage.activateSession({ userId: 'user-b', kind: 'firebase' }); expect(storage.get('workspace')).toBeNull(); storage.set('workspace', { owner: 'b' }); storage.activateSession({ userId: 'user-a', kind: 'firebase' }); expect(storage.get('workspace')).toEqual({ owner: 'a' }); });
  it('keeps demo and Firebase sessions explicitly separate', () => { storage.activateSession({ userId: 'same-id', kind: 'demo' }); storage.set('learning_state', { xp: 5 }); storage.activateSession({ userId: 'same-id', kind: 'firebase' }); expect(storage.get('learning_state')).toBeNull(); });
  it('migrates legacy global data only when legacy owner matches', () => { localStorage.setItem('eos_auth_user', JSON.stringify({ id: 'owner-a' })); localStorage.setItem('eos_learning_state', JSON.stringify({ xp: 9 })); storage.activateSession({ userId: 'owner-b', kind: 'firebase' }); expect(storage.get('learning_state')).toBeNull(); storage.activateSession({ userId: 'owner-a', kind: 'firebase' }); expect(storage.get('learning_state')).toEqual({ xp: 9 }); expect(localStorage.getItem('eos_learning_state')).toBeNull(); });
});
