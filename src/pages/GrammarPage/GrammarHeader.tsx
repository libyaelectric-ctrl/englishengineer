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
    <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border-soft -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <header className="flex h-16 shrink-0 items-center gap-3">
        <h1 className="shrink-0 text-base font-bold tracking-tight text-foreground">Grammar</h1>
        <span className="shrink-0 rounded-[4px] border border-border-soft bg-surface px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#0047bb]">{level}</span>

        <div className="flex flex-1 gap-1.5 overflow-x-auto">
          {CEFR_LEVELS.map((cefrLevel) => (
            <button
              key={cefrLevel}
              type="button"
              onClick={() => setQuery(cefrLevel)}
              className={`shrink-0 rounded-[4px] border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
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
      </header>

      <div className="flex items-center gap-3 py-2 border-t border-border-soft">
        {canStartQuiz ? (
          <button
            onClick={onOpenQuiz}
            className="flex items-center gap-1.5 rounded-[4px] bg-primary px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground transition hover:bg-primary-hover"
          >
            <Zap className="h-3 w-3" />
            Quiz ({totalActive} rules)
          </button>
        ) : (
          <div className="flex items-center gap-2 rounded-[4px] border border-amber-300 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5">
            <Lock className="h-3 w-3 text-amber-600" />
            <span className="text-[10px] font-bold text-amber-700">
              Locked — Learn {GRAMMAR_QUIZ_THRESHOLD - totalActive} more rules
            </span>
            <div className="h-1 w-20 rounded-full bg-amber-200 overflow-hidden">
              <div
                className="h-full bg-amber-500 transition-all"
                style={{ width: `${Math.min((totalActive / GRAMMAR_QUIZ_THRESHOLD) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}

        {grammarStruggling > 0 && onOpenStrugglingQuiz && (
          <button
            onClick={onOpenStrugglingQuiz}
            className="flex items-center gap-1 rounded-[4px] border border-red-300 bg-red-50 px-2.5 py-1 text-[10px] font-bold text-red-700 transition hover:bg-red-100"
          >
            Struggling ({grammarStruggling})
          </button>
        )}

        <div className="ml-auto flex items-center gap-1.5 text-[10px] text-muted-copy">
          <Info className="h-3 w-3" />
          {totalActive}/{GRAMMAR_QUIZ_THRESHOLD} learned
        </div>
      </div>
    </div>
  );
};
