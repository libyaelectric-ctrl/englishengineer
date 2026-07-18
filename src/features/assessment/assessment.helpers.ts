import { MissionModule } from '@/core/learning/learning.types';
import {
  AssessmentDimension,
  AssessmentDimensionId,
  AssessmentDimensionScore,
  AssessmentSourceScore,
} from './assessment.types';

export const ASSESSMENT_DIMENSIONS: AssessmentDimension[] = [
  {
    id: 'grammar_accuracy',
    label: 'Grammar Accuracy',
    description:
      'Control of tense, articles, sentence structure, and error-free communication.',
  },
  {
    id: 'vocabulary_range',
    label: 'Vocabulary Range',
    description: 'Breadth of usable professional English vocabulary.',
  },
  {
    id: 'technical_vocabulary',
    label: 'Technical Vocabulary',
    description: 'Use and recognition of engineering terminology.',
  },
  {
    id: 'professional_tone',
    label: 'Professional Tone',
    description: 'Respectful, precise, non-defensive project communication.',
  },
  {
    id: 'clarity',
    label: 'Clarity',
    description: 'Ability to communicate issues, impact, and actions clearly.',
  },
  {
    id: 'conciseness',
    label: 'Conciseness',
    description: 'Ability to communicate without unnecessary wording.',
  },
  {
    id: 'meeting_readiness',
    label: 'Meeting Readiness',
    description:
      'Readiness for coordination, progress, and technical meetings.',
  },
  {
    id: 'site_communication',
    label: 'Site Communication',
    description: 'Ability to explain site issues, constraints, and actions.',
  },
  {
    id: 'qa_qc_communication',
    label: 'QA/QC Communication',
    description:
      'Ability to communicate NCR, inspection, ITP, and quality matters.',
  },
  {
    id: 'commissioning_communication',
    label: 'Commissioning Communication',
    description:
      'Ability to explain testing, commissioning, and handover issues.',
  },
  {
    id: 'consultant_communication',
    label: 'Consultant Communication',
    description:
      'Ability to respond to consultants with evidence and professionalism.',
  },
  {
    id: 'report_writing',
    label: 'Report Writing',
    description:
      'Ability to write site reports, updates, and technical summaries.',
  },
  {
    id: 'email_writing',
    label: 'Email Writing',
    description: 'Ability to write clear technical project emails.',
  },
  {
    id: 'listening_comprehension',
    label: 'Listening Comprehension',
    description:
      'Understanding engineering briefings and spoken project details.',
  },
  {
    id: 'speaking_confidence',
    label: 'Speaking Confidence',
    description: 'Confidence signals from transcript-based speaking activity.',
  },
  {
    id: 'engineering_cefr',
    label: 'Engineering CEFR',
    description: 'Estimated CEFR level for engineering communication.',
  },
  {
    id: 'engineer_elo',
    label: 'Engineer ELO',
    description: 'Existing EngVox learning ELO signal.',
  },
];

const CEFR_THRESHOLDS: [number, string][] = [
  [95, 'C2'],
  [90, 'C1+'],
  [84, 'C1'],
  [78, 'C1-'],
  [73, 'B2+'],
  [68, 'B2'],
  [63, 'B2-'],
  [58, 'B1+'],
  [52, 'B1'],
  [46, 'B1-'],
  [32, 'A2'],
];

export const mapScoreToCefr = (score: number | null): string | null => {
  if (score === null) return null;
  const match = CEFR_THRESHOLDS.find(([threshold]) => score >= threshold);
  return match ? match[1] : 'A1';
};

export const getAssessmentConfidence = (
  sourceScores: AssessmentSourceScore[]
): { score: number; explanation: string } => {
  if (sourceScores.length === 0) {
    return {
      score: 0,
      explanation:
        'No completed learning evidence is available yet, so the assessment estimate is not reliable.',
    };
  }

  const modules = new Set(sourceScores.map((item) => item.module));
  const evidenceScore = Math.min(60, sourceScores.length * 10);
  const coverageScore = Math.min(40, modules.size * 8);
  const confidence = Math.min(100, evidenceScore + coverageScore);

  if (confidence >= 80) {
    return {
      score: confidence,
      explanation:
        'Confidence is sufficient because multiple completed activities across several modules are available.',
    };
  }

  if (confidence >= 35) {
    return {
      score: confidence,
      explanation:
        'Confidence is limited because the profile is based on a small local activity sample.',
    };
  }

  return {
    score: confidence,
    explanation:
      'Confidence is low because the estimate is based on very limited local evidence.',
  };
};

export const mapScoreToEngineerElo = (
  score: number | null,
  currentElo: number
): number | null => {
  if (score === null) return null;
  const normalized = Math.max(0, Math.min(100, score));
  const estimate = Math.round(currentElo + (normalized - 70) * 6);
  return Math.max(800, Math.min(3000, estimate));
};

export const getDataStatus = (
  sourceScores: AssessmentSourceScore[]
): 'sufficient' | 'limited' | 'insufficient' => {
  if (sourceScores.length >= 5) return 'sufficient';
  if (sourceScores.length >= 2) return 'limited';
  return 'insufficient';
};

export const averageScores = (scores: number[]): number | null => {
  if (scores.length === 0) return null;
  return Math.round(
    scores.reduce((total, score) => total + score, 0) / scores.length
  );
};

export const getModuleAverage = (
  sourceScores: AssessmentSourceScore[],
  modules: MissionModule[]
): number | null =>
  averageScores(
    sourceScores
      .filter((item) => modules.includes(item.module))
      .map((item) => item.score)
  );

export const buildDimensionScore = (
  dimensionId: AssessmentDimensionId,
  score: number | null,
  evidence: string
): AssessmentDimensionScore => {
  const dimension = ASSESSMENT_DIMENSIONS.find(
    (item) => item.id === dimensionId
  );
  return {
    dimensionId,
    label: dimension?.label || dimensionId,
    score,
    evidence,
  };
};

export const getStrongestDimensions = (
  scores: AssessmentDimensionScore[]
): AssessmentDimensionScore[] =>
  scores
    .filter((item) => item.score !== null)
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, 4);

export const getWeakestDimensions = (
  scores: AssessmentDimensionScore[]
): AssessmentDimensionScore[] =>
  scores
    .filter((item) => item.score !== null)
    .sort((a, b) => (a.score || 0) - (b.score || 0))
    .slice(0, 4);
