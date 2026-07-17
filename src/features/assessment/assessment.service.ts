import {
  LearningState,
  MissionModule,
  ScoreResult,
} from '@/core/learning/learning.types';
import { VocabularyService } from '@/features/vocabulary/services/vocabulary.service';
import {
  averageScores,
  buildDimensionScore,
  getAssessmentConfidence,
  getDataStatus,
  getModuleAverage,
  getStrongestDimensions,
  getWeakestDimensions,
  mapScoreToCefr,
  mapScoreToEngineerElo,
} from './assessment.helpers';
import {
  AssessmentDimensionScore,
  AssessmentProfile,
  AssessmentResult,
  AssessmentSourceScore,
  AssessmentWrappedScore,
} from './assessment.types';

const COMMUNICATION_MODULES: MissionModule[] = [
  'Writing',
  'Speaking',
  'Listening',
  'Reading',
];

const CERTIFICATE_DISCLAIMER =
  'This is an internal Engineering Communication estimate, not an official CEFR certificate.';

const getSourceScores = (state: LearningState): AssessmentSourceScore[] => [
  ...state.studySessions.map((session) => ({
    module: session.module,
    score: session.score,
    durationMinutes: session.durationMinutes,
  })),
  ...state.missions
    .filter(
      (mission) =>
        mission.status === 'completed' && typeof mission.score === 'number'
    )
    .map((mission) => ({
      module: mission.module,
      score: mission.score || 0,
      durationMinutes: mission.estimatedMinutes,
    })),
];

const bounded = (value: number | null): number | null => {
  if (value === null) return null;
  return Math.max(0, Math.min(100, Math.round(value)));
};

const deriveDimensionScores = (
  state: LearningState,
  sourceScores: AssessmentSourceScore[]
): AssessmentDimensionScore[] => {
  const vocabulary = VocabularyService.getSummary();
  const writing = getModuleAverage(sourceScores, ['Writing']);
  const reading = getModuleAverage(sourceScores, ['Reading']);
  const listening = getModuleAverage(sourceScores, ['Listening']);
  const speaking = getModuleAverage(sourceScores, ['Speaking']);
  const vocabularyScore = getModuleAverage(sourceScores, ['Vocabulary']);
  const communicationAverage = averageScores(
    sourceScores
      .filter((item) => COMMUNICATION_MODULES.includes(item.module))
      .map((item) => item.score)
  );
  const overall = averageScores(sourceScores.map((item) => item.score));
  const retention =
    vocabulary.retentionPercentage > 0
      ? vocabulary.retentionPercentage
      : vocabularyScore;
  const eloSignal = Math.max(
    0,
    Math.min(100, Math.round((state.elo - 800) / 16))
  );

  return [
    buildDimensionScore(
      'grammar_accuracy',
      bounded(
        averageScores(
          [writing, speaking].filter((score): score is number => score !== null)
        )
      ),
      'Derived from Writing and Speaking activity.'
    ),
    buildDimensionScore(
      'vocabulary_range',
      bounded(retention),
      'Derived from Vocabulary review retention and vocabulary mission scores.'
    ),
    buildDimensionScore(
      'technical_vocabulary',
      bounded(
        averageScores(
          [vocabularyScore, reading].filter(
            (score): score is number => score !== null
          )
        )
      ),
      'Derived from Vocabulary and Reading technical comprehension.'
    ),
    buildDimensionScore(
      'professional_tone',
      bounded(writing),
      'Derived from Writing activity.'
    ),
    buildDimensionScore(
      'clarity',
      bounded(communicationAverage),
      'Derived from Reading, Writing, Listening, and Speaking scores.'
    ),
    buildDimensionScore(
      'conciseness',
      bounded(writing === null ? null : Math.min(100, writing + 3)),
      'Estimated from Writing performance only.'
    ),
    buildDimensionScore(
      'meeting_readiness',
      bounded(
        averageScores(
          [listening, speaking].filter(
            (score): score is number => score !== null
          )
        )
      ),
      'Derived from Listening and Speaking activity.'
    ),
    buildDimensionScore(
      'site_communication',
      bounded(
        averageScores(
          [speaking, listening, writing].filter(
            (score): score is number => score !== null
          )
        )
      ),
      'Derived from site-facing communication modules.'
    ),
    buildDimensionScore(
      'qa_qc_communication',
      bounded(
        averageScores(
          [writing, reading].filter((score): score is number => score !== null)
        )
      ),
      'Derived from Reading and Writing activity.'
    ),
    buildDimensionScore(
      'commissioning_communication',
      bounded(
        averageScores(
          [listening, reading].filter(
            (score): score is number => score !== null
          )
        )
      ),
      'Derived from Listening and Reading activity.'
    ),
    buildDimensionScore(
      'consultant_communication',
      bounded(
        averageScores(
          [writing, reading].filter((score): score is number => score !== null)
        )
      ),
      'Derived from consultant-style Reading and Writing activity.'
    ),
    buildDimensionScore(
      'report_writing',
      bounded(writing),
      'Derived from Writing activity.'
    ),
    buildDimensionScore(
      'email_writing',
      bounded(writing === null ? null : Math.max(0, writing - 2)),
      'Estimated from Writing activity.'
    ),
    buildDimensionScore(
      'listening_comprehension',
      bounded(listening),
      'Derived from Listening activity.'
    ),
    buildDimensionScore(
      'speaking_confidence',
      bounded(speaking),
      'Derived from transcript-based Speaking activity.'
    ),
    buildDimensionScore(
      'engineering_cefr',
      bounded(overall),
      'Mapped from overall local assessment score.'
    ),
    buildDimensionScore(
      'engineer_elo',
      bounded(eloSignal),
      'Normalized from existing Learning Engine ELO.'
    ),
  ];
};

