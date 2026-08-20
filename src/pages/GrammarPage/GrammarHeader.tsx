import { Search, Trophy } from 'lucide-react';

import { PageHeader } from '@/shared/components/PageHeader';

import { CEFR_LEVELS, type CefrLevel } from '@/features/level-system';

export const GrammarHeader = ({
  level,
  levelCounts,
  query,
  setQuery,
  grammarLearned,
  grammarStruggling,
  onOpenQuiz,
  onOpenStrugglingQuiz,
}: {
  level: string;
  levelCounts: Record<CefrLevel, number>;
  query: string;
  setQuery: (q: string) => void;
  grammarLearned?: number;
  grammarStruggling?: number;
  onOpenQuiz?: () => void;
  onOpenStrugglingQuiz?: () => void;
}) => {
  return (
    <PageHeader
      title="Grammar"
      badgeText={level}
      description="Search rules and master grammar fundamentals."
      actions={
        <div className="flex items-center gap-2">
          {(grammarStruggling ?? 0) > 0 && (
            <button
              type="button"
              onClick={onOpenStrugglingQuiz}
              title="Zayıf kuralları tekrar et"
              className="flex items-center gap-1.5 rounded-[4px] border border-rose-400/40 bg-rose-500/10 px-2.5 py-1 text-[10px] font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 cursor-pointer transition-all uppercase tracking-wider"
            >
              ⚠️ Zayıf ({grammarStruggling})
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              if ((grammarLearned ?? 0) < 2) {
                alert(
                  `Grammar Quiz başlatmak için en az 2 kuralı tamamlayın (Mevcut: ${grammarLearned ?? 0}/2).`
                );
                return;
              }
              onOpenQuiz?.();
            }}
            title={
              (grammarLearned ?? 0) < 2
                ? `En az 2 öğrenilmiş kural gerekli (Mevcut: ${grammarLearned ?? 0}/2)`
                : 'Grammar Quiz Başlat'
            }
            className={`flex items-center gap-1 rounded-[4px] border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
              (grammarLearned ?? 0) >= 2
                ? 'border-amber-400/50 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20'
                : 'border-border-soft bg-surface text-muted-copy opacity-75'
            }`}
          >
            <Trophy className="h-3.5 w-3.5" aria-hidden="true" /> Quiz ({grammarLearned ?? 0}/2)
          </button>

          <div
            className="flex gap-1 rounded-[4px] border border-border-soft bg-surface p-1 shadow-sm overflow-x-auto"
            role="tablist"
            aria-label="Grammar level"
          >
            {CEFR_LEVELS.map((cefrLevel) => (
              <button
                key={cefrLevel}
                type="button"
                role="tab"
                aria-selected={cefrLevel === level}
                onClick={() => setQuery(cefrLevel)}
                className={`px-3 py-1 text-[10px] font-sans font-bold rounded-[4px] transition-all cursor-pointer uppercase tracking-wider ${
                  cefrLevel === level
                    ? 'bg-primary text-white border border-primary'
                    : 'text-muted-copy hover:bg-primary/5 hover:text-primary'
                }`}
              >
                {cefrLevel}
                <span className="ml-1 text-[10px] opacity-60">{levelCounts[cefrLevel]}</span>
              </button>
            ))}
          </div>
        </div>
      }
    >
      <label htmlFor="grammar-search" className="relative hidden w-36 sm:w-44 md:block">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-copy" />
        <input
          id="grammar-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="min-h-8 w-full rounded-[4px] border border-border-soft bg-surface pl-8 pr-2 text-xs outline-none focus:border-primary text-foreground"
          placeholder="Search rules..."
        />
      </label>
    </PageHeader>
  );
};
