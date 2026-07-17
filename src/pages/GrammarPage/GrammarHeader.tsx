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
  <header className="sticky top-0 z-20 -mx-4 border-b border-border-soft bg-background/95 px-4 py-3 shadow-sm backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
    <div className="flex items-center justify-between">
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wide text-primary">
          {level} Grammar Path
        </p>
        <h1 className="mt-0.5 truncate text-sm font-black tracking-tight sm:text-base">
          Learn grammar by building real engineering sentences
        </h1>
      </div>
    </div>

    <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="flex flex-1 gap-1.5 overflow-x-auto pb-1 sm:pb-0">
        {CEFR_LEVELS.map((cefrLevel) => (
          <button
            key={cefrLevel}
            type="button"
            className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-bold transition-colors ${cefrLevel === level ? 'border-primary/40 bg-primary/5 text-primary' : 'border-border-soft bg-surface text-muted-copy hover:text-foreground'}`}
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
          className="min-h-10 w-full rounded-lg border border-border-soft bg-surface px-10 text-sm outline-none focus:border-primary/50"
          placeholder="Search..."
        />
      </label>
    </div>
  </header>
);
