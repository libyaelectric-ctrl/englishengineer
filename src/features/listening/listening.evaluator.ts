import {
  ListeningMission,
  ListeningSubmission,
  ListeningEvaluationResult,
  ListeningDetailedAnswerFeedback,
} from './listening.types';
import { ScoringService } from '@/core/learning/scoring.service';

export const ListeningEvaluator = {
  /**
   * Evaluates a listening submission locally using precise rule-based criteria.
   */
  evaluate(
    mission: ListeningMission,
    submission: ListeningSubmission
  ): ListeningEvaluationResult {
    const { answers, summary, userKeywords, timeSpentMinutes } = submission;
    const detailedAnswers: ListeningDetailedAnswerFeedback[] = [];

    // 1. Comprehension questions scoring (multiple-choice or true-false)
    let correctQuestionsCount = 0;
    const totalQuestionsCount = mission.questions.length;

    mission.questions.forEach((q) => {
      const userAns = (answers[q.id] || '').trim();
      const isMC = q.type === 'multiple_choice';
      const isTF = q.type === 'true_false';

      let isCorrect = false;

      if (isMC) {
        const cleanedUser = userAns.toUpperCase().charAt(0);
        const cleanedCorrect = q.correctAnswer.toUpperCase().charAt(0);
        isCorrect = cleanedUser === cleanedCorrect;
      } else if (isTF) {
        const cleanedUser = userAns.toLowerCase().trim();
        const cleanedCorrect = q.correctAnswer.toLowerCase().trim();
        isCorrect =
          cleanedUser === cleanedCorrect ||
          (cleanedUser.startsWith('t') && cleanedCorrect.startsWith('t')) ||
          (cleanedUser.startsWith('f') && cleanedCorrect.startsWith('f'));
      } else {
        // Fallback or fill in comparison
        isCorrect = userAns.toLowerCase() === q.correctAnswer.toLowerCase();
      }

      if (isCorrect) {
        correctQuestionsCount++;
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

    const comprehensionScore =
      totalQuestionsCount > 0
        ? Math.round((correctQuestionsCount / totalQuestionsCount) * 100)
        : 100;

    // 2. Keyword score calculation
    // Clean and split user input keywords
    const userKeywordList = userKeywords
      .toLowerCase()
      .split(/[\s,;]+/)
      .map((k) => k.trim())
      .filter((k) => k.length > 2);

    let matchedKeywordsCount = 0;
    const missionKeywords = mission.keywords.map((k) => k.toLowerCase());

    missionKeywords.forEach((mk) => {
      // Direct match or substring match
      const isMatched =
        userKeywordList.some((uk) => uk.includes(mk) || mk.includes(uk)) ||
        summary.toLowerCase().includes(mk);
      if (isMatched) {
        matchedKeywordsCount++;
      }
    });

    const keywordRatio =
      missionKeywords.length > 0
        ? matchedKeywordsCount / missionKeywords.length
        : 1.0;
    const keywordScore = Math.round(keywordRatio * 100);

    // 3. Vocabulary score calculation
    // Check if the user mentioned the defined technical vocabulary terms in their summary/keywords
    let matchedVocabCount = 0;
    const vocabularyList = mission.vocabulary.map((v) => v.term.toLowerCase());

    vocabularyList.forEach((vt) => {
      const isFound =
        summary.toLowerCase().includes(vt) ||
        userKeywords.toLowerCase().includes(vt);
      if (isFound) {
        matchedVocabCount++;
      }
    });

    const vocabRatio =
      vocabularyList.length > 0
        ? matchedVocabCount / vocabularyList.length
        : 1.0;
    // Base vocabulary score plus a bonus for answering questions correctly
    const vocabularyScore = Math.round(
      vocabRatio * 60 + (comprehensionScore / 100) * 40
    );

    // 4. Summary Quality Scoring
    // Check length of summary and presence of core keywords
    const wordCount = summary.split(/\s+/).filter(Boolean).length;
    let summaryScore = 0;

    if (wordCount === 0) {
      summaryScore = 0;
    } else if (wordCount < 15) {
      summaryScore = 30; // too brief
    } else if (wordCount < 30) {
      summaryScore = 60; // moderate
    } else if (wordCount < 100) {
      summaryScore = 85; // solid
    } else {
      summaryScore = 100; // comprehensive
    }

    // Add some weight based on matching keyword density in summary
    const summaryDensityBonus = Math.min(15, matchedKeywordsCount * 3);
    summaryScore = Math.min(100, summaryScore + summaryDensityBonus);

    // 5. Final weighted score calculation
    const finalScore = Math.round(
      comprehensionScore * 0.4 +
        keywordScore * 0.2 +
        vocabularyScore * 0.2 +
        summaryScore * 0.2
    );

    // Call global learning scoring service
    const scoringResult = ScoringService.calculateScore({
      module: 'Listening',
      difficulty: mission.difficulty,
      performanceRatio: finalScore / 100,
      timeSpentMinutes,
    });

    // 6. Generate feedback insights
    const strengths: string[] = [...scoringResult.strengths];
    const weaknesses: string[] = [...scoringResult.weaknesses];

    let summaryFeedback = '';
    let keywordFeedback = '';

    if (comprehensionScore >= 100) {
      strengths.push('Flawless retention of quantitative speech figures');
    } else if (comprehensionScore < 50) {
      weaknesses.push('Key architectural parameters missed in verbal exchange');
    }

    if (keywordScore >= 80) {
      strengths.push('Highly acute recognition of technical site keywords');
      keywordFeedback =
        'Superb keyword alignment. You captured almost all crucial concepts discussed in the session.';
    } else {
      weaknesses.push('Critical keywords not fully captured from audio track');
      keywordFeedback =
        'Consider reviewing the transcript clues to target specific engineering nomenclature during listening.';
    }

    if (vocabRatio >= 1.0) {
      strengths.push(
        'Demonstrated strong mastery of core technical vocabulary items'
      );
    } else {
      weaknesses.push('Technical glossary terms underutilized in synthesis');
    }

    if (wordCount >= 30) {
      strengths.push('Structured and detailed engineering executive summary');
      summaryFeedback =
        'Your summary displays professional clarity and sufficient technical depth to guide downstream workflows.';
    } else {
      weaknesses.push(
        'Executive summary is too brief to convey full technical contexts'
      );
      summaryFeedback =
        'Try to elaborate your summaries by documenting specific engineering values, directives, or safety guidelines.';
    }

    const finalWeaknesses = weaknesses.filter((w) => w !== 'None detected');

    return {
      missionId: mission.id,
      comprehensionScore,
      keywordScore,
      vocabularyScore,
      summaryScore,
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
      summaryFeedback,
      keywordFeedback,
    };
  },
};
