import { Link } from 'react-router-dom';
import { Award, Gauge, ArrowRight } from 'lucide-react';
import { SectionCard } from '@/shared/components/SectionCard';
import { ProgressBar } from '@/shared/components/ProgressBar';
import { Heatmap } from '@/shared/components/Heatmap';
import {
  SKILL_NAMES,
  UserLearningProfile,
  LearningProfileEngine,
  VocabularyMemorySummary,
  getEloBandRange,
} from '@/features/profile';
import { MistakeLogEntry } from '@/features/learning-intelligence';

interface SkillsProgressSectionProps {
  profile: UserLearningProfile;
  memory: VocabularyMemorySummary;
  learningState: {
    streak: number;
    studySessions: Array<{ timestamp: string }>;
  };
  mistakeLog: MistakeLogEntry[];
}

export const SkillsProgressSection = ({
  profile,
  memory,
  learningState,
  mistakeLog,
}: SkillsProgressSectionProps) => {
  const badges = LearningProfileEngine.getBadges(profile, memory);
  const completedTasks = SKILL_NAMES.reduce(
    (total, skill) => total + profile.skills[skill].completedTasks,
    0
  );
  const weeklyCompleted = learningState.studySessions.filter((session) => {
    const timestamp = new Date(session.timestamp).getTime();
    return timestamp >= Date.now() - 7 * 24 * 60 * 60 * 1000;
  }).length;
  const vocabularyMastery =
    memory.total > 0 ? (memory.mastered / memory.total) * 100 : 0;

  return (
    <section
      id="skills"
      className="animate-in fade-in duration-200 max-h-[calc(100vh-12rem)] overflow-y-auto"
    >
      <SectionCard
        title="Skills & Progress"
        subtitle="Your estimated CEFR levels and study progress breakdown"
        icon={Gauge}
      >
        {/* Skill cards grid */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {SKILL_NAMES.map((skill) => {
            const skillProfile = profile.skills[skill];
            const isSimulated = skill === 'listening' || skill === 'speaking';
            return (
              <article
                key={skill}
                className="rounded-[4px] border border-[#d9d9e3] bg-white p-4 relative shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <p className="text-xs font-bold uppercase tracking-wider text-foreground capitalize">
                    {skill}
                  </p>
                  {/* Replaced top badge with the new detailed progress bar below */}
                </div>
                <p className="mt-2 text-[10px] text-muted-copy leading-4 font-medium">
                  {isSimulated
                    ? skill === 'listening'
                      ? 'Simulated listening talks. Available for practice.'
                      : 'Simulated site meeting discussions. Available for practice.'
                    : `Accuracy: ${skillProfile.accuracy}%. Completed Tasks: ${skillProfile.completedTasks}.`}
                </p>
                <div className="mt-4 space-y-3">
                  {/* Current Band Progress */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-end px-1">
                      <div className="flex flex-col items-start">
                        <span className="text-[8px] uppercase tracking-widest text-muted-copy/70 font-bold">
                          Min
                        </span>
                        <span className="text-[10px] font-bold text-muted-copy">
                          {getEloBandRange(skillProfile.cefrBand).min}
                        </span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-bold text-foreground font-mono">
                          {skillProfile.elo} ELO
                        </span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[8px] uppercase tracking-widest text-muted-copy/70 font-bold">
                          Max
                        </span>
                        <span className="text-[10px] font-bold text-muted-copy">
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
              </article>
            );
          })}
        </div>

        {/* Quick Metrics */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            ['Streak', `${learningState.streak} days`],
            ['Missions', completedTasks],
            ['Weekly Goal', `${weeklyCompleted}/${profile.weeklyGoal}`],
            ['Mastered words', memory.mastered],
            ['Weak words', memory.weakWords],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-[4px] border border-[#d9d9e3] bg-white p-3 shadow-sm"
            >
              <p className="text-[9px] font-bold uppercase tracking-wider text-muted-copy">
                {label}
              </p>
              <p className="mt-1 text-base font-bold text-foreground">
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Vocabulary Progress */}
        <div className="mt-6 rounded-[4px] border border-[#d9d9e3] bg-white p-4 shadow-sm">
          <span className="text-[9px] font-bold uppercase tracking-wider text-muted-copy">
            Vocabulary Mastery
          </span>
          <div className="mt-2 flex items-center justify-between gap-3 text-xs font-medium">
            <span>
              {memory.mastered} of {memory.total} terms mastered
            </span>
            <span className="text-[#0047bb] font-bold">
              {memory.dueToday} terms due today
            </span>
          </div>
          <ProgressBar
            value={vocabularyMastery}
            color="emerald"
            className="mt-3"
          />
        </div>

        {/* Unlocked Badges */}
        <div className="mt-6">
          <span className="text-[9px] font-bold uppercase tracking-wider text-muted-copy">
            Achievements & Badges
          </span>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            {badges
              .filter((b) => b.unlocked)
              .slice(0, 4)
              .map((badge) => (
                <div
                  key={badge.id}
                  className="flex items-start gap-3 rounded-[4px] border border-success/20 bg-success/5 p-3.5 shadow-sm"
                >
                  <Award className="h-4 w-4 text-success shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-foreground">
                      {badge.label}
                    </p>
                    <p className="mt-0.5 text-[10px] text-muted-copy leading-4 font-medium">
                      {badge.description}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Mistake Log Summary */}
        <div className="mt-6">
          <span className="text-[9px] font-bold uppercase tracking-wider text-muted-copy">
            Mistake Log Summary
          </span>
          {mistakeLog.length === 0 ? (
            <p className="mt-2 rounded-[4px] border border-dashed border-[#d9d9e3] bg-[#faf8ff] p-4 text-center text-xs text-muted-copy font-medium shadow-sm">
              No mistakes recorded yet.
            </p>
          ) : (
            <div className="mt-2 space-y-2">
              {mistakeLog.slice(0, 2).map((m) => (
                <div
                  key={m.id}
                  className="rounded-[4px] border border-[#d9d9e3] bg-white p-3 text-xs shadow-sm"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-[9px] text-muted-copy uppercase font-bold">
                      {m.category}
                    </span>
                    <span className="text-[9px] font-bold text-rose-600 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded-[4px] shadow-sm">
                      {(m.repetitionCount ?? 1) >= 3
                        ? 'Critical'
                        : `${m.repetitionCount ?? 1}x`}
                    </span>
                  </div>
                  <p className="mt-1 font-bold text-foreground">
                    &quot;{m.originalText}&quot;
                  </p>
                  <p className="mt-0.5 text-muted-copy font-medium">
                    Correction: {m.correction}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Heatmap & Analytics CTA */}
        <div className="mt-6 flex flex-col gap-4 border-t border-[#d9d9e3] pt-4">
          <Heatmap />
          <div className="flex justify-end mt-2">
            <Link
              to="/progress/overview"
              className="inline-flex min-h-9 items-center gap-1.5 rounded-[4px] border border-[#d9d9e3] bg-white px-4 text-xs font-bold uppercase tracking-wider text-[#0047bb] hover:bg-[#0047bb]/5 transition-colors cursor-pointer shadow-sm"
            >
              View Detailed Analytics <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </SectionCard>
    </section>
  );
};
