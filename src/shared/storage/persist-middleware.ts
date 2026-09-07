import { type PersistOptions, type PersistStorage } from 'zustand/middleware';
import { storage } from './index';
const createScopedPersistStorage = <S>(): PersistStorage<S> => ({
  getItem: (name) => { const value = storage.get<string>(name); if (value === null) return null; try { return JSON.parse(value) as { state: S; version?: number }; } catch { return null; } },
  setItem: (name, value) => { storage.set(name, JSON.stringify(value)); },
  removeItem: (name) => { storage.remove(name); },
});
const createGlobalPersistStorage = <S>(): PersistStorage<S> => ({
  getItem: (name) => storage.globalGet<{ state: S; version?: number }>(name),
  setItem: (name, value) => { storage.globalSet(name, value); },
  removeItem: (name) => { storage.globalRemove(name); },
});
export const eosPersistConfig = <S>(storageKey: string, partialize?: (state: S) => Partial<S>): Omit<PersistOptions<S, Partial<S>>, 'name'> & { name: string } => ({ name: storageKey, storage: createScopedPersistStorage<Partial<S>>(), skipHydration: true, ...(partialize ? { partialize } : {}) });
export const eosGlobalPersistConfig = <S>(storageKey: string, partialize?: (state: S) => Partial<S>): Omit<PersistOptions<S, Partial<S>>, 'name'> & { name: string } => ({ name: storageKey, storage: createGlobalPersistStorage<Partial<S>>(), ...(partialize ? { partialize } : {}) });
export const eosPersistPartial = <S extends Record<string, unknown>>(storageKey: string, keysToPersist: (keyof S)[]): Omit<PersistOptions<S, Partial<S>>, 'name'> & { name: string } => ({ name: storageKey, storage: createScopedPersistStorage<Partial<S>>(), skipHydration: true, partialize: (state) => { const partial: Record<string, unknown> = {}; for (const key of keysToPersist) if (key in state) partial[key as string] = state[key]; return partial as Partial<S>; } });
