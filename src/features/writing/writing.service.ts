import {
  KnowledgePoolEntry,
  sortContentByPoolRatio,
} from '@/core/content-selection/personalized-content.service';
import { AppError } from '@/core/errors/app-error';
import { ErrorCode } from '@/core/errors/error-codes';
import { useLearningStore } from '@/core/learning';

import { EngineeringDiscipline } from '@/shared/constants/engineering-disciplines';
import { filterMissionsByDiscipline } from '@/shared/constants/mission-discipline-map';
import { GrammarTransferService } from '@/shared/services/grammar-transfer.service';
import { LearningIntelligenceService } from '@/shared/services/learning-intelligence.service';
import { storage } from '@/shared/storage';

import { VocabularyService } from '@/features/vocabulary';

import { submitWritingToBackend } from './writing-submit.service';
import { WRITING_MISSIONS } from './writing.data';
import { WritingEvaluator } from './writing.evaluator';
import {
  WritingEvaluationResult,
  WritingHistoryEntry,
  WritingMission,
  WritingState,
  WritingSubmission,
} from './writing.types';

const STORAGE_KEY = 'EngVox_writing_state';

const DEFAULT_STATE: WritingState = {
  completedMissions: {},
  lastSelectedMissionId: 'writing_a1_simple_site_update',
  history: [],
};

// AI evaluation happens once, server-side, via POST /api/writing/submit
// (submitWritingToBackend below). Previously this module also called the AI
// proxy directly from the client for the same draft, which meant every
// submission paid for two separate AI evaluations while only the local one
// was ever shown to the user (see the equivalent fix already applied to
// Speaking, in speaking.service.ts).

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
   * Retrieves all available writing missions, optionally filtered by discipline.
   */
  getMissions(userDiscipline?: EngineeringDiscipline): WritingMission[] {
    if (!userDiscipline) return WRITING_MISSIONS;
    return filterMissionsByDiscipline(WRITING_MISSIONS, userDiscipline);
  },

  getMissionsSortedByPoolRatio(
    pool: KnowledgePoolEntry[] = useLearningStore.getState().vocabularyPool.map((id) => ({
      content_type: 'vocabulary',
      content_id: id,
    })),
    userDiscipline?: EngineeringDiscipline
  ): WritingMission[] {
    return sortContentByPoolRatio(this.getMissions(userDiscipline), pool);
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
      throw new AppError({
        code: ErrorCode.VALIDATION,
        message: `Writing mission with ID "${submission.missionId}" not found.`,
      });
    }

    // 1. Evaluate submission using rule-based evaluator
    const evaluation = WritingEvaluator.evaluate(mission, submission);
    VocabularyService.addDiscoveredTerms(mission.corrections.map((correction) => correction.fix));
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

    // 6b. Single source of AI evaluation: submit the draft to the backend for
    // real AI grading. Its feedback is merged into this same evaluation once
    // it resolves; the offline-first local score/history above is never
    // blocked waiting for it.
    void submitWritingToBackend({ content: submission.finalDraft }).then((response) => {
      if (response?.feedback) {
        this.mergeBackendFeedback(mission, evaluation, response.feedback);
      }
    });

    // 7. Sync with global LearningStore to award XP, coins, and update ELO/achievements
    const learningStore = useLearningStore.getState();
    const globalMissionExists = learningStore.missions.some((m) => m.id === mission.id);

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

    void GrammarTransferService.recordWritingEvidence(mission, evaluation);

    return evaluation;
  },

  /**
   * Applies the backend's AI-derived feedback (from POST /api/writing/submit)
   * to the matching history entry. Call this once, after submitSubmission's
   * local state has been saved -- do not also call the AI proxy directly from
   * the client for the same submission (see note above).
   */
  mergeBackendFeedback(
    mission: WritingMission,
    evaluation: WritingEvaluationResult,
    feedback: Record<string, string> | undefined
  ): void {
    if (!feedback) return;
    const notes = Object.values(feedback).filter(Boolean);
    if (notes.length === 0) return;

    evaluation.weaknesses = [...new Set([...evaluation.weaknesses, ...notes.slice(0, 3)])];
    evaluation.feedback = notes.join(' ');

    // Matched by missionId only, not by object reference: getState() below
    // deserializes state fresh from storage on every call, so a stored
    // WritingHistoryEntry's `evaluation` is never the same object reference
    // as the in-memory `evaluation` passed in here, even right after
    // submitSubmission saved it. Since new entries are always unshifted to
    // the front of history, matching on missionId picks the most recent
    // submission for that mission -- correct in the common case of one
    // in-flight AI merge per mission at a time.
    const state = this.getState();
    const entry = state.history.find((h) => h.missionId === mission.id);
    if (entry) {
      entry.evaluation = evaluation;
      this.saveState(state);
    }
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
