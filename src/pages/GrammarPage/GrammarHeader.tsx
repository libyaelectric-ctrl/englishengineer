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
  <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border-soft -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
    <div className="flex h-12 shrink-0 items-center gap-3">
      <h1 className="shrink-0 text-sm font-bold tracking-tight text-foreground">Grammar</h1>
      <span className="shrink-0 rounded-[4px] border border-border-soft bg-surface px-2 py-0.5 text-[8px] font-bold uppercase text-[#0047bb]">{level}</span>

      <div className="flex flex-1 gap-1 overflow-x-auto">
        {CEFR_LEVELS.map((cefrLevel) => (
          <button
            key={cefrLevel}
            type="button"
            onClick={() => setQuery(cefrLevel)}
            className={`shrink-0 rounded-[4px] border px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              cefrLevel === level
                ? 'border-[#0047bb]/40 bg-[#0047bb]/5 text-[#0047bb]'
                : 'border-border-soft text-muted-copy hover:text-foreground'
            }`}
          >
            {cefrLevel}
            <span className="ml-0.5 text-[8px] opacity-50">{levelCounts[cefrLevel]}</span>
          </button>
        ))}
      </div>

      <label htmlFor="grammar-search" className="relative shrink-0 w-40 sm:w-48">
        <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-copy" />
        <input
          id="grammar-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="min-h-8 w-full rounded-[4px] border border-border-soft bg-surface pl-7 pr-2 text-xs outline-none focus:border-[#0047bb]/50 text-foreground"
          placeholder="Search..."
        />
      </label>
    </div>
  </header>
);
