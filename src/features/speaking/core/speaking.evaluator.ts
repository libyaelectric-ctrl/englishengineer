import { ScoringService } from '@/core/learning/scoring.service';

import {
  CLARITY_KEYWORD_WEIGHT,
  CLARITY_STRENGTH_THRESHOLD,
  CONFIDENCE_FILLER_PENALTY,
  CONFIDENCE_KEYWORD_WEIGHT,
  CONFIDENCE_NO_FILLER_BONUS,
  CONFIDENCE_SENTENCE_COUNT_DIVISOR,
  CONFIDENCE_SENTENCE_WEIGHT,
  FILLER_PENALTY_CAP,
  FILLER_PENALTY_MULTIPLIER,
  FINAL_CLARITY_WEIGHT,
  FINAL_CONFIDENCE_WEIGHT,
  FINAL_FLUENCY_WEIGHT,
  FINAL_GRAMMAR_WEIGHT,
  FINAL_TECHNICAL_WEIGHT,
  FLUENCY_STRENGTH_THRESHOLD,
  GRAMMAR_STRENGTH_THRESHOLD,
  LENGTH_WEIGHT,
  LOWER_TOLERANCE_MULTIPLIER,
  MIN_PROMPT_TOKEN_LENGTH,
  OVERSPEED_RANGE_FACTOR,
  PACE_WEIGHT,
  PROMPT_COVERAGE_WEIGHT,
  SENTENCE_COUNT_DIVISOR,
  SENTENCE_RATIO_WEIGHT,
  TECHNICAL_KEYWORD_WEIGHT,
  TECHNICAL_TARGET_TERM_WEIGHT,
  TECHNICAL_VOCABULARY_STRENGTH_THRESHOLD,
  UNREALISTIC_SPEED_MULTIPLIER,
  UNREALISTIC_SPEED_PENALTY,
  UPPER_TOLERANCE_MULTIPLIER,
} from './speaking.constants';
import {
  calculateWordsPerMinute,
  countFillerWords,
  countSentences,
  countWords,
  keywordMatchRatio,
  normalizeSpeechText,
} from './speaking.helpers';
import { SpeakingEvaluationResult, SpeakingMission, SpeakingSubmission } from './speaking.types';

const scoreFromRatio = (ratio: number): number => Math.round(Math.min(1, Math.max(0, ratio)) * 100);

const getPaceRatio = (wordsPerMinute: number, targetWpm: number): number => {
  if (targetWpm <= 0) return 1;

  const lowerTolerance = targetWpm * LOWER_TOLERANCE_MULTIPLIER;
  const upperTolerance = targetWpm * UPPER_TOLERANCE_MULTIPLIER;
  const unrealisticUpper = targetWpm * UNREALISTIC_SPEED_MULTIPLIER;

  if (wordsPerMinute >= lowerTolerance && wordsPerMinute <= upperTolerance) return 1;
  if (wordsPerMinute < lowerTolerance) return wordsPerMinute / lowerTolerance;
  if (wordsPerMinute >= unrealisticUpper) return UNREALISTIC_SPEED_PENALTY;

  const overspeedRange = unrealisticUpper - upperTolerance;
  const overspeedAmount = wordsPerMinute - upperTolerance;
  return 1 - (overspeedAmount / overspeedRange) * OVERSPEED_RANGE_FACTOR;
};

