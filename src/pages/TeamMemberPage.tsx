import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { EntitlementGate } from '@/features/billing';
import { getMemberSummary, useTeamStore } from '@/features/team';
import { StatusBadge } from '@/shared/components/StatusBadge';

const TeamMemberPage = () => {
  const { memberId = '' } = useParams();
  const members = useTeamStore((state) => state.members);
  const summaries = useTeamStore((state) => state.summaries);
  const member = members.find((item) => item.id === memberId);
  const summary = getMemberSummary(memberId, summaries);
  return (
    <main className="space-y-6">
      <Link
        to="/team"
        className="inline-flex items-center gap-2 text-sm font-medium text-primary"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Team workspace
      </Link>
      <EntitlementGate
        feature="projectWorkspace"
        title="Team member summaries require Project access"
      >
        {!member || !summary ? (
          <div className="rounded-xl border border-border-soft bg-white p-8 text-center">
            <h1 className="font-medium">Member summary unavailable</h1>
            <p className="mt-2 text-sm text-muted-copy">
              No authorized summary was found for this member.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            <header>
              <StatusBadge label="Demo summary" tone="warning" />
              <h1 className="mt-2 text-2xl font-medium">{member.displayName}</h1>
              <p className="mt-1 text-sm text-muted-copy">
                {member.discipline} · Internal CEFR estimate{' '}
                {summary.cefrEstimate}
              </p>
            </header>
            <section className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-border-soft bg-white p-5">
                <p className="text-xs text-muted-copy">Overall progress</p>
                <p className="mt-2 text-2xl font-medium">
                  {summary.overallProgress}%
                </p>
              </div>
              <div className="rounded-xl border border-border-soft bg-white p-5">
                <p className="text-xs text-muted-copy">Completed tasks</p>
                <p className="mt-2 text-2xl font-medium">
                  {summary.completedTasks}
                </p>
              </div>
              <div className="rounded-xl border border-border-soft bg-white p-5">
                <p className="text-xs text-muted-copy">CEFR estimate</p>
                <p className="mt-2 text-2xl font-medium">
                  {summary.cefrEstimate}
                </p>
              </div>
            </section>
            <section className="rounded-xl border border-border-soft bg-white p-5">
              <h2 className="font-medium">Skill breakdown</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {Object.entries(summary.skillScores).map(([skill, score]) => (
                  <div key={skill}>
                    <div className="flex justify-between text-xs">
                      <span className="capitalize text-muted-copy">{skill}</span>
                      <strong>{score}%</strong>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-surface-hover">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
            <section className="grid gap-5 md:grid-cols-2">
              <div className="rounded-xl border border-border-soft bg-white p-5">
                <h2 className="font-medium">Mistake categories</h2>
                <ul className="mt-3 space-y-2 text-sm text-muted-copy">
                  {summary.mistakeCategories.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-border-soft bg-white p-5">
                <h2 className="font-medium">Recommended next tasks</h2>
                <ul className="mt-3 space-y-2 text-sm text-muted-copy">
                  {summary.recommendedTasks.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
            </section>
          </div>
        )}
      </EntitlementGate>
    </main>
  );
};

export default TeamMemberPage;
