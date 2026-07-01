import {
  WritingMission,
  WritingSubmission,
  WritingEvaluationResult,
  DetailedCorrectionFeedback,
} from './writing.types';
import { ScoringService } from '@/core/learning/scoring.service';

export const WritingEvaluator = {
  /**
   * Evaluates a writing submission locally using rule-based matching.
   */
  evaluate(
    mission: WritingMission,
    submission: WritingSubmission
  ): WritingEvaluationResult {
    const { finalDraft, timeSpentMinutes, autoFixesUsed } = submission;
    const detailedCorrections: DetailedCorrectionFeedback[] = [];

    const cleanedDraft = finalDraft.toLowerCase();

    let correctGrammarCount = 0;
    let totalGrammarCount = 0;

    let correctVocabCount = 0;
    let totalVocabCount = 0;

    let correctStyleCount = 0;
    let totalStyleCount = 0;

    mission.corrections.forEach((c) => {
      const isGrammar = c.type === 'grammar';
      const isVocab = c.type === 'vocabulary';
      const isStyle = c.type === 'style';

      if (isGrammar) totalGrammarCount++;
      if (isVocab) totalVocabCount++;
      if (isStyle) totalStyleCount++;

      // An issue is fixed if the original error is no longer present in the draft
      const isFixed = !cleanedDraft.includes(c.original.toLowerCase());

      if (isFixed) {
        if (isGrammar) correctGrammarCount++;
        if (isVocab) correctVocabCount++;
        if (isStyle) correctStyleCount++;
      }

      detailedCorrections.push({
        correctionId: c.id,
        type: c.type,
        text: c.text,
        original: c.original,
        fix: c.fix,
        isFixed,
      });
    });

    // Sub-Scores out of 100
    const linguisticClarityScore =
      totalGrammarCount > 0
        ? Math.round((correctGrammarCount / totalGrammarCount) * 100)
        : 100;

    const jargonDensityScore =
      totalVocabCount > 0
        ? Math.round((correctVocabCount / totalVocabCount) * 100)
        : 100;

    const professionalToneScore =
      totalStyleCount > 0
        ? Math.round((correctStyleCount / totalStyleCount) * 100)
        : 100;

    // Weighted final score
    const finalScore = Math.round(
      linguisticClarityScore * 0.4 +
        jargonDensityScore * 0.3 +
        professionalToneScore * 0.3
    );

    // Standard rewards via core ScoringService
    const scoringResult = ScoringService.calculateScore({
      module: 'Writing',
      difficulty: mission.difficulty,
      performanceRatio: finalScore / 100,
      timeSpentMinutes,
    });

    // Customize strengths & weaknesses based on writing-specific sub-scores
    const strengths: string[] = [...scoringResult.strengths];
    const weaknesses: string[] = [...scoringResult.weaknesses];

    if (linguisticClarityScore >= 90) {
      strengths.push('Impeccable syntax and grammatical tense accuracy');
    } else {
      weaknesses.push('Unresolved grammatical errors in technical logs');
    }

    if (jargonDensityScore >= 100) {
      strengths.push('Excellent integration of precise engineering terms');
    } else {
      weaknesses.push(
        'Casual operational phrases limit professional jargon usage'
      );
    }

    if (professionalToneScore >= 90) {
      strengths.push('Strict compliance with formal technical report styling');
    } else {
      weaknesses.push('Imprecise tone or vague performance boosters found');
    }

    if (autoFixesUsed === 0 && finalScore === 100) {
      strengths.push(
        'Manual mastery: Resolved all linguistic flags without auto-fix'
      );
    } else if (autoFixesUsed > 0) {
      strengths.push(
        'Systemic review: Correctly leveraged compiler-assisted suggestions'
      );
    }

    // Filter "None detected" from weaknesses if we have real weaknesses
    const finalWeaknesses = weaknesses.filter((w) => w !== 'None detected');

    return {
      missionId: mission.id,
      linguisticClarityScore,
      jargonDensityScore,
      professionalToneScore,
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
      detailedCorrections,
      finalDraft,
    };
  },
};
