import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Download,
  LockKeyhole,
  MailPlus,
  RefreshCw,
  ShieldAlert,
  Users,
} from 'lucide-react';
import { EntitlementGate } from '@/features/billing';
import { getTeamOverview, useTeamStore } from '@/features/team';
import type { OrganizationRole } from '@/features/team';
import { StatusBadge } from '@/shared/components/StatusBadge';

const TeamPage = () => {
  const team = useTeamStore();
  const [email, setEmail] = useState('');
  const [role, setRole] =
    useState<Exclude<OrganizationRole, 'admin'>>('learner');
  useEffect(() => {
    void team.loadWorkspace();
  }, [team.loadWorkspace]);
  const overview = useMemo(
    () => getTeamOverview(team.members, team.summaries),
    [team.members, team.summaries]
  );

  return (
    <main className="space-y-6">
      <header className="flex flex-col gap-4 border-b border-soft pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-medium text-foreground">
              Team workspace
            </h1>
            <StatusBadge
              label={team.source === 'demo' ? 'Demo data' : 'Backend data'}
              tone={team.source === 'demo' ? 'warning' : 'success'}
            />
            <StatusBadge label="Manager view" tone="info" />
          </div>
          <p className="mt-2 text-sm text-muted-copy">
            Manager-level communication readiness summaries without exposing raw
            learner responses.
          </p>
        </div>
        <button
          type="button"
          disabled
          title="Export requires a verified Team backend"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-soft bg-surface-hover px-4 text-sm font-medium text-muted-copy disabled:cursor-not-allowed disabled:opacity-70"
        >
          <Download className="h-4 w-4" />
          Export requires backend
        </button>
      </header>
      <EntitlementGate
        feature="projectWorkspace"
        title="Team workspace requires the Project plan"
        description="Manager summaries, invitations and exports require backend-verified Project entitlement."
      >
        <div className="space-y-6">
          {team.source === 'demo' && (
            <div className="flex gap-3 rounded-xl border border-warning bg-warning p-4 text-sm text-warning">
              <ShieldAlert className="h-5 w-5 shrink-0" />
              <p>
                <strong>Demo team data.</strong> These names and metrics are
                fictional and are not live organization analytics.
              </p>
            </div>
          )}
          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['Active learners', overview.activeLearners],
              ['Average progress', `${overview.averageProgress}%`],
              ['Completed tasks', overview.completedTasks],
              ['Inactive / risk', overview.inactiveLearners],
            ].map(([label, value]) => (
              <div
                key={label}
                className={`rounded-xl border bg-white p-5 ${label === 'Inactive / risk' && Number(value) > 0 ? 'border-warning bg-warning/60' : 'border-soft'}`}
              >
                <p className="text-xs font-medium text-muted-copy">{label}</p>
                <p className="mt-2 text-2xl font-medium text-foreground">
                  {value}
                </p>
              </div>
            ))}
          </section>
          <section className="rounded-xl border border-soft bg-white">
            <div className="border-b border-soft p-5">
              <div className="flex items-center gap-2">
                <LockKeyhole
                  className="h-4 w-4 text-primary"
                  aria-hidden="true"
                />
                <h2 className="font-medium">Learner summaries</h2>
              </div>
              <p className="mt-2 text-xs leading-5 text-muted-copy">
                Manager-only aggregates. Raw writing and speaking responses are
                not shown here.
              </p>
            </div>
            <div className="hidden grid-cols-[1fr_0.6fr_0.5fr_auto] gap-2 border-b border-soft bg-surface-hover px-5 py-3 text-[10px] font-medium uppercase text-muted-copy sm:grid">
              <span>Learner</span>
              <span>Level estimate</span>
              <span>Progress</span>
              <span className="sr-only">Action</span>
            </div>
            <div className="divide-y divide-soft">
              {team.members.map((member) => {
                const summary = team.summaries.find(
                  (item) => item.memberId === member.id
                );
                return (
                  <Link
                    key={member.id}
                    to={`/team/members/${member.id}`}
                    className="grid gap-3 p-5 transition-colors hover:bg-primary/5 sm:grid-cols-[1fr_0.6fr_0.5fr_auto] sm:items-center"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {member.displayName}
                      </p>
                      <p className="text-xs text-muted-copy">
                        {member.discipline}
                      </p>
                    </div>
                    <p className="text-sm text-muted-copy">
                      <span className="mr-1 font-medium text-muted-copy sm:hidden">
                        Level:
                      </span>
                      {summary?.cefrEstimate ?? 'Not enough data'}
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      <span className="mr-1 font-medium text-muted-copy sm:hidden">
                        Progress:
                      </span>
                      {summary?.overallProgress ?? 0}%
                    </p>
                    <span className="text-sm font-medium text-primary">
                      View
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
          <section className="grid gap-5 lg:grid-cols-2">
            <form
              className="rounded-xl border border-soft bg-white p-5"
              onSubmit={(event) => {
                event.preventDefault();
                if (!email.trim()) return;
                void team.inviteMember(email.trim(), role);
                setEmail('');
              }}
            >
              <div className="flex items-center gap-2">
                <MailPlus className="h-5 w-5 text-primary" />
                <h2 className="font-medium">Invite member</h2>
              </div>
              <p className="mt-2 text-xs leading-5 text-muted-copy">
                The local provider creates a pending record only. No email is
                sent or claimed.
              </p>
              <label className="mt-4 block text-sm font-medium">
                Email
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="premium-input mt-2 w-full rounded-lg px-3 py-3"
                  placeholder="engineer@company.com"
                />
              </label>
              <label className="mt-4 block text-sm font-medium">
                Role
                <select
                  value={role}
                  onChange={(event) =>
                    setRole(event.target.value as 'manager' | 'learner')
                  }
                  className="premium-input mt-2 w-full rounded-lg px-3 py-3"
                >
                  <option value="learner">Learner</option>
                  <option value="manager">Manager</option>
                </select>
              </label>
              <button type="submit" className="public-primary-action mt-4 rounded-lg">
                Create pending invite
              </button>
            </form>
            <div className="rounded-xl border border-soft bg-white p-5">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <h2 className="font-medium">Pending invites</h2>
              </div>
              {team.invitations.length === 0 ? (
                <div className="mt-5 rounded-lg border border-dashed border-border-hover bg-surface-hover p-5 text-center">
                  <MailPlus
                    className="mx-auto h-5 w-5 text-muted-copy"
                    aria-hidden="true"
                  />
                  <p className="mt-2 text-sm font-medium text-foreground">
                    No pending invitations
                  </p>
                  <p className="mt-1 text-xs leading-5 text-muted-copy">
                    New local invite records will appear here. Email is not
                    sent.
                  </p>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {team.invitations.map((invite) => (
                    <div
                      key={invite.id}
                      className="rounded-lg border border-soft bg-surface-hover p-3"
                    >
                      <p className="text-sm font-medium">{invite.email}</p>
                      <p className="mt-1 text-xs text-warning">
                        Email delivery not implemented
                      </p>
                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          onClick={() => team.resendInvitation(invite.id)}
                          className="inline-flex min-h-10 items-center gap-1 rounded-lg border border-soft bg-white px-3 py-2 text-xs font-medium transition-colors hover:border-primary/30 hover:bg-primary/5"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          Resend record
                        </button>
                        <button
                          type="button"
                          onClick={() => team.cancelInvitation(invite.id)}
                          className="min-h-10 rounded-lg px-3 py-2 text-xs font-medium text-rose-700 transition-colors hover:bg-rose-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </EntitlementGate>
    </main>
  );
};

export default TeamPage;