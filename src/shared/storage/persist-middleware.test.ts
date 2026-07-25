import { describe, it, expect, beforeEach } from 'vitest';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { eosPersistConfig, eosPersistPartial } from './persist-middleware';
import { storage } from './index';

interface TestState {
  count: number;
  name: string;
  increment: () => void;
  setName: (name: string) => void;
}

describe('eosPersistConfig middleware', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('creates a store with persistence', () => {
    const useStore = create<TestState>()(
      persist(
        (set) => ({
          count: 0,
          name: 'default',
          increment: () => set((s) => ({ count: s.count + 1 })),
          setName: (name) => set({ name }),
        }),
        eosPersistConfig('test_persist_store')
      )
    );

    const { count, name } = useStore.getState();
    expect(count).toBe(0);
    expect(name).toBe('default');
  });

  it('persists state changes via storage module', () => {
    const useStore = create<TestState>()(
      persist(
        (set) => ({
          count: 0,
          name: 'default',
          increment: () => set((s) => ({ count: s.count + 1 })),
          setName: (name) => set({ name }),
        }),
        eosPersistConfig('test_persist_changes')
      )
    );

    useStore.getState().increment();
    useStore.getState().increment();
    useStore.getState().setName('updated');

    // Zustand persist is async, check via storage module
    const stored = storage.get<{ state: TestState }>('test_persist_changes');
    expect(stored).toBeTruthy();
    expect(stored?.state?.count).toBe(2);
    expect(stored?.state?.name).toBe('updated');
  });

  it('restores state from storage on creation', () => {
    // Pre-populate via storage module
    storage.set('test_persist_restore', {
      state: { count: 42, name: 'restored' },
      version: 0,
    });

    const useStore = create<TestState>()(
      persist(
        (set) => ({
          count: 0,
          name: 'default',
          increment: () => set((s) => ({ count: s.count + 1 })),
          setName: (name) => set({ name }),
        }),
        eosPersistConfig('test_persist_restore')
      )
    );

    const { count, name } = useStore.getState();
    expect(count).toBe(42);
    expect(name).toBe('restored');
  });

  it('supports partialize option', () => {
    const useStore = create<{ count: number; secret: string }>()(
      persist(
        (_set) => ({
          count: 0,
          secret: 'hidden',
        }),
        eosPersistConfig('test_partial_option', (state) => ({
          count: state.count,
        }))
      )
    );

    useStore.setState({ count: 5, secret: 'topsecret' });

    const stored = storage.get<{
      state: { count: number; secret?: string };
    }>('test_partial_option');
    expect(stored).toBeTruthy();
    expect(stored?.state?.count).toBe(5);
    expect(stored?.state?.secret).toBeUndefined();
  });
});

describe('eosPersistPartial helper', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('only persists specified keys', () => {
    const useStore = create<{ count: number; secret: string }>()(
      persist(
        (_set) => ({
          count: 0,
          secret: 'hidden',
        }),
        eosPersistPartial<{ count: number; secret: string }>(
          'test_partial_persist',
          ['count']
        )
      )
    );

    useStore.setState({ count: 5, secret: 'topsecret' });

    const stored = storage.get<{
      state: { count: number; secret?: string };
    }>('test_partial_persist');
    expect(stored).toBeTruthy();
    expect(stored?.state?.count).toBe(5);
    expect(stored?.state?.secret).toBeUndefined();
  });
});
