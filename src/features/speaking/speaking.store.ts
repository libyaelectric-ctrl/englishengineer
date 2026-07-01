import { create } from 'zustand';
import {
  SpeakingEvaluationResult,
  SpeakingHistoryEntry,
  SpeakingMission,
} from './speaking.types';
import { SpeakingService } from './speaking.service';
import { KnowledgeCaptureService } from '@/features/learning-intelligence/knowledge-capture.service';

interface SpeakingStoreState {
  missions: SpeakingMission[];
  selectedMissionId: string;
  transcript: string;
  typedTranscript: string;
  timeSpentSeconds: number;
  recordingSeconds: number;
  evaluationResult: SpeakingEvaluationResult | null;
  history: SpeakingHistoryEntry[];
  completedMissions: Record<string, number>;
  isSubmitting: boolean;
  isRecording: boolean;
  hasRecorded: boolean;
  usedSpeechRecognition: boolean;
  volumeLevel: number[];
}

interface SpeakingStoreActions {
  initializeStore: () => void;
  selectMission: (id: string) => void;
  setTranscript: (text: string) => void;
  setTypedTranscript: (text: string) => void;
  startRecording: (usedSpeechRecognition: boolean) => void;
  stopRecording: () => void;
  incrementTimer: () => void;
  submitCurrentMission: () => SpeakingEvaluationResult;
  resetCurrentMission: () => void;
  resetAllSpeakingProgress: () => void;
}

const DEFAULT_VOLUME = Array(18).fill(2) as number[];

const getActivityIndicator = (seconds: number): number[] =>
  Array.from({ length: 18 }, (_value, index) => {
    const cycle = (seconds + index) % 6;
    return 4 + cycle * 3;
  });

export const useSpeakingStore = create<
  SpeakingStoreState & SpeakingStoreActions
>((set, get) => ({
  missions: SpeakingService.getMissions(),
  selectedMissionId: 'speaking_a1_site_introduction',
  transcript: '',
  typedTranscript: '',
  timeSpentSeconds: 0,
  recordingSeconds: 0,
  evaluationResult: null,
  history: [],
  completedMissions: {},
  isSubmitting: false,
  isRecording: false,
  hasRecorded: false,
  usedSpeechRecognition: false,
  volumeLevel: DEFAULT_VOLUME,

  initializeStore: () => {
    const state = SpeakingService.getState();
    set({
      selectedMissionId:
        state.lastSelectedMissionId || 'speaking_a1_site_introduction',
      history: state.history,
      completedMissions: state.completedMissions,
      transcript: '',
      typedTranscript: '',
      timeSpentSeconds: 0,
      recordingSeconds: 0,
      evaluationResult: null,
      isSubmitting: false,
      isRecording: false,
      hasRecorded: false,
      usedSpeechRecognition: false,
      volumeLevel: DEFAULT_VOLUME,
    });
  },

  selectMission: (id: string) => {
    SpeakingService.setLastSelectedMissionId(id);
    set({
      selectedMissionId: id,
      transcript: '',
      typedTranscript: '',
      timeSpentSeconds: 0,
      recordingSeconds: 0,
      evaluationResult: null,
      isRecording: false,
      hasRecorded: false,
      usedSpeechRecognition: false,
      volumeLevel: DEFAULT_VOLUME,
    });
  },

  setTranscript: (text: string) => {
    set({ transcript: text });
  },

  setTypedTranscript: (text: string) => {
    set({
      typedTranscript: text,
      hasRecorded: text.trim().length > 0 || get().hasRecorded,
    });
  },

  startRecording: (usedSpeechRecognition: boolean) => {
    set({
      transcript: '',
      recordingSeconds: 0,
      isRecording: true,
      hasRecorded: false,
      usedSpeechRecognition,
      volumeLevel: DEFAULT_VOLUME,
    });
  },

  stopRecording: () => {
    set({ isRecording: false, hasRecorded: true, volumeLevel: DEFAULT_VOLUME });
  },

  incrementTimer: () => {
    const { isRecording } = get();
    set((state) => ({
      timeSpentSeconds: state.timeSpentSeconds + 1,
      recordingSeconds: isRecording
        ? state.recordingSeconds + 1
        : state.recordingSeconds,
      volumeLevel: isRecording
        ? getActivityIndicator(state.recordingSeconds + 1)
        : DEFAULT_VOLUME,
    }));
  },

  submitCurrentMission: () => {
    set({ isSubmitting: true, isRecording: false });
    const {
      selectedMissionId,
      transcript,
      typedTranscript,
      timeSpentSeconds,
      recordingSeconds,
      usedSpeechRecognition,
      missions,
    } = get();
    const timeSpentMinutes = Math.max(1, Math.round(timeSpentSeconds / 60));

    try {
      const result = SpeakingService.submitSubmission({
        missionId: selectedMissionId,
        transcript,
        typedTranscript,
        timeSpentMinutes,
        recordingSeconds,
        usedSpeechRecognition,
      });
      const state = SpeakingService.getState();
      const mission = missions.find((item) => item.id === selectedMissionId);
      void KnowledgeCaptureService.capture({
        cefrLevel: mission?.cefrLevel ?? 'A1',
        vocabularyTerms: mission?.expectedKeywords,
        grammarHints: mission?.grammarTargets,
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
    set({
      transcript: '',
      typedTranscript: '',
      timeSpentSeconds: 0,
      recordingSeconds: 0,
      evaluationResult: null,
      isRecording: false,
      hasRecorded: false,
      usedSpeechRecognition: false,
      volumeLevel: DEFAULT_VOLUME,
    });
  },

  resetAllSpeakingProgress: () => {
    SpeakingService.resetSpeakingState();
    const state = SpeakingService.getState();
    set({
      selectedMissionId: 'speaking_a1_site_introduction',
      transcript: '',
      typedTranscript: '',
      timeSpentSeconds: 0,
      recordingSeconds: 0,
      evaluationResult: null,
      history: state.history,
      completedMissions: state.completedMissions,
      isSubmitting: false,
      isRecording: false,
      hasRecorded: false,
      usedSpeechRecognition: false,
      volumeLevel: DEFAULT_VOLUME,
    });
  },
}));