export const SpeakingEvaluator = {
  evaluate(mission: SpeakingMission, submission: SpeakingSubmission): SpeakingEvaluationResult {
    const transcriptUsed = (submission.transcript || submission.typedTranscript).trim();
    const normalizedTranscript = normalizeSpeechText(transcriptUsed);
    const normalizedPrompt = normalizeSpeechText(mission.promptText);
    const wordCount = countWords(transcriptUsed);
    const sentenceCount = countSentences(transcriptUsed);
    const fillerWordCount = countFillerWords(transcriptUsed);
    const promptWordCount = countWords(mission.promptText);
    const wordsPerMinuteResult = calculateWordsPerMinute(wordCount, submission.recordingSeconds);
    const wordsPerMinute = wordsPerMinuteResult.value;

    const paceRatio = getPaceRatio(wordsPerMinute, mission.targetWpm);
    const lengthRatio = promptWordCount > 0 ? Math.min(wordCount / promptWordCount, 1) : 1;
    const sentenceRatio = Math.min(sentenceCount / SENTENCE_COUNT_DIVISOR, 1);
    const fillerPenalty = Math.min(fillerWordCount * FILLER_PENALTY_MULTIPLIER, FILLER_PENALTY_CAP);
    const fluencyScore = Math.max(
      0,
      scoreFromRatio(
        paceRatio * PACE_WEIGHT +
          lengthRatio * LENGTH_WEIGHT +
          sentenceRatio * SENTENCE_RATIO_WEIGHT
      ) - fillerPenalty
    );

    const promptTokens = normalizedPrompt
      .split(' ')
      .filter((token) => token.length > MIN_PROMPT_TOKEN_LENGTH);
    const matchedPromptTokens = promptTokens.filter((token) =>
      normalizedTranscript.includes(token)
    );
    const promptCoverageRatio =
      promptTokens.length > 0 ? matchedPromptTokens.length / promptTokens.length : 1;
    const clarityKeywordRatio = keywordMatchRatio(transcriptUsed, mission.confidenceMarkers);
    const clarityScore = scoreFromRatio(
      promptCoverageRatio * PROMPT_COVERAGE_WEIGHT + clarityKeywordRatio * CLARITY_KEYWORD_WEIGHT
    );

    const grammarScore = scoreFromRatio(keywordMatchRatio(transcriptUsed, mission.grammarTargets));
    const targetTermRatio = keywordMatchRatio(
      transcriptUsed,
      mission.syllabicTargets.map((target) => target.word)
    );
    const technicalVocabularyScore = scoreFromRatio(
      keywordMatchRatio(transcriptUsed, mission.expectedKeywords) * TECHNICAL_KEYWORD_WEIGHT +
        targetTermRatio * TECHNICAL_TARGET_TERM_WEIGHT
    );
    const confidenceScore = scoreFromRatio(
      keywordMatchRatio(transcriptUsed, mission.confidenceMarkers) * CONFIDENCE_KEYWORD_WEIGHT +
        Math.min(sentenceCount / CONFIDENCE_SENTENCE_COUNT_DIVISOR, 1) *
          CONFIDENCE_SENTENCE_WEIGHT +
        (fillerWordCount === 0 ? CONFIDENCE_NO_FILLER_BONUS : CONFIDENCE_FILLER_PENALTY)
    );

    const finalScore = Math.round(
      fluencyScore * FINAL_FLUENCY_WEIGHT +
        clarityScore * FINAL_CLARITY_WEIGHT +
        grammarScore * FINAL_GRAMMAR_WEIGHT +
        technicalVocabularyScore * FINAL_TECHNICAL_WEIGHT +
        confidenceScore * FINAL_CONFIDENCE_WEIGHT
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

    if (fluencyScore >= FLUENCY_STRENGTH_THRESHOLD)
      strengths.push('Stable pacing against target speaking rate');
    else weaknesses.push('Speaking pace or transcript length needs more control');

    if (clarityScore >= CLARITY_STRENGTH_THRESHOLD)
      strengths.push('Clear alignment with the prompt structure');
    else weaknesses.push('Prompt details were omitted or heavily paraphrased');

    if (technicalVocabularyScore >= TECHNICAL_VOCABULARY_STRENGTH_THRESHOLD)
      strengths.push('Strong use of engineering terminology');
    else weaknesses.push('Important technical vocabulary was missing');

    if (grammarScore >= GRAMMAR_STRENGTH_THRESHOLD)
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
