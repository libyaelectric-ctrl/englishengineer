/**
 * Vocabulary Cache — Enhanced offline-first vocabulary storage
 *
 * Extends IndexedDB with:
 * - TTL-based cache expiration
 * - Priority-based cache eviction
 * - Sync status tracking
 * - Offline vocabulary search
 */
import { logger } from '@/shared/logger';

import { isIDBSupported, openIDB } from './idb-helper';

const DB_NAME = 'engvox_vocabulary_cache';
const DB_VERSION = 1;
const STORE_VOCABULARY = 'vocabulary';
const STORE_SYNC_QUEUE = 'sync_queue';

interface CachedTerm {
  id: string;
  term: string;
  definition: string;
  pronunciation?: string;
  language?: string;
  cefrLevel?: string;
  domain?: string;
  examples?: string[];
  timestamp: number;
  expiresAt?: number;
  priority: 'high' | 'medium' | 'low';
  synced: boolean;
}

interface SyncQueueItem {
  id: string;
  termId: string;
  action: 'add' | 'update' | 'delete';
  data?: Partial<CachedTerm>;
  timestamp: string;
  retries: number;
}

interface CacheStats {
  totalTerms: number;
  syncedTerms: number;
  unsyncedTerms: number;
  highPriority: number;
  mediumPriority: number;
  lowPriority: number;
  expiredTerms: number;
}

const ensureStores = (db: IDBDatabase): void => {
  if (!db.objectStoreNames.contains(STORE_VOCABULARY)) {
    const vocabStore = db.createObjectStore(STORE_VOCABULARY, { keyPath: 'id' });
    vocabStore.createIndex('term', 'term', { unique: false });
    vocabStore.createIndex('cefrLevel', 'cefrLevel', { unique: false });
    vocabStore.createIndex('domain', 'domain', { unique: false });
    vocabStore.createIndex('priority', 'priority', { unique: false });
    vocabStore.createIndex('synced', 'synced', { unique: false });
  }
  if (!db.objectStoreNames.contains(STORE_SYNC_QUEUE)) {
    const syncStore = db.createObjectStore(STORE_SYNC_QUEUE, {
      keyPath: 'id',
      autoIncrement: true,
    });
    syncStore.createIndex('termId', 'termId', { unique: false });
    syncStore.createIndex('timestamp', 'timestamp', { unique: false });
  }
};

const openDB = (): Promise<IDBDatabase> =>
  openIDB({ dbName: DB_NAME, dbVersion: DB_VERSION, onUpgrade: ensureStores });

/**
 * Cache a vocabulary term with TTL and priority.
 */
export async function cacheTerm(term: CachedTerm, ttlMs?: number): Promise<void> {
  if (!isIDBSupported()) return;

  const entry: CachedTerm = {
    ...term,
    timestamp: Date.now(),
    expiresAt: ttlMs ? Date.now() + ttlMs : undefined,
    synced: false,
  };

  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_VOCABULARY, 'readwrite');
      const store = tx.objectStore(STORE_VOCABULARY);
      store.put(entry);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    logger.w('[VocabCache] Failed to cache term', e);
  }
}

/**
 * Batch cache multiple vocabulary terms.
 */
export async function cacheTermsBatch(terms: CachedTerm[], ttlMs?: number): Promise<void> {
  if (!isIDBSupported() || terms.length === 0) return;

  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_VOCABULARY, 'readwrite');
      const store = tx.objectStore(STORE_VOCABULARY);
      const now = Date.now();

      for (const term of terms) {
        store.put({
          ...term,
          timestamp: now,
          expiresAt: ttlMs ? now + ttlMs : undefined,
          synced: false,
        });
      }

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    logger.w('[VocabCache] Failed to batch cache terms', e);
  }
}

/**
 * Get a cached term by ID.
 */
