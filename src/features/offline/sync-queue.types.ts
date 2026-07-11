export interface SyncQueueItem {
  id: string;
  action: string;
  payload: Record<string, unknown>;
  timestamp: string;
  retries: number;
  maxRetries: number;
}

export interface SyncQueueState {
  items: SyncQueueItem[];
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncAt: string | null;
  syncProgress: number;
}

export type SyncQueueListener = (state: SyncQueueState) => void;
