import type {
  PlacementAnswers,
  PlacementDomain,
  PlacementQuestion,
  PlacementResult,
} from './placement.types';

const BAND_BY_SCORE: PlacementResult['recommendedBand'][] = [
  'A1',
  'A1+',
  'A2',
  'A2+',
  'B1',
  'B1+',
  'B2',
  'C1',
  'C2',
];

export const evaluatePlacement = (
  questions: PlacementQuestion[],
  answers: PlacementAnswers,
  now = new Date()
): PlacementResult => {
  const answered = questions.filter((question) =>
    Number.isInteger(answers[question.id])
  );
  const correct = answered.filter(
    (question) => answers[question.id] === question.correctIndex
  );
  const domainScores = new Map<
    PlacementDomain,
    { correct: number; total: number }
  >();

  questions.forEach((question) => {
    const score = domainScores.get(question.domain) ?? { correct: 0, total: 0 };
    score.total += 1;
    if (answers[question.id] === question.correctIndex) score.correct += 1;
    domainScores.set(question.domain, score);
  });

  const orderedDomains = [...domainScores.entries()].sort(
    (a, b) => b[1].correct / b[1].total - a[1].correct / a[1].total
  );
  const score = Math.round(
    (correct.length / Math.max(questions.length, 1)) * 100
  );
  const bandIndex = Math.min(correct.length, BAND_BY_SCORE.length - 1);

  return {
    score,
    answeredCount: answered.length,
    recommendedBand: BAND_BY_SCORE[bandIndex],
    confidence:
      answered.length < 6
        ? 'limited'
        : answered.length < questions.length
          ? 'moderate'
          : 'strong',
    strengths: orderedDomains
      .filter(([, value]) => value.correct / value.total >= 0.67)
      .map(([domain]) => domain),
    priorityAreas: orderedDomains
      .filter(([, value]) => value.correct / value.total < 0.67)
      .map(([domain]) => domain),
    recommendedSkills: ['reading', 'vocabulary', 'grammar'],
    completedAt: now.toISOString(),
  };
};
