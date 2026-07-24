import { Search, Zap, Lock, Info } from 'lucide-react';
import { CEFR_LEVELS, type CefrLevel } from '@/features/level-system';

const GRAMMAR_QUIZ_THRESHOLD = 50;

export const GrammarHeader = ({
  level,
  levelCounts,
  query,
  setQuery,
  grammarLearned = 0,
  grammarMastered = 0,
  grammarStruggling = 0,
  onOpenQuiz,
  onOpenStrugglingQuiz,
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
  const totalActive = grammarLearned + grammarMastered;
  const canStartQuiz = totalActive >= GRAMMAR_QUIZ_THRESHOLD;

  return (
    <div className="space-y-4 mb-6">
      {/* Clean 64px Sticky Header Bar (Identical to ProgressPage) */}
      <div className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-border-soft bg-background/80 backdrop-blur-xl -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex items-center gap-3">
          <h1 className="text-base font-bold tracking-tight text-foreground">
            Grammar
          </h1>
          <span className="rounded-[4px] border border-border-soft bg-surface px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#0047bb]">
            {level}
          </span>
          <p className="hidden text-[11px] font-medium text-muted-copy leading-tight sm:block">
            CEFR grammar rules & technical sentence patterns.
          </p>
        </div>

        {/* Level Switcher Tabs */}
        <div className="flex items-center gap-1 rounded-[4px] border border-border-soft bg-surface p-1 shadow-sm overflow-x-auto">
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

      {/* Secondary Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <label
          htmlFor="grammar-search"
          className="relative shrink-0 w-48 sm:w-64"
        >
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-copy" />
          <input
            id="grammar-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="min-h-9 w-full rounded-[4px] border border-border-soft bg-surface pl-8 pr-2 text-xs outline-none focus:border-[#0047bb] text-foreground"
            placeholder="Search grammar rules..."
          />
        </label>

        <div className="flex items-center gap-3">
          {canStartQuiz ? (
            <button
              onClick={onOpenQuiz}
              className="flex items-center gap-1.5 rounded-[4px] bg-[#0047bb] px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider text-white transition hover:bg-[#0047bb]/90 cursor-pointer shadow-sm"
            >
              <Zap className="h-3.5 w-3.5" />
              Quiz ({totalActive} rules)
            </button>
          ) : (
            <div className="flex items-center gap-2 rounded-[4px] border border-amber-300 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5">
              <Lock className="h-3.5 w-3.5 text-amber-600" />
              <span className="text-[10px] font-bold text-amber-700">
                Locked — Learn {GRAMMAR_QUIZ_THRESHOLD - totalActive} more rules
              </span>
              <div className="h-1.5 w-20 rounded-full bg-amber-200 overflow-hidden">
                <div
                  className="h-full bg-amber-500 transition-all"
                  style={{
                    width: `${Math.min((totalActive / GRAMMAR_QUIZ_THRESHOLD) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          )}

          {grammarStruggling > 0 && onOpenStrugglingQuiz && (
            <button
              onClick={onOpenStrugglingQuiz}
              className="flex items-center gap-1 rounded-[4px] border border-red-300 bg-red-50 px-2.5 py-1 text-[10px] font-bold text-red-700 transition hover:bg-red-100 cursor-pointer"
            >
              Struggling ({grammarStruggling})
            </button>
          )}

          <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-muted-copy font-medium">
            <Info className="h-3.5 w-3.5" />
            {totalActive}/{GRAMMAR_QUIZ_THRESHOLD} learned
          </div>
        </div>
      </div>
    </div>
  );
};
