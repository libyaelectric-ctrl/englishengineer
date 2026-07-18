import { SupabaseClient } from '@supabase/supabase-js';
import { IdService } from '@/core/ids/id.service';
import { storage } from '@/shared/storage';
import { logger } from '@/shared/logger';
import { getSupabaseClient, isSupabaseConfigured } from './supabase.client';
import {
  CloudProgressSnapshot,
  CloudSnapshotEnvelope,
  CloudSyncQueueItem,
  CloudSyncReason,
  CloudSyncState,
  SyncableStateKey,
} from './cloud-sync.types';
import { JsonObject, JsonValue } from './supabase.types';

const QUEUE_KEY = 'cloud_sync_queue';
const STATE_KEY = 'cloud_sync_state';
const SNAPSHOT_SCHEMA_VERSION = 1;
const MAX_SYNC_ATTEMPTS = 5;
const stateListeners = new Set<(state: CloudSyncState) => void>();
let isApplyingRemoteSnapshot = false;

const SYNCABLE_KEYS: SyncableStateKey[] = [
  'learning',
  'readingHistory',
  'writingHistory',
  'listeningHistory',
  'speakingHistory',
  'vocabularyReview',
  'grammarReview',
  'mistakeLog',
  'reviewQueue',
  'learningProfile',
  'aiCoach',
  'gamification',
  'userPreferences',
  'workspaces',
];

const STATIC_STORAGE_KEYS: Record<
  Exclude<SyncableStateKey, 'learningProfile' | 'vocabularyReview'>,
  string
> = {
  learning: 'learning_state',
  readingHistory: 'EngVox_reading_state',
  writingHistory: 'EngVox_writing_state',
  listeningHistory: 'EngVox_listening_state',
  speakingHistory: 'EngVox_speaking_state',
  grammarReview: 'EngVox_grammar_progress',
  mistakeLog: 'learning_intelligence',
  reviewQueue: 'task_evaluation_records',
  aiCoach: 'ai_coach_pro_state',
  gamification: 'gamification_pro_state',
  userPreferences: 'auth_user',
  workspaces: 'EngVox_workspaces',
};

const getStorageKeys = (
  key: SyncableStateKey,
  userId: string | null
): string[] => {
  if (key === 'learningProfile') {
    return userId ? [`learning_profile_${userId}`] : [];
  }
  if (key === 'vocabularyReview') {
    return [
      'EngVox_vocabulary_state',
      'EngVox_vocabulary_memory',
      'EngVox_vocabulary_menu',
    ];
  }
  return [STATIC_STORAGE_KEYS[key]];
};

const createEmptySnapshotData = (): Record<
  SyncableStateKey,
  JsonValue | null
> =>
  Object.fromEntries(SYNCABLE_KEYS.map((key) => [key, null])) as Record<
    SyncableStateKey,
    JsonValue | null
  >;

const isOnline = (): boolean =>
  typeof navigator === 'undefined' || navigator.onLine;

const emptyState = (): CloudSyncState => ({
  status: 'idle',
  pendingItems: 0,
  lastSyncedAt: null,
  lastError: null,
});

const toJsonValue = (value: unknown): JsonValue | null => {
  if (value === undefined) {
    return null;
  }

  return JSON.parse(JSON.stringify(value)) as JsonValue;
};

const isJsonObject = (value: unknown): value is JsonObject =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

