import { create } from 'zustand';
import {
  WritingMission,
  WritingHistoryEntry,
  WritingEvaluationResult,
} from './writing.types';
import { WritingService } from './writing.service';
import { KnowledgeCaptureService } from '@/features/learning-intelligence/knowledge-capture.service';
import { scoreContentByPoolRatio } from '@/core/content-selection/personalized-content.service';
import { useLearningStore } from '@/core/learning';

interface WritingStoreState {
  missions: WritingMission[];
  selectedMissionId: string;
  draft: string;
  autoFixesUsed: number;
  timeSpentSeconds: number;
  evaluationResult: WritingEvaluationResult | null;
  history: WritingHistoryEntry[];
  completedMissions: Record<string, number>; // missionId -> best score
  isSubmitting: boolean;
}

interface WritingStoreActions {
  initializeStore: () => void;
  selectMission: (id: string) => void;
  setDraft: (text: string) => void;
  incrementAutoFixCount: () => void;
  incrementTimer: () => void;
  submitCurrentMission: () => WritingEvaluationResult;
  resetCurrentMission: () => void;
  resetAllWritingProgress: () => void;
  getMissionsSortedByPoolRatio: () => WritingMission[];
}

export const useWritingStore = create<WritingStoreState & WritingStoreActions>(
  (set, get) => ({
    missions: WritingService.getMissions(),
    selectedMissionId: 'writing_a1_simple_site_update',
    draft: '',
    autoFixesUsed: 0,
    timeSpentSeconds: 0,
    evaluationResult: null,
    history: [],
    completedMissions: {},
    isSubmitting: false,

    initializeStore: () => {
      const state = WritingService.getState();
      const missions = WritingService.getMissions();
      const lastId =
        state.lastSelectedMissionId || 'writing_a1_simple_site_update';
      const currentMission =
        missions.find((m) => m.id === lastId) || missions[0];

      set({
        selectedMissionId: lastId,
        history: state.history,
        completedMissions: state.completedMissions,
        draft: currentMission ? currentMission.initialDraft : '',
        autoFixesUsed: 0,
        timeSpentSeconds: 0,
        evaluationResult: null,
      });
    },

    selectMission: (id: string) => {
      WritingService.setLastSelectedMissionId(id);
      const missions = WritingService.getMissions();
      const currentMission = missions.find((m) => m.id === id) || missions[0];

      set({
        selectedMissionId: id,
        draft: currentMission ? currentMission.initialDraft : '',
        autoFixesUsed: 0,
        timeSpentSeconds: 0,
        evaluationResult: null,
      });
    },

    setDraft: (text: string) => {
      set({ draft: text });
    },

    incrementAutoFixCount: () => {
      set((state) => ({ autoFixesUsed: state.autoFixesUsed + 1 }));
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
        draft,
        timeSpentSeconds,
        autoFixesUsed,
        missions,
      } = get();
      const timeSpentMinutes = Math.max(1, Math.round(timeSpentSeconds / 60));

      try {
        const result = WritingService.submitSubmission({
          missionId: selectedMissionId,
          finalDraft: draft,
          timeSpentMinutes,
          autoFixesUsed,
        });

        // Refresh local states
        const state = WritingService.getState();
        const mission = missions.find((item) => item.id === selectedMissionId);
        void KnowledgeCaptureService.capture({
          cefrLevel: mission?.cefrLevel ?? 'A1',
          vocabularyTerms: mission?.targetVocabulary,
          grammarHints: mission?.grammarFocus,
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
        draft: currentMission ? currentMission.initialDraft : '',
        autoFixesUsed: 0,
        timeSpentSeconds: 0,
        evaluationResult: null,
      });
    },

    resetAllWritingProgress: () => {
      WritingService.resetWritingState();
      const state = WritingService.getState();
      const missions = WritingService.getMissions();
      const currentMission = missions[0];

      set({
        selectedMissionId: 'writing_a1_simple_site_update',
        draft: currentMission ? currentMission.initialDraft : '',
        autoFixesUsed: 0,
        timeSpentSeconds: 0,
        evaluationResult: null,
        history: state.history,
        completedMissions: state.completedMissions,
      });
    },

    getMissionsSortedByPoolRatio: () => {
      const pool = useLearningStore.getState().vocabularyPool.map(id => ({
        content_type: 'vocabulary' as const,
        content_id: id,
      }));
      const missions = WritingService.getMissions();
      if (pool.length === 0) return missions;
      return [...missions].sort((a, b) => {
        const scoreA = scoreContentByPoolRatio(a, pool).score;
        const scoreB = scoreContentByPoolRatio(b, pool).score;
        return scoreB - scoreA;
      });
    },
  })
);
