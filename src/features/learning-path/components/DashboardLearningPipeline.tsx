import React from 'react';

import type { EngineeringDiscipline } from '@/shared/constants/engineering-disciplines';

import { ConceptCPipelineView } from './ConceptCPipelineView';

export interface DashboardLearningPipelineProps {
  disciplineOverride?: EngineeringDiscipline;
  className?: string;
}

export const DashboardLearningPipeline: React.FC<DashboardLearningPipelineProps> = ({
  disciplineOverride,
  className = '',
}) => {
  return (
    <ConceptCPipelineView
      disciplineOverride={disciplineOverride}
      showHeroStats={false}
      className={className}
    />
  );
};
