import { Sparkles, Target, ShieldAlert } from 'lucide-react';
import { MetricCard } from '@/shared/components/MetricCard';

interface MetricsGridProps {
  usage: {
    totalSessions: number;
    mostUsedMode: string;
    suggestedFocusArea: string;
  };
  coachContext: { averageScore: number };
  connectionValue: string;
  connectionTrend: string;
}

export const MetricsGrid = ({
  usage,
  coachContext,
  connectionValue,
  connectionTrend,
}: MetricsGridProps) => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
    <MetricCard
      label="Coach Sessions"
      value={`${usage.totalSessions}`}
      icon={Sparkles}
      trend={usage.mostUsedMode}
      statusColor="primary"
    />
    <MetricCard
      label="Suggested Focus"
      value={usage.suggestedFocusArea}
      icon={Target}
      trend={`${coachContext.averageScore}% average score`}
      statusColor="warning"
    />
    <MetricCard
      label="AI Connection"
      value={connectionValue}
      icon={ShieldAlert}
      trend={connectionTrend}
      trendDirection="neutral"
      statusColor="cyan"
    />
  </div>
);
