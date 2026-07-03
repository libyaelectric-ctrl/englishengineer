import { JsonObject, JsonValue } from './supabase.types';

export type CloudSyncReason =
  | 'auth-state-ready'
  | 'manual-sync'
  | 'local-change'
  | 'online-return'
  | 'profile-updated';

export type CloudSyncStatus =
  | 'idle'
  | 'queued'
  | 'syncing'
  | 'synced'
  | 'offline'
  | 'error';

export type SyncableStateKey =
  | 'learning'
  | 'readingHistory'
  | 'writingHistory'
  | 'listeningHistory'
  | 'speakingHistory'
  | 'vocabularyReview'
  | 'grammarReview'
  | 'mistakeLog'
  | 'reviewQueue'
  | 'learningProfile'
  | 'aiCoach'
  | 'gamification'
  | 'userPreferences'
  | 'workspaces';

export interface CloudProgressSnapshot {
  schemaVersion: 1;
  userId: string | null;
  capturedAt: string;
  source: 'local-first';
  data: Record<SyncableStateKey, JsonValue | null>;
}

export interface CloudSyncQueueItem {
  id: string;
  reason: CloudSyncReason;
  createdAt: string;
  attempts: number;
  snapshot: CloudProgressSnapshot;
}

export interface CloudSyncState {
  status: CloudSyncStatus;
  pendingItems: number;
  lastSyncedAt: string | null;
  lastError: string | null;
}

export interface CloudSnapshotEnvelope extends JsonObject {
  schemaVersion: 1;
  mergedAt: string;
  payload: JsonValue;
}
