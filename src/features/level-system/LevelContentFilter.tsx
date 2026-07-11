import {
  ContentAccessLabel,
  ContentLevelFilter,
  CefrLevel,
} from './level-system.types';

const FILTERS: Array<{ value: ContentLevelFilter; label: string }> = [
  { value: 'my-level', label: 'My Level' },
  { value: 'review-previous', label: 'Review Previous' },
  { value: 'preview-next', label: 'Preview Next' },
  { value: 'all-levels', label: 'All Levels' },
];

const accessStyles: Record<ContentAccessLabel, string> = {
  Current: 'border-primary/20 bg-primary/5 text-primary',
  Review: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  Preview: 'border-amber-200 bg-amber-50 text-amber-700',
  Locked: 'border-border-soft bg-surface-hover text-muted-copy',
};

interface LevelContentFilterProps {
  value: ContentLevelFilter;
  currentLevel: CefrLevel;
  onChange: (value: ContentLevelFilter) => void;
}

export const LevelContentFilter = ({
  value,
  currentLevel,
  onChange,
}: LevelContentFilterProps) => (
  <div className="space-y-2">
    <div className="rounded-xl border border-border-soft bg-surface p-3 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase text-muted-copy">
            Content level
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground">
            Current skill level: {currentLevel}
          </p>
        </div>
        <div
          className="grid grid-cols-2 gap-2 sm:flex"
          aria-label="Content level filter"
        >
          {FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => onChange(filter.value)}
              aria-pressed={value === filter.value}
              className={`min-h-10 rounded-[10px] border px-3 py-2 text-xs font-semibold transition-colors ${
                value === filter.value
                  ? 'border-sky-300 bg-primary/5 text-primary'
                  : 'border-border-soft bg-surface text-muted-copy hover:border-primary/20 hover:bg-primary/5/60'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>
    </div>
    {value === 'all-levels' && (
      <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
        You are viewing all levels. This may include advanced content above your
        current level.
      </p>
    )}
  </div>
);

export const LevelAccessBadge = ({ label }: { label: ContentAccessLabel }) => (
  <span className="inline-flex flex-wrap items-center gap-1">
    <span
      className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${accessStyles[label]}`}
    >
      {label}
    </span>
    {label === 'Locked' && (
      <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-700">
        Advanced Preview
      </span>
    )}
  </span>
);

export const EmptyLevelState = ({ skill }: { skill: string }) => (
  <div className="rounded-xl border border-border-soft bg-surface-hover p-6 text-sm text-foreground">
    <p className="font-semibold text-foreground">
      No current-level content yet
    </p>
    <p className="mt-1">
      No {skill} content is available for this filter. Choose Review Previous,
      Preview Next, or All Levels intentionally.
    </p>
  </div>
);
