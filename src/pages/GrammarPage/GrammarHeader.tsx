import { Search } from 'lucide-react';
import { CEFR_LEVELS, type CefrLevel } from '@/features/level-system';

export const GrammarHeader = ({
  level,
  levelCounts,
  query,
  setQuery,
}: {
  level: string;
  levelCounts: Record<CefrLevel, number>;
  query: string;
  setQuery: (q: string) => void;
  grammarLearned?: number;
  grammarMastered?: number;
  grammarStruggling?: number;
  onOpenQuiz?: () => void;
  onOpenStrugglingQuiz?: () => void;
}) => {
  return (
    <div className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-border-soft bg-background/95 backdrop-blur-xl mb-6">
      <div className="flex items-center gap-3">
        <h1 className="text-base font-bold tracking-tight text-foreground">
          Grammar
        </h1>
        <span className="rounded-[4px] border border-border-soft bg-surface px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#0047bb]">
          {level}
        </span>
        <label
          htmlFor="grammar-search"
          className="relative hidden w-36 sm:w-44 md:block"
        >
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-copy" />
          <input
            id="grammar-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="min-h-8 w-full rounded-[4px] border border-border-soft bg-surface pl-8 pr-2 text-xs outline-none focus:border-[#0047bb] text-foreground"
            placeholder="Search..."
          />
        </label>
      </div>

      {/* Level Switcher Tabs (Identical to ProgressPage) */}
      <div className="flex gap-1 rounded-[4px] border border-border-soft bg-surface p-1 shadow-sm overflow-x-auto">
        {CEFR_LEVELS.map((cefrLevel) => (
          <button
            key={cefrLevel}
            type="button"
            onClick={() => setQuery(cefrLevel)}
            className={`px-3 py-1 text-[10px] font-sans font-bold rounded-[4px] transition-all cursor-pointer uppercase tracking-wider ${
              cefrLevel === level
                ? 'bg-[#0047bb] text-white border border-[#0047bb]'
                : 'text-muted-copy hover:bg-primary/5 hover:text-[#0047bb]'
            }`}
          >
            {cefrLevel}
            <span className="ml-1 text-[8px] opacity-60">
              {levelCounts[cefrLevel]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
