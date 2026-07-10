import { create } from 'zustand';
import { ListeningPlaybackSpeed } from './listening.types';
import { ListeningService } from './listening.service';
import { useListeningMissionsStore } from './listening-missions.store';

interface ListeningPlaybackState {
  isPlaying: boolean;
  currentTimeSeconds: number;
  totalDurationSeconds: number;
  playbackSpeed: ListeningPlaybackSpeed;
  isAudioLoading: boolean;
  audioError: string | null;
  favoriteMissionIds: string[];
  resumePositions: Record<string, number>;
  replayCounts: Record<string, number>;
  listeningSecondsByMission: Record<string, number>;
  speedSamples: ListeningPlaybackSpeed[];
  audioCompletedMissionIds: string[];
}

interface ListeningPlaybackActions {
  initializePlayback: () => void;
  syncPlaybackToMission: (missionId: string) => void;
  startPlaying: () => void;
  pausePlaying: () => void;
  replayPlaying: () => void;
  setCurrentTime: (seconds: number) => void;
  setPlayingState: (playing: boolean) => void;
  setPlaybackSpeed: (speed: ListeningPlaybackSpeed) => void;
  setAudioLoading: (loading: boolean) => void;
  setAudioError: (message: string | null) => void;
  updateAudioProgress: (currentSeconds: number, totalSeconds: number) => void;
  skipRelative: (deltaSeconds: number) => void;
  toggleFavoriteMission: (missionId: string) => void;
  recordReplay: (missionId: string) => void;
  recordListeningSecond: () => void;
  markAudioCompleted: (missionId: string) => void;
  selectNextMission: () => void;
  resetPlaybackState: () => void;
}

export const useListeningPlaybackStore = create<
  ListeningPlaybackState & ListeningPlaybackActions
>((set, get) => ({
  isPlaying: false,
  currentTimeSeconds: 0,
  totalDurationSeconds:
    ListeningService.getMissions()[0]?.audioDurationSeconds || 45,
  playbackSpeed: 1,
  isAudioLoading: false,
  audioError: null,
  favoriteMissionIds: [],
  resumePositions: {},
  replayCounts: {},
  listeningSecondsByMission: {},
  speedSamples: [],
  audioCompletedMissionIds: [],

  initializePlayback: () => {
    const state = ListeningService.getState();
    const missions = ListeningService.getMissions();
    const lastId = state.lastSelectedMissionId || 'listening_a1_safe_room';
    const currentMission = missions.find((m) => m.id === lastId) || missions[0];

    set({
      favoriteMissionIds: state.favoriteMissionIds,
      resumePositions: state.resumePositions,
      replayCounts: state.replayCounts,
      listeningSecondsByMission: state.listeningSecondsByMission,
      speedSamples: state.speedSamples,
      audioCompletedMissionIds: state.audioCompletedMissionIds,
      isPlaying: false,
      currentTimeSeconds: state.resumePositions[lastId] || 0,
      totalDurationSeconds: currentMission
        ? currentMission.audioDurationSeconds
        : 45,
      playbackSpeed: 1,
      isAudioLoading: false,
      audioError: null,
    });
  },

  syncPlaybackToMission: (missionId: string) => {
    const missions = ListeningService.getMissions();
    const currentMission = missions.find((m) => m.id === missionId) || missions[0];
    const { resumePositions } = get();

    set({
      isPlaying: false,
      currentTimeSeconds: resumePositions[missionId] || 0,
      totalDurationSeconds: currentMission
        ? currentMission.audioDurationSeconds
        : 45,
      isAudioLoading: false,
      audioError: null,
    });
  },

  startPlaying: () => {
    const { currentTimeSeconds, totalDurationSeconds } = get();
    if (currentTimeSeconds >= totalDurationSeconds) {
      set({ isPlaying: true, currentTimeSeconds: 0 });
    } else {
      set({ isPlaying: true });
    }
  },

  pausePlaying: () => set({ isPlaying: false }),

  replayPlaying: () => set({ isPlaying: true, currentTimeSeconds: 0 }),

  setCurrentTime: (seconds: number) => {
    const { totalDurationSeconds } = get();
    set({
      currentTimeSeconds: Math.min(totalDurationSeconds, Math.max(0, seconds)),
    });
  },

  setPlayingState: (playing: boolean) => set({ isPlaying: playing }),

  setPlaybackSpeed: (speed: ListeningPlaybackSpeed) => {
    const allowedSpeeds: ListeningPlaybackSpeed[] = [0.75, 1, 1.25, 1.5];
    if (allowedSpeeds.includes(speed)) {
      set({ playbackSpeed: speed });
    }
  },

  setAudioLoading: (loading: boolean) => set({ isAudioLoading: loading }),

  setAudioError: (message: string | null) =>
    set({ audioError: message, isAudioLoading: false, isPlaying: false }),

  updateAudioProgress: (currentSeconds: number, totalSeconds: number) => {
    const { selectedMissionId } = useListeningMissionsStore.getState();
    const nextCurrent = Math.max(0, Math.floor(currentSeconds));
    const nextTotal =
      Number.isFinite(totalSeconds) && totalSeconds > 0
        ? Math.floor(totalSeconds)
        : get().totalDurationSeconds;
    ListeningService.saveResumePosition(selectedMissionId, nextCurrent);
    set({
      currentTimeSeconds: nextCurrent,
      totalDurationSeconds: nextTotal,
    });
  },

  skipRelative: (deltaSeconds: number) => {
    const { currentTimeSeconds, totalDurationSeconds } = get();
    set({
      currentTimeSeconds: Math.min(
        totalDurationSeconds,
        Math.max(0, currentTimeSeconds + deltaSeconds)
      ),
    });
  },

  toggleFavoriteMission: (missionId: string) => {
    const state = ListeningService.toggleFavoriteMission(missionId);
    set({ favoriteMissionIds: state.favoriteMissionIds });
  },

  recordReplay: (missionId: string) => {
    const state = ListeningService.recordReplay(missionId);
    set({ replayCounts: state.replayCounts });
  },

  recordListeningSecond: () => {
    const { selectedMissionId } = useListeningMissionsStore.getState();
    const { playbackSpeed } = get();
    const state = ListeningService.recordListeningSecond(
      selectedMissionId,
      playbackSpeed
    );
    set({
      listeningSecondsByMission: state.listeningSecondsByMission,
      speedSamples: state.speedSamples,
    });
  },

  markAudioCompleted: (missionId: string) => {
    const state = ListeningService.markAudioCompleted(missionId);
    set({
      audioCompletedMissionIds: state.audioCompletedMissionIds,
      resumePositions: state.resumePositions,
      currentTimeSeconds: 0,
      isPlaying: false,
    });
  },

  selectNextMission: () => {
    const { missions, selectedMissionId } = useListeningMissionsStore.getState();
    const { selectMission } = useListeningMissionsStore.getState();
    const currentIndex = missions.findIndex(
      (mission) => mission.id === selectedMissionId
    );
    const nextMission = missions[(currentIndex + 1) % missions.length];
    if (nextMission) {
      selectMission(nextMission.id);
    }
  },

  resetPlaybackState: () => {
    const missions = ListeningService.getMissions();
    const currentMission = missions[0];

    set({
      isPlaying: false,
      currentTimeSeconds: 0,
      totalDurationSeconds: currentMission
        ? currentMission.audioDurationSeconds
        : 45,
      playbackSpeed: 1,
      isAudioLoading: false,
      audioError: null,
    });
  },
}));
