import { ArrowUpDown, BarChart3, Filter } from 'lucide-react';
import { useShallow } from 'zustand/shallow';

import { useLocalizationStore } from '@/features/localization';
import { SIDEBAR_SKILL_COPY } from '@/features/localization/translations/rightsidebar.translations';
import { useReadingStore } from '@/features/reading';

export function ReadingSidebar() {
  const language = useLocalizationStore((s) => s.language);
  const copy = SIDEBAR_SKILL_COPY[language] ?? SIDEBAR_SKILL_COPY.en;
  const { missions, completedMissions } = useReadingStore(
    useShallow((s) => ({ missions: s.missions, completedMissions: s.completedMissions }))
  );
  const done = Object.keys(completedMissions).length;
  const total = missions.length;
  const avgScore =
    done > 0 ? Math.round(Object.values(completedMissions).reduce((a, b) => a + b, 0) / done) : 0;

  return (
    <aside className="w-64 space-y-4 p-4">
      {/* Filtreleme */}
      <div className="rounded-[4px] border-2 border-primary bg-surface p-3">
        <div className="flex items-center gap-2 mb-2">
          <Filter className="h-3 w-3 text-primary" />
          <span className="text-[10px] font-bold uppercase text-foreground">{copy.filter}</span>
        </div>
        <div className="space-y-1">
          {[copy.all, copy.unread, copy.read, copy.difficult].map((f) => (
            <button
              key={f}
              className="w-full rounded-[4px] px-2 py-1.5 text-[10px] font-medium text-left text-muted-copy hover:bg-surface-hover hover:text-foreground transition"
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Sıralama */}
      <div className="rounded-[4px] border-2 border-primary bg-surface p-3">
        <div className="flex items-center gap-2 mb-2">
          <ArrowUpDown className="h-3 w-3 text-primary" />
          <span className="text-[10px] font-bold uppercase text-foreground">{copy.sort}</span>
        </div>
        <div className="space-y-1">
          {[copy.duration, copy.level, copy.score].map((s) => (
            <button
              key={s}
              className="w-full rounded-[4px] px-2 py-1.5 text-[10px] font-medium text-left text-muted-copy hover:bg-surface-hover hover:text-foreground transition"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* İlerleme Raporu */}
      <div className="rounded-[4px] border-2 border-primary bg-surface p-3">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="h-3 w-3 text-primary" />
          <span className="text-[10px] font-bold uppercase text-foreground">{copy.progress}</span>
        </div>
        <div className="space-y-2 text-[10px]">
          <div className="flex justify-between text-muted-copy">
            <span>{copy.read}</span>
            <span className="font-bold text-foreground">
              {done}/{total}
            </span>
          </div>
          <div className="h-1 rounded-full bg-border-soft overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${total > 0 ? (done / total) * 100 : 0}%` }}
            />
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
