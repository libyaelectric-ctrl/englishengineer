import { BarChart3, Filter, ArrowUpDown } from 'lucide-react';
import { useReadingStore } from '@/features/reading';

export function ReadingSidebar() {
  const { missions, completedMissions } = useReadingStore();
  const done = Object.keys(completedMissions).length;
  const total = missions.length;
  const avgScore = done > 0
    ? Math.round(
        Object.values(completedMissions).reduce((a, b) => a + b, 0) / done
      )
    : 0;

  return (
    <aside className="w-64 space-y-4 p-4">
      {/* Filtreleme */}
      <div className="rounded-[4px] border-2 border-[#0047bb] bg-surface p-3">
        <div className="flex items-center gap-2 mb-2">
          <Filter className="h-3 w-3 text-[#0047bb]" />
          <span className="text-[10px] font-bold uppercase text-foreground">Filter</span>
        </div>
        <div className="space-y-1">
          {['All', 'Unread', 'Read', 'Difficult'].map((f) => (
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
      <div className="rounded-[4px] border-2 border-[#0047bb] bg-surface p-3">
        <div className="flex items-center gap-2 mb-2">
          <ArrowUpDown className="h-3 w-3 text-[#0047bb]" />
          <span className="text-[10px] font-bold uppercase text-foreground">Sort</span>
        </div>
        <div className="space-y-1">
          {['Duration', 'Level', 'Score'].map((s) => (
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
      <div className="rounded-[4px] border-2 border-[#0047bb] bg-surface p-3">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="h-3 w-3 text-[#0047bb]" />
          <span className="text-[10px] font-bold uppercase text-foreground">Progress</span>
        </div>
        <div className="space-y-2 text-[10px]">
          <div className="flex justify-between text-muted-copy">
            <span>Read</span>
            <span className="font-bold text-foreground">{done}/{total}</span>
          </div>
          <div className="h-1 rounded-full bg-border-soft overflow-hidden">
            <div
              className="h-full bg-[#0047bb] transition-all"
              style={{ width: `${total > 0 ? (done / total) * 100 : 0}%` }}
            />
          </div>
          <div className="flex justify-between text-muted-copy">
            <span>Avg Score</span>
            <span className="font-bold text-foreground">{avgScore}%</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
