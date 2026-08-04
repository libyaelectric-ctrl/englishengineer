import {
  AlertTriangle,
  BookMarked,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Library,
  RotateCcw,
} from 'lucide-react';

import { MetricCard } from '@/shared/components/MetricCard';
import { SectionCard } from '@/shared/components/SectionCard';

import { useLocalizationStore } from '@/features/localization';

interface VocabularySummary {
  total: number;
  newWords: number;
  learning: number;
  mastered: number;
  weak: number;
  forgotten: number;
  dueToday: number;
}

interface ProgressMetricsProps {
  summary: VocabularySummary;
}

export const ProgressMetrics = ({ summary }: ProgressMetricsProps) => {
  const translate = useLocalizationStore((s) => s.translate);

  return (
    <SectionCard
      title={translate('vocabulary.progressMetrics')}
      subtitle={translate('vocabulary.progressMetricsDesc')}
      icon={Library}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <MetricCard
          data-testid="metric-total"
          label={translate('vocabulary.total')}
          value={summary.total}
          icon={Library}
          className="min-w-0 p-4 sm:p-4"
          statusColor="primary"
        />
        <MetricCard
          data-testid="metric-new"
          label={translate('vocabulary.new')}
          value={summary.newWords}
          icon={BookMarked}
          className="min-w-0 p-4 sm:p-4"
          statusColor="cyan"
        />
        <MetricCard
          data-testid="metric-learning"
          label={translate('vocabulary.learned')}
          value={summary.learning}
          icon={GraduationCap}
          className="min-w-0 p-4 sm:p-4"
          statusColor="primary"
        />
        <MetricCard
          data-testid="metric-mastered"
          label={translate('vocabulary.mastered')}
          value={summary.mastered}
          icon={CheckCircle2}
          className="min-w-0 p-4 sm:p-4"
          statusColor="emerald"
        />
        <MetricCard
          data-testid="metric-weak"
          label={translate('vocabulary.weakWords')}
          value={summary.weak}
          icon={AlertTriangle}
          className="min-w-0 p-4 sm:p-4"
          statusColor="rose"
        />
        <MetricCard
          data-testid="metric-forgotten"
          label={translate('vocabulary.forgotten')}
          value={summary.forgotten}
          icon={RotateCcw}
          className="min-w-0 p-4 sm:p-4"
          statusColor="amber"
        />
        <MetricCard
          data-testid="metric-due"
          label={translate('vocabulary.dueToday')}
          value={summary.dueToday}
          icon={Clock3}
          className="min-w-0 p-4 sm:p-4"
          statusColor="amber"
        />
      </div>
      <div className="mt-4 rounded-[4px] border border-emerald-200 bg-emerald-50 p-4">
        <p className="text-sm font-bold text-emerald-950">
          {translate('vocabulary.mastered')}: {summary.mastered} / {summary.total}
        </p>
        <p className="mt-1 text-xs text-emerald-800">{translate('vocabulary.masteredReference')}</p>
      </div>
    </SectionCard>
  );
};
