import { useState } from 'react';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import { StatusPill } from './GrammarPageComponents';
import type { LessonStatus } from './GrammarPageHelpers';

type PathEntry = {
  rule: { id: string; title: string; grammarCategory: string };
  status: LessonStatus;
  isUnlocked?: boolean;
};

type PathGroup = {
  module: string;
  entries: PathEntry[];
};

export const GrammarLessonMap = ({
  pathGroups,
  selectedRule,
  selectRule,
  scrollLessonStrip,
  lessonStripRef,
}: {
  pathGroups: PathGroup[];
  selectedRule: { id: string } | null;
  selectRule: (id: string) => void;
  scrollLessonStrip: (dir: 'left' | 'right') => void;
  lessonStripRef: React.RefObject<HTMLDivElement | null>;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="rounded-lg border border-border-soft bg-surface">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-xs font-black uppercase tracking-wide text-muted-copy">
          Complete Grammar Map
        </span>
        <ChevronDown
          className={`h-4 w-4 text-muted-copy transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>

      {isExpanded && (
        <div className="border-t border-border-soft px-2 py-2">
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
                        {group.entries.map(
                          ({ rule, status, isUnlocked }, idx) => {
                            const selected = rule.id === selectedRule?.id;
                            const locked = isUnlocked === false;
                            return (
                              <button
                                key={rule.id}
                                type="button"
                                disabled={locked}
                                onClick={() => selectRule(rule.id)}
                                className={`flex w-44 shrink-0 flex-col justify-between rounded-lg border px-2 py-1.5 text-left transition-colors ${
                                  selected
                                    ? 'border-foreground bg-foreground text-background'
                                    : locked
                                      ? 'border-border-soft bg-surface-hover opacity-50 cursor-not-allowed'
                                      : 'border-border-soft bg-background hover:border-primary/40'
                                }`}
                              >
                                <span className="line-clamp-2 text-xs font-black leading-4">
                                  <span className="mr-1 text-[10px] opacity-60">
                                    {startNum + idx}.
                                  </span>
                                  {rule.title}
                                </span>
                                <span className="mt-1 flex items-center justify-between gap-1">
                                  {locked ? (
                                    <span className="text-[10px] text-muted-copy leading-3">
                                      Locked 🔒
                                    </span>
                                  ) : status === 'Mastered' ? (
                                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-success" />
                                  ) : (
                                    <Circle className="h-3.5 w-3.5 shrink-0 text-muted-copy" />
                                  )}
                                  <StatusPill status={status} compact />
                                </span>
                              </button>
                            );
                          }
                        )}
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
      )}
    </div>
  );
};
