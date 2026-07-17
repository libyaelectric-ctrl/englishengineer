import React from 'react';
import { Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  type SkillName,
  type UserLearningProfile,
  getEloBandRange,
} from '@/features/profile';
import { ProgressBar } from '@/shared/components/ProgressBar';
import { SectionCard } from '@/shared/components/SectionCard';
import { Sparkline } from './Sparkline';
import { LessonPathEngine } from '@/features/learning-orchestrator';

interface SkillMeta {
  label: string;
  route: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface ProgressCockpitProps {
  skillNames: readonly SkillName[];
  skillMeta: Record<SkillName, SkillMeta>;
  profile: UserLearningProfile;
  skillSparklineData: Record<SkillName, number[]>;
}

export const ProgressCockpit = React.memo(({
  skillNames,
  skillMeta,
  profile,
  skillSparklineData,
}: ProgressCockpitProps) => {
  const navigate = useNavigate();

  return (
    <SectionCard
      title="Progress Cockpit"
      subtitle={`${skillNames.length} skills tracked — Detailed ELO, CEFR, and Global progression`}
      icon={Target}
      className="animate-on-scroll"
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {skillNames.map((skill) => {
          const skillProfile = profile.skills[skill];
          const meta = skillMeta[skill];
          const Icon = meta.icon;
          const lesson = LessonPathEngine.getSkillProgress(profile, skill)
            .lesson.number;
          const isSimulated = skill === 'listening' || skill === 'speaking';

          return (
            <button
              key={skill}
              type="button"
              onClick={() => navigate(meta.route)}
              className="group min-w-0 rounded-card border border-border-soft bg-surface p-4 text-left transition-all hover:border-border-hover hover:bg-surface-hover/20 card-interactive relative transition-transform hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="rounded-[8px] border border-border-soft bg-surface-hover p-1.5 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="text-right">
                  <span className="block text-sm font-bold text-foreground">
                    {meta.label}
                  </span>
                  <span className="block text-[10px] font-medium text-muted-copy">
                    Lesson {lesson}
                  </span>
                </div>
              </div>

              <p className="mt-3 text-[10px] text-muted-copy leading-4">
                {isSimulated
                  ? skill === 'listening'
                    ? 'Simulated listening talks. Available for practice.'
                    : 'Simulated site meeting discussions. Available for practice.'
                  : `Accuracy: ${skillProfile.accuracy}%. Completed Tasks: ${skillProfile.completedTasks}.`}
              </p>

              <Sparkline
                data={skillSparklineData[skill]}
                className="w-full h-6 text-primary/40"
              />

              <div className="mt-4 space-y-3">
                {/* Current Band Progress */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-end px-1">
                    <div className="flex flex-col items-start">
                      <span className="text-[8px] uppercase tracking-widest text-muted-copy/70">
                        Min
                      </span>
                      <span className="text-[10px] font-medium text-muted-copy">
                        {getEloBandRange(skillProfile.cefrBand).min}
                      </span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-bold text-foreground">
                        {skillProfile.elo} ELO
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[8px] uppercase tracking-widest text-muted-copy/70">
                        Max
                      </span>
                      <span className="text-[10px] font-medium text-muted-copy">
                        {getEloBandRange(skillProfile.cefrBand).max}
                      </span>
                    </div>
                  </div>
                  <ProgressBar
                    value={skillProfile.progressToNextBand}
                    showValue={false}
                    color="cyan"
                    className=""
                  />
                  <div className="flex justify-between items-center px-1 pt-0.5">
                    <span className="text-[10px] font-bold text-primary">
                      {skillProfile.cefrBand} Level
                    </span>
                    <span className="text-[9px] font-medium text-muted-copy">
                      {skillProfile.progressToNextBand}% to next level
                    </span>
                  </div>
                </div>

                {/* Global Progress */}
                <div className="space-y-1.5 border-t border-border-soft/50 pt-2.5">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[9px] font-medium text-muted-copy">
                      Global Progress (A1 - C2+)
                    </span>
                    <span className="text-[9px] font-bold text-foreground">
                      {Math.round(((skillProfile.elo - 1000) / 4000) * 100)}%
                    </span>
                  </div>
                  <ProgressBar
                    value={((skillProfile.elo - 1000) / 4000) * 100}
                    showValue={false}
                    color="emerald"
                    className="h-1.5"
                  />
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[8px] text-muted-copy/70">
                      1000 ELO (A1)
                    </span>
                    <span className="text-[8px] text-muted-copy/70">
                      5000 ELO (C2+)
                    </span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </SectionCard>
  );
});
ProgressCockpit.displayName = 'ProgressCockpit';
