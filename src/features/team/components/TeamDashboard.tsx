import { useEffect, type FC } from 'react';
import { ShieldAlert } from 'lucide-react';
import { EntitlementGate } from '@/features/billing';
import { useTeamStore } from '../team.store';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { TeamStats } from './TeamStats';
import { TeamMemberList } from './TeamMemberList';
import { BulkLicenseAssign } from './BulkLicenseAssign';

export const TeamDashboard: FC = () => {
  const team = useTeamStore();

  useEffect(() => {
    void team.loadWorkspace();
  }, [team.loadWorkspace]);

  return (
    <main className="space-y-6 pt-12 sm:pt-0">
      <header className="flex flex-col gap-4 border-b border-border-soft pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-medium text-foreground">
              Team Management
            </h1>
            <StatusBadge
              label={team.source === 'demo' ? 'Demo data' : 'Backend data'}
              tone={team.source === 'demo' ? 'warning' : 'success'}
            />
            <StatusBadge label="Admin panel" tone="info" />
          </div>
          <p className="mt-2 text-sm text-muted-copy">
            Assign training licenses, track team progress, and view individual performance.
          </p>
        </div>
      </header>

      <EntitlementGate
        feature="projectWorkspace"
        title="Team management requires the Project plan"
        description="Bulk license assignment, team analytics, and member performance require a Project plan."
      >
        <div className="space-y-6">
          {team.source === 'demo' && (
            <div className="flex gap-3 rounded-xl border border-warning bg-warning p-4 text-sm text-warning">
              <ShieldAlert className="h-5 w-5 shrink-0" />
              <p>
                <strong>Demo team data.</strong> These names, metrics and
                invitations are fictional and are not live organization analytics.
              </p>
            </div>
          )}

          {team.isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-border-soft border-t-primary" />
            </div>
          ) : (
            <>
              <TeamStats members={team.members} summaries={team.summaries} />

              <div className="grid gap-6 lg:grid-cols-5">
                <div className="lg:col-span-3">
                  <TeamMemberList
                    members={team.members}
                    summaries={team.summaries}
                  />
                </div>
                <div className="lg:col-span-2">
                  <BulkLicenseAssign />
                </div>
              </div>
            </>
          )}
        </div>
      </EntitlementGate>
    </main>
  );
};
