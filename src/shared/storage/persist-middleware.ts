import { type PersistOptions, type PersistStorage } from 'zustand/middleware';

import { logger } from '@/shared/logger';

import { storage } from './index';

const createScopedPersistStorage = <S>(): PersistStorage<S> => ({
  getItem: (name) => {
    const value = storage.get<string>(name);
    if (value === null) return null;
    try {
      return JSON.parse(value) as { state: S; version?: number };
    } catch (err) {
      logger.e(`[PERSIST] Failed to deserialize persisted state for "${name}":`, err);
      return null;
    }
  },
  setItem: (name, value) => {
    storage.set(name, JSON.stringify(value));
  },
  removeItem: (name) => {
    storage.remove(name);
  },
});
const createGlobalPersistStorage = <S>(): PersistStorage<S> => ({
  getItem: (name) => storage.globalGet<{ state: S; version?: number }>(name),
  setItem: (name, value) => {
    storage.globalSet(name, value);
  },
  removeItem: (name) => {
    storage.globalRemove(name);
  },
});
export const eosPersistConfig = <S>(
  storageKey: string,
  partialize?: (state: S) => Partial<S>
): Omit<PersistOptions<S, Partial<S>>, 'name'> & { name: string } => ({
  name: storageKey,
  storage: createScopedPersistStorage<Partial<S>>(),
  skipHydration: true,
  ...(partialize ? { partialize } : {}),
});
export const eosGlobalPersistConfig = <S>(
  storageKey: string,
  partialize?: (state: S) => Partial<S>
): Omit<PersistOptions<S, Partial<S>>, 'name'> & { name: string } => ({
  name: storageKey,
  storage: createGlobalPersistStorage<Partial<S>>(),
  ...(partialize ? { partialize } : {}),
});
