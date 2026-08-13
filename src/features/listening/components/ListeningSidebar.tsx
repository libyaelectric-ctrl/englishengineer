import { ArrowUpDown, BarChart3, Filter } from 'lucide-react';

import { useLocalizationStore } from '@/features/localization';
import { SIDEBAR_SKILL_COPY } from '@/features/localization/translations/rightsidebar.translations';

export function ListeningSidebar() {
  const language = useLocalizationStore((s) => s.language);
  const copy = SIDEBAR_SKILL_COPY[language] ?? SIDEBAR_SKILL_COPY.en;
  return (
    <aside className="w-64 space-y-4 p-4">
      <div className="rounded-[4px] border-2 border-primary bg-surface p-3">
        <div className="flex items-center gap-2 mb-2">
          <Filter className="h-3 w-3 text-primary" />
          <span className="text-[10px] font-bold uppercase text-foreground">{copy.filter}</span>
        </div>
        <div className="space-y-1">
          {[copy.all, copy.unheard, copy.listened, copy.completed].map((f) => (
            <button
              key={f}
              className="w-full rounded-[4px] px-2 py-1.5 text-[10px] font-medium text-left text-muted-copy hover:bg-surface-hover hover:text-foreground transition"
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
          {[copy.duration, copy.level].map((s) => (
            <button
              key={s}
              className="w-full rounded-[4px] px-2 py-1.5 text-[10px] font-medium text-left text-muted-copy hover:bg-surface-hover hover:text-foreground transition"
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
            <span>{copy.listened}</span>
            <span className="font-bold text-foreground">0</span>
          </div>
          <div className="flex justify-between text-muted-copy">
            <span>{copy.avgScore}</span>
            <span className="font-bold text-foreground">0%</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
