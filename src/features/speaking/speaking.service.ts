import { storage } from '@/shared/storage';
import { useLearningStore } from '@/core/learning';
import { SPEAKING_MISSIONS } from './speaking.data';
import {
  SpeakingEvaluationResult,
  SpeakingHistoryEntry,
  SpeakingMission,
  SpeakingState,
  SpeakingSubmission,
} from './speaking.types';
import { SpeakingEvaluator } from './speaking.evaluator';
import { VocabularyService } from '@/features/vocabulary';
import { LearningIntelligenceService } from '@/features/learning-intelligence';
import { getSpeakingHistoryDetails } from './speaking-mvp';

const STORAGE_KEY = 'EngVox_speaking_state';

const DEFAULT_STATE: SpeakingState = {
  completedMissions: {},
  lastSelectedMissionId: 'speaking_a1_site_introduction',
  history: [],
};

export const SpeakingService = {
  getState(): SpeakingState {
    const data = storage.get<SpeakingState>(STORAGE_KEY);
    if (!data) return DEFAULT_STATE;
    return {
      ...DEFAULT_STATE,
      ...data,
      completedMissions: data.completedMissions || {},
      history: data.history || [],
    };
  },

  saveState(state: SpeakingState): void {
    storage.set(STORAGE_KEY, state);
  },

  getMissions(): SpeakingMission[] {
    return SPEAKING_MISSIONS;
  },

  getMissionById(id: string): SpeakingMission | undefined {
    return SPEAKING_MISSIONS.find((mission) => mission.id === id);
  },

  submitSubmission(submission: SpeakingSubmission): SpeakingEvaluationResult {
    const mission = this.getMissionById(submission.missionId);
    if (!mission) {
      throw new Error(
        `Speaking mission with ID "${submission.missionId}" not found.`
      );
    }

    const evaluation = SpeakingEvaluator.evaluate(mission, submission);
    VocabularyService.addDiscoveredTerms([
      ...mission.expectedKeywords,
      ...mission.syllabicTargets.map((target) => target.word),
    ]);
    const state = this.getState();
    const prevBest = state.completedMissions[mission.id] || 0;
    state.completedMissions[mission.id] = Math.max(
      prevBest,
      evaluation.finalScore
    );
    state.lastSelectedMissionId = mission.id;

    const historyEntry: SpeakingHistoryEntry = {
      missionId: mission.id,
      timestamp: new Date().toISOString(),
      score: evaluation.finalScore,
      evaluation,
      ...getSpeakingHistoryDetails(evaluation),
    };
    state.history = [historyEntry, ...state.history];
    this.saveState(state);

    if (evaluation.finalScore < 60) {
      LearningIntelligenceService.addMistake(
        'Speaking Response',
        mission.title,
        historyEntry.progressNote ??
          'Repeat the written roleplay at the current level.'
      );
    }

    const learningStore = useLearningStore.getState();
    const globalMissionExists = learningStore.missions.some(
      (learningMission) => learningMission.id === mission.id
    );

    if (globalMissionExists) {
      learningStore.submitMissionResult(
        mission.id,
        evaluation.finalScore / 100,
        submission.timeSpentMinutes
      );
    } else {
      learningStore.completeGenericPractice(
        'Speaking',
        evaluation.finalScore,
        submission.timeSpentMinutes
      );
    }

    return evaluation;
  },

  setLastSelectedMissionId(missionId: string): void {
    const state = this.getState();
    state.lastSelectedMissionId = missionId;
    this.saveState(state);
  },

  resetSpeakingState(): void {
    this.saveState(DEFAULT_STATE);
  },
};
