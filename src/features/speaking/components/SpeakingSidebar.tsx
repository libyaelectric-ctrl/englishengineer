import { BarChart3, Filter, ArrowUpDown } from 'lucide-react';

export function SpeakingSidebar() {
  return (
    <aside className="w-64 space-y-4 p-4">
      <div className="rounded-[4px] border-2 border-[#0047bb] bg-surface p-3">
        <div className="flex items-center gap-2 mb-2">
          <Filter className="h-3 w-3 text-[#0047bb]" />
          <span className="text-[10px] font-bold uppercase text-foreground">Filter</span>
        </div>
        <div className="space-y-1">
          {['All', 'Draft', 'Submitted', 'Graded'].map((f) => (
            <button key={f} className="w-full rounded-[4px] px-2 py-1.5 text-[10px] font-medium text-left text-muted-copy hover:bg-surface-hover hover:text-foreground transition">{f}</button>
          ))}
        </div>
      </div>
      <div className="rounded-[4px] border-2 border-[#0047bb] bg-surface p-3">
        <div className="flex items-center gap-2 mb-2">
          <ArrowUpDown className="h-3 w-3 text-[#0047bb]" />
          <span className="text-[10px] font-bold uppercase text-foreground">Sort</span>
        </div>
        <div className="space-y-1">
          {['Duration', 'Difficulty'].map((s) => (
            <button key={s} className="w-full rounded-[4px] px-2 py-1.5 text-[10px] font-medium text-left text-muted-copy hover:bg-surface-hover hover:text-foreground transition">{s}</button>
          ))}
        </div>
      </div>
      <div className="rounded-[4px] border-2 border-[#0047bb] bg-surface p-3">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="h-3 w-3 text-[#0047bb]" />
          <span className="text-[10px] font-bold uppercase text-foreground">Progress</span>
        </div>
        <div className="space-y-2 text-[10px]">
          <div className="flex justify-between text-muted-copy"><span>Submissions</span><span className="font-bold text-foreground">0</span></div>
          <div className="flex justify-between text-muted-copy"><span>Avg Score</span><span className="font-bold text-foreground">0%</span></div>
        </div>
      </div>
    </aside>
  );
}
