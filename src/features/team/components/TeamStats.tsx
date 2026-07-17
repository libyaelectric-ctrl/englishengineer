import { useMemo, type FC } from 'react';
import {
  Users,
  Activity,
  BookOpen,
  BrainCircuit,
  TrendingUp,
} from 'lucide-react';
import { MetricCard } from '@/shared/components/MetricCard';
import type { TeamMember, TeamProgressSummary } from '../team.types';

interface TeamStatsProps {
  members: TeamMember[];
  summaries: TeamProgressSummary[];
}

export const TeamStats: FC<TeamStatsProps> = ({ members, summaries }) => {
  const stats = useMemo(() => {
    const now = new Date();
    const weekAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;

    const activeThisWeek = members.filter(
      (m) => m.lastActiveAt && new Date(m.lastActiveAt).getTime() >= weekAgo
    ).length;

    const vocabScores = summaries.map((s) => s.skillScores.vocabulary);
    const grammarScores = summaries.map((s) => s.skillScores.grammar);
    const allScores = summaries.map((s) => s.overallProgress);

    const avgVocab =
      vocabScores.length > 0
        ? Math.round(
            vocabScores.reduce((a, b) => a + b, 0) / vocabScores.length
          )
        : 0;

    const avgGrammar =
      grammarScores.length > 0
        ? Math.round(
            grammarScores.reduce((a, b) => a + b, 0) / grammarScores.length
          )
        : 0;

    const avgScore =
      allScores.length > 0
        ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
        : 0;

    return {
      totalMembers: members.length,
      activeThisWeek,
      vocabularyMastered: avgVocab,
      grammarMastered: avgGrammar,
      averageScore: avgScore,
    };
  }, [members, summaries]);

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <MetricCard
        label="Total Members"
        value={stats.totalMembers}
        icon={Users}
        statusColor="primary"
      />
      <MetricCard
        label="Active This Week"
        value={stats.activeThisWeek}
        icon={Activity}
        trend={`${Math.round((stats.activeThisWeek / Math.max(stats.totalMembers, 1)) * 100)}% of team`}
        trendDirection="up"
        statusColor="emerald"
      />
      <MetricCard
        label="Vocabulary Score"
        value={`${stats.vocabularyMastered}%`}
        icon={BookOpen}
        statusColor="cyan"
      />
      <MetricCard
        label="Grammar Score"
        value={`${stats.grammarMastered}%`}
        icon={BrainCircuit}
        statusColor="amber"
      />
      <MetricCard
        label="Average Score"
        value={`${stats.averageScore}%`}
        icon={TrendingUp}
        statusColor="emerald"
      />
    </div>
  );
};
