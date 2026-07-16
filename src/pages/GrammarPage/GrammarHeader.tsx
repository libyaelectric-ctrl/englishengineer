import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { CEFR_LEVELS, type CefrLevel } from '@/features/level-system';
import {
  CheckCircle2,
  Circle,
} from 'lucide-react';
import { StatusPill } from './GrammarPageComponents';

type PathEntry = {
  rule: { id: string; title: string; grammarCategory: string };
  status: string;
};

type PathGroup = {
  module: string;
  entries: PathEntry[];
};

export const GrammarHeader = ({
  level,
  levelCounts,
  query,
  setQuery,
  pathGroups,
  selectedRule,
  selectRule,
  scrollLessonStrip,
  lessonStripRef,
}: {
  level: string;
  levelCounts: Record<CefrLevel, number>;
  query: string;
  setQuery: (q: string) => void;
  pathGroups: PathGroup[];
  selectedRule: { id: string } | null;
  selectRule: (id: string) => void;
  scrollLessonStrip: (dir: 'left' | 'right') => void;
  lessonStripRef: React.RefObject<HTMLDivElement>;
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
      <label className="relative flex-1 sm:max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-copy" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="min-h-10 w-full rounded-lg border border-border-soft bg-surface px-10 text-sm outline-none focus:border-primary/50"
          placeholder="Search..."
        />
      </label>
    </div>

    <div className="mt-3 rounded-lg border border-border-soft bg-surface p-2">
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => scrollLessonStrip('left')}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted-copy hover:text-foreground"
          aria-label="Scroll lessons left"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div
          ref={lessonStripRef}
          className="flex flex-1 gap-1.5 overflow-x-auto scroll-smooth px-1 pb-1"
        >
          {pathGroups.length === 0 ? (
            <p className="px-2 py-3 text-xs text-muted-copy">
              No lessons match this filter.
            </p>
          ) : (
            (() => {
              let lessonNum = 0;
              return pathGroups.map((group) => {
                const startNum = lessonNum + 1;
                lessonNum += group.entries.length;
                return (
                  <div
                    key={group.module}
                    className="flex shrink-0 items-stretch gap-1.5"
                  >
                    <div className="flex w-36 shrink-0 flex-col justify-center rounded-lg border border-border-soft bg-background px-2 py-1.5">
                      <span className="line-clamp-2 text-xs font-black leading-4">
                        {group.module}
                      </span>
                    </div>
                    {group.entries.map(({ rule, status }, idx) => {
                      const selected = rule.id === selectedRule?.id;
                      return (
                        <button
                          key={rule.id}
                          type="button"
                          onClick={() => selectRule(rule.id)}
                          className={`flex w-44 shrink-0 flex-col justify-between rounded-lg border px-2 py-1.5 text-left transition-colors ${selected ? 'border-foreground bg-foreground text-background' : 'border-border-soft bg-background hover:border-primary/40'}`}
                        >
                          <span className="line-clamp-2 text-xs font-black leading-4">
                            <span className="mr-1 text-[10px] opacity-60">
                              {startNum + idx}.
                            </span>
                            {rule.title}
                          </span>
                          <span className="mt-1 flex items-center justify-between gap-1">
                            {status === 'Mastered' ? (
                              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-success" />
                            ) : (
                              <Circle className="h-3.5 w-3.5 shrink-0 text-muted-copy" />
                            )}
                            <StatusPill status={status as any} compact />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                );
              });
            })()
          )}
        </div>
        <button
          type="button"
          onClick={() => scrollLessonStrip('right')}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted-copy hover:text-foreground"
          aria-label="Scroll lessons right"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  </header>
);
