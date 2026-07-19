import type { ComponentType } from 'react';
import type { AnalyticsTimelinePoint } from '@/features/analytics';

export const WeeklyActivityChart = ({ values }: { values: number[] }) => {
  const maxValue = Math.max(...values, 1);
  return (
    <div className="rounded-[4px] border border-border-soft bg-surface p-5 shadow-sm">
      <p className="text-[10px] font-mono text-muted-copy uppercase tracking-widest font-bold">
        Weekly Activity
      </p>
      <div className="h-36 flex items-end gap-2 mt-5">
        {values.map((value, index) => (
          <div
            key={`${value}-${index}`}
            className="flex-1 flex flex-col items-center gap-2"
          >
            <div
              className="w-full rounded-t bg-[#0047bb]/80 min-h-[6px]"
              style={{ height: `${Math.max(6, (value / maxValue) * 120)}px` }}
            />
            <span className="text-[9px] font-mono text-muted-copy font-bold">
              {value}m
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const StudyHeatmap = ({
  values,
}: {
  values: Array<{ date: string; count: number }>;
}) => (
  <div className="rounded-[4px] border border-border-soft bg-surface p-5 shadow-sm">
    <p className="text-[10px] font-mono text-muted-copy uppercase tracking-widest font-bold">
      Study Heatmap
    </p>
    <div className="grid grid-cols-7 gap-2 mt-5">
      {values.map((item) => (
        <div
          key={item.date}
          title={`${item.date}: ${item.count} sessions`}
          className={`aspect-square rounded-[4px] border border-border-soft ${
            item.count >= 3
              ? 'bg-success'
              : item.count === 2
                ? 'bg-[#0047bb]'
                : item.count === 1
                  ? 'bg-[#0047bb]/40'
                  : 'bg-surface-hover'
          }`}
        />
      ))}
    </div>
  </div>
);

export const SkillRadar = ({
  skills,
}: {
  skills: Array<{ module: string; averageScore: number }>;
}) => {
  const size = 220;
  const center = size / 2;
  const radius = 82;
  const points = skills.map((skill, index) => {
    const angle = (Math.PI * 2 * index) / skills.length - Math.PI / 2;
    const distance = radius * (skill.averageScore / 100);
    return {
      x: center + Math.cos(angle) * distance,
      y: center + Math.sin(angle) * distance,
      labelX: center + Math.cos(angle) * (radius + 22),
      labelY: center + Math.sin(angle) * (radius + 22),
      skill,
    };
  });
  const polygon = points.map((point) => `${point.x},${point.y}`).join(' ');

  return (
    <div className="overflow-x-auto rounded-[4px] border border-border-soft bg-surface p-5 shadow-sm">
      <p className="text-[10px] font-mono text-muted-copy uppercase tracking-widest font-bold">
        Skill Radar
      </p>
      <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto mt-4 h-64 w-64">
        {[0.25, 0.5, 0.75, 1].map((ratio) => (
          <circle
            key={ratio}
            cx={center}
            cy={center}
            r={radius * ratio}
            fill="none"
            stroke="#d9d9e3"
            strokeWidth="1"
          />
        ))}
        <polygon
          points={polygon}
          fill="rgba(0, 71, 187, 0.15)"
          stroke="#0047bb"
          strokeWidth="2"
        />
        {points.map((point) => (
          <g key={point.skill.module}>
            <circle cx={point.x} cy={point.y} r="4" fill="#0047bb" />
            <text
              x={point.labelX}
              y={point.labelY}
              textAnchor="middle"
              fill="var(--muted-copy)"
              className="text-[9px] font-bold font-mono"
            >
              {point.skill.module}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

export const TimelinePanel = ({
  title,
  icon: Icon,
  points,
  footer,
}: {
  title: string;
  icon: ComponentType<{ className?: string }>;
  points: AnalyticsTimelinePoint[];
  footer: string;
}) => (
  <div className="space-y-5">
    <div className="flex items-center gap-2 text-foreground">
      <Icon className="h-5 w-5 text-[#0047bb]" />
      <h3 className="text-lg font-bold">{title}</h3>
    </div>
    <LineSvg points={points} />
    <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar pr-2">
      {points
        .slice()
        .reverse()
        .slice(0, 8)
        .map((point) => (
          <div
            key={`${point.date}-${point.label}-${point.value}`}
            className="flex items-center justify-between rounded-[4px] border border-border-soft bg-surface p-3 shadow-sm"
          >
            <div>
              <p className="text-xs font-bold text-foreground">{point.label}</p>
              <p className="text-[9px] font-mono text-muted-copy">
                {point.date}
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-[#0047bb]">
              {point.value}
            </span>
          </div>
        ))}
    </div>
    <p className="text-[10px] font-mono text-muted-copy text-center uppercase tracking-widest">
      {footer}
    </p>
  </div>
);

const LineSvg = ({ points }: { points: AnalyticsTimelinePoint[] }) => {
  if (points.length === 0)
    return <p className="text-xs text-muted-copy">No timeline data yet.</p>;

  const width = 600;
  const height = 180;
  const padding = 26;
  const values = points.map((point) => point.value);
  const maxValue = Math.max(...values, 1);
  const minValue = Math.min(...values, 0);
  const range = maxValue - minValue || 1;
  const svgPoints = points.map((point, index) => {
    const x =
      padding +
      (index / Math.max(points.length - 1, 1)) * (width - padding * 2);
    const y =
      height -
      padding -
      ((point.value - minValue) / range) * (height - padding * 2);
    return { x, y, point };
  });
  const path = svgPoints
    .map((item, index) => `${index === 0 ? 'M' : 'L'} ${item.x} ${item.y}`)
    .join(' ');

  return (
    <div className="relative overflow-x-auto rounded-[4px] border border-border-soft bg-surface p-4 shadow-sm">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-44 overflow-visible"
      >
        <path
          d={path}
          fill="none"
          stroke="#0047bb"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {svgPoints.map((item) => (
          <g key={`${item.point.date}-${item.point.label}-${item.point.value}`}>
            <circle
              cx={item.x}
              cy={item.y}
              r="4"
              fill="var(--foreground)"
              stroke="#0047bb"
              strokeWidth="2"
            />
          </g>
        ))}
      </svg>
    </div>
  );
};
