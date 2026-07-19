export interface ForgettingCurvePoint {
  day: number;
  retention: number;
}

export interface ForgettingCurveData {
  wordId: string;
  stability: number;
  curve: ForgettingCurvePoint[];
  currentRetention: number;
}

const DEFAULT_STABILITY = 3;

export const calculateRetention = (
  daysSinceReview: number,
  stability: number
): number => {
  if (stability <= 0) return 0;
  return Math.max(
    0,
    Math.min(100, Math.round(100 * Math.exp(-daysSinceReview / stability)))
  );
};

export const estimateStability = (
  correctReviews: number,
  wrongReviews: number,
  averageEaseFactor: number
): number => {
  if (correctReviews === 0 && wrongReviews === 0) return DEFAULT_STABILITY;
  const baseStability = 1 + correctReviews * 1.5;
  const penalty = wrongReviews * 0.8;
  const easeBonus = (averageEaseFactor - 2.5) * 0.5;
  return Math.max(0.5, baseStability - penalty + easeBonus);
};

export const generateForgettingCurve = (
  wordId: string,
  correctReviews: number,
  wrongReviews: number,
  easeFactor: number,
  daysSinceLastReview: number,
  daysToPlot = 30
): ForgettingCurveData => {
  const stability = estimateStability(correctReviews, wrongReviews, easeFactor);
  const curve: ForgettingCurvePoint[] = [];

  for (let day = 0; day <= daysToPlot; day++) {
    curve.push({
      day,
      retention: calculateRetention(day + daysSinceLastReview, stability),
    });
  }

  const currentRetention = calculateRetention(daysSinceLastReview, stability);

  return { wordId, stability, curve, currentRetention };
};

export const generateMultiWordCurves = (
  words: Array<{
    wordId: string;
    correctReviews: number;
    wrongReviews: number;
    easeFactor: number;
    daysSinceLastReview: number;
  }>,
  daysToPlot = 30
): ForgettingCurveData[] =>
  words.map((word) =>
    generateForgettingCurve(
      word.wordId,
      word.correctReviews,
      word.wrongReviews,
      word.easeFactor,
      word.daysSinceLastReview,
      daysToPlot
    )
  );

export const getRetentionColor = (retention: number): string => {
  if (retention >= 80) return '#22c55e';
  if (retention >= 50) return '#eab308';
  if (retention >= 25) return '#f97316';
  return '#ef4444';
};

export const getRetentionLabel = (retention: number): string => {
  if (retention >= 80) return 'Strong';
  if (retention >= 50) return 'Fading';
  if (retention >= 25) return 'Weak';
  return 'Critical';
};
