import { ScoringService } from '@/core/learning/scoring.service';
import {
  SpeakingEvaluationResult,
  SpeakingMission,
  SpeakingSubmission,
} from './speaking.types';
import {
  calculateWordsPerMinute,
  countFillerWords,
  countSentences,
  countWords,
  keywordMatchRatio,
  normalizeSpeechText,
} from './speaking.helpers';

const scoreFromRatio = (ratio: number): number =>
  Math.round(Math.min(1, Math.max(0, ratio)) * 100);

const getPaceRatio = (wordsPerMinute: number, targetWpm: number): number => {
  if (targetWpm <= 0) return 1;

  const lowerTolerance = targetWpm * 0.75;
  const upperTolerance = targetWpm * 1.15;
  const unrealisticUpper = targetWpm * 1.65;

  if (wordsPerMinute >= lowerTolerance && wordsPerMinute <= upperTolerance)
    return 1;
  if (wordsPerMinute < lowerTolerance) return wordsPerMinute / lowerTolerance;
  if (wordsPerMinute >= unrealisticUpper) return 0.45;

  const overspeedRange = unrealisticUpper - upperTolerance;
  const overspeedAmount = wordsPerMinute - upperTolerance;
  return 1 - (overspeedAmount / overspeedRange) * 0.55;
};

export const SpeakingEvaluator = {
  evaluate(
    mission: SpeakingMission,
    submission: SpeakingSubmission
  ): SpeakingEvaluationResult {
    const transcriptUsed = (
      submission.transcript || submission.typedTranscript
    ).trim();
    const normalizedTranscript = normalizeSpeechText(transcriptUsed);
    const normalizedPrompt = normalizeSpeechText(mission.promptText);
    const wordCount = countWords(transcriptUsed);
    const sentenceCount = countSentences(transcriptUsed);
    const fillerWordCount = countFillerWords(transcriptUsed);
    const promptWordCount = countWords(mission.promptText);
    const wordsPerMinuteResult = calculateWordsPerMinute(
      wordCount,
      submission.recordingSeconds
    );
    const wordsPerMinute = wordsPerMinuteResult.value;

    const paceRatio = getPaceRatio(wordsPerMinute, mission.targetWpm);
    const lengthRatio =
      promptWordCount > 0 ? Math.min(wordCount / promptWordCount, 1) : 1;
    const sentenceRatio = Math.min(sentenceCount / 2, 1);
    const fillerPenalty = Math.min(fillerWordCount * 8, 35);
    const fluencyScore = Math.max(
      0,
      scoreFromRatio(
        paceRatio * 0.5 + lengthRatio * 0.3 + sentenceRatio * 0.2
      ) - fillerPenalty
    );

    const promptTokens = normalizedPrompt
      .split(' ')
      .filter((token) => token.length > 3);
    const matchedPromptTokens = promptTokens.filter((token) =>
      normalizedTranscript.includes(token)
    );
    const promptCoverageRatio =
      promptTokens.length > 0
        ? matchedPromptTokens.length / promptTokens.length
        : 1;
    const clarityKeywordRatio = keywordMatchRatio(
      transcriptUsed,
      mission.confidenceMarkers
    );
    const clarityScore = scoreFromRatio(
      promptCoverageRatio * 0.75 + clarityKeywordRatio * 0.25
    );

    const grammarScore = scoreFromRatio(
      keywordMatchRatio(transcriptUsed, mission.grammarTargets)
    );
    const targetTermRatio = keywordMatchRatio(
      transcriptUsed,
      mission.syllabicTargets.map((target) => target.word)
    );
    const technicalVocabularyScore = scoreFromRatio(
      keywordMatchRatio(transcriptUsed, mission.expectedKeywords) * 0.7 +
        targetTermRatio * 0.3
    );
    const confidenceScore = scoreFromRatio(
      keywordMatchRatio(transcriptUsed, mission.confidenceMarkers) * 0.55 +
        Math.min(sentenceCount / 3, 1) * 0.25 +
        (fillerWordCount === 0 ? 0.2 : 0.05)
    );

    const finalScore = Math.round(
      fluencyScore * 0.22 +
        clarityScore * 0.24 +
        grammarScore * 0.18 +
        technicalVocabularyScore * 0.24 +
        confidenceScore * 0.12
    );

    const scoringResult = ScoringService.calculateScore({
      module: 'Speaking',
      difficulty: mission.difficulty,
      performanceRatio: finalScore / 100,
      timeSpentMinutes: submission.timeSpentMinutes,
    });

    const strengths: string[] = [...scoringResult.strengths];
    const weaknesses: string[] = [...scoringResult.weaknesses].filter(
      (item) => item !== 'None detected'
    );

    if (fluencyScore >= 85)
      strengths.push('Stable pacing against target speaking rate');
    else
      weaknesses.push('Speaking pace or transcript length needs more control');

    if (clarityScore >= 85)
      strengths.push('Clear alignment with the prompt structure');
    else weaknesses.push('Prompt details were omitted or heavily paraphrased');

    if (technicalVocabularyScore >= 80)
      strengths.push('Strong use of engineering terminology');
    else weaknesses.push('Important technical vocabulary was missing');

    if (grammarScore >= 80)
      strengths.push('Good command of required grammar patterns');
    else weaknesses.push('Target grammar structures need more repetition');

    return {
      missionId: mission.id,
      fluencyScore,
      clarityScore,
      grammarScore,
      technicalVocabularyScore,
      confidenceScore,
      finalScore,
      xpEarned: scoringResult.xp,
      coinsEarned: scoringResult.coins,
      eloChange: scoringResult.eloChange,
      wordCount,
      sentenceCount,
      fillerWordCount,
      wordsPerMinute,
      isWordsPerMinuteEstimated: wordsPerMinuteResult.isEstimated,
      strengths,
      weaknesses: weaknesses.length > 0 ? weaknesses : ['None detected'],
      feedback: scoringResult.feedback,
      transcriptUsed,
    };
  },
};
