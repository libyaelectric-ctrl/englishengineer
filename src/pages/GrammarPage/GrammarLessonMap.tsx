import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { type LessonStatus } from './GrammarPageHelpers';

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

  return (
    <div className="rounded-[4px] border border-border-soft bg-surface transition-all shadow-sm">
      {/* Header bar */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-background/45 cursor-pointer"
      >
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-bold uppercase tracking-wider text-[#0047bb]">
            Curriculum Map
          </span>
          <span className="text-[11px] text-muted-copy">
            {masteredLessons} of {totalLessons} Lessons Mastered
          </span>
        </div>
        <div className="flex items-center gap-3">
          {/* Progress bar */}
          <div className="hidden h-1.5 w-24 overflow-hidden rounded-[4px] bg-[#d9d9e3] sm:block">
            <div
              className="h-full bg-success transition-all duration-300"
              style={{
                width: `${totalLessons > 0 ? (masteredLessons / totalLessons) * 100 : 0}%`,
              }}
            />
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
              const masteredInGroup = group.entries.filter(
                (e) => e.status === 'Mastered'
              ).length;
              return (
                <div
                  key={group.module}
                  className="flex flex-col rounded-[4px] bg-surface border border-border-soft p-4 shadow-sm"
                >
                  <div className="mb-3 flex items-center justify-between border-b border-border-soft pb-2">
                    <h3 className="text-xs font-bold uppercase tracking-wide text-foreground">
                      {group.module}
                    </h3>
                    <span className="text-[9px] font-bold text-muted-copy bg-background px-2 py-0.5 rounded-[4px] border border-border-soft uppercase tracking-wider">
                      {masteredInGroup}/{group.entries.length} Passed
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-1.5">
                    {group.entries.map(({ rule, status, isUnlocked }) => {
                      const selected = rule.id === selectedRule?.id;
                      const locked = isUnlocked === false;
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
                                : 'hover:bg-[#0047bb]/5 text-foreground hover:text-[#0047bb] border border-border-soft hover:border-[#0047bb]/30'
                          }`}
                        >
                          <span className="truncate text-xs font-semibold pr-2">
                            {rule.title}
                          </span>
                          <span className="flex shrink-0 items-center gap-1.5">
                            {locked ? (
                              <span className="text-[10px] text-muted-copy opacity-75">
                                🔒
                              </span>
                            ) : status === 'Mastered' ? (
                              <span className="text-xs font-black text-success">
                                ✓
                              </span>
                            ) : status === 'Needs Reading/Writing' ? (
                              <span className="text-[9px] bg-warning/10 text-warning px-1.5 py-0.5 rounded-[4px] font-bold uppercase border border-warning/20">
                                R/W
                              </span>
                            ) : (
                              <span className="h-1.5 w-1.5 rounded-full bg-[#0047bb]/40" />
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
