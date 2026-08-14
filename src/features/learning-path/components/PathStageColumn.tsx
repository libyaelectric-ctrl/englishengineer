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
}: PathStageColumnProps) => (
  <div className="flex min-w-[7rem] flex-col items-center gap-4">
    <div className="flex flex-col items-center gap-0.5">
      <span
        className="rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide"
        style={{ borderColor: stage.color, color: stage.color }}
      >
        {title}
      </span>
      <span className="text-[10px] text-[var(--color-muted-copy)]">
        {stage.totalTerms} {termsLabel}
      </span>
    </div>
    <div className="flex flex-col items-center gap-3">
      {stage.levels.map((level) => (
        <HexagonNode key={level.id} level={level} onSelect={onSelectLevel} />
      ))}
    </div>
  </div>
);