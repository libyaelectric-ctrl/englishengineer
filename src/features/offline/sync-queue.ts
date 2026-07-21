import { storage } from '@/shared/storage';
import { logger } from '@/shared/logger';
import type {
  SyncQueueItem,
  SyncQueueState,
  SyncQueueListener,
} from './sync-queue.types';

const STORAGE_KEY = 'sync_queue';
const DEAD_LETTER_KEY = 'sync_dead_letter_queue';
const MAX_RETRIES = 3;
const SYNC_INTERVAL_MS = 5000;
const SYNC_API_TIMEOUT_MS = 15_000;

let listeners: SyncQueueListener[] = [];
let syncTimer: ReturnType<typeof setInterval> | null = null;

const getInitialState = (): SyncQueueState => ({
  items: storage.get<SyncQueueItem[]>(STORAGE_KEY) || [],
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  isSyncing: false,
  lastSyncAt: null,
  syncProgress: 0,
});

const state = getInitialState();

const notifyListeners = () => {
  listeners.forEach((listener) => listener({ ...state }));
};

const persistState = () => {
  storage.set(STORAGE_KEY, state.items);
};

const moveToDeadLetter = (item: SyncQueueItem): void => {
  const deadLetter =
    storage.get<SyncQueueItem[]>(DEAD_LETTER_KEY) || [];
  deadLetter.push({ ...item, timestamp: new Date().toISOString() });
  storage.set(DEAD_LETTER_KEY, deadLetter);
  logger.w(`[SyncQueue] Item ${item.id} moved to dead letter queue after ${item.retries} retries.`);
};

const getDeadLetterItems = (): SyncQueueItem[] =>
  storage.get<SyncQueueItem[]>(DEAD_LETTER_KEY) || [];

const clearDeadLetter = (): void => {
  storage.set(DEAD_LETTER_KEY, []);
};

const getSyncEndpoint = (): string => {
  const raw =
    (import.meta as unknown as { env?: Record<string, string> }).env
      ?.VITE_AI_PROXY_URL || '';
  if (!raw) return '';
  const base = raw.replace(/\/+$/, '');
  return `${base}/api/v1/sync`;
};

const postSyncItem = async (item: SyncQueueItem): Promise<void> => {
  const endpoint = getSyncEndpoint();
  if (!endpoint) {
    logger.w(
      `Sync API not configured (VITE_AI_PROXY_URL missing). Skipping network sync for item: ${item.id}`
    );
    return;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), SYNC_API_TIMEOUT_MS);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: item.action,
        payload: item.payload,
        itemId: item.id,
        timestamp: item.timestamp,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Sync API responded with status ${response.status}`);
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('Sync API request timed out');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

export const SyncQueue = {
  getState(): SyncQueueState {
    return { ...state };
  },

  subscribe(listener: SyncQueueListener): () => void {
    listeners.push(listener);
    listener({ ...state });
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },

  enqueue(action: string, payload: Record<string, unknown>): string {
    const id = `sq_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const item: SyncQueueItem = {
      id,
      action,
      payload,
      timestamp: new Date().toISOString(),
      retries: 0,
      maxRetries: MAX_RETRIES,
    };

    state.items.push(item);
    persistState();
    notifyListeners();

    if (state.isOnline && !state.isSyncing) {
      this.processQueue();
    }

    return id;
  },

  remove(id: string): void {
    state.items = state.items.filter((item) => item.id !== id);
    persistState();
    notifyListeners();
  },

  clear(): void {
    state.items = [];
    persistState();
    notifyListeners();
  },

  setOnline(isOnline: boolean): void {
    const wasOffline = !state.isOnline;
    state.isOnline = isOnline;
    notifyListeners();

    if (isOnline && wasOffline && state.items.length > 0) {
      this.processQueue();
    }
  },

  async processQueue(): Promise<void> {
    if (state.isSyncing || !state.isOnline || state.items.length === 0) return;

    state.isSyncing = true;
    state.syncProgress = 0;
    notifyListeners();

    const totalItems = state.items.length;
    const processedIds: string[] = [];

    for (let i = 0; i < state.items.length; i++) {
      const item = state.items[i];

      try {
        await postSyncItem(item);
        processedIds.push(item.id);
      } catch {
        item.retries += 1;
        if (item.retries >= item.maxRetries) {
          moveToDeadLetter(item);
          processedIds.push(item.id);
        }
      }

      state.syncProgress = Math.round(((i + 1) / totalItems) * 100);
      notifyListeners();

      if (!state.isOnline) break;
    }

    state.items = state.items.filter((item) => !processedIds.includes(item.id));
    state.isSyncing = false;
    state.lastSyncAt = new Date().toISOString();
    state.syncProgress = 100;
    persistState();
    notifyListeners();
  },

  startAutoSync(): void {
    if (syncTimer) return;
    syncTimer = setInterval(() => {
      if (state.isOnline && !state.isSyncing && state.items.length > 0) {
        this.processQueue();
      }
    }, SYNC_INTERVAL_MS);

    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.setOnline(true));
      window.addEventListener('offline', () => this.setOnline(false));
    }
  },

  stopAutoSync(): void {
    if (syncTimer) {
      clearInterval(syncTimer);
      syncTimer = null;
    }
  },

  getQueueSize(): number {
    return state.items.length;
  },

  isItemPending(id: string): boolean {
    return state.items.some((item) => item.id === id);
  },

  getDeadLetterItems,
  clearDeadLetter,
};
