import type { GrammarRuleProgress } from './grammar.progress';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'challenge';

export interface DifficultyAssessment {
  ruleId: string;
  suggestedDifficulty: DifficultyLevel;
  confidence: number;
  reasoning: string;
}

const STRENGTH_WEIGHT = 0.4;
const ACCURACY_WEIGHT = 0.4;
const EXPOSURE_WEIGHT = 0.2;

export const AdaptiveDifficultyEngine = {
  assessDifficulty(
    ruleId: string,
    progress: GrammarRuleProgress
  ): DifficultyAssessment {
    const accuracy = progress.correctUsages + progress.incorrectUsages > 0
      ? progress.correctUsages / (progress.correctUsages + progress.incorrectUsages)
      : 0.5;

    const strengthScore = progress.strength / 100;
    const exposureScore = Math.min(1, progress.exposures / 20);

    const compositeScore =
      strengthScore * STRENGTH_WEIGHT +
      accuracy * ACCURACY_WEIGHT +
      exposureScore * EXPOSURE_WEIGHT;

    if (compositeScore >= 0.8) {
      return {
        ruleId,
        suggestedDifficulty: 'challenge',
        confidence: Math.min(1, compositeScore),
        reasoning: 'High accuracy and strength — ready for challenge material.',
      };
    }

    if (compositeScore >= 0.6) {
      return {
        ruleId,
        suggestedDifficulty: 'advanced',
        confidence: compositeScore,
        reasoning: 'Solid understanding — can handle advanced variations.',
      };
    }

    if (compositeScore >= 0.4) {
      return {
        ruleId,
        suggestedDifficulty: 'intermediate',
        confidence: compositeScore,
        reasoning: 'Building foundation — intermediate complexity is appropriate.',
      };
    }

    return {
      ruleId,
      suggestedDifficulty: 'beginner',
      confidence: 1 - compositeScore,
      reasoning: 'Early learning stage — focus on basic patterns.',
    };
  },

  selectQuestionDifficulty(
    progress: GrammarRuleProgress,
    recentCorrectStreak: number
  ): DifficultyLevel {
    const assessment = this.assessDifficulty(progress.ruleId, progress);

    if (recentCorrectStreak >= 3) {
      const upgrade: Record<DifficultyLevel, DifficultyLevel> = {
        beginner: 'intermediate',
        intermediate: 'advanced',
        advanced: 'challenge',
        challenge: 'challenge',
      };
      return upgrade[assessment.suggestedDifficulty];
    }

    if (recentCorrectStreak === 0 && progress.incorrectUsages > 0) {
      const downgrade: Record<DifficultyLevel, DifficultyLevel> = {
        challenge: 'advanced',
        advanced: 'intermediate',
        intermediate: 'beginner',
        beginner: 'beginner',
      };
      return downgrade[assessment.suggestedDifficulty];
    }

    return assessment.suggestedDifficulty;
  },

  getDifficultyMultiplier(level: DifficultyLevel): number {
    switch (level) {
      case 'beginner': return 1.0;
      case 'intermediate': return 1.5;
      case 'advanced': return 2.0;
      case 'challenge': return 3.0;
    }
  },
};
