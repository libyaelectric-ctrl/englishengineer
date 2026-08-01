import { ScoringService } from '@/core/learning/scoring.service';

import {
  FINAL_ACCURACY_WEIGHT,
  FINAL_RETENTION_WEIGHT,
  FINAL_SPEED_WEIGHT,
  MAX_SPEED_SCORE,
  MIN_REPETITIONS_FOR_RETENTION,
  MIN_TIME_SPENT_MINUTES,
  MINUTES_PER_ANSWER,
  SPEED_DECAY_MULTIPLIER,
} from './vocabulary.constants';
import {
  VocabularyAnswer,
  VocabularyEvaluationResult,
  VocabularyReviewState,
} from '../types/vocabulary.types';

export const VocabularyEvaluator = {
  evaluate(
    answers: VocabularyAnswer[],
    reviewStates: Record<string, VocabularyReviewState>
  ): VocabularyEvaluationResult {
    const total = Math.max(answers.length, 1);
    const correctAnswers = answers.filter((answer) => answer.isCorrect);
    const accuracy = Math.round((correctAnswers.length / total) * 100);
    const averageSpeed =
      answers.reduce((sum, answer) => sum + answer.responseTimeSeconds, 0) / total;
    const speed = Math.round(Math.max(0, Math.min(MAX_SPEED_SCORE, MAX_SPEED_SCORE - averageSpeed * SPEED_DECAY_MULTIPLIER)));

    const retained = correctAnswers.filter(
      (answer) => (reviewStates[answer.wordId]?.repetitions || 0) >= MIN_REPETITIONS_FOR_RETENTION
    ).length;
    const retention = Math.round((retained / total) * 100);
    const finalScore = Math.round(accuracy * FINAL_ACCURACY_WEIGHT + speed * FINAL_SPEED_WEIGHT + retention * FINAL_RETENTION_WEIGHT);

    const scoring = ScoringService.calculateScore({
      module: 'Vocabulary',
      difficulty: 'Intermediate',
      performanceRatio: finalScore / 100,
      timeSpentMinutes: Math.max(MIN_TIME_SPENT_MINUTES, Math.round(total * MINUTES_PER_ANSWER)),
    });

    const weakWords = answers.filter((answer) => !answer.isCorrect).map((answer) => answer.wordId);
    const strongWords = correctAnswers.map((answer) => answer.wordId);

    return {
      accuracy,
      speed,
      retention,
      finalScore,
      xpEarned: scoring.xp,
      coinsEarned: scoring.coins,
      eloChange: scoring.eloChange,
      weakWords,
      strongWords,
      feedback: scoring.feedback,
    };
  },
};
