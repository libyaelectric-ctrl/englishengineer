import { beforeEach, describe, expect, it } from 'vitest';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { storage } from './index';
import { eosPersistConfig } from './persist-middleware';
interface TestState { count: number; increment: () => void; }
const createTestStore = () => create<TestState>()(persist((set) => ({ count: 0, increment: () => set((state) => ({ count: state.count + 1 })) }), eosPersistConfig('test-store')));
describe('identity-gated persist middleware', () => {
  beforeEach(() => { localStorage.clear(); storage.deactivateSession(); });
  it('does not hydrate before a session is active', () => { const store = createTestStore(); expect(store.persist.hasHydrated()).toBe(false); expect(store.getState().count).toBe(0); });
  it('rehydrates only the active user namespace', async () => { storage.activateSession({ userId: 'a', kind: 'firebase' }); storage.set('test-store', JSON.stringify({ state: { count: 7 }, version: 0 })); const store = createTestStore(); await store.persist.rehydrate(); expect(store.getState().count).toBe(7); storage.deactivateSession(); store.setState({ count: 0 }); storage.activateSession({ userId: 'b', kind: 'firebase' }); await store.persist.rehydrate(); expect(store.getState().count).toBe(0); });
  it('writes only after identity activation', () => { const store = createTestStore(); store.getState().increment(); expect([...Array(localStorage.length)].map((_, index) => localStorage.key(index))).toEqual([]); storage.activateSession({ userId: 'a', kind: 'firebase' }); store.getState().increment(); expect(storage.get('test-store')).toBeTruthy(); });
});
