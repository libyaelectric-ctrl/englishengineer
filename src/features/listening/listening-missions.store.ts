import { create } from 'zustand';
import {
  ListeningMission,
  ListeningHistoryEntry,
  ListeningEvaluationResult,
} from './listening.types';
import { ListeningService } from './listening.service';
import { KnowledgeCaptureService } from '@/features/learning-intelligence/knowledge-capture.service';

interface ListeningMissionsState {
  missions: ListeningMission[];
  selectedMissionId: string;
  answers: Record<string, string>;
  summary: string;
  userKeywords: string;
  timeSpentSeconds: number;
  evaluationResult: ListeningEvaluationResult | null;
  history: ListeningHistoryEntry[];
  completedMissions: Record<string, number>;
  isSubmitting: boolean;
}

interface ListeningMissionsActions {
  initializeMissions: () => void;
  selectMission: (id: string) => void;
  setAnswer: (questionId: string, answer: string) => void;
  setSummary: (text: string) => void;
  setUserKeywords: (text: string) => void;
  incrementTimer: () => void;
  submitCurrentMission: () => ListeningEvaluationResult;
  resetCurrentMission: () => void;
  resetAllMissionsProgress: () => void;
}

export const useListeningMissionsStore = create<
  ListeningMissionsState & ListeningMissionsActions
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

  initializeMissions: () => {
    const state = ListeningService.getState();
    const lastId = state.lastSelectedMissionId || 'listening_a1_safe_room';

    set({
      selectedMissionId: lastId,
      history: state.history,
      completedMissions: state.completedMissions,
      answers: {},
      summary: '',
      userKeywords: '',
      timeSpentSeconds: 0,
      evaluationResult: null,
    });
  },

  selectMission: (id: string) => {
    ListeningService.setLastSelectedMissionId(id);
    set({
      selectedMissionId: id,
      answers: {},
      summary: '',
      userKeywords: '',
      timeSpentSeconds: 0,
      evaluationResult: null,
    });
  },

  setAnswer: (questionId: string, answer: string) => {
    set((state) => ({
      answers: { ...state.answers, [questionId]: answer },
    }));
  },

  setSummary: (text: string) => set({ summary: text }),

  setUserKeywords: (text: string) => set({ userKeywords: text }),

  incrementTimer: () => {
    set((state) => ({ timeSpentSeconds: state.timeSpentSeconds + 1 }));
  },

  submitCurrentMission: () => {
    set({ isSubmitting: true });
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
    set({
      answers: {},
      summary: '',
      userKeywords: '',
      timeSpentSeconds: 0,
      evaluationResult: null,
    });
  },

  resetAllMissionsProgress: () => {
    ListeningService.resetListeningState();
    const state = ListeningService.getState();

    set({
      selectedMissionId: 'listening_a1_safe_room',
      answers: {},
      summary: '',
      userKeywords: '',
      timeSpentSeconds: 0,
      evaluationResult: null,
      history: state.history,
      completedMissions: state.completedMissions,
    });
  },
}));
