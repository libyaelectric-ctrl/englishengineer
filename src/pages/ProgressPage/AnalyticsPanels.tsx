import { ProgressBar } from '@/shared/components/ProgressBar';
import type { AssessmentProfile } from '@/features/assessment';

export const AnalyticsProgress = ({
  label,
  value,
}: {
  label: string;
  value: number;
}) => (
  <div className="space-y-2">
    <div className="flex justify-between text-xs font-medium text-border-hover">
      <span>{label}</span>
      <span className="text-[#0047bb] font-bold font-mono">{value}%</span>
    </div>
    <ProgressBar value={value} color="primary" />
  </div>
);

export const MiniStat = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <div className="rounded-[4px] border border-border-soft bg-surface p-4 shadow-sm">
    <p className="text-[10px] font-mono text-muted-copy uppercase font-bold">
      {label}
    </p>
    <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
  </div>
);

export const DetailRow = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <div className="flex items-center justify-between border-b border-border-soft pb-2 last:border-b-0 last:pb-0">
    <span className="font-mono text-xs uppercase font-bold">{label}</span>
    <span className="text-right font-bold text-foreground">{value}</span>
  </div>
);

export const TagList = ({
  items,
  tone,
  emptyLabel,
}: {
  items: string[];
  tone: 'rose' | 'emerald';
  emptyLabel: string;
}) => {
  const filtered = items.filter((item) => item !== 'None');
  if (filtered.length === 0)
    return <p className="text-xs text-muted-copy font-medium">{emptyLabel}</p>;
  const classes =
    tone === 'rose'
      ? 'bg-rose-500/10 text-error border-rose-500/20'
      : 'bg-success/10 text-success border-success/20';
  return (
    <div className="flex flex-wrap gap-2">
      {filtered.map((item) => (
        <span
          key={item}
          className={`text-[10px] font-mono uppercase border px-2 py-1 rounded-[4px] ${classes}`}
        >
          {item}
        </span>
      ))}
    </div>
  );
};

const ReadinessCard = ({
  label,
  value,
}: {
  label: string;
  value: number | null;
}) => (
  <div className="rounded-[4px] border border-border-soft bg-surface p-5 shadow-sm">
    <div className="flex items-center justify-between text-xs font-medium text-foreground">
      <span>{label}</span>
      <span className="text-[#0047bb] font-bold font-mono">
        {value === null ? 'Pending' : `${value}%`}
      </span>
    </div>
    <div className="mt-3">
      <ProgressBar value={value ?? 0} color="primary" />
    </div>
  </div>
);

const DEFAULT_DIMENSIONS = [
  {
    label: 'Technical Accuracy',
    evidence:
      'Measures accuracy of engineering terms & units across site reports.',
  },
  {
    label: 'Reading Comprehension',
    evidence:
      'Measures speed and precision in technical specifications & specifications.',
  },
  {
    label: 'Professional Writing',
    evidence:
      'Evaluates email clarity, tone, and formal structure in engineering logs.',
  },
  {
    label: 'Listening Retention',
    evidence: 'Tracks retention of oral site instructions & safety briefings.',
  },
  {
    label: 'Speaking Fluency',
    evidence:
      'Assesses pronunciation, vocabulary choice, and confidence in meetings.',
  },
  {
    label: 'Grammar & Syntax',
    evidence:
      'Evaluates passive voice, conditionals, and complex sentence structures.',
  },
];

const toDimensionId = (label: string) =>
  label.toLowerCase().replace(/[^a-z0-9]/g, '-');

const getDimensionsToDisplay = (
  isPending: boolean,
  profile: AssessmentProfile
) =>
  isPending
    ? DEFAULT_DIMENSIONS.map((d) => ({
        dimensionId: toDimensionId(d.label),
        label: d.label,
        score: null,
        evidence: d.evidence,
      }))
    : profile.dimensionScores;

const PendingBaselineBanner = () => (
  <div className="rounded-xl border border-[#0047bb]/30 bg-[#0047bb]/5 p-5 shadow-sm">
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <p className="text-xs font-bold text-[#0047bb] uppercase tracking-wider">
          Engineering Assessment Profile — Initializing Baseline
        </p>
        <p className="mt-1 text-xs leading-relaxed text-muted-copy font-medium">
          Complete practice missions across Reading, Writing, Listening,
          Speaking, or Vocabulary to build your verified engineering
          communication rating.
        </p>
      </div>
      <a
        href="/vocabulary"
        className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-[#0047bb] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#003896] transition-colors"
      >
        Start Diagnostic
      </a>
    </div>
  </div>
);

const OverviewStats = ({
  isPending,
  profile,
}: {
  isPending: boolean;
  profile: AssessmentProfile;
}) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    <MiniStat
      label="Overall"
      value={isPending ? 'Baseline' : `${profile.overallScore ?? 0}%`}
    />
    <MiniStat
      label="Engineer CEFR"
      value={profile.engineerCefr || 'A2-B1 Baseline'}
    />
    <MiniStat
      label="Internal progress index"
      value={`${profile.engineerElo ?? 1000}`}
    />
    <MiniStat
      label="Confidence"
      value={isPending ? 'Initial' : `${profile.confidenceScore}%`}
    />
  </div>
);

