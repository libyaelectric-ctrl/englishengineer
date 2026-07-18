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
  Current: 'border-[#0047bb]/20 bg-[#0047bb]/5 text-[#0047bb]',
  Review: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  Preview: 'border-amber-200 bg-amber-50 text-amber-700',
  Locked: 'border-[#d9d9e3] bg-[#faf8ff] text-muted-copy',
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
  <div className="space-y-2 font-sans">
    <div className="rounded-[4px] border border-[#d9d9e3] bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-copy">
            Content level configuration
          </p>
          <p className="mt-1 text-xs font-bold text-foreground">
            Current CEFR level: {currentLevel}
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
              className={`min-h-9 rounded-[4px] border px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-sm ${
                value === filter.value
                  ? 'border-[#0047bb]/40 bg-[#0047bb]/5 text-[#0047bb]'
                  : 'border-[#d9d9e3] bg-white text-muted-copy hover:border-[#0047bb]/30'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>
    </div>
    {value === 'all-levels' && (
      <p className="rounded-[4px] border border-amber-200 bg-amber-50 p-3.5 text-xs font-medium text-amber-800 leading-relaxed">
        You are viewing all levels. This may include advanced content above your
        current level.
      </p>
    )}
  </div>
);

export const LevelAccessBadge = ({ label }: { label: ContentAccessLabel }) => (
  <span className="inline-flex flex-wrap items-center gap-1.5 font-sans">
    <span
      className={`rounded-[4px] border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${accessStyles[label]}`}
    >
      {label}
    </span>
    {label === 'Locked' && (
      <span className="rounded-[4px] border border-amber-200 bg-amber-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-700">
        Advanced Preview
      </span>
    )}
  </span>
);

export const EmptyLevelState = ({ skill }: { skill: string }) => (
  <div className="rounded-[4px] border border-[#d9d9e3] bg-[#faf8ff] p-6 text-xs text-foreground font-sans">
    <p className="font-bold text-foreground uppercase tracking-wider">
      No current-level content yet
    </p>
    <p className="mt-2 leading-relaxed text-muted-copy font-medium">
      No {skill} content is available for this filter. Choose Review Previous,
      Preview Next, or All Levels intentionally.
    </p>
  </div>
);
