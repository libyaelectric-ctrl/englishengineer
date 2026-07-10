/**
 * Backward-compatible re-export.
 * Consumers should gradually migrate to:
 *   - useListeningMissionsStore (mission data)
 *   - useListeningPlaybackStore (audio playback state)
 */
export { useListeningMissionsStore } from './listening-missions.store';
export { useListeningPlaybackStore } from './listening-playback.store';

import { useListeningMissionsStore } from './listening-missions.store';
import { useListeningPlaybackStore } from './listening-playback.store';

/**
 * Combined store selector for backward compatibility.
 * Prefer using the individual stores for better re-render performance.
 */
export const useListeningStore = () => {
  const missions = useListeningMissionsStore();
  const playback = useListeningPlaybackStore();
  return {
    ...missions,
    ...playback,
    // Backward-compatible aliases
    initializeStore: () => {
      missions.initializeMissions();
      playback.initializePlayback();
    },
    resetAllListeningProgress: () => {
      missions.resetAllMissionsProgress();
      playback.resetPlaybackState();
    },
  };
};

/**
 * Combined getState() for imperative access.
 */
useListeningStore.getState = () => {
  const missions = useListeningMissionsStore.getState();
  const playback = useListeningPlaybackStore.getState();
  return { ...missions, ...playback };
};
