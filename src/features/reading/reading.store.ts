import { create } from 'zustand';
import {
  ReadingMission,
  ReadingHistoryEntry,
  ReadingEvaluationResult,
} from './reading.types';
import { ReadingService } from './reading.service';
import { KnowledgeCaptureService } from '@/features/learning-intelligence/knowledge-capture.service';
import type { KnowledgePoolEntry } from '@/core/content-selection/personalized-content.service';

interface ReadingStoreState {
  missions: ReadingMission[];
  selectedMissionId: string;
  answers: Record<string, string>; // questionId -> response
  clickedVocab: string[]; // list of clicked vocabulary terms
  timeSpentSeconds: number;
  evaluationResult: ReadingEvaluationResult | null;
  history: ReadingHistoryEntry[];
  completedMissions: Record<string, number>; // missionId -> best score
  isSubmitting: boolean;
}

interface ReadingStoreActions {
  initializeStore: () => void;
  selectMission: (id: string) => void;
  setAnswer: (questionId: string, answer: string) => void;
  addClickedVocab: (term: string) => void;
  incrementTimer: () => void;
  submitCurrentMission: () => ReadingEvaluationResult;
  resetCurrentMission: () => void;
  resetAllReadingProgress: () => void;
  getMissionsSortedByPoolRatio: (
    pool: KnowledgePoolEntry[]
  ) => ReadingMission[];
}

export const useReadingStore = create<ReadingStoreState & ReadingStoreActions>(
  (set, get) => ({
    missions: ReadingService.getMissions(),
    selectedMissionId: 'reading_a1_site_signs',
    answers: {},
    clickedVocab: [],
    timeSpentSeconds: 0,
    evaluationResult: null,
    history: [],
    completedMissions: {},
    isSubmitting: false,

    initializeStore: () => {
      const state = ReadingService.getState();
      set({
        selectedMissionId:
          state.lastSelectedMissionId || 'reading_a1_site_signs',
        history: state.history,
        completedMissions: state.completedMissions,
        answers: {},
        clickedVocab: [],
        timeSpentSeconds: 0,
        evaluationResult: null,
      });
    },

    selectMission: (id: string) => {
      ReadingService.setLastSelectedMissionId(id);
      set({
        selectedMissionId: id,
        answers: {},
        clickedVocab: [],
        timeSpentSeconds: 0,
        evaluationResult: null,
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

    addClickedVocab: (term: string) => {
      const { clickedVocab } = get();
      if (!clickedVocab.includes(term)) {
        set({ clickedVocab: [...clickedVocab, term] });
      }
    },

    incrementTimer: () => {
      set((state) => ({
        timeSpentSeconds: state.timeSpentSeconds + 1,
      }));
    },

    submitCurrentMission: () => {
      set({ isSubmitting: true });
      const {
        selectedMissionId,
        answers,
        timeSpentSeconds,
        clickedVocab,
        missions,
      } = get();
      const timeSpentMinutes = Math.max(1, Math.round(timeSpentSeconds / 60));

      try {
        const result = ReadingService.submitSubmission(
          {
            missionId: selectedMissionId,
            answers,
            timeSpentMinutes,
          },
          clickedVocab
        );

        // Refresh local states
        const state = ReadingService.getState();
        const mission = missions.find((item) => item.id === selectedMissionId);
        void KnowledgeCaptureService.capture({
          cefrLevel: mission?.cefrLevel ?? 'A1',
          vocabularyTerms: [
            ...(mission?.vocabulary.map((item) => item.term) ?? []),
            ...clickedVocab,
          ],
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
        clickedVocab: [],
        timeSpentSeconds: 0,
        evaluationResult: null,
      });
    },

    resetAllReadingProgress: () => {
      ReadingService.resetReadingState();
      const state = ReadingService.getState();
      set({
        selectedMissionId: 'reading_a1_site_signs',
        answers: {},
        clickedVocab: [],
        timeSpentSeconds: 0,
        evaluationResult: null,
        history: state.history,
        completedMissions: state.completedMissions,
      });
    },

    getMissionsSortedByPoolRatio: (pool) => {
      return ReadingService.getMissionsSortedByPoolRatio(pool);
    },
  })
);
