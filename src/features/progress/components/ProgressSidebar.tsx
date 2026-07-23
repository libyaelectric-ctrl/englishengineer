import { Filter, BarChart3 } from 'lucide-react';

export function ProgressSidebar() {
  return (
    <aside className="w-64 space-y-4 p-4">
      <div className="rounded-[4px] border-2 border-[#0047bb] bg-surface p-3">
        <div className="flex items-center gap-2 mb-2">
          <Filter className="h-3 w-3 text-[#0047bb]" />
          <span className="text-[10px] font-bold uppercase text-foreground">
            Filter
          </span>
        </div>
        <div className="space-y-1">
          {['All', 'This Week', 'This Month'].map((f) => (
            <button
              key={f}
              className="w-full rounded-[4px] px-2 py-1.5 text-[10px] font-medium text-left text-muted-copy hover:bg-surface-hover hover:text-foreground transition"
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      <div className="rounded-[4px] border-2 border-[#0047bb] bg-surface p-3">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="h-3 w-3 text-[#0047bb]" />
          <span className="text-[10px] font-bold uppercase text-foreground">
            Summary
          </span>
        </div>
        <div className="space-y-2 text-[10px]">
          <div className="flex justify-between text-muted-copy">
            <span>Total Words</span>
            <span className="font-bold text-foreground">0</span>
          </div>
          <div className="flex justify-between text-muted-copy">
            <span>Total Rules</span>
            <span className="font-bold text-foreground">0</span>
          </div>
          <div className="flex justify-between text-muted-copy">
            <span>Activities</span>
            <span className="font-bold text-foreground">0</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
