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
  <div className="rounded-[4px] border border-[#d9d9e3] bg-white p-4 shadow-sm">
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
  <div className="flex items-center justify-between border-b border-[#d9d9e3] pb-2 last:border-b-0 last:pb-0">
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
      ? 'bg-rose-500/10 text-rose-600 border-rose-500/20'
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
  <div className="rounded-[4px] border border-[#d9d9e3] bg-white p-5 shadow-sm">
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

export const AssessmentProfilePanel = ({
  profile,
}: {
  profile: AssessmentProfile;
}) => {
  if (!profile.hasEnoughData) {
    return (
      <div className="rounded-[4px] border border-warning/20 bg-warning/5 p-5 shadow-sm">
        <p className="text-sm font-bold text-warning uppercase tracking-wider">
          Not enough assessment data yet.
        </p>
        <p className="mt-2 text-xs leading-relaxed text-warning/80 font-medium">
          Complete Reading, Writing, Listening, Speaking, or Vocabulary missions
          to build a reliable engineering communication profile.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MiniStat label="Overall" value={`${profile.overallScore ?? 0}%`} />
        <MiniStat
          label="Engineer CEFR"
          value={profile.engineerCefr || 'Pending'}
        />
        <MiniStat
          label="Internal progress index"
          value={`${profile.engineerElo}`}
        />
        <MiniStat label="Confidence" value={`${profile.confidenceScore}%`} />
      </div>

      <div className="rounded-[4px] border border-[#0047bb]/20 bg-[#0047bb]/5 p-4 shadow-sm">
        <p className="text-xs font-bold text-[#0047bb]">
          {profile.certificateDisclaimer}
        </p>
        <p className="mt-2 text-xs leading-relaxed text-[#0047bb]/80 font-medium">
          {profile.confidenceExplanation}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ReadinessCard
          label="Meeting Readiness"
          value={profile.readiness.meetings}
        />
        <ReadinessCard
          label="Report Readiness"
          value={profile.readiness.reports}
        />
        <ReadinessCard
          label="Consultant Readiness"
          value={profile.readiness.consultantCommunication}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-[4px] border border-success/20 bg-success/5 p-5 shadow-sm">
          <p className="text-[10px] font-mono text-success uppercase tracking-widest font-bold">
            Strongest Dimensions
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {profile.strongestDimensions.map((d) => (
              <span
                key={d.dimensionId}
                className="rounded-[4px] border border-success/20 bg-success/10 px-2 py-1 text-[10px] font-mono uppercase text-success font-bold"
              >
                {d.label} {d.score}%
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-[4px] border border-rose-500/20 bg-rose-500/5 p-5 shadow-sm">
          <p className="text-[10px] font-mono text-rose-600 uppercase tracking-widest font-bold">
            Priority Improvement Areas
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {profile.weakestDimensions.map((d) => (
              <span
                key={d.dimensionId}
                className="rounded-[4px] border border-rose-500/20 bg-rose-500/10 px-2 py-1 text-[10px] font-mono uppercase text-rose-600 font-bold"
              >
                {d.label} {d.score}%
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {profile.dimensionScores.map((dimension) => (
          <div
            key={dimension.dimensionId}
            className="rounded-[4px] border border-[#d9d9e3] bg-white p-4 shadow-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-bold text-foreground">
                {dimension.label}
              </p>
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
        ))}
      </div>
    </div>
  );
};
