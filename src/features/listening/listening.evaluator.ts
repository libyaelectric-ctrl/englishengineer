import {
  ListeningMission,
  ListeningSubmission,
  ListeningEvaluationResult,
  ListeningDetailedAnswerFeedback,
} from './listening.types';
import { ScoringService } from '@/core/learning/scoring.service';

const scoreComprehension = (
  mission: ListeningMission,
  answers: Record<string, string>
): { correct: number; detailed: ListeningDetailedAnswerFeedback[] } => {
  let correctCount = 0;
  const detailed: ListeningDetailedAnswerFeedback[] = [];

  mission.questions.forEach((q) => {
    const userAns = (answers[q.id] || '').trim();
    const isCorrect = checkAnswer(userAns, q.correctAnswer, q.type);

    if (isCorrect) correctCount++;
    detailed.push({
      questionId: q.id,
      questionText: q.questionText,
      userAnswer: userAns || '(No Answer Provided)',
      correctAnswer: q.correctAnswer,
      isCorrect,
      explanation: q.explanation,
    });
  });

  return { correct: correctCount, detailed };
};

const checkAnswer = (userAns: string, correctAnswer: string, type: string): boolean => {
  if (type === 'multiple_choice') {
    return userAns.toUpperCase().charAt(0) === correctAnswer.toUpperCase().charAt(0);
  }
  if (type === 'true_false') {
    const cleanedUser = userAns.toLowerCase().trim();
    const cleanedCorrect = correctAnswer.toLowerCase().trim();
    return (
      cleanedUser === cleanedCorrect ||
      (cleanedUser.startsWith('t') && cleanedCorrect.startsWith('t')) ||
      (cleanedUser.startsWith('f') && cleanedCorrect.startsWith('f'))
    );
  }
  return userAns.toLowerCase() === correctAnswer.toLowerCase();
};

const scoreKeywords = (
  userKeywordList: string[],
  missionKeywords: string[],
  summary: string
): { keywordRatio: number; matchedCount: number } => {
  let matchedCount = 0;
  missionKeywords.forEach((mk) => {
    const isMatched =
      userKeywordList.some((uk) => uk.includes(mk) || mk.includes(uk)) ||
      summary.toLowerCase().includes(mk);
    if (isMatched) matchedCount++;
  });
  const keywordRatio = missionKeywords.length > 0 ? matchedCount / missionKeywords.length : 1.0;
  return { keywordRatio, matchedCount };
};

const scoreVocabulary = (
  vocabularyList: string[],
  summary: string,
  userKeywords: string,
  comprehensionScore: number
): { vocabRatio: number; score: number } => {
  let matchedCount = 0;
  const lowerSummary = summary.toLowerCase();
  const lowerKeywords = userKeywords.toLowerCase();
  vocabularyList.forEach((vt) => {
    if (lowerSummary.includes(vt) || lowerKeywords.includes(vt)) matchedCount++;
  });
  const vocabRatio = vocabularyList.length > 0 ? matchedCount / vocabularyList.length : 1.0;
  return { vocabRatio, score: Math.round(vocabRatio * 60 + (comprehensionScore / 100) * 40) };
};

const scoreSummary = (wordCount: number, matchedKeywordsCount: number): number => {
  let summaryScore = 0;
  if (wordCount === 0) {
    summaryScore = 0;
  } else if (wordCount < 15) {
    summaryScore = 30;
  } else if (wordCount < 30) {
    summaryScore = 60;
  } else if (wordCount < 100) {
    summaryScore = 85;
  } else {
    summaryScore = 100;
  }
  return Math.min(100, summaryScore + Math.min(15, matchedKeywordsCount * 3));
};

const buildFeedback = (
  comprehensionScore: number,
  keywordScore: number,
  vocabRatio: number,
  wordCount: number,
  strengths: string[],
  weaknesses: string[]
): { summaryFeedback: string; keywordFeedback: string } => {
  let summaryFeedback = '';
  let keywordFeedback = '';

  if (comprehensionScore >= 100) {
    strengths.push('Flawless retention of quantitative speech figures');
  } else if (comprehensionScore < 50) {
    weaknesses.push('Key architectural parameters missed in verbal exchange');
  }

  if (keywordScore >= 80) {
    strengths.push('Highly acute recognition of technical site keywords');
    keywordFeedback = 'Superb keyword alignment. You captured almost all crucial concepts discussed in the session.';
  } else {
    weaknesses.push('Critical keywords not fully captured from audio track');
    keywordFeedback = 'Consider reviewing the transcript clues to target specific engineering nomenclature during listening.';
  }

  if (vocabRatio >= 1.0) {
    strengths.push('Demonstrated strong mastery of core technical vocabulary items');
  } else {
    weaknesses.push('Technical glossary terms underutilized in synthesis');
  }

  if (wordCount >= 30) {
    strengths.push('Structured and detailed engineering executive summary');
    summaryFeedback = 'Your summary displays professional clarity and sufficient technical depth to guide downstream workflows.';
  } else {
    weaknesses.push('Executive summary is too brief to convey full technical contexts');
    summaryFeedback = 'Try to elaborate your summaries by documenting specific engineering values, directives, or safety guidelines.';
  }

  return { summaryFeedback, keywordFeedback };
};

export const ListeningEvaluator = {
  evaluate(
    mission: ListeningMission,
    submission: ListeningSubmission
  ): ListeningEvaluationResult {
    const { answers, summary, userKeywords, timeSpentMinutes } = submission;

    const totalQuestionsCount = mission.questions.length;
    const { correct: correctQuestionsCount, detailed: detailedAnswers } =
      scoreComprehension(mission, answers);

    const comprehensionScore =
      totalQuestionsCount > 0
        ? Math.round((correctQuestionsCount / totalQuestionsCount) * 100)
        : 100;

    const userKeywordList = userKeywords
      .toLowerCase()
      .split(/[\s,;]+/)
      .map((k) => k.trim())
      .filter((k) => k.length > 2);

    const missionKeywords = mission.keywords.map((k) => k.toLowerCase());
    const { keywordRatio, matchedCount: matchedKeywordsCount } =
      scoreKeywords(userKeywordList, missionKeywords, summary);
    const keywordScore = Math.round(keywordRatio * 100);

    const vocabularyList = mission.vocabulary.map((v) => v.term.toLowerCase());
    const { vocabRatio, score: vocabularyScore } = scoreVocabulary(vocabularyList, summary, userKeywords, comprehensionScore);

    const wordCount = summary.split(/\s+/).filter(Boolean).length;
    const summaryScore = scoreSummary(wordCount, matchedKeywordsCount);

    const finalScore = Math.round(
      comprehensionScore * 0.4 + keywordScore * 0.2 + vocabularyScore * 0.2 + summaryScore * 0.2
    );

    const scoringResult = ScoringService.calculateScore({
      module: 'Listening',
      difficulty: mission.difficulty,
      performanceRatio: finalScore / 100,
      timeSpentMinutes,
    });

    const strengths: string[] = [...scoringResult.strengths];
    const weaknesses: string[] = [...scoringResult.weaknesses];
    const { summaryFeedback, keywordFeedback } = buildFeedback(
      comprehensionScore, keywordScore, vocabRatio, wordCount, strengths, weaknesses
    );

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
      weaknesses: finalWeaknesses.length > 0 ? Array.from(new Set(finalWeaknesses)) : ['None detected'],
      feedback: scoringResult.feedback,
      detailedAnswers,
      summaryFeedback,
      keywordFeedback,
    };
  },
};
