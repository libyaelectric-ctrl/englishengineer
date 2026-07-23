import React from 'react';
import type { SkillName, UserLearningProfile } from '@/features/profile';

interface SkillRadarChartProps {
  profile: UserLearningProfile;
}

const SKILL_LABELS: { key: SkillName; label: string }[] = [
  { key: 'vocabulary', label: 'Vocabulary' },
  { key: 'grammar', label: 'Grammar' },
  { key: 'reading', label: 'Reading' },
  { key: 'writing', label: 'Writing' },
  { key: 'listening', label: 'Listening' },
  { key: 'speaking', label: 'Speaking' },
];

export const SkillRadarChart: React.FC<SkillRadarChartProps> = ({
  profile,
}) => {
  const size = 260;
  const center = size / 2;
  const radius = 90;
  const totalAxes = SKILL_LABELS.length;

  const getScore = (skillKey: SkillName): number => {
    const sp = profile.skills[skillKey];
    if (!sp) return 50;
    const taskScore = Math.min(100, sp.completedTasks * 10 + 30);
    const score = Math.max(20, Math.min(100, taskScore - sp.weaknessScore));
    return score;
  };

  const getCoordinates = (index: number, value: number) => {
    const angle = ((Math.PI * 2) / totalAxes) * index - Math.PI / 2;
    const r = (value / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  const dataPoints = SKILL_LABELS.map((item, index) => {
    const score = getScore(item.key);
    return getCoordinates(index, score);
  });

  const polygonString = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');
  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  return (
    <div className="flex flex-col items-center rounded-2xl border border-border-soft bg-surface p-5 shadow-sm">
      <div className="flex w-full items-center justify-between border-b border-border-soft pb-3 mb-2">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
            Competency Radar
          </h3>
          <p className="text-[11px] font-medium text-muted-copy">
            6-Axis Technical Skill Footprint
          </p>
        </div>
        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary uppercase tracking-wider">
          CEFR Matched
        </span>
      </div>

      <div className="relative flex items-center justify-center py-2">
        <svg width={size} height={size} className="overflow-visible">
          {gridLevels.map((level) => {
            const levelPoints = SKILL_LABELS.map((_, index) => {
              const { x, y } = getCoordinates(index, level * 100);
              return `${x},${y}`;
            }).join(' ');
            return (
              <polygon
                key={level}
                points={levelPoints}
                className="fill-none stroke-border-soft"
                strokeWidth="1"
                strokeDasharray={level === 1 ? 'none' : '2,2'}
              />
            );
          })}

          {SKILL_LABELS.map((_, index) => {
            const { x, y } = getCoordinates(index, 100);
            return (
              <line
                key={index}
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                className="stroke-border-soft"
                strokeWidth="1"
              />
            );
          })}

          <polygon
            points={polygonString}
            className="fill-primary/20 stroke-primary transition-all duration-500"
            strokeWidth="2"
          />

          {SKILL_LABELS.map((item, index) => {
            const score = getScore(item.key);
            const point = getCoordinates(index, score);
            const labelCoord = getCoordinates(index, 118);

            return (
              <g key={item.key}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="4"
                  className="fill-primary stroke-surface transition-all duration-300"
                  strokeWidth="2"
                />
                <text
                  x={labelCoord.x}
                  y={labelCoord.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-foreground text-[10px] font-bold tracking-tight"
                >
                  {item.label} ({score}%)
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
