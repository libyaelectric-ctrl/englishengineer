/**
 * Shared IndexedDB helper — provides a reusable openDB with singleton caching.
 */
import { logger } from '@/shared/logger';

interface IDBOpenOptions {
  dbName: string;
  dbVersion: number;
  onUpgrade?: (db: IDBDatabase, oldVersion: number, newVersion: number) => void;
}

const dbInstances = new Map<string, IDBDatabase>();

export const openIDB = (options: IDBOpenOptions): Promise<IDBDatabase> => {
  const { dbName, dbVersion, onUpgrade } = options;
  const existing = dbInstances.get(dbName);
  if (existing && existing.version === dbVersion) return Promise.resolve(existing);

  if (typeof indexedDB === 'undefined') {
    return Promise.reject(new Error('IndexedDB not available'));
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, dbVersion);

    request.onupgradeneeded = (event) => {
      const db = request.result;
      onUpgrade?.(db, event.oldVersion, event.newVersion ?? dbVersion);
    };

    request.onsuccess = () => {
      const db = request.result;
      dbInstances.set(dbName, db);
      resolve(db);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

export const isIDBSupported = (): boolean => typeof indexedDB !== 'undefined';

export const idbGet = async <T>(
  dbName: string,
  storeName: string,
  key: string
): Promise<T | null> => {
  try {
    const db = await openIDB({ dbName, dbVersion: 1 });
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const req = tx.objectStore(storeName).get(key);
      req.onsuccess = () => resolve(req.result?.value ?? req.result ?? null);
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    logger.w(`[IDB] Read failed for ${storeName}/${key}:`, e);
    return null;
  }
};

export const idbSet = async <T>(
  dbName: string,
  storeName: string,
  key: string,
  value: T
): Promise<boolean> => {
  try {
    const db = await openIDB({ dbName, dbVersion: 1 });
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const req = tx.objectStore(storeName).put({ key, value, updatedAt: Date.now() });
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    logger.w(`[IDB] Write failed for ${storeName}/${key}:`, e);
    return false;
  }
};
