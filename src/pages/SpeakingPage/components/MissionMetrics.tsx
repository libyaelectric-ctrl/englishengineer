import { Brain, Layers, MessageSquareText } from 'lucide-react';
import { MetricCard } from '@/shared/components/MetricCard';
import { getSpeakingRoleplayCategory, type SpeakingMission } from '@/features/speaking';

interface MissionMetricsProps {
  activeMission: SpeakingMission;
  completedMissions: Record<string, number | undefined>;
}

export const MissionMetrics = ({
  activeMission,
  completedMissions,
}: MissionMetricsProps) => (
  <div className="grid gap-5 md:grid-cols-3">
    <MetricCard
      label="Best Speaking Score"
      value={
        completedMissions[activeMission.id]
          ? `${completedMissions[activeMission.id]}%`
          : 'Not scored'
      }
      icon={MessageSquareText}
      trend="Written response evidence"
      statusColor="primary"
    />
    <MetricCard
      label="Vocabulary Targets"
      value={`${activeMission.expectedKeywords.length} Terms`}
      icon={Brain}
      trend={activeMission.discipline}
      statusColor="primary"
    />
    <MetricCard
      label="Task Level"
      value={activeMission.cefrLevel}
      icon={Layers}
      trend={getSpeakingRoleplayCategory(activeMission)}
      statusColor="success"
    />
  </div>
);
