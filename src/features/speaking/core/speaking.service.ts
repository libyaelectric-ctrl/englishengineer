import { AppError } from '@/core/errors/app-error';
import { ErrorCode } from '@/core/errors/error-codes';
import { eventBus } from '@/core/events/event-bus';
import { useLearningStore } from '@/core/learning';

import { EngineeringDiscipline } from '@/shared/constants/engineering-disciplines';
import { filterMissionsByDiscipline } from '@/shared/constants/mission-discipline-map';
import { LearningIntelligenceService } from '@/shared/services/learning-intelligence.service';
import { storage } from '@/shared/storage';
import {
  SpeakingEvaluationResult,
  SpeakingHistoryEntry,
  SpeakingMission,
  SpeakingState,
  SpeakingSubmission,
} from '@/shared/types/speaking.types';
import { applyFeedbackToEvaluation } from '@/shared/utils/evaluation-merge';

import { VocabularyService } from '@/features/vocabulary';

import { getSpeakingHistoryDetails } from './speaking-mvp';
import { SPEAKING_MISSIONS } from './speaking.data';
import { SpeakingEvaluator } from './speaking.evaluator';

const STORAGE_KEY = 'EngVox_speaking_state';

const DEFAULT_STATE: SpeakingState = {
  completedMissions: {},
  lastSelectedMissionId: 'speaking_a1_site_introduction',
  history: [],
};

// AI evaluation now happens once, server-side, via POST /api/speaking/submit
// (see useSpeakingPage.submitRoleplay -> submitSpeakingToBackend). Previously
// this module also called the AI proxy directly for the same transcript,
// which meant every submission paid for two separate AI evaluations while
// only the local one was ever shown to the user. SpeakingService.mergeBackendFeedback
// below applies the backend's (already-paid-for) result to the local record
// instead of making a second call.

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

  getMissions(userDiscipline?: EngineeringDiscipline): SpeakingMission[] {
    if (!userDiscipline) return SPEAKING_MISSIONS;
    return filterMissionsByDiscipline(SPEAKING_MISSIONS, userDiscipline);
  },

  /**
   * Returns missions sorted by how many pool words appear in their prompt/keywords.
   * Missions with more pool-word hits appear first.
   */
  getMissionsSortedByPool(
    pool: string[],
    userDiscipline?: EngineeringDiscipline
  ): SpeakingMission[] {
    const missions = this.getMissions(userDiscipline);
    if (pool.length === 0) return missions;
    const poolSet = new Set(pool.map((w) => w.toLowerCase()));
    return [...missions].sort((a, b) => {
      const aText = `${a.promptText} ${a.expectedKeywords.join(' ')}`.toLowerCase();
      const bText = `${b.promptText} ${b.expectedKeywords.join(' ')}`.toLowerCase();
      let aCount = 0;
      let bCount = 0;
      for (const word of poolSet) {
        if (aText.includes(word)) aCount++;
        if (bText.includes(word)) bCount++;
      }
      return bCount - aCount;
    });
  },

  getMissionById(id: string): SpeakingMission | undefined {
    return SPEAKING_MISSIONS.find((mission) => mission.id === id);
  },

  submitSubmission(submission: SpeakingSubmission): SpeakingEvaluationResult {
    const mission = this.getMissionById(submission.missionId);
    if (!mission) {
      throw new AppError({
        code: ErrorCode.VALIDATION,
        message: `Speaking mission with ID "${submission.missionId}" not found.`,
      });
    }

    const evaluation = SpeakingEvaluator.evaluate(mission, submission);
    VocabularyService.addDiscoveredTerms([
      ...mission.expectedKeywords,
      ...mission.syllabicTargets.map((target) => target.word),
    ]);

    const state = this.getState();
    const prevBest = state.completedMissions[mission.id] || 0;
    state.completedMissions[mission.id] = Math.max(prevBest, evaluation.finalScore);
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
        historyEntry.progressNote ?? 'Repeat the written roleplay at the current level.'
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

    eventBus.publish({
      id: `speaking-completed-${mission.id}-${Date.now()}`,
      type: 'speaking:completed',
      timestamp: new Date().toISOString(),
      payload: {
        missionId: mission.id,
        score: evaluation.finalScore,
        completedAt: new Date().toISOString(),
      },
    });

    return evaluation;
  },

  setLastSelectedMissionId(missionId: string): void {
    const state = this.getState();
    state.lastSelectedMissionId = missionId;
    this.saveState(state);
  },

  /**
   * Applies the backend's AI-derived feedback (from POST /api/speaking/submit)
   * to the matching history entry. Call this once, after submitSubmission, from
   * the async backend response handler -- do not also call the AI proxy
   * directly from the client for the same submission (see note above).
   */
  mergeBackendFeedback(
    mission: SpeakingMission,
    evaluation: SpeakingEvaluationResult,
    feedback: Record<string, string> | undefined
  ): void {
    if (!applyFeedbackToEvaluation(evaluation, feedback)) return;

    // Matched by missionId only, not by object reference: getState() below
    // deserializes state fresh from storage on every call, so a stored
    // SpeakingHistoryEntry's `evaluation` is never the same object reference
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

  resetSpeakingState(): void {
    this.saveState(DEFAULT_STATE);
  },
};
