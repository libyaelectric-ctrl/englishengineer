import { ChevronDown } from 'lucide-react';

import { useState } from 'react';

import { type LessonStatus } from './GrammarPageHelpers';

type PathEntry = {
  rule: { id: string; title: string; grammarCategory: string; cefrLevel?: string };
  status: LessonStatus;
  isUnlocked?: boolean;
};

type PathGroup = {
  module: string;
  entries: PathEntry[];
};

const STATUS_ICON: Record<string, string> = {
  Mastered: '✓',
  'Needs Reading/Writing': 'R/W',
  Practicing: '●',
};

const CEFR_COLORS: Record<string, string> = {
  A1: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  A2: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
  B1: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  B2: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  C1: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  C2: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
};

export const GrammarLessonMap = ({
  pathGroups,
  selectedRule,
  selectRule,
}: {
  pathGroups: PathGroup[];
  selectedRule: { id: string } | null;
  selectRule: (id: string) => void;
  scrollLessonStrip?: (dir: 'left' | 'right') => void;
  lessonStripRef?: React.RefObject<HTMLDivElement | null>;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const totalLessons = pathGroups.reduce((acc, g) => acc + g.entries.length, 0);
  const masteredLessons = pathGroups.reduce(
    (acc, g) => acc + g.entries.filter((e) => e.status === 'Mastered').length,
    0
  );
  const practicingLessons = pathGroups.reduce(
    (acc, g) => acc + g.entries.filter((e) => e.status === 'Practicing').length,
    0
  );

  const masteredPct = totalLessons > 0 ? Math.round((masteredLessons / totalLessons) * 100) : 0;

  return (
    <div className="rounded-[4px] border border-border-soft bg-surface transition-all shadow-sm">
      {/* Header bar */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-background/45 cursor-pointer"
      >
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            Curriculum Map
          </span>
          <span className="text-[11px] text-muted-copy">
            {masteredLessons}/{totalLessons} Mastered
            {practicingLessons > 0 && (
              <span className="ml-2 text-amber-600 font-bold">
                · {practicingLessons} Practicing
              </span>
            )}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {/* Progress bar */}
          <div className="hidden sm:flex flex-col items-end gap-0.5">
            <div className="h-1.5 w-28 overflow-hidden rounded-full bg-[#d9d9e3]">
              <div
                className="h-full bg-success transition-all duration-500"
                style={{ width: `${masteredPct}%` }}
              />
            </div>
            <span className="text-[10px] font-bold text-muted-copy">{masteredPct}%</span>
          </div>
          <ChevronDown
            className={`h-4 w-4 text-muted-copy transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-border-soft bg-background/30 p-5">
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {pathGroups.map((group) => {
              const masteredInGroup = group.entries.filter((e) => e.status === 'Mastered').length;
              const groupPct =
                group.entries.length > 0
                  ? Math.round((masteredInGroup / group.entries.length) * 100)
                  : 0;
              return (
                <div
                  key={group.module}
                  className="flex flex-col rounded-[4px] bg-surface border border-border-soft p-4 shadow-sm"
                >
                  <div className="mb-2 space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wide text-foreground">
                        {group.module}
                      </h3>
                      <span className="text-[10px] font-bold text-muted-copy bg-background px-2 py-0.5 rounded-[4px] border border-border-soft uppercase tracking-wider">
                        {masteredInGroup}/{group.entries.length}
                      </span>
                    </div>
                    {/* Group progress bar */}
                    <div className="h-1 w-full overflow-hidden rounded-full bg-[#d9d9e3]">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${groupPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-1.5">
                    {group.entries.map(({ rule, status, isUnlocked }) => {
                      const selected = rule.id === selectedRule?.id;
                      const locked = isUnlocked === false;
                      const cefrClass = rule.cefrLevel ? (CEFR_COLORS[rule.cefrLevel] ?? '') : '';
                      return (
                        <button
                          key={rule.id}
                          type="button"
                          disabled={locked}
                          onClick={() => selectRule(rule.id)}
                          className={`flex w-full items-center justify-between rounded-[4px] px-3 py-2 text-left transition-all cursor-pointer ${
                            selected
                              ? 'bg-foreground text-background font-bold shadow-sm'
                              : locked
                                ? 'bg-surface-hover/50 text-muted-copy opacity-50 cursor-not-allowed border border-dashed border-border-soft'
                                : 'hover:bg-primary/5 text-foreground hover:text-primary border border-border-soft hover:border-primary/30'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            {rule.cefrLevel && (
                              <span
                                className={`shrink-0 rounded px-1 text-[9px] font-extrabold uppercase ${cefrClass}`}
                              >
                                {rule.cefrLevel}
                              </span>
                            )}
                            <span className="truncate text-xs font-semibold">{rule.title}</span>
                          </div>
                          <span className="flex shrink-0 items-center gap-1.5 ml-1">
                            {locked ? (
                              <span className="text-[10px] text-muted-copy opacity-75">🔒</span>
                            ) : status === 'Mastered' ? (
                              <span className="text-xs font-black text-success">
                                {STATUS_ICON['Mastered']}
                              </span>
                            ) : status === 'Needs Reading/Writing' ? (
                              <span className="text-[10px] bg-warning/10 text-warning px-1.5 py-0.5 rounded-[4px] font-bold uppercase border border-warning/20">
                                {STATUS_ICON['Needs Reading/Writing']}
                              </span>
                            ) : status === 'Practicing' ? (
                              <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                            ) : (
                              <span className="h-1.5 w-1.5 rounded-full bg-primary/40" />
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
