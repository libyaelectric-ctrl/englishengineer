import { create } from 'zustand';
import {
  ListeningMission,
  ListeningHistoryEntry,
  ListeningEvaluationResult,
  ListeningPlaybackSpeed,
} from './listening.types';
import { ListeningService } from './listening.service';
import { KnowledgeCaptureService } from '@/features/learning-intelligence/knowledge-capture.service';

interface ListeningStoreState {
  missions: ListeningMission[];
  selectedMissionId: string;
  answers: Record<string, string>; // questionId -> answer
  summary: string;
  userKeywords: string;
  timeSpentSeconds: number;
  evaluationResult: ListeningEvaluationResult | null;
  history: ListeningHistoryEntry[];
  completedMissions: Record<string, number>; // missionId -> best score
  isSubmitting: boolean;

  // Audio playback state
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

interface ListeningStoreActions {
  initializeStore: () => void;
  selectMission: (id: string) => void;
  setAnswer: (questionId: string, answer: string) => void;
  setSummary: (text: string) => void;
  setUserKeywords: (text: string) => void;
  incrementTimer: () => void;
  submitCurrentMission: () => ListeningEvaluationResult;
  resetCurrentMission: () => void;
  resetAllListeningProgress: () => void;

  // Audio playback actions
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
}

export const useListeningStore = create<
  ListeningStoreState & ListeningStoreActions
>((set, get) => ({
  missions: ListeningService.getMissions(),
  selectedMissionId: 'listening_a1_safe_room',
  answers: {},
  summary: '',
  userKeywords: '',
  timeSpentSeconds: 0,
  evaluationResult: null,
  history: [],
  completedMissions: {},
  isSubmitting: false,

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

  initializeStore: () => {
    const state = ListeningService.getState();
    const missions = ListeningService.getMissions();
    const lastId = state.lastSelectedMissionId || 'listening_a1_safe_room';
    const currentMission = missions.find((m) => m.id === lastId) || missions[0];

    set({
      selectedMissionId: lastId,
      history: state.history,
      completedMissions: state.completedMissions,
      favoriteMissionIds: state.favoriteMissionIds,
      resumePositions: state.resumePositions,
      replayCounts: state.replayCounts,
      listeningSecondsByMission: state.listeningSecondsByMission,
      speedSamples: state.speedSamples,
      audioCompletedMissionIds: state.audioCompletedMissionIds,
      answers: {},
      summary: '',
      userKeywords: '',
      timeSpentSeconds: 0,
      evaluationResult: null,
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

  selectMission: (id: string) => {
    ListeningService.setLastSelectedMissionId(id);
    const missions = ListeningService.getMissions();
    const currentMission = missions.find((m) => m.id === id) || missions[0];

    set({
      selectedMissionId: id,
      answers: {},
      summary: '',
      userKeywords: '',
      timeSpentSeconds: 0,
      evaluationResult: null,
      isPlaying: false,
      currentTimeSeconds: ListeningService.getState().resumePositions[id] || 0,
      totalDurationSeconds: currentMission
        ? currentMission.audioDurationSeconds
        : 45,
      isAudioLoading: false,
      audioError: null,
    });
  },

  setAnswer: (questionId: string, answer: string) => {
    set((state) => ({
      answers: {
        ...state.answers,
        [questionId]: answer,
      },
    }));
  },

  setSummary: (text: string) => {
    set({ summary: text });
  },

  setUserKeywords: (text: string) => {
    set({ userKeywords: text });
  },

  incrementTimer: () => {
    const { isPlaying, currentTimeSeconds, totalDurationSeconds } = get();

    // Increment general study time spent
    set((state) => ({
      timeSpentSeconds: state.timeSpentSeconds + 1,
    }));

    // If audio is playing, advance progress
    if (isPlaying) {
      if (currentTimeSeconds >= totalDurationSeconds) {
        set({ isPlaying: false, currentTimeSeconds: totalDurationSeconds });
      } else {
        set({ currentTimeSeconds: currentTimeSeconds + 1 });
      }
    }
  },

  submitCurrentMission: () => {
    set({ isSubmitting: true, isPlaying: false });
    const {
      selectedMissionId,
      answers,
      summary,
      userKeywords,
      timeSpentSeconds,
      missions,
    } = get();
    const timeSpentMinutes = Math.max(1, Math.round(timeSpentSeconds / 60));

    try {
      const result = ListeningService.submitSubmission({
        missionId: selectedMissionId,
        answers,
        summary,
        userKeywords,
        timeSpentMinutes,
      });

      // Refresh local states
      const state = ListeningService.getState();
      const mission = missions.find((item) => item.id === selectedMissionId);
      void KnowledgeCaptureService.capture({
        cefrLevel: mission?.cefrLevel ?? 'A1',
        vocabularyTerms: mission?.vocabulary.map((item) => item.term),
      }).catch(() => undefined);

      set({
        evaluationResult: result,
        history: state.history,
        completedMissions: state.completedMissions,
        isSubmitting: false,
      });

      return result;
    } catch (error) {
      set({ isSubmitting: false });
      throw error;
    }
  },

  resetCurrentMission: () => {
    const { selectedMissionId, missions } = get();
    const currentMission =
      missions.find((m) => m.id === selectedMissionId) || missions[0];

    set({
      answers: {},
      summary: '',
      userKeywords: '',
      timeSpentSeconds: 0,
      evaluationResult: null,
      isPlaying: false,
      currentTimeSeconds: 0,
      totalDurationSeconds: currentMission
        ? currentMission.audioDurationSeconds
        : 45,
      audioError: null,
    });
  },

  resetAllListeningProgress: () => {
    ListeningService.resetListeningState();
    const state = ListeningService.getState();
    const missions = ListeningService.getMissions();
    const currentMission = missions[0];

    set({
      selectedMissionId: 'listening_a1_safe_room',
      answers: {},
      summary: '',
      userKeywords: '',
      timeSpentSeconds: 0,
      evaluationResult: null,
      history: state.history,
      completedMissions: state.completedMissions,
      favoriteMissionIds: state.favoriteMissionIds,
      resumePositions: state.resumePositions,
      replayCounts: state.replayCounts,
      listeningSecondsByMission: state.listeningSecondsByMission,
      speedSamples: state.speedSamples,
      audioCompletedMissionIds: state.audioCompletedMissionIds,
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

  // Audio actions
  startPlaying: () => {
    const { currentTimeSeconds, totalDurationSeconds } = get();
    if (currentTimeSeconds >= totalDurationSeconds) {
      set({ isPlaying: true, currentTimeSeconds: 0 });
    } else {
      set({ isPlaying: true });
    }
  },

  pausePlaying: () => {
    set({ isPlaying: false });
  },

  replayPlaying: () => {
    set({ isPlaying: true, currentTimeSeconds: 0 });
  },

  setCurrentTime: (seconds: number) => {
    const { totalDurationSeconds } = get();
    set({
      currentTimeSeconds: Math.min(totalDurationSeconds, Math.max(0, seconds)),
    });
  },

  setPlayingState: (playing: boolean) => {
    set({ isPlaying: playing });
  },

  setPlaybackSpeed: (speed: ListeningPlaybackSpeed) => {
    const allowedSpeeds: ListeningPlaybackSpeed[] = [0.75, 1, 1.25, 1.5];
    if (allowedSpeeds.includes(speed)) {
      set({ playbackSpeed: speed });
    }
  },

  setAudioLoading: (loading: boolean) => {
    set({ isAudioLoading: loading });
  },

  setAudioError: (message: string | null) => {
    set({ audioError: message, isAudioLoading: false, isPlaying: false });
  },

  updateAudioProgress: (currentSeconds: number, totalSeconds: number) => {
    const { selectedMissionId } = get();
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
    const { selectedMissionId, playbackSpeed } = get();
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
    const { missions, selectedMissionId, selectMission } = get();
    const currentIndex = missions.findIndex(
      (mission) => mission.id === selectedMissionId
    );
    const nextMission = missions[(currentIndex + 1) % missions.length];
    if (nextMission) {
      selectMission(nextMission.id);
    }
  },
}));
