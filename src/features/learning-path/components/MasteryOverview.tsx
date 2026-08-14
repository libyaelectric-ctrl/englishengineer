import { useLocalizationStore } from '@/features/localization';

export interface MasteryOverviewProps {
  /** 0-100 overall term mastery for the roadmap. */
  percent: number;
  /** Number of completed path levels. */
  levelsCompleted: number;
  /** Total number of path levels. */
  levelsTotal: number;
  /** Discipline accent color for the bar fill. */
  accent: string;
}

/** Overall roadmap mastery summary with an animated completion bar. */
export const MasteryOverview = ({
  percent,
  levelsCompleted,
  levelsTotal,
  accent,
}: MasteryOverviewProps) => {
  const translate = useLocalizationStore((state) => state.translate);
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));

  return (
    <div className="mb-5 rounded-[var(--radius-card)] border border-[var(--color-border-soft)] bg-[var(--surface)]/50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-baseline gap-3">
          <span className="text-sm font-bold text-[var(--foreground)]">
            {translate('learningpath.overallMastery')}
          </span>
          <span className="text-xl font-extrabold tabular-nums" style={{ color: accent }}>
            {clamped}%
          </span>
        </div>
        <span className="text-[11px] font-semibold text-[var(--color-muted-copy)]">
          {levelsCompleted} / {levelsTotal} {translate('learningpath.levelsCompleted')}
        </span>
      </div>
      <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-[var(--color-border-soft)]/70">
        <div
          className="h-full rounded-full transition-[width] duration-700 ease-out"
          style={{ width: `${clamped}%`, backgroundColor: accent }}
        />
      </div>
    </div>
  );
};
