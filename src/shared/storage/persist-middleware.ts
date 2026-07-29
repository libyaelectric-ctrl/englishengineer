import { type PersistOptions } from 'zustand/middleware';
import { storage } from './index';

/**
 * A storage adapter that wraps the existing EngVox storage module.
 * Ensures Zustand persist middleware uses the same user-scoped localStorage.
 *
 * Note: Zustand's PersistStorage<S> expects getItem to return
 * `StorageValue<S>` (parsed JSON), but our adapter returns raw strings.
 * This is safe because Zustand's persist middleware handles serialization
 * internally — it calls `JSON.parse` on the string returned by getItem.
 * We use a targeted type assertion at the usage site to satisfy TypeScript.
 */
const eosStorage = {
  getItem: (name: string) => {
    return storage.get<string>(name) ?? null;
  },
  setItem: (name: string, value: string) => {
    storage.set(name, value);
  },
  removeItem: (name: string) => {
    storage.remove(name);
  },
};

// Zustand's PersistStorage<S> generic expects parsed JSON types, but our
// adapter returns raw JSON strings which Zustand handles correctly.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const typedEosStorage = eosStorage as any;

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
  storage: typedEosStorage,
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
  storage: typedEosStorage,
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
