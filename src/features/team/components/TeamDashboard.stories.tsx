import type { Meta, StoryObj } from '@storybook/react';
import { ShieldAlert } from 'lucide-react';
import { StatusBadge } from '@/shared/components/StatusBadge';

const meta: Meta = {
  title: 'Features/Team/TeamDashboard',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;

const DEMO_MEMBERS = [
  { id: '1', name: 'Alice Johnson', email: 'alice@example.com', role: 'admin' as const },
  { id: '2', name: 'Bob Smith', email: 'bob@example.com', role: 'member' as const },
  { id: '3', name: 'Carol Davis', email: 'carol@example.com', role: 'member' as const },
];

const DEMO_SUMMARIES = [
  { memberId: '1', wordsLearned: 342, studyHours: 28, streak: 14, score: 92 },
  { memberId: '2', wordsLearned: 215, studyHours: 18, streak: 7, score: 78 },
  { memberId: '3', wordsLearned: 180, studyHours: 12, streak: 3, score: 65 },
];

const TeamDashboardDemo = ({ showDemoWarning }: { showDemoWarning?: boolean }) => {
  const totalWords = DEMO_SUMMARIES.reduce((s, m) => s + m.wordsLearned, 0);
  const avgScore = Math.round(
    DEMO_SUMMARIES.reduce((s, m) => s + m.score, 0) / DEMO_SUMMARIES.length
  );

  return (
    <main className="space-y-6 pt-12 sm:pt-0">
      <header className="flex flex-col gap-4 border-b border-border-soft pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-medium text-foreground">Team Management</h1>
            <StatusBadge
              label={showDemoWarning ? 'Demo data' : 'Backend data'}
              tone={showDemoWarning ? 'warning' : 'success'}
            />
            <StatusBadge label="Admin panel" tone="info" />
          </div>
          <p className="mt-2 text-sm text-muted-copy">
            Assign training licenses, track team progress, and view individual performance.
          </p>
        </div>
      </header>

      {showDemoWarning && (
        <div className="flex gap-3 rounded-xl border border-warning bg-warning p-4 text-sm text-warning">
          <ShieldAlert className="h-5 w-5 shrink-0" />
          <p>
            <strong>Demo team data.</strong> These names, metrics and invitations are
            fictional and are not live organization analytics.
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border-soft bg-surface p-4">
          <p className="text-xs font-medium uppercase text-muted-copy">Team Members</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{DEMO_MEMBERS.length}</p>
        </div>
        <div className="rounded-xl border border-border-soft bg-surface p-4">
          <p className="text-xs font-medium uppercase text-muted-copy">Total Words Learned</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{totalWords}</p>
        </div>
        <div className="rounded-xl border border-border-soft bg-surface p-4">
          <p className="text-xs font-medium uppercase text-muted-copy">Average Score</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{avgScore}%</p>
        </div>
      </div>

      <div className="rounded-xl border border-border-soft bg-surface">
        <div className="border-b border-border-soft px-4 py-3">
          <h2 className="text-sm font-semibold text-foreground">Team Members</h2>
        </div>
        <div className="divide-y divide-border-soft">
          {DEMO_MEMBERS.map((member) => {
            const summary = DEMO_SUMMARIES.find((s) => s.memberId === member.id);
            return (
              <div
                key={member.id}
                className="flex items-center justify-between px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{member.name}</p>
                  <p className="text-xs text-muted-copy">{member.email}</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-copy">
                  <span>{summary?.wordsLearned ?? 0} words</span>
                  <span>{summary?.studyHours ?? 0}h</span>
                  <span
                    className={`font-semibold ${
                      (summary?.score ?? 0) >= 80
                        ? 'text-success'
                        : (summary?.score ?? 0) >= 60
                          ? 'text-warning'
                          : 'text-error'
                    }`}
                  >
                    {summary?.score ?? 0}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
};

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <TeamDashboardDemo />,
};

export const WithDemoWarning: Story = {
  render: () => <TeamDashboardDemo showDemoWarning />,
};
