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

const evaluateMultipleChoice = (
  userAns: string,
  correctAnswer: string
): boolean =>
  userAns.toUpperCase().charAt(0) === correctAnswer.toUpperCase().charAt(0);

const evaluateTrueFalse = (userAns: string, correctAnswer: string): boolean => {
  const u = userAns.toLowerCase();
  const c = correctAnswer.toLowerCase();
  return (
    u === c ||
    (u.startsWith('t') && c.startsWith('t')) ||
    (u.startsWith('f') && c.startsWith('f'))
  );
};

const evaluateKeywordAnswer = (
  userAns: string,
  correctAnswer: string,
  keywords?: string[]
): boolean => {
  const lower = userAns.toLowerCase();
  return (
    keywords?.some((k) => lower.includes(k.toLowerCase())) ||
    lower === correctAnswer.toLowerCase()
  );
};

const evaluateShortAnswer = (
  userAns: string,
  keywords?: string[]
): boolean => {
  const lower = userAns.toLowerCase();
  if (lower.length <= 5) return false;
  const matched =
    keywords?.filter((k) => lower.includes(k.toLowerCase())) ?? [];
  const ratio =
    keywords && keywords.length > 0 ? matched.length / keywords.length : 1.0;
  return ratio >= 0.5;
};

const evaluateQuestion = (
  q: ReadingMission['questions'][number],
  userAns: string
): QuestionEvalResult => {
  if (q.type === 'multiple_choice') {
    return {
      isCorrect: evaluateMultipleChoice(userAns, q.correctAnswer),
      category: 'comprehension',
    };
  }
  if (q.type === 'true_false') {
    return {
      isCorrect: evaluateTrueFalse(userAns, q.correctAnswer),
      category: 'comprehension',
    };
  }
  if (q.type === 'keyword_answer') {
    return {
      isCorrect: evaluateKeywordAnswer(userAns, q.correctAnswer, q.keywords),
      category: 'tech',
    };
  }
  return {
    isCorrect: evaluateShortAnswer(userAns, q.keywords),
    category: 'vocab',
  };
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
