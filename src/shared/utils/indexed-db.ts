/**
 * IndexedDB Seed Caching Utility
 *
 * Caches loaded vocabulary terms and grammar rules into browser IndexedDB
 * for instant offline access in remote job sites, tunnels, or offline PWA mode.
 */
import { logger } from '@/shared/logger';

import { isIDBSupported, openIDB } from './idb-helper';

const DB_NAME = 'engvox_offline_cache';
const DB_VERSION = 2;
const STORE_SEED = 'seed_data';
const STORE_ACTIONS = 'offline_actions';

interface CacheEntry<T> {
  key: string;
  data: T;
  timestamp: number;
}

interface OfflineAction {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  timestamp: string;
  retries: number;
}

const ensureStores = (db: IDBDatabase): void => {
  if (!db.objectStoreNames.contains(STORE_SEED)) {
    db.createObjectStore(STORE_SEED, { keyPath: 'key' });
  }
  if (!db.objectStoreNames.contains(STORE_ACTIONS)) {
    const store = db.createObjectStore(STORE_ACTIONS, {
      keyPath: 'id',
      autoIncrement: true,
    });
    store.createIndex('type', 'type', { unique: false });
    store.createIndex('timestamp', 'timestamp', { unique: false });
  }
};

const openDB = (): Promise<IDBDatabase> =>
  openIDB({ dbName: DB_NAME, dbVersion: DB_VERSION, onUpgrade: ensureStores });

// Seed data cache
export async function getCachedSeed<T>(key: string): Promise<T | null> {
  if (!isIDBSupported()) return null;
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_SEED, 'readonly');
      const store = tx.objectStore(STORE_SEED);
      const request = store.get(key);

      request.onsuccess = () => {
        const result = request.result as CacheEntry<T> | undefined;
        resolve(result ? result.data : null);
      };
      request.onerror = () => resolve(null);
    });
  } catch (e) {
    logger.w('[IDB] Failed to read cached seed', e);
    return null;
  }
}

export async function setCachedSeed<T>(key: string, data: T): Promise<void> {
  if (!isIDBSupported()) return;
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_SEED, 'readwrite');
      const store = tx.objectStore(STORE_SEED);
      const entry: CacheEntry<T> = {
        key,
        data,
        timestamp: Date.now(),
      };
      store.put(entry);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch (e) {
    logger.w('[IDB] Failed to write cached seed', e);
  }
}

// Offline action queue
export async function addOfflineAction(
  type: string,
  payload: Record<string, unknown>
): Promise<string> {
  const id = `oa_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  if (!isIDBSupported()) return id;
  const action: OfflineAction = {
    id,
    type,
    payload,
    timestamp: new Date().toISOString(),
    retries: 0,
  };

  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_ACTIONS, 'readwrite');
      const store = tx.objectStore(STORE_ACTIONS);
      store.add(action);
      tx.oncomplete = () => resolve(id);
      tx.onerror = () => resolve(id);
    });
  } catch (e) {
    logger.w('[IDB] Failed to add offline action', e);
    return id;
  }
}

export async function getOfflineActions(): Promise<OfflineAction[]> {
  if (!isIDBSupported()) return [];
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_ACTIONS, 'readonly');
      const store = tx.objectStore(STORE_ACTIONS);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => resolve([]);
    });
  } catch (e) {
    logger.w('[IDB] Failed to get offline actions', e);
    return [];
  }
}

export async function removeOfflineAction(id: string): Promise<void> {
  if (!isIDBSupported()) return;
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_ACTIONS, 'readwrite');
      const store = tx.objectStore(STORE_ACTIONS);
      store.delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch (e) {
    logger.w('[IDB] Failed to remove offline action', e);
  }
}

export async function clearOfflineActions(): Promise<void> {
  if (!isIDBSupported()) return;
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_ACTIONS, 'readwrite');
      const store = tx.objectStore(STORE_ACTIONS);
      store.clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch (e) {
    logger.w('[IDB] Failed to clear offline actions', e);
  }
}

export async function getOfflineActionCount(): Promise<number> {
  if (!isIDBSupported()) return 0;
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_ACTIONS, 'readonly');
      const store = tx.objectStore(STORE_ACTIONS);
      const request = store.count();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(0);
    });
  } catch (e) {
    logger.w('[IDB] Failed to count offline actions', e);
    return 0;
  }
}