export async function getCachedTerm(id: string): Promise<CachedTerm | null> {
  if (!isIDBSupported()) return null;

  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_VOCABULARY, 'readonly');
      const store = tx.objectStore(STORE_VOCABULARY);
      const request = store.get(id);

      request.onsuccess = () => {
        const result = request.result as CachedTerm | undefined;
        if (!result) return resolve(null);

        // Check TTL
        if (result.expiresAt && Date.now() > result.expiresAt) {
          resolve(null);
          return;
        }
        resolve(result);
      };
      request.onerror = () => resolve(null);
    });
  } catch (e) {
    logger.w('[VocabCache] Failed to get term', e);
    return null;
  }
}

/**
 * Search cached vocabulary terms offline.
 */
export async function searchCachedTerms(
  query: string,
  options?: {
    cefrLevel?: string;
    domain?: string;
    limit?: number;
  }
): Promise<CachedTerm[]> {
  if (!isIDBSupported()) return [];

  const lowerQuery = query.toLowerCase();
  const limit = options?.limit ?? 20;

  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_VOCABULARY, 'readonly');
      const store = tx.objectStore(STORE_VOCABULARY);
      const request = store.getAll();

      request.onsuccess = () => {
        const allTerms = (request.result as CachedTerm[]) ?? [];
        const now = Date.now();

        const results = allTerms
          .filter((term) => {
            // Filter expired
            if (term.expiresAt && now > term.expiresAt) return false;

            // Filter by query
            const matchesQuery =
              term.term.toLowerCase().includes(lowerQuery) ||
              term.definition.toLowerCase().includes(lowerQuery);
            if (!matchesQuery) return false;

            // Filter by CEFR level
            if (options?.cefrLevel && term.cefrLevel !== options.cefrLevel) return false;

            // Filter by domain
            if (options?.domain && term.domain !== options.domain) return false;

            return true;
          })
          .sort((a, b) => {
            // Sort by priority then timestamp
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            const pDiff = (priorityOrder[a.priority] ?? 1) - (priorityOrder[b.priority] ?? 1);
            if (pDiff !== 0) return pDiff;
            return b.timestamp - a.timestamp;
          })
          .slice(0, limit);

        resolve(results);
      };
      request.onerror = () => resolve([]);
    });
  } catch (e) {
    logger.w('[VocabCache] Failed to search terms', e);
    return [];
  }
}

/**
 * Get all cached terms for offline use.
 */
export async function getAllCachedTerms(): Promise<CachedTerm[]> {
  if (!isIDBSupported()) return [];

  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_VOCABULARY, 'readonly');
      const store = tx.objectStore(STORE_VOCABULARY);
      const request = store.getAll();

      request.onsuccess = () => {
        const terms = (request.result as CachedTerm[]) ?? [];
        const now = Date.now();
        // Filter out expired
        resolve(terms.filter((t) => !t.expiresAt || now <= t.expiresAt));
      };
      request.onerror = () => resolve([]);
    });
  } catch (e) {
    logger.w('[VocabCache] Failed to get all terms', e);
    return [];
  }
}

/**
 * Add a term to the sync queue for when online.
 */
export async function addToSyncQueue(
  termId: string,
  action: SyncQueueItem['action'],
  data?: Partial<CachedTerm>
): Promise<void> {
  if (!isIDBSupported()) return;

  const item: Omit<SyncQueueItem, 'id'> = {
    termId,
    action,
    data,
    timestamp: new Date().toISOString(),
    retries: 0,
  };

  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_SYNC_QUEUE, 'readwrite');
      const store = tx.objectStore(STORE_SYNC_QUEUE);
      store.add(item);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    logger.w('[VocabCache] Failed to add to sync queue', e);
  }
}

/**
 * Get pending sync items.
 */
export async function getSyncQueue(): Promise<SyncQueueItem[]> {
  if (!isIDBSupported()) return [];

  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_SYNC_QUEUE, 'readonly');
      const store = tx.objectStore(STORE_SYNC_QUEUE);
      const request = store.getAll();

      request.onsuccess = () => resolve((request.result as SyncQueueItem[]) ?? []);
      request.onerror = () => resolve([]);
    });
  } catch (e) {
    logger.w('[VocabCache] Failed to get sync queue', e);
    return [];
  }
}

