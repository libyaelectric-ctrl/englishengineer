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

import { AIService } from '@/features/ai';
import { VocabularyService } from '@/features/vocabulary';

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

// Optional backend AI layer: sends the student draft to the AI evaluation
// endpoint and merges the returned feedback into the local result. When the
// backend is not configured or the call fails, the local evaluation is used
// unchanged so the offline-first flow is never blocked.
const buildAiFeedback = async (mission: WritingMission, draft: string) => {
  try {
    const prompt = [
      'Evaluate this engineering student written response.',
      `Task: ${mission.task || mission.description}`,
      `Discipline: ${mission.discipline}`,
      `CEFR level: ${mission.cefrLevel}`,
      "Student's submission:",
      '"""',
      draft,
      '"""',
      'Provide concise strengths, weaknesses, and overall feedback for an engineering context.',
    ].join('\n');

    const response = await AIService.run([], 'evaluateEngineeringEnglish', {
      modeId: 'writing_reviewer',
      modeName: 'Writing Reviewer',
      prompt,
      context: {
        userName: 'the learner',
        role: 'engineer',
        discipline: mission.discipline,
        targetLevel: mission.cefrLevel,
        xp: 0,
        level: 1,
        elo: 1000,
        streak: 0,
        averageScore: 0,
        completedMissions: 0,
        totalMissions: 0,
        weakSkills: [],
        strongSkills: [],
        recentActivities: [],
        weakVocabulary: [],
        wordsLearned: 0,
        vocabularyRetention: 0,
        recommendedFocus: 'Writing',
      },
    });

    const structured = response.structuredResult as {
      strengths?: string[];
      weaknesses?: string[];
      summary?: string;
    } | null;

    if (!structured) return null;
    return {
      strengths: structured.strengths || [],
      weaknesses: structured.weaknesses || [],
      summary: structured.summary || '',
    };
  } catch {
    return null;
  }
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

    // 1b. Optional backend AI feedback merged into the local result. Fire and
    // forget so the offline-first submission is never delayed or blocked.
    void buildAiFeedback(mission, submission.finalDraft).then((ai) => {
      if (!ai) return;
      if (ai.strengths.length > 0) {
        evaluation.strengths = [...new Set([...evaluation.strengths, ...ai.strengths.slice(0, 3)])];
      }
      if (ai.weaknesses.length > 0) {
        evaluation.weaknesses = [
          ...new Set([...evaluation.weaknesses, ...ai.weaknesses.slice(0, 3)]),
        ];
      }
      if (ai.summary) {
        evaluation.feedback = ai.summary;
      }
      // Persist the enriched evaluation back into history.
      const state = this.getState();
      const entry = state.history.find(
        (h) => h.missionId === mission.id && h.evaluation === evaluation
      );
      if (entry) {
        entry.evaluation = evaluation;
        this.saveState(state);
      }
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
