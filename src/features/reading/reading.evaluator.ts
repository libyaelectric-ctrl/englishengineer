import {
  ReadingMission,
  ReadingSubmission,
  ReadingEvaluationResult,
  DetailedAnswerFeedback,
} from './reading.types';
import { ScoringService } from '@/core/learning/scoring.service';

interface QuestionEvalResult {
  isCorrect: boolean;
  category: 'comprehension' | 'tech' | 'vocab';
}

const evaluateQuestion = (
  q: ReadingMission['questions'][number],
  userAns: string
): QuestionEvalResult => {
  if (q.type === 'multiple_choice') {
    const cleanedUser = userAns.toUpperCase().charAt(0);
    const cleanedCorrect = q.correctAnswer.toUpperCase().charAt(0);
    return { isCorrect: cleanedUser === cleanedCorrect, category: 'comprehension' };
  }

  if (q.type === 'true_false') {
    const cleanedUser = userAns.toLowerCase();
    const cleanedCorrect = q.correctAnswer.toLowerCase();
    const isCorrect =
      cleanedUser === cleanedCorrect ||
      (cleanedUser.startsWith('t') && cleanedCorrect.startsWith('t')) ||
      (cleanedUser.startsWith('f') && cleanedCorrect.startsWith('f'));
    return { isCorrect, category: 'comprehension' };
  }

  if (q.type === 'keyword_answer') {
    const cleanedUser = userAns.toLowerCase();
    const isCorrect =
      q.keywords?.some((k) => cleanedUser.includes(k.toLowerCase())) ||
      cleanedUser === q.correctAnswer.toLowerCase();
    return { isCorrect, category: 'tech' };
  }

  // short_answer
  const cleanedUser = userAns.toLowerCase();
  if (cleanedUser.length > 5) {
    const matchedKeywords =
      q.keywords?.filter((k) => cleanedUser.includes(k.toLowerCase())) || [];
    const matchRatio =
      q.keywords && q.keywords.length > 0
        ? matchedKeywords.length / q.keywords.length
        : 1.0;
    return { isCorrect: matchRatio >= 0.5, category: 'vocab' };
  }
  return { isCorrect: false, category: 'vocab' };
};

export const ReadingEvaluator = {
  evaluate(
    mission: ReadingMission,
    submission: ReadingSubmission,
    clickedVocabCount: number
  ): ReadingEvaluationResult {
    const { answers, timeSpentMinutes } = submission;
    const detailedAnswers: DetailedAnswerFeedback[] = [];
    const counts = { comprehension: [0, 0], tech: [0, 0], vocab: [0, 0] } as Record<string, [number, number]>;

    mission.questions.forEach((q) => {
      const userAns = (answers[q.id] || '').trim();
      const { isCorrect, category } = evaluateQuestion(q, userAns);
      counts[category][0]++;
      if (isCorrect) counts[category][1]++;

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
      counts.comprehension[0] > 0
        ? Math.round((counts.comprehension[1] / counts.comprehension[0]) * 100)
        : 100;

    const technicalAccuracyScore =
      counts.tech[0] > 0
        ? Math.round((counts.tech[1] / counts.tech[0]) * 100)
        : 100;

    const qVocabRatio =
      counts.vocab[0] > 0 ? counts.vocab[1] / counts.vocab[0] : 1.0;
    const clickBonus = Math.min(30, clickedVocabCount * 15);
    const vocabularyScore = Math.min(
      100,
      Math.round(qVocabRatio * 70 + clickBonus)
    );

    const finalScore = Math.round(
      comprehensionScore * 0.4 +
        vocabularyScore * 0.3 +
        technicalAccuracyScore * 0.3
    );

    const scoringResult = ScoringService.calculateScore({
      module: 'Reading',
      difficulty: mission.difficulty,
      performanceRatio: finalScore / 100,
      timeSpentMinutes,
    });

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
