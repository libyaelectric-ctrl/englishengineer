import { Activity } from 'lucide-react';
import { SectionCard } from '@/shared/components/SectionCard';
import type { AnalyticsRecentSession } from '@/features/analytics';

export const RecentSessions = ({
  sessions,
}: {
  sessions: AnalyticsRecentSession[];
}) => {
  return (
    <SectionCard
      title="Recent Sessions"
      subtitle="Latest learning activity across all engines"
      icon={Activity}
    >
      <div className="space-y-3">
        {sessions.map((session) => (
          <div
            key={`${session.timestamp}-${session.module}`}
            className="flex items-center justify-between rounded-xl border border-border-soft bg-surface-hover p-4"
          >
            <div>
              <p className="text-sm font-medium text-foreground">
                {session.module}
              </p>
              <p className="text-[10px] font-mono text-muted-copy">
                {new Date(session.timestamp).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-primary">
                {session.score}%
              </p>
              <p className="text-[10px] font-mono text-muted-copy">
                {session.durationMinutes} min
              </p>
            </div>
          </div>
        ))}
        {sessions.length === 0 && (
          <p className="text-xs text-muted-copy">No recent sessions yet.</p>
        )}
      </div>
    </SectionCard>
  );
};
