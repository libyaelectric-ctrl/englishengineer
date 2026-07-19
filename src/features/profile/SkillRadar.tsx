import { SKILL_NAMES, type UserLearningProfile } from './profile.types';

export const SkillRadar = ({ profile }: { profile: UserLearningProfile }) => (
  <div className="relative overflow-hidden rounded-[4px] border border-border-soft bg-surface p-5 font-sans">
    {/* Technical alignment grid for the background */}
    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808003_1px,transparent_1px),linear-gradient(to_bottom,#80808003_1px,transparent_1px)] bg-[size:16px_16px]" />

    <div className="relative grid gap-3 sm:grid-cols-2 z-10">
      {SKILL_NAMES.map((skill) => {
        const item = profile.skills[skill];
        const strength = ((item.elo - 1000) / 4000) * 100;
        return (
          <div
            key={skill}
            className="rounded-[4px] border border-border-soft bg-surface-hover p-3 shadow-sm"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-copy">
                {skill}
              </span>
              <span className="text-xs font-bold text-foreground font-mono">
                {item.cefrBand} ({item.elo} ELO)
              </span>
            </div>
            <div className="mt-2.5 h-2 overflow-hidden border border-border-soft bg-surface rounded-[0px]">
              <div
                className="h-full bg-[#0047bb] transition-all duration-500 rounded-[0px]"
                style={{ width: `${Math.max(strength, 2)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  </div>
);
