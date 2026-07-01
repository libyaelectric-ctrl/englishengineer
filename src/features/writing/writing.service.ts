import { storage } from '@/shared/storage';
import { WRITING_MISSIONS } from './writing.data';
import {
  WritingMission,
  WritingState,
  WritingSubmission,
  WritingEvaluationResult,
  WritingHistoryEntry,
} from './writing.types';
import { WritingEvaluator } from './writing.evaluator';
import { useLearningStore } from '@/core/learning';
import { VocabularyService } from '@/features/vocabulary';
import { LearningIntelligenceService } from '@/features/learning-intelligence';

const STORAGE_KEY = 'engineeros_writing_state';

const DEFAULT_STATE: WritingState = {
  completedMissions: {},
  lastSelectedMissionId: 'writing_a1_simple_site_update',
  history: [],
};

export const WritingService = {
  /**
   * Loads the writing state from localStorage.
   */
  getState(): WritingState {
    const data = storage.get<WritingState>(STORAGE_KEY);
    if (!data) return DEFAULT_STATE;
    return {
      ...DEFAULT_STATE,
      ...data,
      completedMissions: data.completedMissions || {},
      history: data.history || [],
    };
  },

  /**
   * Saves the writing state to localStorage.
   */
  saveState(state: WritingState): void {
    storage.set(STORAGE_KEY, state);
  },

  /**
   * Retrieves all available writing missions.
   */
  getMissions(): WritingMission[] {
    return WRITING_MISSIONS;
  },

  /**
   * Retrieves a specific writing mission by ID.
   */
  getMissionById(id: string): WritingMission | undefined {
    return WRITING_MISSIONS.find((m) => m.id === id);
  },

  /**
   * Evaluates a writing mission submission, updates history, best scores,
   * last selected mission, and synchronizes state with the global learning core.
   */
  submitSubmission(submission: WritingSubmission): WritingEvaluationResult {
    const mission = this.getMissionById(submission.missionId);
    if (!mission) {
      throw new Error(
        `Writing mission with ID "${submission.missionId}" not found.`
      );
    }

    // 1. Evaluate submission using rule-based evaluator
    const evaluation = WritingEvaluator.evaluate(mission, submission);
    VocabularyService.addDiscoveredTerms(
      mission.corrections.map((correction) => correction.fix)
    );
    evaluation.detailedCorrections
      .filter((correction) => !correction.isFixed)
      .forEach((correction) => {
        LearningIntelligenceService.addMistake(
          correction.type === 'grammar'
            ? 'grammar'
            : correction.type === 'vocabulary'
              ? 'word choice'
              : 'unclear sentence',
          correction.original,
          correction.fix
        );
      });

    // 2. Load writing state
    const state = this.getState();

    // 3. Update best score per mission
    const prevBest = state.completedMissions[mission.id] || 0;
    const newBest = Math.max(prevBest, evaluation.finalScore);
    state.completedMissions[mission.id] = newBest;

    // 4. Update selected mission
    state.lastSelectedMissionId = mission.id;

    // 5. Append to writing history
    const historyEntry: WritingHistoryEntry = {
      missionId: mission.id,
      timestamp: new Date().toISOString(),
      score: evaluation.finalScore,
      evaluation,
    };
    state.history = [historyEntry, ...state.history];

    // 6. Persist writing state
    this.saveState(state);

    // 7. Sync with global LearningStore to award XP, coins, and update ELO/achievements
    const learningStore = useLearningStore.getState();
    const globalMissionExists = learningStore.missions.some(
      (m) => m.id === mission.id
    );

    if (globalMissionExists) {
      // If the mission exists in the global store, submit it there to update progress
      learningStore.submitMissionResult(
        mission.id,
        evaluation.finalScore / 100,
        submission.timeSpentMinutes
      );
    } else {
      // Fallback: If it's a practice session or doesn't exist, complete it as generic practice
      learningStore.completeGenericPractice(
        'Writing',
        evaluation.finalScore,
        submission.timeSpentMinutes
      );
    }

    return evaluation;
  },

  /**
   * Update the last selected writing mission ID.
   */
  setLastSelectedMissionId(missionId: string): void {
    const state = this.getState();
    state.lastSelectedMissionId = missionId;
    this.saveState(state);
  },

  /**
   * Resets the writing-specific history and scores.
   */
  resetWritingState(): void {
    this.saveState(DEFAULT_STATE);
  },
};
