import { storage } from '@/shared/storage';
import { AppError } from '@/core/errors/app-error';
import { ErrorCode } from '@/core/errors/error-codes';
import { READING_MISSIONS } from './reading.data';
import {
  ReadingMission,
  ReadingState,
  ReadingSubmission,
  ReadingEvaluationResult,
  ReadingHistoryEntry,
} from './reading.types';
import { ReadingEvaluator } from './reading.evaluator';
import { useLearningStore } from '@/core/learning';
import { VocabularyService } from '@/features/vocabulary/services/vocabulary.service';
import { GrammarTransferService } from '@/features/grammar/grammar.transfer';
import {
  KnowledgePoolEntry,
  sortContentByPoolRatio,
} from '@/core/content-selection/personalized-content.service';

const STORAGE_KEY = 'EngVox_reading_state';
export const READING_CONTENT_SCHEMA_VERSION = 1;
export const READING_LESSON_CAPACITY = 200;

const getReadingCatalog = (): ReadingMission[] =>
  READING_MISSIONS.map((mission, index) => ({
    ...mission,
    sequenceNumber: index + 1,
    sourceMetadata: {
      origin: 'EngVox original',
      author: 'Özcan ERENSAYIN',
      schemaVersion: READING_CONTENT_SCHEMA_VERSION,
    },
  }));

const DEFAULT_STATE: ReadingState = {
  completedMissions: {},
  lastSelectedMissionId: 'reading_a1_site_signs',
  history: [],
};

export const ReadingService = {
  /**
   * Loads the reading state from localStorage.
   */
  getState(): ReadingState {
    const data = storage.get<ReadingState>(STORAGE_KEY);
    if (!data) return DEFAULT_STATE;
    return {
      ...DEFAULT_STATE,
      ...data,
      completedMissions: data.completedMissions || {},
      history: data.history || [],
    };
  },

  /**
   * Saves the reading state to localStorage.
   */
  saveState(state: ReadingState): void {
    storage.set(STORAGE_KEY, state);
  },

  /**
   * Retrieves all available reading missions.
   */
  getMissions(): ReadingMission[] {
    return getReadingCatalog();
  },

  getMissionsSortedByPoolRatio(
    pool: KnowledgePoolEntry[] = useLearningStore
      .getState()
      .vocabularyPool.map((id) => ({
        content_type: 'vocabulary',
        content_id: id,
      }))
  ): ReadingMission[] {
    return sortContentByPoolRatio(this.getMissions(), pool);
  },

  /**
   * Retrieves a specific reading mission by ID.
   */
  getMissionById(id: string): ReadingMission | undefined {
    return getReadingCatalog().find((m) => m.id === id);
  },

  /**
   * Evaluates a reading mission submission, updates history, best scores,
   * last selected mission, and synchronizes state with the global learning core.
   */
  submitSubmission(
    submission: ReadingSubmission,
    clickedVocabTerms: string[]
  ): ReadingEvaluationResult {
    const mission = this.getMissionById(submission.missionId);
    if (!mission) {
      throw new AppError({
        code: ErrorCode.VALIDATION,
        message: `Reading mission with ID "${submission.missionId}" not found.`,
      });
    }

    // 1. Evaluate submission using rule-based evaluator
    const evaluation = ReadingEvaluator.evaluate(
      mission,
      submission,
      clickedVocabTerms.length
    );
    VocabularyService.addDiscoveredTerms(clickedVocabTerms);

    // 2. Load reading state
    const state = this.getState();

    // 3. Update best score per mission
    const prevBest = state.completedMissions[mission.id] || 0;
    const newBest = Math.max(prevBest, evaluation.finalScore);
    state.completedMissions[mission.id] = newBest;

    // 4. Update selected mission
    state.lastSelectedMissionId = mission.id;

    // 5. Append to reading history
    const historyEntry: ReadingHistoryEntry = {
      missionId: mission.id,
      timestamp: new Date().toISOString(),
      score: evaluation.finalScore,
      evaluation,
    };
    state.history = [historyEntry, ...state.history];

    // 6. Persist reading state
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
        'Reading',
        evaluation.finalScore,
        submission.timeSpentMinutes
      );
    }

    void GrammarTransferService.recordReadingEvidence(mission, evaluation);

    return evaluation;
  },

  /**
   * Update the last selected reading mission ID.
   */
  setLastSelectedMissionId(missionId: string): void {
    const state = this.getState();
    state.lastSelectedMissionId = missionId;
    this.saveState(state);
  },

  /**
   * Resets the reading-specific history and scores.
   */
  resetReadingState(): void {
    this.saveState(DEFAULT_STATE);
  },
};
