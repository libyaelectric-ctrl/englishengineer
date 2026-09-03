export {
  type AssessmentDimensionId,
  type AssessmentDimension,
  type AssessmentDimensionScore,
  type AssessmentResult,
  type AssessmentReadiness,
  type AssessmentProfile,
  type AssessmentSourceScore,
  type AssessmentWrappedScore,
} from '@/shared/types/assessment.types';

export {
  ASSESSMENT_DIMENSIONS,
  mapScoreToCefr,
  getAssessmentConfidence,
  mapScoreToEngineerElo,
  getDataStatus,
  averageScores,
  getModuleAverage,
  buildDimensionScore,
  getStrongestDimensions,
  getWeakestDimensions,
} from './assessment.helpers';

export { AssessmentService } from './assessment.service';
