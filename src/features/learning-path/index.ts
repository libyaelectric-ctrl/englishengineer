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

export { DISCIPLINE_TOPIC_KEYWORDS, getDisciplineTopics } from './discipline-topics';

export { PathStageColumn } from './components/PathStageColumn';
export { MasteryOverview } from './components/MasteryOverview';
export { DashboardLearningPipeline } from './components/DashboardLearningPipeline';
export { ConceptCPipelineView } from './components/ConceptCPipelineView';
export { MountainRailwayPath } from './components/MountainRailwayPath';

export type { LearningPath, PathLevel, PathLevelStatus, PathStage } from './learning-path.types';
