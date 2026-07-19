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
}) => (
  <header className="sticky top-0 z-20 -mx-4 border-b border-border-soft bg-background/80 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Grammar
        </h1>
        <span className="rounded-[4px] border border-border-soft bg-surface px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#0047bb]">
          {level}
        </span>
      </div>
      <div className="hidden text-xs text-muted-copy lg:block font-bold">
        Learn grammar by building real engineering sentences
      </div>
    </div>

    <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="flex flex-1 gap-1.5 overflow-x-auto pb-1 sm:pb-0">
        {CEFR_LEVELS.map((cefrLevel) => (
          <button
            key={cefrLevel}
            type="button"
            className={`flex shrink-0 items-center gap-1.5 rounded-[4px] border px-3 py-2 text-[10px] font-sans font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              cefrLevel === level
                ? 'border-[#0047bb]/40 bg-[#0047bb]/5 text-[#0047bb]'
                : 'border-border-soft bg-[#f3f3fd] text-muted-copy hover:text-foreground hover:bg-surface-hover'
            }`}
          >
            <span>{cefrLevel}</span>
            <span className="text-[10px] opacity-60">
              {levelCounts[cefrLevel]}
            </span>
          </button>
        ))}
      </div>
      <label htmlFor="grammar-search" className="relative flex-1 sm:max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-copy" />
        <input
          id="grammar-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="min-h-10 w-full rounded-[4px] border border-border-soft bg-surface px-10 text-sm outline-none focus:border-[#0047bb]/50 focus:ring-2 focus:ring-[#0047bb]/10 font-medium text-foreground"
          placeholder="Search grammar concepts..."
        />
      </label>
    </div>
  </header>
);
