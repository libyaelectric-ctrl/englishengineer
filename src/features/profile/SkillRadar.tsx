import { SKILL_NAMES, type UserLearningProfile } from './profile.types';

export const SkillRadar = ({ profile }: { profile: UserLearningProfile }) => (
  <div className="relative overflow-hidden rounded-[16px] border border-border-soft bg-surface-hover p-5">
    <div className="pointer-events-none absolute inset-6 rounded-full border border-sky-100" />
    <div className="pointer-events-none absolute inset-12 rounded-full border border-border-soft" />
    <div className="relative grid gap-3 sm:grid-cols-2">
      {SKILL_NAMES.map((skill) => {
        const item = profile.skills[skill];
        const strength = ((item.elo - 1000) / 4000) * 100;
        return (
          <div
            key={skill}
            className="rounded-[12px] border border-white/80 bg-white/90 p-3 shadow-sm"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold capitalize text-muted-copy">
                {skill}
              </span>
              <span className="text-sm font-black text-foreground">
                {item.cefrBand}
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-hover">
              <div
                className="h-full rounded-full bg-sky-600 transition-all duration-500"
                style={{ width: `${Math.max(strength, 2)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  </div>
);
