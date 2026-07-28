import { StateStorage, PersistOptions } from 'zustand/middleware';
import { storage } from './index';

/**
 * A StateStorage adapter that wraps the existing EngVox storage module.
 * Ensures Zustand persist middleware uses the same user-scoped localStorage.
 */
const eosStorage = {
  getItem: (name: string) => {
    return storage.get<string>(name);
  },
  setItem: (name: string, value: string) => {
    storage.set(name, value);
  },
  removeItem: (name: string) => {
    storage.remove(name);
  },
} as StateStorage;

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  storage: eosStorage as any,
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  storage: eosStorage as any,
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
