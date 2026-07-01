import {
  ScoreResult,
  MissionModule,
  MissionDifficulty,
} from './learning.types';

export const ScoringService = {
  /**
   * Reusable core scoring calculation for all learning modules.
   */
  calculateScore(params: {
    module: MissionModule;
    difficulty: MissionDifficulty;
    performanceRatio: number; // 0.0 to 1.0 representation
    mistakesCount?: number;
    timeSpentMinutes?: number;
  }): ScoreResult {
    // Ensure score is strictly bounded [0, 100]
    const score = Math.min(
      100,
      Math.max(0, Math.round(params.performanceRatio * 100))
    );

    // Scale awards depending on the mission level
    let difficultyMultiplier = 1.0;
    if (params.difficulty === 'Intermediate') {
      difficultyMultiplier = 1.5;
    } else if (params.difficulty === 'Advanced') {
      difficultyMultiplier = 2.0;
    }

    const baseXP = 60;
    const baseCoins = 15;
    const baseElo = 12;

    const xpEarned = Math.round(baseXP * difficultyMultiplier * (score / 100));
    const coinsEarned = Math.round(
      baseCoins * difficultyMultiplier * (score / 100)
    );
    const eloChange = Math.round(
      baseElo * difficultyMultiplier * ((score - 50) / 50)
    ); // Positive if score > 50, else negative

    const strengths: string[] = [];
    const weaknesses: string[] = [];
    let feedback = '';

    if (params.module === 'Reading') {
      if (score >= 90) {
        strengths.push(
          'Excellent technical reading accuracy',
          'Strong understanding of engineering context'
        );
        feedback =
          'Strong technical reading. You identified key terms, requirements, and document intent accurately.';
      } else if (score >= 70) {
        strengths.push('Solid document comprehension');
        weaknesses.push('Some technical terms need review');
        feedback =
          'Good comprehension. Review the highlighted glossary terms before moving to the next report.';
      } else {
        weaknesses.push(
          'Missed several key document details',
          'Technical vocabulary needs reinforcement'
        );
        feedback =
          'Low comprehension match. Re-read the passage and clarify the annotated definitions.';
      }
    } else if (params.module === 'Writing') {
      if (score >= 90) {
        strengths.push(
          'Professional engineering tone',
          'Strong grammar and revision accuracy'
        );
        feedback =
          'Pristine technical writing. Your phrasing maintains professional tone and precise specification standards.';
      } else if (score >= 70) {
        strengths.push('Good stylistic phrasing');
        weaknesses.push('Occasional informal wording', 'Vague qualifiers');
        feedback =
          'Well drafted, but some wording remains too casual for formal engineering communication. Apply the suggested revisions for clarity.';
      } else {
        weaknesses.push(
          'High volume of syntax style flags',
          'Inconsistent active verb tenses'
        );
        feedback =
          'The draft needs revision for grammar, tone, and technical clarity before it is suitable for project communication.';
      }
    } else if (params.module === 'Listening') {
      if (score >= 90) {
        strengths.push(
          'Strong transcript comprehension',
          'Accurate technical detail retention'
        );
        feedback =
          'Excellent comprehension. You captured the key engineering details from the briefing transcript.';
      } else if (score >= 70) {
        strengths.push('Good briefing retention');
        weaknesses.push('Some details were missed');
        feedback =
          'Completed successfully. Replay the simulated briefing and compare your summary with the transcript.';
      } else {
        weaknesses.push(
          'Important briefing details were missed',
          'Keyword recognition needs practice'
        );
        feedback =
          'Comprehension was limited. Review the transcript and repeat the simulation before submitting again.';
      }
    } else {
      // Speaking / Vocabulary / Grammar
      if (score >= 90) {
        strengths.push(
          'Clear transcript structure',
          'Strong engineering vocabulary'
        );
        feedback =
          'Strong speaking attempt. The transcript shows clear structure, relevant vocabulary, and confident delivery signals.';
      } else if (score >= 70) {
        strengths.push('Functional fluency');
        weaknesses.push('Some technical terms need clearer phrasing');
        feedback =
          'Good flow. This mode evaluates transcript content and pacing signals, not full pronunciation accuracy.';
      } else {
        weaknesses.push(
          'Short or incomplete transcript',
          'Frequent hesitation markers'
        );
        feedback =
          'The transcript suggests limited delivery. Review the prompt and provide a fuller spoken or typed response.';
      }
    }

    return {
      score,
      xp: xpEarned,
      coins: coinsEarned,
      eloChange: eloChange === 0 && score > 0 ? 4 : eloChange,
      strengths,
      weaknesses: weaknesses.length > 0 ? weaknesses : ['None detected'],
      feedback,
    };
  },
};