const DisclaimerBox = ({
  disclaimer,
  explanation,
}: {
  disclaimer: string | null;
  explanation: string | null;
}) => (
  <div className="rounded-xl border border-[#0047bb]/20 bg-surface/80 p-4 shadow-sm">
    <p className="text-xs font-bold text-[#0047bb]">
      {disclaimer || 'Engineering Communication Standards & CEFR Mapping'}
    </p>
    <p className="mt-1.5 text-xs leading-relaxed text-muted-copy font-medium">
      {explanation ||
        'Scores update dynamically as you complete practice sessions across site communication modules.'}
    </p>
  </div>
);

const ReadinessGrid = ({
  readiness,
}: {
  readiness: AssessmentProfile['readiness'];
}) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
    <ReadinessCard
      label="Meeting Readiness"
      value={readiness?.meetings ?? null}
    />
    <ReadinessCard
      label="Report Readiness"
      value={readiness?.reports ?? null}
    />
    <ReadinessCard
      label="Consultant Readiness"
      value={readiness?.consultantCommunication ?? null}
    />
  </div>
);

const DimensionTag = ({
  d,
  variant,
}: {
  d: { dimensionId: string; label: string; score: number | null };
  variant: 'strong' | 'weak';
}) => {
  const color =
    variant === 'strong'
      ? 'border-success/20 bg-success/10 text-success'
      : 'border-rose-500/20 bg-rose-500/10 text-error';
  return (
    <span
      key={d.dimensionId}
      className={`rounded-lg border px-2.5 py-1 text-[10px] font-mono uppercase font-bold ${color}`}
    >
      {d.label} {d.score}%
    </span>
  );
};

const StrengthWeaknessPanel = ({ profile }: { profile: AssessmentProfile }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <div className="rounded-xl border border-success/20 bg-success/5 p-5 shadow-sm">
      <p className="text-[10px] font-mono text-success uppercase tracking-widest font-bold">
        Strongest Dimensions
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {profile.strongestDimensions.map((d) => (
          <DimensionTag key={d.dimensionId} d={d} variant="strong" />
        ))}
      </div>
    </div>
    <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-5 shadow-sm">
      <p className="text-[10px] font-mono text-error uppercase tracking-widest font-bold">
        Priority Improvement Areas
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {profile.weakestDimensions.map((d) => (
          <DimensionTag key={d.dimensionId} d={d} variant="weak" />
        ))}
      </div>
    </div>
  </div>
);

const DimensionCard = ({
  dimension,
}: {
  dimension: {
    dimensionId: string;
    label: string;
    score: number | null;
    evidence: string;
  };
}) => (
  <div
    key={dimension.dimensionId}
    className="rounded-xl border border-[#0047bb]/20 bg-surface p-4 shadow-sm hover:border-[#0047bb]/40 transition-colors"
  >
    <div className="flex items-center justify-between gap-3">
      <p className="text-xs font-bold text-foreground">{dimension.label}</p>
      <span className="text-[10px] font-mono font-bold text-[#0047bb]">
        {dimension.score === null ? 'Pending' : `${dimension.score}%`}
      </span>
    </div>
    <div className="mt-3">
      <ProgressBar value={dimension.score ?? 0} color="primary" />
    </div>
    <p className="mt-2 text-[10px] leading-relaxed text-muted-copy font-medium">
      {dimension.evidence}
    </p>
  </div>
);

const DimensionCardsGrid = ({
  dimensions,
}: {
  dimensions: Array<{
    dimensionId: string;
    label: string;
    score: number | null;
    evidence: string;
  }>;
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
    {dimensions.map((dimension) => (
      <DimensionCard key={dimension.dimensionId} dimension={dimension} />
    ))}
  </div>
);

const QuickWorkoutBanner = () => (
  <div className="rounded-xl border border-[#0047bb]/30 bg-[#0047bb]/5 p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
    <div className="flex items-center gap-3">
      <div className="rounded-lg bg-[#0047bb]/10 px-2.5 py-1 text-[#0047bb] font-bold text-[10px] uppercase tracking-wider">
        ⚡ Quick Workout
      </div>
      <div>
        <p className="text-xs font-bold text-foreground">
          Priority Focus: Speaking Fluency & Technical Register
        </p>
        <p className="text-[11px] text-muted-copy font-medium">
          Targeted 3-minute practice mission to boost your lowest dimension
          score.
        </p>
      </div>
    </div>
    <a
      href="/speaking"
      className="shrink-0 rounded-lg bg-[#0047bb] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#003896] transition-colors cursor-pointer"
    >
      🚀 Start 3-min Workout
    </a>
  </div>
);

export const AssessmentProfilePanel = ({
  profile,
}: {
  profile: AssessmentProfile;
}) => {
  const isPending = !profile.hasEnoughData;
  const dimensionsToDisplay = getDimensionsToDisplay(isPending, profile);

  return (
    <div className="space-y-6">
      {isPending && <PendingBaselineBanner />}

      <OverviewStats isPending={isPending} profile={profile} />

      <DisclaimerBox
        disclaimer={profile.certificateDisclaimer}
        explanation={profile.confidenceExplanation}
      />

      <ReadinessGrid readiness={profile.readiness} />

      {!isPending && <StrengthWeaknessPanel profile={profile} />}

      <DimensionCardsGrid dimensions={dimensionsToDisplay} />

      <QuickWorkoutBanner />
    </div>
  );
};
