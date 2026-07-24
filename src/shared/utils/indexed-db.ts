/**
 * IndexedDB Seed Caching Utility
 *
 * Caches loaded 5,000 vocabulary terms and 360 grammar rules into browser IndexedDB
 * for instant 0ms offline access in remote job sites, tunnels, or offline PWA mode.
 */

const DB_NAME = 'engvox_offline_cache';
const DB_VERSION = 1;
const STORE_NAME = 'seed_data';

interface CacheEntry<T> {
  key: string;
  data: T;
  timestamp: number;
}

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export async function getCachedSeed<T>(key: string): Promise<T | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onsuccess = () => {
        const result = request.result as CacheEntry<T> | undefined;
        resolve(result ? result.data : null);
      };
      request.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function setCachedSeed<T>(key: string, data: T): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const entry: CacheEntry<T> = {
        key,
        data,
        timestamp: Date.now(),
      };
      store.put(entry);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {
    // Ignore cache write errors
  }
}
