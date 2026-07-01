import { storage } from '@/shared/storage';
import { LearningIntelligenceService } from '@/features/learning-intelligence';
import {
  clampSkillElo,
  getAdaptivePaceDecision,
  getCefrBandFromElo,
  LearningProfileRepository,
} from '@/features/profile';
import { VocabularyMenuService } from '@/features/vocabulary';
import { GrammarProgressService } from '@/features/grammar';
import type {
  TaskEvaluationInput,
  TaskEvaluationRecord,
} from './learning-orchestrator.types';

const STORAGE_KEY = 'task_evaluation_records';

const calculateEloDelta = (input: TaskEvaluationInput): number => {
  const base = input.accuracy >= 85 ? 12 : input.accuracy >= 60 ? 4 : -8;
  if (
    base > 0 &&
    input.responseTimeSeconds > input.expectedResponseTimeSeconds * 2
  ) {
    return Math.max(1, base - 4);
  }
  return base;
};

export const TaskEvaluationService = {
  getRecords(): TaskEvaluationRecord[] {
    return storage.get<TaskEvaluationRecord[]>(STORAGE_KEY) ?? [];
  },

  recordEvaluation(
    input: TaskEvaluationInput,
    userId = 'local-user',
    now = new Date()
  ): TaskEvaluationRecord {
    const profile = LearningProfileRepository.getProfile(userId);
    const current = profile.skills[input.skill];
    const eloDelta = calculateEloDelta(input);
    const nextElo = clampSkillElo(current.elo + eloDelta);
    const previousCefr = getCefrBandFromElo(current.elo);
    const nextCefr = getCefrBandFromElo(nextElo);
    const pace = getAdaptivePaceDecision({
      accuracy: input.accuracy,
      mistakeType: input.mistakeTypes[0] ?? null,
      repeatMistakeCount: input.repeatMistakeCount,
      responseTimeSeconds: input.responseTimeSeconds,
      skill: input.skill,
      currentElo: current.elo,
    });
    const wordsMovedToLearning: string[] = [];
    const wordsMovedToMastered: string[] = [];
    const wordsMovedToWeak: string[] = [];

    input.vocabularyOutcomes?.forEach((outcome) => {
      const result = VocabularyMenuService.reviewWord(
        outcome.wordId,
        outcome.correct,
        now,
        outcome.term
      );
      if (result.isWeak) wordsMovedToWeak.push(outcome.wordId);
      else if (result.status === 'Mastered') {
        wordsMovedToMastered.push(outcome.wordId);
      } else wordsMovedToLearning.push(outcome.wordId);
    });

    input.grammarOutcomes?.forEach((outcome) => {
      GrammarProgressService.recordUsage(outcome.ruleId, outcome.correct, now);
      if (!outcome.correct) {
        LearningIntelligenceService.addMistake(
          'grammar',
          outcome.ruleId,
          `Review the rule and complete one controlled ${input.skill} example.`,
          now
        );
      }
    });

    if (pace.sendToMistakeLog) {
      input.mistakeTypes.forEach((mistake) =>
        LearningIntelligenceService.addMistake(
          'repeated phrase issue',
          mistake,
          `Repeat controlled ${input.skill} practice at ${input.targetCefr}.`,
          now
        )
      );
    }

    const reviewRecommendation =
      pace.difficulty === 'slightly-harder'
        ? `Continue at ${nextCefr} with controlled stretch content.`
        : pace.difficulty === 'easier'
          ? `Repeat an easier ${input.skill} task and review logged mistakes.`
          : `Maintain ${input.targetCefr} and review due vocabulary.`;
    const record: TaskEvaluationRecord = {
      ...input,
      id: `evaluation_${input.skill}_${now.getTime()}`,
      createdAt: now.toISOString(),
      previousElo: current.elo,
      nextElo,
      eloDelta,
      previousCefr,
      nextCefr,
      cefrImpact:
        previousCefr === nextCefr
          ? `Remains in ${nextCefr}.`
          : `Moved from ${previousCefr} to ${nextCefr}.`,
      reviewRecommendation,
      wordsMovedToLearning,
      wordsMovedToMastered,
      wordsMovedToWeak,
      grammarIssues: input.mistakeTypes.filter((mistake) =>
        /grammar|article|preposition|tense|agreement/i.test(mistake)
      ),
      nextRecommendedAction: pace.reason,
    };

    LearningProfileRepository.updateSkill(userId, input.skill, {
      elo: nextElo,
      accuracy: input.accuracy,
      completedTasks: current.completedTasks + 1,
      weaknessScore: 100 - input.accuracy,
      lastPracticedAt: now.toISOString(),
    });
    storage.set(STORAGE_KEY, [record, ...this.getRecords()].slice(0, 200));
    return record;
  },

  reset(): void {
    storage.remove(STORAGE_KEY);
  },
};
