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
      <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-black text-slate-950">
              Team workspace
            </h1>
            <StatusBadge
              label={team.source === 'demo' ? 'Demo data' : 'Backend data'}
              tone={team.source === 'demo' ? 'warning' : 'success'}
            />
            <StatusBadge label="Manager view" tone="info" />
          </div>
          <p className="mt-2 text-sm text-slate-600">
            Manager-level communication readiness summaries without exposing raw
            learner responses.
          </p>
        </div>
        <button
          type="button"
          disabled
          title="Export requires a verified Team backend"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[12px] border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-500 disabled:cursor-not-allowed disabled:opacity-70"
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
            <div className="flex gap-3 rounded-[12px] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
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
                className={`rounded-[16px] border bg-white p-5 ${label === 'Inactive / risk' && Number(value) > 0 ? 'border-amber-200 bg-amber-50/60' : 'border-slate-200'}`}
              >
                <p className="text-xs font-semibold text-slate-500">{label}</p>
                <p className="mt-2 text-2xl font-black text-slate-950">
                  {value}
                </p>
              </div>
            ))}
          </section>
          <section className="rounded-[16px] border border-slate-200 bg-white">
            <div className="border-b border-slate-200 p-5">
              <div className="flex items-center gap-2">
                <LockKeyhole
                  className="h-4 w-4 text-sky-700"
                  aria-hidden="true"
                />
                <h2 className="font-bold">Learner summaries</h2>
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Manager-only aggregates. Raw writing and speaking responses are
                not shown here.
              </p>
            </div>
            <div className="hidden grid-cols-[1fr_0.6fr_0.5fr_auto] gap-2 border-b border-slate-200 bg-slate-50 px-5 py-3 text-[10px] font-bold uppercase text-slate-500 sm:grid">
              <span>Learner</span>
              <span>Level estimate</span>
              <span>Progress</span>
              <span className="sr-only">Action</span>
            </div>
            <div className="divide-y divide-slate-200">
              {team.members.map((member) => {
                const summary = team.summaries.find(
                  (item) => item.memberId === member.id
                );
                return (
                  <Link
                    key={member.id}
                    to={`/team/members/${member.id}`}
                    className="grid gap-3 p-5 transition-colors hover:bg-sky-50/50 sm:grid-cols-[1fr_0.6fr_0.5fr_auto] sm:items-center"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">
                        {member.displayName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {member.discipline}
                      </p>
                    </div>
                    <p className="text-sm text-slate-600">
                      <span className="mr-1 font-semibold text-slate-500 sm:hidden">
                        Level:
                      </span>
                      {summary?.cefrEstimate ?? 'Not enough data'}
                    </p>
                    <p className="text-sm font-semibold text-slate-700">
                      <span className="mr-1 font-semibold text-slate-500 sm:hidden">
                        Progress:
                      </span>
                      {summary?.overallProgress ?? 0}%
                    </p>
                    <span className="text-sm font-semibold text-sky-700">
                      View
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
          <section className="grid gap-5 lg:grid-cols-2">
            <form
              className="rounded-[16px] border border-slate-200 bg-white p-5"
              onSubmit={(event) => {
                event.preventDefault();
                if (!email.trim()) return;
                void team.inviteMember(email.trim(), role);
                setEmail('');
              }}
            >
              <div className="flex items-center gap-2">
                <MailPlus className="h-5 w-5 text-sky-700" />
                <h2 className="font-bold">Invite member</h2>
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                The local provider creates a pending record only. No email is
                sent or claimed.
              </p>
              <label className="mt-4 block text-sm font-semibold">
                Email
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="premium-input mt-2 w-full px-3 py-3"
                  placeholder="engineer@company.com"
                />
              </label>
              <label className="mt-4 block text-sm font-semibold">
                Role
                <select
                  value={role}
                  onChange={(event) =>
                    setRole(event.target.value as 'manager' | 'learner')
                  }
                  className="premium-input mt-2 w-full px-3 py-3"
                >
                  <option value="learner">Learner</option>
                  <option value="manager">Manager</option>
                </select>
              </label>
              <button type="submit" className="public-primary-action mt-4">
                Create pending invite
              </button>
            </form>
            <div className="rounded-[16px] border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-sky-700" />
                <h2 className="font-bold">Pending invites</h2>
              </div>
              {team.invitations.length === 0 ? (
                <div className="mt-5 rounded-[12px] border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
                  <MailPlus
                    className="mx-auto h-5 w-5 text-slate-400"
                    aria-hidden="true"
                  />
                  <p className="mt-2 text-sm font-semibold text-slate-700">
                    No pending invitations
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    New local invite records will appear here. Email is not
                    sent.
                  </p>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {team.invitations.map((invite) => (
                    <div
                      key={invite.id}
                      className="rounded-[12px] border border-slate-200 bg-slate-50 p-3"
                    >
                      <p className="text-sm font-semibold">{invite.email}</p>
                      <p className="mt-1 text-xs text-amber-700">
                        Email delivery not implemented
                      </p>
                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          onClick={() => team.resendInvitation(invite.id)}
                          className="inline-flex min-h-10 items-center gap-1 rounded-[12px] border border-slate-200 bg-white px-3 py-2 text-xs font-semibold transition-colors hover:border-sky-200 hover:bg-sky-50"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          Resend record
                        </button>
                        <button
                          type="button"
                          onClick={() => team.cancelInvitation(invite.id)}
                          className="min-h-10 rounded-[12px] px-3 py-2 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-50"
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
