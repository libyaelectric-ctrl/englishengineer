import { Fragment } from 'react';

import type { PathStage } from '../learning-path.types';
import { HexagonNode } from './HexagonNode';

export interface PathStageColumnProps {
  stage: PathStage;
  /** Translated band label, e.g. "A1 — Foundation". */
  title: string;
  /** Translated term-count label. */
  termsLabel: string;
  onSelectLevel: (levelId: string) => void;
}

/** One CEFR band column of the roadmap (Gantt-style stage). */
export const PathStageColumn = ({
  stage,
  title,
  termsLabel,
  onSelectLevel,
}: PathStageColumnProps) => {
  const masteredRatio =
    stage.totalTerms > 0 ? Math.round((stage.masteredTerms / stage.totalTerms) * 100) : 0;

  return (
    <div className="flex min-w-[7rem] flex-col items-center gap-4">
      <div className="flex flex-col items-center gap-1">
        <span
          className="rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide"
          style={{ borderColor: stage.color, color: stage.color }}
        >
          {title}
        </span>
        <span className="text-[10px] tabular-nums text-[var(--color-muted-copy)]">
          {stage.masteredTerms}/{stage.totalTerms} {termsLabel}
        </span>
        <div className="h-1 w-16 overflow-hidden rounded-full bg-[var(--color-border-soft)]">
          <div
            className="h-full rounded-full transition-[width] duration-700 ease-out"
            style={{ width: `${masteredRatio}%`, backgroundColor: stage.color }}
          />
        </div>
      </div>
      <div className="flex flex-col items-center gap-3">
        {stage.levels.map((level, index) => (
          <Fragment key={level.id}>
            {index > 0 && (
              <div className="h-3 w-0.5 shrink-0 rounded-full bg-[var(--color-border-soft)]" />
            )}
            <HexagonNode level={level} onSelect={onSelectLevel} />
            <span className="mt-1 text-[9px] tabular-nums text-[var(--color-muted-copy)]">
              {Math.round(level.masteryRatio * level.termCount)}/{level.termCount}
            </span>
          </Fragment>
        ))}
      </div>
    </div>
  );
};