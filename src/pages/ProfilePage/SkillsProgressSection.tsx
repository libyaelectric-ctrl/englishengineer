import { Link } from 'react-router-dom';
import { Award, Gauge, ArrowRight } from 'lucide-react';
import { SectionCard } from '@/shared/components/SectionCard';
import { ProgressBar } from '@/shared/components/ProgressBar';
import {
  SKILL_NAMES,
  UserLearningProfile,
  LearningProfileEngine,
  VocabularyMemorySummary,
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
                className="rounded-xl border border-border-soft bg-surface p-4 relative"
              >
                <div className="flex justify-between items-start">
                  <p className="text-xs font-medium uppercase tracking-wider text-foreground capitalize">
                    {skill}
                  </p>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-medium text-primary">
                    {skillProfile.cefrBand} ({skillProfile.elo} ELO)
                  </span>
                </div>
                <p className="mt-2 text-[10px] text-muted-copy leading-4">
                  {isSimulated
                    ? skill === 'listening'
                      ? 'Simulated listening talks. Available for practice.'
                      : 'Simulated site meeting discussions. Available for practice.'
                    : `Accuracy: ${skillProfile.accuracy}%. Completed Tasks: ${skillProfile.completedTasks}.`}
                </p>
                <ProgressBar
                  value={skillProfile.progressToNextBand}
                  showValue={false}
                  color="cyan"
                  className="mt-4"
                />
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
              className="rounded-xl border border-border-soft bg-surface p-3"
            >
              <p className="text-[9px] font-medium uppercase tracking-wider text-muted-copy">
                {label}
              </p>
              <p className="mt-1 text-base font-medium text-foreground">
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Vocabulary Progress */}
        <div className="mt-6 rounded-xl border border-border-soft bg-surface p-4">
          <span className="text-[9px] font-medium uppercase tracking-wider text-muted-copy">
            Vocabulary Mastery
          </span>
          <div className="mt-2 flex items-center justify-between gap-3 text-xs font-medium">
            <span>
              {memory.mastered} of {memory.total} terms mastered
            </span>
            <span className="text-primary">
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
          <span className="text-[9px] font-medium uppercase tracking-wider text-muted-copy">
            Achievements & Badges
          </span>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            {badges
              .filter((b) => b.unlocked)
              .slice(0, 4)
              .map((badge) => (
                <div
                  key={badge.id}
                  className="flex items-start gap-3 rounded-xl border border-success/20 bg-success/5 p-3.5"
                >
                  <Award className="h-4 w-4 text-success shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-foreground">
                      {badge.label}
                    </p>
                    <p className="mt-0.5 text-[10px] text-muted-copy leading-4">
                      {badge.description}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Mistake Log Summary */}
        <div className="mt-6">
          <span className="text-[9px] font-medium uppercase tracking-wider text-muted-copy">
            Mistake Log Summary
          </span>
          {mistakeLog.length === 0 ? (
            <p className="mt-2 rounded-xl border border-dashed border-border-soft bg-surface p-4 text-center text-xs text-muted-copy">
              No mistakes recorded yet.
            </p>
          ) : (
            <div className="mt-2 space-y-2">
              {mistakeLog.slice(0, 2).map((m) => (
                <div
                  key={m.id}
                  className="rounded-xl border border-border-soft bg-surface p-3 text-xs"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-[9px] text-muted-copy uppercase">
                      {m.category}
                    </span>
                    <span className="text-[9px] font-medium text-error bg-error/10 px-1.5 py-0.5 rounded">
                      {(m.repetitionCount ?? 1) >= 3
                        ? 'Critical'
                        : `${m.repetitionCount ?? 1}x`}
                    </span>
                  </div>
                  <p className="mt-1 font-medium text-foreground">
                    &quot;{m.originalText}&quot;
                  </p>
                  <p className="mt-0.5 text-muted-copy">
                    Correction: {m.correction}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Analytics CTA */}
        <div className="mt-6 flex justify-end border-t border-border-soft pt-4">
          <Link
            to="/analytics"
            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-4 text-xs font-medium text-primary hover:bg-primary/5 transition-colors"
          >
            View Detailed Analytics <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </SectionCard>
    </section>
  );
};