/**
 * Remove a synced item from the queue.
 */
export async function removeFromSyncQueue(termId: string): Promise<void> {
  if (!isIDBSupported()) return;

  try {
    const db = await openDB();
    const queue = await getSyncQueue();

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_SYNC_QUEUE, 'readwrite');
      const store = tx.objectStore(STORE_SYNC_QUEUE);

      for (const item of queue) {
        if (item.termId === termId) {
          store.delete(item.id);
        }
      }

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    logger.w('[VocabCache] Failed to remove from sync queue', e);
  }
}

/**
 * Get cache statistics.
 */
export async function getCacheStats(): Promise<CacheStats> {
  if (!isIDBSupported()) {
    return {
      totalTerms: 0,
      syncedTerms: 0,
      unsyncedTerms: 0,
      highPriority: 0,
      mediumPriority: 0,
      lowPriority: 0,
      expiredTerms: 0,
    };
  }

  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_VOCABULARY, 'readonly');
      const store = tx.objectStore(STORE_VOCABULARY);
      const request = store.getAll();

      request.onsuccess = () => {
        const terms = (request.result as CachedTerm[]) ?? [];
        const now = Date.now();

        let syncedTerms = 0;
        let highPriority = 0;
        let mediumPriority = 0;
        let lowPriority = 0;
        let expiredTerms = 0;

        for (const term of terms) {
          if (term.synced) syncedTerms++;
          if (term.priority === 'high') highPriority++;
          else if (term.priority === 'medium') mediumPriority++;
          else lowPriority++;
          if (term.expiresAt && now > term.expiresAt) expiredTerms++;
        }

        resolve({
          totalTerms: terms.length,
          syncedTerms,
          unsyncedTerms: terms.length - syncedTerms,
          highPriority,
          mediumPriority,
          lowPriority,
          expiredTerms,
        });
      };
      request.onerror = () =>
        resolve({
          totalTerms: 0,
          syncedTerms: 0,
          unsyncedTerms: 0,
          highPriority: 0,
          mediumPriority: 0,
          lowPriority: 0,
          expiredTerms: 0,
        });
    });
  } catch (e) {
    logger.w('[VocabCache] Failed to get cache stats', e);
    return {
      totalTerms: 0,
      syncedTerms: 0,
      unsyncedTerms: 0,
      highPriority: 0,
      mediumPriority: 0,
      lowPriority: 0,
      expiredTerms: 0,
    };
  }
}

/**
 * Evict expired and low-priority terms when cache is full.
 */
export async function evictCache(maxSize: number = 10000): Promise<number> {
  if (!isIDBSupported()) return 0;

  try {
    const db = await openDB();
    const terms = await getAllCachedTerms();

    if (terms.length <= maxSize) return 0;

    const toEvict = terms.length - maxSize;
    const sorted = terms.sort((a, b) => {
      // Evict expired first, then low priority, then oldest
      const aExpired = a.expiresAt && Date.now() > a.expiresAt ? 0 : 1;
      const bExpired = b.expiresAt && Date.now() > b.expiresAt ? 0 : 1;
      if (aExpired !== bExpired) return aExpired - bExpired;

      const priorityOrder = { low: 0, medium: 1, high: 2 };
      const pDiff = (priorityOrder[a.priority] ?? 1) - (priorityOrder[b.priority] ?? 1);
      if (pDiff !== 0) return pDiff;

      return a.timestamp - b.timestamp;
    });

    const toDelete = sorted.slice(0, toEvict);

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_VOCABULARY, 'readwrite');
      const store = tx.objectStore(STORE_VOCABULARY);

      for (const term of toDelete) {
        store.delete(term.id);
      }

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });

    return toDelete.length;
  } catch (e) {
    logger.w('[VocabCache] Failed to evict cache', e);
    return 0;
  }
}
