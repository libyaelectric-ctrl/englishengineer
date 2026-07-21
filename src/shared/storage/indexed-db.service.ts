import { logger } from '@/shared/logger';
import { storage } from './index';

const DB_NAME = 'engineeros-db';
const DB_VERSION = 1;
const LARGE_DATA_STORES = ['vocabulary', 'learning', 'grammar'] as const;
type LargeDataStore = (typeof LARGE_DATA_STORES)[number];

let dbInstance: IDBDatabase | null = null;

const openDB = (): Promise<IDBDatabase> => {
  if (dbInstance) return Promise.resolve(dbInstance);
  if (typeof indexedDB === 'undefined') {
    return Promise.reject(new Error('IndexedDB not available'));
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      for (const store of LARGE_DATA_STORES) {
        if (!db.objectStoreNames.contains(store)) {
          db.createObjectStore(store, { keyPath: 'key' });
        }
      }
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

interface IDBEntry<T> {
  key: string;
  value: T;
  updatedAt: string;
}

const idbGet = async <T>(store: LargeDataStore, key: string): Promise<T | null> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(store, 'readonly');
      const req = tx.objectStore(store).get(key);
      req.onsuccess = () => {
        const entry = req.result as IDBEntry<T> | undefined;
        resolve(entry?.value ?? null);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    logger.w(`[IndexedDB] Read failed for ${store}/${key}:`, e);
    return null;
  }
};

const idbSet = async <T>(store: LargeDataStore, key: string, value: T): Promise<boolean> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(store, 'readwrite');
      const req = tx.objectStore(store).put({
        key,
        value,
        updatedAt: new Date().toISOString(),
      } as IDBEntry<T>);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    logger.w(`[IndexedDB] Write failed for ${store}/${key}:`, e);
    return false;
  }
};

const IDB_MIGRATION_KEYS: Record<LargeDataStore, string[]> = {
  vocabulary: ['EngVox_vocabulary_state', 'EngVox_vocabulary_memory', 'EngVox_vocabulary_menu'],
  learning: ['learning_state'],
  grammar: ['EngVox_grammar_progress'],
};

const migrateFromLocalStorage = async (store: LargeDataStore): Promise<void> => {
  const keys = IDB_MIGRATION_KEYS[store];
  for (const lsKey of keys) {
    const existing = await idbGet(store, lsKey);
    if (existing !== null) continue;

    const lsValue = storage.get<unknown>(lsKey);
    if (lsValue === null) continue;

    await idbSet(store, lsKey, lsValue);
    logger.i(`[IndexedDB] Migrated ${lsKey} from localStorage`);
  }
};

export const indexedDBStorage = {
  async get<T>(store: LargeDataStore, key: string): Promise<T | null> {
    const idbValue = await idbGet<T>(store, key);
    if (idbValue !== null) return idbValue;

    const lsValue = storage.get<T>(key);
    if (lsValue !== null) {
      await idbSet(store, key, lsValue);
      return lsValue;
    }

    return null;
  },

  async set<T>(store: LargeDataStore, key: string, value: T): Promise<boolean> {
    return idbSet(store, key, value);
  },

  async migrateAll(): Promise<void> {
    try {
      for (const store of LARGE_DATA_STORES) {
        await migrateFromLocalStorage(store);
      }
      logger.i('[IndexedDB] Migration complete');
    } catch (e) {
      logger.w('[IndexedDB] Migration failed:', e);
    }
  },
};
