import { ArrowUpDown, BarChart3, Filter } from 'lucide-react';

import { useLocalizationStore } from '@/features/localization';
import { SIDEBAR_SKILL_COPY } from '@/features/localization/translations/rightsidebar.translations';

interface WritingSidebarProps {
  submissionCount?: number;
  avgScore?: number;
  activeFilter?: string;
  onFilterChange?: (filter: string) => void;
  activeSort?: string;
  onSortChange?: (sort: string) => void;
}

export function WritingSidebar({
  submissionCount = 0,
  avgScore = 0,
  activeFilter,
  onFilterChange,
  activeSort,
  onSortChange,
}: WritingSidebarProps) {
  const language = useLocalizationStore((s) => s.language);
  const copy = SIDEBAR_SKILL_COPY[language] ?? SIDEBAR_SKILL_COPY.en;
  const FILTERS = [copy.all, copy.draft, copy.submitted, copy.graded];
  const SORTS = [copy.duration, copy.difficulty];

  return (
    <aside className="w-64 space-y-4 p-4">
      <div className="rounded-[4px] border-2 border-primary bg-surface p-3">
        <div className="flex items-center gap-2 mb-2">
          <Filter className="h-3 w-3 text-primary" />
          <span className="text-[10px] font-bold uppercase text-foreground">{copy.filter}</span>
        </div>
        <div className="space-y-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => onFilterChange?.(f)}
              className={`w-full rounded-[4px] px-2 py-1.5 text-[10px] font-medium text-left transition ${
                activeFilter === f
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-copy hover:bg-surface-hover hover:text-foreground'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-[4px] border-2 border-primary bg-surface p-3">
        <div className="flex items-center gap-2 mb-2">
          <ArrowUpDown className="h-3 w-3 text-primary" />
          <span className="text-[10px] font-bold uppercase text-foreground">{copy.sort}</span>
        </div>
        <div className="space-y-1">
          {SORTS.map((s) => (
            <button
              key={s}
              onClick={() => onSortChange?.(s)}
              className={`w-full rounded-[4px] px-2 py-1.5 text-[10px] font-medium text-left transition ${
                activeSort === s
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-copy hover:bg-surface-hover hover:text-foreground'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-[4px] border-2 border-primary bg-surface p-3">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="h-3 w-3 text-primary" />
          <span className="text-[10px] font-bold uppercase text-foreground">{copy.progress}</span>
        </div>
        <div className="space-y-2 text-[10px]">
          <div className="flex justify-between text-muted-copy">
            <span>{copy.submissions}</span>
            <span className="font-bold text-foreground">{submissionCount}</span>
          </div>
          <div className="flex justify-between text-muted-copy">
            <span>{copy.avgScore}</span>
            <span className="font-bold text-foreground">{avgScore}%</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
