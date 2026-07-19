import { storage } from '@/shared/storage';
import type {
  VocabularyMenuState,
  VocabularyMenuProgress,
} from '../services/vocabulary.menu';

const SYNC_STORAGE_KEY = 'EngVox_vocabulary_sync';
const SYNC_timestamp_KEY = 'EngVox_vocabulary_sync_timestamp';

export interface VocabularySyncState {
  userId: string;
  progress: Record<string, VocabularyMenuProgress>;
  myVocabularyIds: string[];
  lastSyncedAt: string;
  syncVersion: number;
}

export interface SyncConflict {
  wordId: string;
  local: VocabularyMenuProgress;
  remote: VocabularyMenuProgress;
  localTimestamp: string;
  remoteTimestamp: string;
}

const emptySyncState = (): VocabularySyncState => ({
  userId: '',
  progress: {},
  myVocabularyIds: [],
  lastSyncedAt: '',
  syncVersion: 0,
});

export const VocabularySyncService = {
  getSyncState(): VocabularySyncState {
    return (
      storage.get<VocabularySyncState>(SYNC_STORAGE_KEY) ?? emptySyncState()
    );
  },

  saveSyncState(state: VocabularySyncState): void {
    storage.set(SYNC_STORAGE_KEY, state);
    storage.set(SYNC_timestamp_KEY, state.lastSyncedAt);
  },

  getLastSyncTimestamp(): string {
    return storage.get<string>(SYNC_timestamp_KEY) ?? '';
  },

  mergeProgress(
    local: Record<string, VocabularyMenuProgress>,
    remote: Record<string, VocabularyMenuProgress>
  ): Record<string, VocabularyMenuProgress> {
    const merged = { ...remote };

    for (const [wordId, localProgress] of Object.entries(local)) {
      const remoteProgress = merged[wordId];

      if (!remoteProgress) {
        merged[wordId] = localProgress;
        continue;
      }

      const localTotal =
        localProgress.correctReviews + localProgress.wrongReviews;
      const remoteTotal =
        remoteProgress.correctReviews + remoteProgress.wrongReviews;

      if (localTotal > remoteTotal) {
        merged[wordId] = localProgress;
      } else if (remoteTotal > localTotal) {
        merged[wordId] = remoteProgress;
      } else {
        const localDate = new Date(localProgress.lastReviewed || 0).getTime();
        const remoteDate = new Date(remoteProgress.lastReviewed || 0).getTime();
        merged[wordId] =
          localDate >= remoteDate ? localProgress : remoteProgress;
      }
    }

    return merged;
  },

  detectConflicts(
    local: Record<string, VocabularyMenuProgress>,
    remote: Record<string, VocabularyMenuProgress>
  ): SyncConflict[] {
    const conflicts: SyncConflict[] = [];

    for (const [wordId, localProgress] of Object.entries(local)) {
      const remoteProgress = remote[wordId];
      if (!remoteProgress) continue;

      const localTotal =
        localProgress.correctReviews + localProgress.wrongReviews;
      const remoteTotal =
        remoteProgress.correctReviews + remoteProgress.wrongReviews;

      if (localTotal > 0 && remoteTotal > 0 && localTotal === remoteTotal) {
        const localDate = localProgress.lastReviewed || '';
        const remoteDate = remoteProgress.lastReviewed || '';
        if (localDate !== remoteDate) {
          conflicts.push({
            wordId,
            local: localProgress,
            remote: remoteProgress,
            localTimestamp: localDate,
            remoteTimestamp: remoteDate,
          });
        }
      }
    }

    return conflicts;
  },

  prepareSyncPayload(
    localState: VocabularyMenuState,
    userId: string
  ): VocabularySyncState {
    return {
      userId,
      progress: localState.progress,
      myVocabularyIds: localState.myVocabulary.map((w) => w.id),
      lastSyncedAt: new Date().toISOString(),
      syncVersion: this.getSyncState().syncVersion + 1,
    };
  },

  applySyncPayload(
    payload: VocabularySyncState,
    currentLocal: VocabularyMenuState
  ): VocabularyMenuState {
    const mergedProgress = this.mergeProgress(
      currentLocal.progress,
      payload.progress
    );

    return {
      progress: mergedProgress,
      myVocabulary: currentLocal.myVocabulary,
    };
  },

  clearSync(): void {
    storage.remove(SYNC_STORAGE_KEY);
    storage.remove(SYNC_timestamp_KEY);
  },
};
