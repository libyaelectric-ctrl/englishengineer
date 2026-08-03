import { levenshteinSimilarity } from '@/shared/utils/string-utils';

export interface PhonemeAnalysis {
  word: string;
  ipa: string;
  expectedPronunciation: string;
  recognizedText: string;
  similarity: number;
  isAccurate: boolean;
}

export interface PronunciationScoreResult {
  overallScore: number;
  wordAnalyses: PhonemeAnalysis[];
  accurateWordCount: number;
  totalTargetWords: number;
  accentStrength: 'native' | 'strong' | 'moderate' | 'developing' | 'weak';
  feedback: string;
  recommendations: string[];
}

function calculateWordSimilarity(recognized: string, expected: string): number {
  return levenshteinSimilarity(recognized, expected);
}

function classifyAccentStrength(score: number): PronunciationScoreResult['accentStrength'] {
  if (score >= 90) return 'native';
  if (score >= 75) return 'strong';
  if (score >= 55) return 'moderate';
  if (score >= 35) return 'developing';
  return 'weak';
}

function generateRecommendations(analyses: PhonemeAnalysis[]): string[] {
  const recommendations: string[] = [];
  const inaccurateWords = analyses.filter((a) => !a.isAccurate);

  if (inaccurateWords.length === 0) {
    recommendations.push('Excellent pronunciation — maintain this level');
    return recommendations;
  }

  const shortWords = inaccurateWords.filter((a) => a.word.length <= 4);
  const longWords = inaccurateWords.filter((a) => a.word.length > 6);

  if (shortWords.length > 0) {
    recommendations.push(
      `Practice short words: ${shortWords
        .slice(0, 3)
        .map((w) => w.word)
        .join(', ')}`
    );
  }

  if (longWords.length > 0) {
    recommendations.push(
      `Break down long words: ${longWords
        .slice(0, 3)
        .map((w) => w.word)
        .join(', ')}`
    );
  }

  const lowSimilarity = inaccurateWords.filter((a) => a.similarity < 0.5);
  if (lowSimilarity.length > 0) {
    recommendations.push(
      `Focus on these difficult words: ${lowSimilarity
        .slice(0, 3)
        .map((w) => w.word)
        .join(', ')}`
    );
  }

  if (recommendations.length === 0) {
    recommendations.push('Minor pronunciation adjustments needed');
  }

  return recommendations;
}

export const PronunciationScorer = {
  analyze(
    targetWords: Array<{ word: string; ipa: string }>,
    recognizedText: string
  ): PronunciationScoreResult {
    const recognizedWords = recognizedText
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 0);

    const wordAnalyses: PhonemeAnalysis[] = targetWords.map((target) => {
      // Find closest matching recognized word
      let bestSimilarity = 0;
      let bestMatch = '';

      for (const recognized of recognizedWords) {
        const similarity = calculateWordSimilarity(recognized, target.word);
        if (similarity > bestSimilarity) {
          bestSimilarity = similarity;
          bestMatch = recognized;
        }
      }

      const isAccurate = bestSimilarity >= 0.7;

      return {
        word: target.word,
        ipa: target.ipa,
        expectedPronunciation: target.ipa,
        recognizedText: bestMatch || '',
        similarity: Math.round(bestSimilarity * 100) / 100,
        isAccurate,
      };
    });

    const accurateWordCount = wordAnalyses.filter((a) => a.isAccurate).length;
    const totalTargetWords = targetWords.length;
    const overallScore =
      totalTargetWords > 0 ? Math.round((accurateWordCount / totalTargetWords) * 100) : 100;

    const accentStrength = classifyAccentStrength(overallScore);
    const recommendations = generateRecommendations(wordAnalyses);

    const feedback =
      overallScore >= 80
        ? 'Pronunciation is clear and professional'
        : overallScore >= 60
          ? 'Good pronunciation with some areas to improve'
          : 'Pronunciation needs practice — focus on the flagged words';

    return {
      overallScore,
      wordAnalyses,
      accurateWordCount,
      totalTargetWords,
      accentStrength,
      feedback,
      recommendations,
    };
  },
};