const buildFeedback = (
  module: MissionModule | 'AI Copilot',
  score: number | null,
  weakest: AssessmentDimensionScore[]
): Pick<
  AssessmentResult,
  | 'professionalFeedback'
  | 'simplifiedFeedback'
  | 'technicalVocabularyFeedback'
  | 'nextRecommendedPractice'
> => {
  if (score === null) {
    return {
      professionalFeedback:
        'Not enough assessment data yet. Complete at least two learning activities to produce a reliable engineering communication profile.',
      simplifiedFeedback:
        'Complete more missions first. Then EngVox can assess your professional communication more accurately.',
      technicalVocabularyFeedback:
        'Technical vocabulary feedback is unavailable until more vocabulary, reading, listening, or writing evidence exists.',
      nextRecommendedPractice:
        'Complete one Writing mission and one Listening or Speaking mission.',
    };
  }

  const priority = weakest[0]?.label || 'Clarity';
  return {
    professionalFeedback: `${module} performance indicates a current engineering communication score of ${score}%. Priority improvement area: ${priority}.`,
    simplifiedFeedback: `Your current score is ${score}%. Focus next on ${priority}.`,
    technicalVocabularyFeedback:
      'Use precise engineering terms, define the issue, explain the impact, and include evidence or action owners.',
    nextRecommendedPractice: `Complete a focused practice session for ${priority}.`,
  };
};

export const AssessmentService = {
  getProfile(state: LearningState): AssessmentProfile {
    const sourceScores = getSourceScores(state);
    const dataStatus = getDataStatus(sourceScores);
    const dimensionScores = deriveDimensionScores(state, sourceScores);
    const confidence = getAssessmentConfidence(sourceScores);
    const scorable = dimensionScores.filter(
      (item) => item.score !== null && item.dimensionId !== 'engineer_elo'
    );
    const overallScore =
      dataStatus === 'insufficient'
        ? null
        : averageScores(scorable.map((item) => item.score || 0));
    const strongestDimensions = getStrongestDimensions(dimensionScores);
    const weakestDimensions = getWeakestDimensions(dimensionScores);

    return {
      hasEnoughData: dataStatus !== 'insufficient',
      dataStatus,
      overallScore,
      engineerCefr: mapScoreToCefr(overallScore),
      engineerElo: state.elo,
      dimensionScores,
      strongestDimensions,
      weakestDimensions,
      recentHistory: sourceScores
        .slice(-5)
        .reverse()
        .map((item) => this.assessActivity(item.module, item.score, state)),
      recommendedNextMissions:
        weakestDimensions.length > 0
          ? weakestDimensions
              .map((item) => `Practice ${item.label}`)
              .slice(0, 3)
          : ['Complete one Writing mission', 'Complete one Listening mission'],
      readiness: {
        meetings: averageScores(
          [
            dimensionScores.find(
              (item) => item.dimensionId === 'meeting_readiness'
            )?.score,
            dimensionScores.find(
              (item) => item.dimensionId === 'speaking_confidence'
            )?.score,
          ].filter(
            (score): score is number => score !== null && score !== undefined
          )
        ),
        reports:
          dimensionScores.find((item) => item.dimensionId === 'report_writing')
            ?.score ?? null,
        consultantCommunication:
          dimensionScores.find(
            (item) => item.dimensionId === 'consultant_communication'
          )?.score ?? null,
      },
      trustLabel:
        dataStatus === 'sufficient'
          ? 'Based on local assessment history'
          : dataStatus === 'limited'
            ? 'Limited local assessment data'
            : 'Not enough assessment data yet',
      confidenceScore: confidence.score,
      confidenceExplanation: confidence.explanation,
      certificateDisclaimer: CERTIFICATE_DISCLAIMER,
    };
  },

  assessActivity(
    module: MissionModule | 'AI Copilot',
    score: number,
    state: LearningState
  ): AssessmentResult {
    const sourceScores =
      module === 'AI Copilot' ? [] : [{ module, score, durationMinutes: 1 }];
    const baseScores = deriveDimensionScores(state, sourceScores);
    const confidence = getAssessmentConfidence(sourceScores);
    const dimensionScores = baseScores.map((item) => ({
      ...item,
      score: item.score === null ? bounded(score) : item.score,
      evidence:
        module === 'AI Copilot'
          ? 'AI Copilot session metadata only; not AI-grade assessment.'
          : item.evidence,
    }));
    const weakest = getWeakestDimensions(dimensionScores);
    const strongest = getStrongestDimensions(dimensionScores);
    const feedback = buildFeedback(module, score, weakest);

    return {
      activityModule: module,
      overallScore: score,
      cefrEstimate: mapScoreToCefr(score),
      engineerEloEstimate: mapScoreToEngineerElo(score, state.elo),
      dimensionScores,
      strengths: strongest.map((item) => item.label),
      weaknesses: weakest.map((item) => item.label),
      priorityImprovementAreas: weakest.slice(0, 3).map((item) => item.label),
      ...feedback,
      dataStatus: 'limited',
      trustLabel:
        module === 'AI Copilot'
          ? 'Local AI Copilot metadata only'
          : 'Wrapped existing module score',
      confidenceScore: confidence.score,
      confidenceExplanation: confidence.explanation,
      certificateDisclaimer: CERTIFICATE_DISCLAIMER,
    };
  },

  wrapScoreResult(
    module: MissionModule,
    baseScore: ScoreResult,
    state: LearningState
  ): AssessmentWrappedScore {
    return {
      baseScore,
      assessment: this.assessActivity(module, baseScore.score, state),
    };
  },
};
