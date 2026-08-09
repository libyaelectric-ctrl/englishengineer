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
import { storage } from '@/shared/storage';

import { AIService } from '@/features/ai';
import { VocabularyService } from '@/features/vocabulary';

import { READING_MISSIONS } from './reading.data';
import { ReadingEvaluator } from './reading.evaluator';
import {
  ReadingEvaluationResult,
  ReadingHistoryEntry,
  ReadingMission,
  ReadingState,
  ReadingSubmission,
} from './reading.types';

const STORAGE_KEY = 'EngVox_reading_state';
export const READING_CONTENT_SCHEMA_VERSION = 1;

// Optional backend AI layer: sends the passage text to the AI evaluation
// endpoint and merges returned feedback into the local result. When the
// backend is not configured or the call fails, the local evaluation is used
// unchanged so the offline-first flow is never blocked.
const buildAiFeedback = async (mission: ReadingMission) => {
  try {
    const passage =
      typeof mission.passageText === 'string' ? mission.passageText.slice(0, 2000) : '';
    const prompt = [
      'Evaluate this engineering reading passage for a student comprehension task.',
      `Title: ${mission.title}`,
      `Discipline: ${mission.discipline}`,
      `CEFR level: ${mission.cefrLevel}`,
      'Passage:',
      '"""',
      passage,
      '"""',
      'Provide concise strengths, weaknesses, and overall feedback for an engineering context.',
    ].join('\n');

    const response = await AIService.run([], 'evaluateEngineeringEnglish', {
      modeId: 'document_analysis_assistant',
      modeName: 'Document Analysis Assistant',
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
        recommendedFocus: 'Reading',
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
   * Retrieves all available reading missions, optionally filtered by discipline.
   */
  getMissions(userDiscipline?: EngineeringDiscipline): ReadingMission[] {
    const all = getReadingCatalog();
    if (!userDiscipline) return all;
    return filterMissionsByDiscipline(all, userDiscipline);
  },

  getMissionsSortedByPoolRatio(
    pool: KnowledgePoolEntry[] = [],
    userDiscipline?: EngineeringDiscipline
  ): ReadingMission[] {
    return sortContentByPoolRatio(this.getMissions(userDiscipline), pool);
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
    const evaluation = ReadingEvaluator.evaluate(mission, submission, clickedVocabTerms.length);
    VocabularyService.addDiscoveredTerms(clickedVocabTerms);

    // 1b. Optional backend AI feedback merged into the local result. Fire and
    // forget so the offline-first submission is never delayed or blocked.
    void buildAiFeedback(mission).then((ai) => {
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
