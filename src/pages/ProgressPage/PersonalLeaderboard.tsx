import { useMemo } from 'react';
import { Trophy } from 'lucide-react';
import { type LearningState } from '@/core/learning';
import { SectionCard } from '@/shared/components/SectionCard';

export const PersonalLeaderboard = ({
  learningState,
}: {
  learningState: LearningState;
}) => {
  const rows = useMemo(() => {
    const days: { date: string; xp: number; taskCount: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toDateString();
      const label = d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      const xp = learningState.xpHistory
        .filter((h) => new Date(h.date).toDateString() === dateStr)
        .reduce((sum, h) => sum + h.amount, 0);
      const taskCount = learningState.studySessions.filter(
        (s) => new Date(s.timestamp).toDateString() === dateStr
      ).length;
      days.push({ date: label, xp, taskCount });
    }
    return days;
  }, [learningState.xpHistory, learningState.studySessions]);

  return (
    <SectionCard
      title="Personal Score History"
      subtitle="Last 7 days"
      icon={Trophy}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border-soft">
              <th className="pb-2 text-left font-mono uppercase text-muted-copy">
                Date
              </th>
              <th className="pb-2 text-right font-mono uppercase text-muted-copy">
                XP
              </th>
              <th className="pb-2 text-right font-mono uppercase text-muted-copy">
                Tasks
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.date}
                className="border-b border-border-soft/50 last:border-b-0"
              >
                <td className="py-2 font-medium text-foreground">{row.date}</td>
                <td className="py-2 text-right font-mono text-foreground">
                  {row.xp > 0 ? `+${row.xp}` : '—'}
                </td>
                <td className="py-2 text-right font-mono text-foreground">
                  {row.taskCount > 0 ? row.taskCount : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
};
