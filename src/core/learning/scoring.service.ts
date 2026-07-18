import {
  ScoreResult,
  MissionModule,
  MissionDifficulty,
} from './learning.types';

const getModuleFeedback = (
  module: MissionModule,
  score: number
): { strengths: string[]; weaknesses: string[]; feedback: string } => {
  const ranges: Record<number, { s: string[]; w: string[]; f: string }> = {};

  if (module === 'Reading') {
    ranges[90] = {
      s: [
        'Excellent technical reading accuracy',
        'Strong understanding of engineering context',
      ],
      w: [],
      f: 'Strong technical reading. You identified key terms, requirements, and document intent accurately.',
    };
    ranges[70] = {
      s: ['Solid document comprehension'],
      w: ['Some technical terms need review'],
      f: 'Good comprehension. Review the highlighted glossary terms before moving to the next report.',
    };
    ranges[0] = {
      s: [],
      w: [
        'Missed several key document details',
        'Technical vocabulary needs reinforcement',
      ],
      f: 'Low comprehension match. Re-read the passage and clarify the annotated definitions.',
    };
  } else if (module === 'Writing') {
    ranges[90] = {
      s: [
        'Professional engineering tone',
        'Strong grammar and revision accuracy',
      ],
      w: [],
      f: 'Pristine technical writing. Your phrasing maintains professional tone and precise specification standards.',
    };
    ranges[70] = {
      s: ['Good stylistic phrasing'],
      w: ['Occasional informal wording', 'Vague qualifiers'],
      f: 'Well drafted, but some wording remains too casual for formal engineering communication. Apply the suggested revisions for clarity.',
    };
    ranges[0] = {
      s: [],
      w: [
        'High volume of syntax style flags',
        'Inconsistent active verb tenses',
      ],
      f: 'The draft needs revision for grammar, tone, and technical clarity before it is suitable for project communication.',
    };
  } else if (module === 'Listening') {
    ranges[90] = {
      s: [
        'Strong transcript comprehension',
        'Accurate technical detail retention',
      ],
      w: [],
      f: 'Excellent comprehension. You captured the key engineering details from the briefing transcript.',
    };
    ranges[70] = {
      s: ['Good briefing retention'],
      w: ['Some details were missed'],
      f: 'Completed successfully. Replay the simulated briefing and compare your summary with the transcript.',
    };
    ranges[0] = {
      s: [],
      w: [
        'Important briefing details were missed',
        'Keyword recognition needs practice',
      ],
      f: 'Comprehension was limited. Review the transcript and repeat the simulation before submitting again.',
    };
  } else {
    ranges[90] = {
      s: ['Clear transcript structure', 'Strong engineering vocabulary'],
      w: [],
      f: 'Strong speaking attempt. The transcript shows clear structure, relevant vocabulary, and confident delivery signals.',
    };
    ranges[70] = {
      s: ['Functional fluency'],
      w: ['Some technical terms need clearer phrasing'],
      f: 'Good flow. This mode evaluates transcript content and pacing signals, not full pronunciation accuracy.',
    };
    ranges[0] = {
      s: [],
      w: ['Short or incomplete transcript', 'Frequent hesitation markers'],
      f: 'The transcript suggests limited delivery. Review the prompt and provide a fuller spoken or typed response.',
    };
  }

  const tier = score >= 90 ? 90 : score >= 70 ? 70 : 0;
  return {
    strengths: ranges[tier].s,
    weaknesses: ranges[tier].w,
    feedback: ranges[tier].f,
  };
};

export const ScoringService = {
  calculateScore(params: {
    module: MissionModule;
    difficulty: MissionDifficulty;
    performanceRatio: number;
    mistakesCount?: number;
    timeSpentMinutes?: number;
  }): ScoreResult {
    const score = Math.min(
      100,
      Math.max(0, Math.round(params.performanceRatio * 100))
    );

    const difficultyMultiplier =
      params.difficulty === 'Intermediate'
        ? 1.5
        : params.difficulty === 'Advanced'
          ? 2.0
          : 1.0;

    const xpEarned = Math.round(60 * difficultyMultiplier * (score / 100));
    const coinsEarned = Math.round(15 * difficultyMultiplier * (score / 100));
    const eloChange = Math.round(
      4 * difficultyMultiplier * ((score - 50) / 50)
    );

    const { strengths, weaknesses, feedback } = getModuleFeedback(
      params.module,
      score
    );

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
