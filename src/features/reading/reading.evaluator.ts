import {
  ReadingMission,
  ReadingSubmission,
  ReadingEvaluationResult,
  DetailedAnswerFeedback,
} from './reading.types';
import { ScoringService } from '@/core/learning/scoring.service';

export const ReadingEvaluator = {
  /**
   * Evaluates a reading submission locally using sophisticated rule-based matching.
   */
  evaluate(
    mission: ReadingMission,
    submission: ReadingSubmission,
    clickedVocabCount: number
  ): ReadingEvaluationResult {
    const { answers, timeSpentMinutes } = submission;
    const detailedAnswers: DetailedAnswerFeedback[] = [];

    let correctComprehensionCount = 0; // Out of 2 (MC and T/F)
    let totalComprehensionCount = 0;

    let correctTechCount = 0; // Out of 1 (Keyword)
    let totalTechCount = 0;

    let correctVocabCount = 0; // Out of 1 (Short Answer keywords)
    let totalVocabCount = 0;

    mission.questions.forEach((q) => {
      const userAns = (answers[q.id] || '').trim();
      const isMC = q.type === 'multiple_choice';
      const isTF = q.type === 'true_false';
      const isKeyword = q.type === 'keyword_answer';
      const isShort = q.type === 'short_answer';

      let isCorrect = false;

      if (isMC) {
        totalComprehensionCount++;
        // Check if correct choice letter matches
        const cleanedUser = userAns.toUpperCase().charAt(0);
        const cleanedCorrect = q.correctAnswer.toUpperCase().charAt(0);
        isCorrect = cleanedUser === cleanedCorrect;
        if (isCorrect) correctComprehensionCount++;
      } else if (isTF) {
        totalComprehensionCount++;
        const cleanedUser = userAns.toLowerCase();
        const cleanedCorrect = q.correctAnswer.toLowerCase();
        isCorrect =
          cleanedUser === cleanedCorrect ||
          (cleanedUser.startsWith('t') && cleanedCorrect.startsWith('t')) ||
          (cleanedUser.startsWith('f') && cleanedCorrect.startsWith('f'));
        if (isCorrect) correctComprehensionCount++;
      } else if (isKeyword) {
        totalTechCount++;
        const cleanedUser = userAns.toLowerCase();
        // Check keywords
        const matchesKeyword =
          q.keywords?.some((k) => cleanedUser.includes(k.toLowerCase())) ||
          cleanedUser === q.correctAnswer.toLowerCase();
        isCorrect = matchesKeyword;
        if (isCorrect) correctTechCount++;
      } else if (isShort) {
        totalVocabCount++;
        const cleanedUser = userAns.toLowerCase();
        if (cleanedUser.length > 5) {
          // Count matched keywords
          const matchedKeywords =
            q.keywords?.filter((k) => cleanedUser.includes(k.toLowerCase())) ||
            [];
          const matchRatio =
            q.keywords && q.keywords.length > 0
              ? matchedKeywords.length / q.keywords.length
              : 1.0;

          isCorrect = matchRatio >= 0.5; // Correct if at least 50% keywords matched
          if (isCorrect) correctVocabCount++;
        }
      }

      detailedAnswers.push({
        questionId: q.id,
        questionText: q.questionText,
        userAnswer: userAns || '(No Answer Provided)',
        correctAnswer: q.correctAnswer,
        isCorrect,
        explanation: q.explanation,
      });
    });

    // Sub-Scores out of 100
    const comprehensionScore =
      totalComprehensionCount > 0
        ? Math.round(
            (correctComprehensionCount / totalComprehensionCount) * 100
          )
        : 100;

    const technicalAccuracyScore =
      totalTechCount > 0
        ? Math.round((correctTechCount / totalTechCount) * 100)
        : 100;

    // Vocab score accounts for questions + vocabulary exploration clicks (interactive telemetry)
    const qVocabRatio =
      totalVocabCount > 0 ? correctVocabCount / totalVocabCount : 1.0;
    const clickBonus = Math.min(30, clickedVocabCount * 15); // 15 points per clicked term, up to 30 points
    const vocabularyScore = Math.min(
      100,
      Math.round(qVocabRatio * 70 + clickBonus)
    );

    // Weighted final score
    const finalScore = Math.round(
      comprehensionScore * 0.4 +
        vocabularyScore * 0.3 +
        technicalAccuracyScore * 0.3
    );

    // Standard rewards via core ScoringService
    const scoringResult = ScoringService.calculateScore({
      module: 'Reading',
      difficulty: mission.difficulty,
      performanceRatio: finalScore / 100,
      timeSpentMinutes,
    });

    // Customize strengths & weaknesses based on reading-specific sub-scores
    const strengths: string[] = [...scoringResult.strengths];
    const weaknesses: string[] = [...scoringResult.weaknesses];

    if (comprehensionScore >= 90) {
      strengths.push('Excellent overall textual parsing');
    } else {
      weaknesses.push('Minor details missed in the technical specifications');
    }

    if (technicalAccuracyScore >= 100) {
      strengths.push('High precision in electrical specifications extraction');
    } else {
      weaknesses.push('Missed specific engineering parameters or codes');
    }

    if (vocabularyScore >= 80) {
      strengths.push('Proactive vocabulary analysis and jargon mapping');
    } else {
      weaknesses.push('Needs closer review of technical glossary definitions');
    }

    // Filter "None detected" from weaknesses if we have real weaknesses
    const finalWeaknesses = weaknesses.filter((w) => w !== 'None detected');

    return {
      missionId: mission.id,
      comprehensionScore,
      vocabularyScore,
      technicalAccuracyScore,
      finalScore,
      xpEarned: scoringResult.xp,
      coinsEarned: scoringResult.coins,
      eloChange: scoringResult.eloChange,
      strengths: Array.from(new Set(strengths)),
      weaknesses:
        finalWeaknesses.length > 0
          ? Array.from(new Set(finalWeaknesses))
          : ['None detected'],
      feedback: scoringResult.feedback,
      detailedAnswers,
    };
  },
};