export const mergeArrays = (
  local: JsonValue[],
  remote: JsonValue[]
): JsonValue[] => {
  const seen = new Set<string>();
  return [...remote, ...local].filter((item) => {
    const key = JSON.stringify(item);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

export const mergeJsonValues = (
  local: JsonValue | null,
  remote: JsonValue | null
): JsonValue | null => {
  if (local === null) {
    return remote;
  }
  if (remote === null) {
    return local;
  }
  if (typeof local === 'number' && typeof remote === 'number') {
    return Math.max(local, remote);
  }
  if (Array.isArray(local) && Array.isArray(remote)) {
    return mergeArrays(local, remote);
  }
  if (isJsonObject(local) && isJsonObject(remote)) {
    const merged: JsonObject = { ...remote, ...local };
    const keys = new Set([...Object.keys(remote), ...Object.keys(local)]);
    keys.forEach((key) => {
      merged[key] = mergeJsonValues(local[key] ?? null, remote[key] ?? null);
    });
    return merged;
  }
  return local;
};

const isCloudProgressSnapshot = (
  value: unknown
): value is CloudProgressSnapshot => {
  if (!isJsonObject(value)) {
    return false;
  }

  return (
    value.schemaVersion === SNAPSHOT_SCHEMA_VERSION && isJsonObject(value.data)
  );
};

const extractSnapshot = (value: unknown): CloudProgressSnapshot | null => {
  if (isCloudProgressSnapshot(value)) {
    return value;
  }

  if (isJsonObject(value)) {
    const payload = value.payload ?? null;
    if (isCloudProgressSnapshot(payload)) {
      return payload;
    }
  }

  return null;
};

export const mergeSnapshots = (
  local: CloudProgressSnapshot,
  remote: CloudProgressSnapshot | null,
  userId: string
): CloudProgressSnapshot => {
  if (!remote) {
    return { ...local, userId };
  }

  const mergedData = SYNCABLE_KEYS.reduce<
    Record<SyncableStateKey, JsonValue | null>
  >((acc, key) => {
    acc[key] = mergeJsonValues(
      local.data[key] ?? null,
      remote.data[key] ?? null
    );
    return acc;
  }, createEmptySnapshotData());

  return {
    schemaVersion: SNAPSHOT_SCHEMA_VERSION,
    userId,
    capturedAt: new Date().toISOString(),
    source: 'local-first',
    data: mergedData,
  };
};

const saveQueue = (queue: CloudSyncQueueItem[]): void => {
  storage.set(QUEUE_KEY, queue);
  const current = storage.get<CloudSyncState>(STATE_KEY) || emptyState();
  const nextState: CloudSyncState = {
    ...current,
    status: queue.length > 0 ? 'queued' : current.status,
    pendingItems: queue.length,
  };
  storage.set(STATE_KEY, nextState);
  stateListeners.forEach((listener) => listener(nextState));
};

const saveState = (state: CloudSyncState): void => {
  storage.set(STATE_KEY, state);
  stateListeners.forEach((listener) => listener(state));
};

const getQueue = (): CloudSyncQueueItem[] =>
  storage.get<CloudSyncQueueItem[]>(QUEUE_KEY) || [];

const readSyncableData = (
  key: SyncableStateKey,
  userId: string | null
): JsonValue | null => {
  const keys = getStorageKeys(key, userId);
  if (keys.length === 0) return null;
  if (keys.length === 1) {
    return toJsonValue(storage.get<unknown>(keys[0]));
  }

  const grouped: JsonObject = {};
  keys.forEach((storageKey) => {
    const value = toJsonValue(storage.get<unknown>(storageKey));
    if (value !== null) grouped[storageKey] = value;
  });
  return Object.keys(grouped).length > 0 ? grouped : null;
};

export const applyCloudSnapshotLocally = (
  snapshot: CloudProgressSnapshot,
  userId: string
): void => {
  isApplyingRemoteSnapshot = true;
  try {
    SYNCABLE_KEYS.forEach((key) => {
      const value = snapshot.data[key] ?? null;
      if (value === null) return;
      const keys = getStorageKeys(key, userId);
      if (keys.length === 1) {
        storage.set(keys[0], value);
        return;
      }
      if (!isJsonObject(value)) return;
      keys.forEach((storageKey) => {
        const storedValue = value[storageKey];
        if (storedValue !== undefined) storage.set(storageKey, storedValue);
      });
    });
  } finally {
    isApplyingRemoteSnapshot = false;
  }
};

const createSnapshot = (userId: string | null): CloudProgressSnapshot => ({
  schemaVersion: SNAPSHOT_SCHEMA_VERSION,
  userId,
  capturedAt: new Date().toISOString(),
  source: 'local-first',
  data: SYNCABLE_KEYS.reduce<Record<SyncableStateKey, JsonValue | null>>(
    (acc, key) => {
      acc[key] = readSyncableData(key, userId);
      return acc;
    },
    createEmptySnapshotData()
  ),
});

export const CloudSyncService = {
  subscribe(listener: (state: CloudSyncState) => void): () => void {
    stateListeners.add(listener);
    return () => {
      stateListeners.delete(listener);
    };
  },

  isSyncableStorageKey(key: string, userId: string | null): boolean {
    if (isApplyingRemoteSnapshot) return false;
    return SYNCABLE_KEYS.some((syncKey) =>
      getStorageKeys(syncKey, userId).includes(key)
    );
  },

  getState(): CloudSyncState {
    return storage.get<CloudSyncState>(STATE_KEY) || emptyState();
  },

  async queueSync(
    reason: CloudSyncReason,
    userId: string | null = null
  ): Promise<CloudSyncState> {
    const queue = getQueue();
    const nextQueue = [
      ...queue,
      {
        id: IdService.createId('sync'),
        reason,
        createdAt: new Date().toISOString(),
        attempts: 0,
        snapshot: createSnapshot(userId),
      },
    ].slice(-10);

    saveQueue(nextQueue);
    return this.getState();
  },

  async flushQueue(userId: string): Promise<CloudSyncState> {
    const earlyReturn = this.getEarlyReturnState();
    if (earlyReturn) return earlyReturn;

    const client = getSupabaseClient();
    if (!client) {
      return this.saveAndReturn({
        ...this.getState(),
        status: 'error' as const,
        lastError: 'Supabase client is not configured.',
      });
    }

    const queue = getQueue();
    const localSnapshot = queue.at(-1)?.snapshot || createSnapshot(userId);
    saveState({
      ...this.getState(),
      status: 'syncing',
      pendingItems: queue.length,
      lastError: null,
    });

    const remoteSnapshot = await this.fetchRemoteSnapshot(client, userId);
    const mergedSnapshot = mergeSnapshots(localSnapshot, remoteSnapshot, userId);

    const writeError = await this.writeSnapshot(client, userId, mergedSnapshot);
    if (writeError) {
      return this.handleWriteError(queue, mergedSnapshot, writeError);
    }

    applyCloudSnapshotLocally(mergedSnapshot, userId);
    storage.remove(QUEUE_KEY);
    return this.saveAndReturn({
      status: 'synced' as const,
      pendingItems: 0,
      lastSyncedAt: new Date().toISOString(),
      lastError: null,
    });
  },

  getEarlyReturnState(): CloudSyncState | null {
    if (!isSupabaseConfigured()) {
      return this.saveAndReturn({ ...this.getState(), status: 'idle' as const });
    }
    if (!isOnline()) {
      return this.saveAndReturn({
        ...this.getState(),
        status: 'offline' as const,
        pendingItems: getQueue().length,
      });
    }
    return null;
  },

  saveAndReturn(state: CloudSyncState): CloudSyncState {
    saveState(state);
    return state;
  },

  async fetchRemoteSnapshot(
    client: SupabaseClient,
    userId: string
  ): Promise<CloudProgressSnapshot | null> {
    const { data: remoteRow, error: readError } = await client
      .from('user_progress_snapshots')
      .select('snapshot')
      .eq('user_id', userId)
      .maybeSingle();

    if (readError) {
      logger.w('Cloud sync could not read the remote snapshot.', readError.message);
    }
    return extractSnapshot(remoteRow?.snapshot ?? null);
  },

  async writeSnapshot(
    client: SupabaseClient,
    userId: string,
    mergedSnapshot: CloudProgressSnapshot
  ): Promise<{ message: string } | null> {
    const envelope: CloudSnapshotEnvelope = {
      schemaVersion: SNAPSHOT_SCHEMA_VERSION,
      mergedAt: new Date().toISOString(),
      payload: toJsonValue(mergedSnapshot),
    };

    const { error: writeError } = await client
      .from('user_progress_snapshots')
      .upsert({
        user_id: userId,
        snapshot: envelope,
        schema_version: SNAPSHOT_SCHEMA_VERSION,
        updated_at: new Date().toISOString(),
      });

    return writeError ?? null;
  },

  handleWriteError(
    queue: CloudSyncQueueItem[],
    mergedSnapshot: CloudProgressSnapshot,
    writeError: { message: string }
  ): CloudSyncState {
    const attemptedQueue =
      queue.length > 0
        ? queue.map((item) => ({ ...item, attempts: item.attempts + 1 }))
        : [{
            id: IdService.createId('sync'),
            reason: 'manual-sync' as const,
            createdAt: new Date().toISOString(),
            attempts: 1,
            snapshot: mergedSnapshot,
          }];
    const failedQueue = attemptedQueue.filter(
      (item) => item.attempts < MAX_SYNC_ATTEMPTS
    );
    const droppedCount = attemptedQueue.length - failedQueue.length;
    saveQueue(failedQueue);
    return this.saveAndReturn({
      status: 'error' as const,
      pendingItems: failedQueue.length,
      lastSyncedAt: this.getState().lastSyncedAt,
      lastError:
        droppedCount > 0
          ? `${droppedCount} cloud sync item reached ${MAX_SYNC_ATTEMPTS} attempts and was removed. Last error: ${writeError.message}`
          : writeError.message,
    });
  },
};
