export {
  TERMS_PER_LEVEL,
  buildLearningPath,
  getBuildVersion,
  getDisciplineDomains,
  getPathLevelTerms,
  resolveDefaultDiscipline,
} from './curriculum.service';
export type { BuildLearningPathOptions } from './curriculum.service';

export { DISCIPLINE_PALETTES, getDisciplinePalette, STATUS_COLORS } from './discipline-palette';
export type { DisciplinePalette } from './discipline-palette';

export { PathStageColumn } from './components/PathStageColumn';
export { MasteryOverview } from './components/MasteryOverview';

export type {
  LearningPath,
  PathLevel,
  PathLevelStatus,
  PathStage,
} from './learning-path.types';
