import { Target, Calendar, TrendingUp, Sparkles } from 'lucide-react';
import { MetricCard } from '@/shared/components/MetricCard';

export const AnalyticsMetricCards = ({
  analytics,
}: {
  analytics: ReturnType<typeof import('@/features/analytics').AnalyticsService.getSummary>;
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      <MetricCard
        label="Overall Progress"
        value={`${analytics.overallProgress}%`}
        icon={Target}
        trend={`${analytics.recentSessions.length} recent sessions`}
        statusColor="primary"
      />
      <MetricCard
        label="Study Consistency"
        value={`${analytics.studyConsistency}%`}
        icon={Calendar}
        trend={`${analytics.averageSessionLength}m avg session`}
        statusColor="cyan"
      />
      <MetricCard
        label="Improvement Velocity"
        value={`${analytics.improvementVelocity >= 0 ? '+' : ''}${analytics.improvementVelocity}%`}
        icon={TrendingUp}
        trend={`${analytics.retention}% retention signal`}
        statusColor={analytics.improvementVelocity >= 0 ? 'emerald' : 'amber'}
      />
      <MetricCard
        label="AI Coach Usage"
        value={`${analytics.aiCoachUsage.totalSessions}`}
        icon={Sparkles}
        trend={analytics.aiCoachUsage.mostUsedMode}
        statusColor="amber"
      />
    </div>
  );
};
