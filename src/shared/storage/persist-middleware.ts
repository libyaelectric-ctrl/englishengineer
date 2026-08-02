import { type PersistOptions, type PersistStorage } from 'zustand/middleware';

import { storage } from './index';

/**
 * A storage adapter that wraps the existing EngVox storage module.
 * Ensures Zustand persist middleware uses the same user-scoped localStorage.
 */
const createPersistStorage = <S>(): PersistStorage<S> => ({
  getItem: (name: string) => {
    const value = storage.get<string>(name);
    if (value === null) return null;
    try {
      return JSON.parse(value) as { state: S; version?: number };
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: { state: S; version?: number }) => {
    storage.set(name, JSON.stringify(value));
  },
  removeItem: (name: string) => {
    storage.remove(name);
  },
});

/**
 * Creates Zustand persist middleware options using the EngVox storage module.
 * Use with Zustand's `persist` middleware.
 *
 * @param storageKey - The key to persist state under
 * @param partialize - Optional function to select which state keys to persist
 *
 * @example
 * ```ts
 * const useStore = create<MyState>()(
 *   persist(
 *     (set) => ({ count: 0, increment: () => set((s) => ({ count: s.count + 1 })) }),
 *     eosPersistConfig('my_store_key')
 *   )
 * );
 * ```
 */
export const eosPersistConfig = <S>(
  storageKey: string,
  partialize?: (state: S) => Partial<S>
): Omit<PersistOptions<S, Partial<S>>, 'name'> & { name: string } => ({
  name: storageKey,
  storage: createPersistStorage<Partial<S>>(),
  ...(partialize ? { partialize } : {}),
});

/**
 * Creates a partialized persist config — only specified keys are saved.
 *
 * @param storageKey - The key to persist state under
 * @param keysToPersist - Array of state keys to persist
 *
 * @example
 * ```ts
 * const useStore = create<MyState>()(
 *   persist(
 *     (set) => ({ ... }),
 *     eosPersistPartial('my_key', ['theme', 'sidebarOpen'])
 *   )
 * );
 * ```
 */
export const eosPersistPartial = <S extends Record<string, unknown>>(
  storageKey: string,
  keysToPersist: (keyof S)[]
): Omit<PersistOptions<S, Partial<S>>, 'name'> & { name: string } => ({
  name: storageKey,
  storage: createPersistStorage<Partial<S>>(),
  partialize: (state) => {
    const partial: Record<string, unknown> = {};
    for (const key of keysToPersist) {
      if (key in state) {
        partial[key as string] = state[key];
      }
    }
    return partial as Partial<S>;
  },
});
