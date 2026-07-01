import { ScoringService } from '@/core/learning';
import {
  VocabularyAnswer,
  VocabularyEvaluationResult,
  VocabularyReviewState,
} from './vocabulary.types';

export const VocabularyEvaluator = {
  evaluate(
    answers: VocabularyAnswer[],
    reviewStates: Record<string, VocabularyReviewState>
  ): VocabularyEvaluationResult {
    const total = Math.max(answers.length, 1);
    const correctAnswers = answers.filter((answer) => answer.isCorrect);
    const accuracy = Math.round((correctAnswers.length / total) * 100);
    const averageSpeed =
      answers.reduce((sum, answer) => sum + answer.responseTimeSeconds, 0) /
      total;
    const speed = Math.round(
      Math.max(0, Math.min(100, 100 - averageSpeed * 8))
    );

    const retained = correctAnswers.filter(
      (answer) => (reviewStates[answer.wordId]?.repetitions || 0) >= 2
    ).length;
    const retention = Math.round((retained / total) * 100);
    const finalScore = Math.round(
      accuracy * 0.55 + speed * 0.2 + retention * 0.25
    );

    const scoring = ScoringService.calculateScore({
      module: 'Vocabulary',
      difficulty: 'Intermediate',
      performanceRatio: finalScore / 100,
      timeSpentMinutes: Math.max(1, Math.round(total * 0.5)),
    });

    const weakWords = answers
      .filter((answer) => !answer.isCorrect)
      .map((answer) => answer.wordId);
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
