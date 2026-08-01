import { ShieldAlert } from 'lucide-react';

import { type FC, useEffect } from 'react';

import { StatusBadge } from '@/shared/components/StatusBadge';

import { EntitlementGate } from '@/features/billing';

import { useTeamStore } from '../team.store';
import { BulkLicenseAssign } from './BulkLicenseAssign';
import { TeamMemberList } from './TeamMemberList';
import { TeamStats } from './TeamStats';

export const TeamDashboard: FC = () => {
  const source = useTeamStore((s) => s.source);
  const isLoading = useTeamStore((s) => s.isLoading);
  const members = useTeamStore((s) => s.members);
  const summaries = useTeamStore((s) => s.summaries);
  const loadWorkspace = useTeamStore((s) => s.loadWorkspace);

  useEffect(() => {
    void loadWorkspace();
  }, [loadWorkspace]);

  return (
    <main className="space-y-6 pt-12 sm:pt-0">
      <header className="flex flex-col gap-4 border-b border-border-soft pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-medium text-foreground">Team Management</h1>
            <StatusBadge
              label={source === 'demo' ? 'Demo data' : 'Backend data'}
              tone={source === 'demo' ? 'warning' : 'success'}
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
          {source === 'demo' && (
            <div className="flex gap-3 rounded-xl border border-warning bg-warning p-4 text-sm text-warning">
              <ShieldAlert className="h-5 w-5 shrink-0" />
              <p>
                <strong>Demo team data.</strong> These names, metrics and invitations are fictional
                and are not live organization analytics.
              </p>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-border-soft border-t-primary" />
            </div>
          ) : (
            <>
              <TeamStats members={members} summaries={summaries} />

              <div className="grid gap-6 lg:grid-cols-5">
                <div className="lg:col-span-3">
                  <TeamMemberList members={members} summaries={summaries} />
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
