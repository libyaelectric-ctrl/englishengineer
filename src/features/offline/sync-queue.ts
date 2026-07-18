import { storage } from '@/shared/storage';
import type {
  SyncQueueItem,
  SyncQueueState,
  SyncQueueListener,
} from './sync-queue.types';

const STORAGE_KEY = 'sync_queue';
const MAX_RETRIES = 3;
const SYNC_INTERVAL_MS = 5000;

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

    // Start sync if online
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
        // Simulate sync processing - in real app, this would call an API
        await new Promise((resolve) => setTimeout(resolve, 100));

        processedIds.push(item.id);
        state.syncProgress = Math.round(((i + 1) / totalItems) * 100);
        notifyListeners();
      } catch {
        item.retries++;
        if (item.retries >= item.maxRetries) {
          processedIds.push(item.id); // Remove after max retries
        }
      }

      // Check if still online
      if (!state.isOnline) break;
    }

    // Remove processed items
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

    // Listen for online/offline events
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
};
