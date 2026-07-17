export { type UserProfile, type AuthState } from './auth.types';

export {
  type SupabaseReadyConfig,
  isLocalAuthAllowed,
  AUTH_CONFIG,
} from './auth.config';

export {
  type AuthAdapter,
  LocalAuthAdapter,
  SupabaseReadyAuthAdapter,
  SupabaseAuthAdapter,
} from './auth.adapter';

export { AuthService } from './auth.service';

export { useAuthStore } from './auth.store';

export { getInitials, generateId } from './auth.helpers';

export {
  mergeArrays,
  mergeJsonValues,
  mergeSnapshots,
  applyCloudSnapshotLocally,
  CloudSyncService,
} from './cloud-sync.service';

export {
  type CloudSyncReason,
  type CloudSyncStatus,
  type SyncableStateKey,
  type CloudProgressSnapshot,
  type CloudSyncQueueItem,
  type CloudSyncState,
  type CloudSnapshotEnvelope,
} from './cloud-sync.types';

export { isSupabaseConfigured, getSupabaseClient } from './supabase.client';

export {
  type JsonPrimitive,
  type JsonValue,
  type JsonObject,
  type SupabaseProfileRow,
  type SupabaseProgressSnapshotRow,
  type EngVoxDatabase,
  mapProfileToSupabaseRow,
  mapSupabaseRowToProfile,
} from './supabase.types';

export { AuthGuard } from './AuthGuard';

export { CloudSyncStatusPanel } from './CloudSyncStatus';
