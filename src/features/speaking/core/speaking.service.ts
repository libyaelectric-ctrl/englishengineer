import { AppError } from '@/core/errors/app-error';
import { ErrorCode } from '@/core/errors/error-codes';
import { eventBus } from '@/core/events/event-bus';
import { useLearningStore } from '@/core/learning';

import { EngineeringDiscipline } from '@/shared/constants/engineering-disciplines';
import { filterMissionsByDiscipline } from '@/shared/constants/mission-discipline-map';
import { LearningIntelligenceService } from '@/shared/services/learning-intelligence.service';
import { storage } from '@/shared/storage';

import { AIService } from '@/features/ai';
import { VocabularyService } from '@/features/vocabulary';

import { getSpeakingHistoryDetails } from './speaking-mvp';
import { SPEAKING_MISSIONS } from './speaking.data';
import { SpeakingEvaluator } from './speaking.evaluator';
import {
  SpeakingEvaluationResult,
  SpeakingHistoryEntry,
  SpeakingMission,
  SpeakingState,
  SpeakingSubmission,
} from './speaking.types';

const STORAGE_KEY = 'EngVox_speaking_state';

const DEFAULT_STATE: SpeakingState = {
  completedMissions: {},
  lastSelectedMissionId: 'speaking_a1_site_introduction',
  history: [],
};

// Optional backend AI layer: when a spoken transcript is available it is sent
// to the AI evaluation endpoint and the returned grammar/vocabulary feedback is
// merged into the local result. When the backend is not configured, the
// transcript is empty, or the call fails, the local evaluation is used
// unchanged so the offline-first flow is never blocked.
const buildAiFeedback = async (mission: SpeakingMission, transcript: string) => {
  if (!transcript.trim()) return null;
  try {
    const prompt = [
      "Evaluate this engineering student's spoken response transcript.",
      `Prompt: ${mission.promptText}`,
      `Discipline: ${mission.discipline}`,
      `CEFR level: ${mission.cefrLevel}`,
      'Transcript:',
      '"""',
      transcript.slice(0, 2000),
      '"""',
      'Provide concise grammar and vocabulary feedback for an engineering context.',
    ].join('\n');

    const response = await AIService.run([], 'evaluateEngineeringEnglish', {
      modeId: 'roleplay_simulator',
      modeName: 'Roleplay Simulator',
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
        recommendedFocus: 'Speaking',
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

    // Optional backend AI feedback merged into the local result. Fire and
    // forget so the offline-first submission is never delayed or blocked.
    void buildAiFeedback(mission, submission.transcript).then((ai) => {
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

  resetSpeakingState(): void {
    this.saveState(DEFAULT_STATE);
  },
};
