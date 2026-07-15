import { FormEvent, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award,
  BookOpenCheck,
  Calendar,
  CheckCircle2,
  Check,
  ClipboardList,
  Coins,
  FileChartColumn,
  Flame,
  Gift,
  Layers,
  Plus,
  Star,
  Trash2,
  Trophy,
  Zap,
} from 'lucide-react';
import { useLearningStore, type LearningState } from '@/core/learning';
import { useAuthStore } from '@/features/auth';
import {
  GamificationMissionProgress,
  GamificationService,
  useGamificationStore,
} from '@/features/gamification';
import { canAccessFeature, useBillingStore } from '@/features/billing';
import { AssessmentService } from '@/features/assessment';
import { buildLevelProfile } from '@/features/level-system';
import { BetaService } from '@/features/beta';
import {
  CAREER_ROLES,
  MISTAKE_CATEGORIES,
  MISTAKE_SUGGESTIONS,
  MistakeCategory,
  buildSevenDayReport,
  getPersonalizedTasks,
  isTaskCompletedToday,
  useLearningIntelligenceStore,
} from '@/features/learning-intelligence';
import { MetricCard } from '@/shared/components/MetricCard';
import { SectionCard } from '@/shared/components/SectionCard';
import { ProgressBar } from '@/shared/components/ProgressBar';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';

const MissionList = ({
  missions,
}: {
  missions: GamificationMissionProgress[];
}) => (
  <div className="space-y-4">
    {missions.map((mission) => {
      const value = Math.round(
        (mission.progress / mission.template.target) * 100
      );
      return (
        <div
          key={mission.template.id}
          className="rounded-xl border border-border-soft bg-surface-hover p-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <p className="text-[10px] font-mono text-primary uppercase tracking-widest font-medium">
                {mission.template.category}
              </p>
              <h4 className="mt-1 text-base font-medium text-foreground">
                {mission.template.title}
              </h4>
              <p className="text-xs text-muted-copy mt-1">
                {mission.template.description}
              </p>
            </div>
            <span
              className={`text-[10px] font-mono uppercase border px-2 py-1 rounded-lg self-start ${
                mission.isCompleted
                  ? 'bg-success/10 text-success border-success/20'
                  : 'border-border-soft bg-surface text-muted-copy'
              }`}
            >
              {mission.isCompleted
                ? 'Complete'
                : `${mission.progress}/${mission.template.target}`}
            </span>
          </div>
          <div className="mt-4 space-y-2">
            <ProgressBar
              value={value}
              color={mission.isCompleted ? 'emerald' : 'primary'}
            />
            <div className="flex justify-between text-[10px] font-mono text-muted-copy">
              <span>+{mission.template.xpReward} XP</span>
              <span>+{mission.template.coinReward} coins</span>
            </div>
          </div>
        </div>
      );
    })}
  </div>
);

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between border-b border-border-soft pb-2 last:border-b-0 last:pb-0">
    <span className="font-mono text-xs uppercase">{label}</span>
    <span className="font-medium text-foreground">{value}</span>
  </div>
);

const MiniStat = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl border border-border-soft bg-surface-hover p-4">
    <p className="text-[10px] font-mono text-muted-copy uppercase">{label}</p>
    <p className="mt-1 text-2xl font-medium text-foreground">{value}</p>
  </div>
);

const FeedList = ({
  items,
  emptyLabel,
}: {
  items: Array<{
    id: string;
    title: string;
    description: string;
    timestamp: string;
  }>;
  emptyLabel: string;
}) => (
  <div className="space-y-3 max-h-72 overflow-y-auto custom-scrollbar pr-1">
    {items.map((item) => (
      <div
        key={item.id}
        className="rounded-xl border border-border-soft bg-surface-hover p-4"
      >
        <p className="text-sm font-medium text-foreground">{item.title}</p>
        <p className="text-xs text-muted-copy mt-1">{item.description}</p>
        <p className="text-[10px] font-mono text-primary mt-2">
          {new Date(item.timestamp).toLocaleDateString()}
        </p>
      </div>
    ))}
    {items.length === 0 && (
      <p className="text-xs text-muted-copy">{emptyLabel}</p>
    )}
  </div>
);

const PersonalLeaderboard = ({
  learningState,
}: {
  learningState: LearningState;
}) => {
  const rows = useMemo(() => {
    const days: { date: string; xp: number; taskCount: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toDateString();
      const label = d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      const xp = learningState.xpHistory
        .filter((h) => new Date(h.date).toDateString() === dateStr)
        .reduce((sum, h) => sum + h.amount, 0);
      const taskCount = learningState.studySessions.filter(
        (s) => new Date(s.timestamp).toDateString() === dateStr
      ).length;
      days.push({ date: label, xp, taskCount });
    }
    return days;
  }, [learningState.xpHistory, learningState.studySessions]);

  return (
    <SectionCard
      title="Personal Score History"
      subtitle="Last 7 days"
      icon={Trophy}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border-soft">
              <th className="pb-2 text-left font-mono uppercase text-muted-copy">
                Date
              </th>
              <th className="pb-2 text-right font-mono uppercase text-muted-copy">
                XP
              </th>
              <th className="pb-2 text-right font-mono uppercase text-muted-copy">
                Tasks
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.date} className="border-b border-border-soft/50 last:border-b-0">
                <td className="py-2 font-medium text-foreground">{row.date}</td>
                <td className="py-2 text-right font-mono text-foreground">
                  {row.xp > 0 ? `+${row.xp}` : '—'}
                </td>
                <td className="py-2 text-right font-mono text-foreground">
                  {row.taskCount > 0 ? row.taskCount : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
};

export const ProgressNextStepsTab = () => {
  const navigate = useNavigate();
  const learning = useLearningStore();
  const learningState = useLearningStore();
  const subscription = useBillingStore((state) => state.subscription);
  const persistedGamification = useGamificationStore();
  const claimDailyLoginReward = useGamificationStore(
    (state) => state.claimDailyLoginReward
  );
  const gamification = GamificationService.getSummary(
    learningState,
    persistedGamification
  );
  const unlockedAchievements = learningState.achievements.filter(
    (achievement) => achievement.unlocked
  ).length;
  const fullGamificationEntitlement = canAccessFeature(
    subscription,
    'fullGamification'
  );

  // Learning Intelligence
  const intelligence = useLearningIntelligenceStore();
  const currentUser = useAuthStore((state) => state.currentUser);
  const [category, setCategory] = useState<MistakeCategory>('grammar');
  const [originalText, setOriginalText] = useState('');
  const [correction, setCorrection] = useState('');
  const assessment = AssessmentService.getProfile(learning);
  const levelProfile = buildLevelProfile(learning, currentUser?.id);
  const weakArea = assessment.weakestDimensions[0]?.label ?? 'Writing';
  const tasks = useMemo(
    () =>
      getPersonalizedTasks(
        intelligence.careerRole,
        levelProfile.overallLevel,
        weakArea,
        intelligence.mistakeLog,
        intelligence.completedTaskDates
      ),
    [
      intelligence.careerRole,
      intelligence.completedTaskDates,
      intelligence.mistakeLog,
      levelProfile.overallLevel,
      weakArea,
    ]
  );
  const report = useMemo(
    () =>
      buildSevenDayReport(
        learning,
        assessment,
        intelligence.completedTaskDates,
        intelligence.mistakeLog,
        intelligence.careerRole,
        levelProfile.overallLevel
      ),
    [
      assessment,
      intelligence.completedTaskDates,
      intelligence.mistakeLog,
      intelligence.careerRole,
      levelProfile.overallLevel,
      learning,
    ]
  );

  const addMistake = (event: FormEvent) => {
    event.preventDefault();
    if (!originalText.trim() || !correction.trim()) return;
    intelligence.addMistake(category, originalText.trim(), correction.trim());
    setOriginalText('');
    setCorrection('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Daily Claim Banner */}
      <div className="flex items-center justify-between rounded-2xl border border-primary/20 bg-primary/5 p-5">
        <div>
          <p className="text-xs font-medium text-primary uppercase tracking-widest">Daily Reward</p>
          <h3 className="mt-1 text-lg font-bold text-foreground">Claim your daily bonus</h3>
          <p className="text-xs text-muted-copy mt-0.5">Keep your streak alive and earn bonus XP.</p>
        </div>
        <Button
          onClick={claimDailyLoginReward}
          className="gap-2 bg-primary text-white font-medium rounded-lg"
        >
          <Gift className="h-4 w-4" /> Claim
        </Button>
      </div>

      {/* Gamification Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <MetricCard
          label="Current Level"
          value={`Level ${gamification.levelInfo.currentLevel}`}
          icon={Star}
          trend={`${gamification.levelInfo.xpRequired} XP to next`}
          statusColor="cyan"
        />
        <MetricCard
          label="Reward Coins"
          value={`${gamification.coins}`}
          icon={Coins}
          trend="Canonical Learning Engine coins"
          statusColor="amber"
        />
        <MetricCard
          label="Active Streak"
          value={`${gamification.streak} Days`}
          icon={Flame}
          trend={`${gamification.bonusSummary.xpMultiplier}x XP multiplier`}
          statusColor="emerald"
        />
        <MetricCard
          label="Achievements"
          value={`${unlockedAchievements}/${learningState.achievements.length}`}
          icon={Award}
          trend={`${gamification.achievementFeed.length} recent unlocks`}
          statusColor="primary"
        />
      </div>

      {/* Gamification Locked Upsell */}
      {!fullGamificationEntitlement.allowed && (
        <SectionCard
          title="Full Gamification Locked"
          subtitle="Upgrade to unlock mission chains, full rewards, bonuses, and long-term challenge progression."
          icon={Trophy}
        >
          <div className="rounded-xl border border-warning/20 bg-warning/5 p-5">
            <p className="text-sm text-warning">
              {fullGamificationEntitlement.reason}
            </p>
            <Button
              onClick={() => navigate('/profile')}
              className="mt-4 h-10 bg-primary text-white font-medium rounded-lg"
            >
              Upgrade to Pro
            </Button>
          </div>
        </SectionCard>
      )}

      {/* Gamification Content */}
      {fullGamificationEntitlement.allowed && (
        <>
          <SectionCard
            title="Level Progression"
            subtitle="Permanent level system derived from existing XP"
            icon={Trophy}
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
              <div className="lg:col-span-2 space-y-3">
                <div className="flex justify-between text-xs font-mono text-muted-copy">
                  <span>{gamification.levelInfo.levelStartXp} XP</span>
                  <span>{gamification.levelInfo.currentXp} XP</span>
                  <span>{gamification.levelInfo.nextLevelXp} XP</span>
                </div>
                <ProgressBar
                  value={gamification.levelInfo.progressPercentage}
                  color="primary"
                />
              </div>
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
                <p className="text-[10px] font-mono text-primary uppercase tracking-widest font-medium">
                  Next Reward
                </p>
                <h3 className="mt-2 text-lg font-medium text-foreground">
                  {gamification.nextReward.title}
                </h3>
                <p className="text-xs text-muted-copy mt-2">
                  {gamification.nextReward.description}
                </p>
              </div>
            </div>
          </SectionCard>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <SectionCard
                title="Daily Missions"
                subtitle="Short repeatable goals for today's learning loop"
                icon={Calendar}
              >
                <MissionList missions={gamification.dailyMissions} />
              </SectionCard>

              <SectionCard
                title="Weekly Missions"
                subtitle="Mission chains that reward balanced engine practice"
                icon={Layers}
              >
                <MissionList missions={gamification.weeklyMissions} />
              </SectionCard>

              <SectionCard
                title="Monthly Goals"
                subtitle="Long-term goals for deep learning consistency"
                icon={Trophy}
              >
                <MissionList missions={gamification.monthlyGoals} />
              </SectionCard>
            </div>

            <div className="space-y-6">
              <SectionCard
                title="Bonus Engine"
                subtitle="Derived bonuses from streaks, combos, and quality"
                icon={Zap}
              >
                <div className="space-y-4 text-sm text-muted-copy">
                  <DetailRow
                    label="XP Multiplier"
                    value={`${gamification.bonusSummary.xpMultiplier}x`}
                  />
                  <DetailRow
                    label="Combo Bonus"
                    value={`+${gamification.bonusSummary.comboBonus} XP`}
                  />
                  <DetailRow
                    label="Perfect Bonus"
                    value={`+${gamification.bonusSummary.perfectSessionBonus} XP`}
                  />
                  <DetailRow
                    label="Consistency Bonus"
                    value={`+${gamification.bonusSummary.consistencyBonus} XP`}
                  />
                  <DetailRow
                    label="Comeback Bonus"
                    value={`+${gamification.bonusSummary.comebackBonus} XP`}
                  />
                </div>
              </SectionCard>

              <SectionCard
                title="Challenge Progress"
                subtitle="Mission completion signals"
                icon={CheckCircle2}
              >
                <div className="grid grid-cols-2 gap-3">
                  <MiniStat
                    label="Daily"
                    value={`${gamification.challengeProgress.dailyCompleted}`}
                  />
                  <MiniStat
                    label="Weekly"
                    value={`${gamification.challengeProgress.weeklyCompleted}`}
                  />
                  <MiniStat
                    label="Monthly"
                    value={`${gamification.challengeProgress.monthlyCompleted}`}
                  />
                  <MiniStat
                    label="Chains"
                    value={`${gamification.challengeProgress.activeChains}`}
                  />
                </div>
              </SectionCard>

              <SectionCard
                title="Learner Titles"
                subtitle="Unlocked through level progression"
                icon={Star}
              >
                <div className="flex flex-wrap gap-2">
                  {gamification.titles.map((title) => (
                    <span
                      key={title}
                      className="text-[10px] font-mono uppercase bg-primary/15 text-primary border border-primary/20 px-2 py-1 rounded-lg"
                    >
                      {title}
                    </span>
                  ))}
                </div>
              </SectionCard>

              <SectionCard
                title="Recent Rewards"
                subtitle="Locally persisted reward history"
                icon={Gift}
              >
                <FeedList
                  items={gamification.recentRewards}
                  emptyLabel="No rewards claimed yet."
                />
              </SectionCard>

              <SectionCard
                title="Achievement Feed"
                subtitle="Existing Learning Engine achievements"
                icon={Award}
              >
                <FeedList
                  items={gamification.achievementFeed}
                  emptyLabel="No achievements unlocked yet."
                />
              </SectionCard>

              <PersonalLeaderboard learningState={learningState} />
            </div>
          </div>
        </>
      )}

      {/* Learning Intelligence Section */}
      <div className="border-t border-border-soft pt-8">
        <h2 className="text-xl font-bold text-foreground mb-1">Learning Intelligence</h2>
        <p className="text-xs text-muted-copy mb-6">Role-based daily practice, repeated-mistake tracking and evidence-based weekly guidance.</p>
      </div>

      <Card hoverEffect={false}>
        <label
          className="block text-sm font-medium text-foreground"
          htmlFor="career-role"
        >
          Career goal
        </label>
        <p className="mt-1 text-sm text-muted-copy">
          Your role changes task order, not scoring or learning history.
        </p>
        <select
          id="career-role"
          value={intelligence.careerRole}
          onChange={(event) =>
            intelligence.setCareerRole(
              event.target.value as typeof intelligence.careerRole
            )
          }
          className="mt-4 min-h-11 w-full rounded-lg border border-border-soft bg-surface px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 md:max-w-md"
        >
          {CAREER_ROLES.map((role) => (
            <option key={role}>{role}</option>
          ))}
        </select>
      </Card>

      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-medium text-foreground">
            Today's Engineering Communication Tasks
          </h2>
          <p className="mt-1 text-sm text-muted-copy">
            A balanced six-skill plan ordered for {intelligence.careerRole}.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {tasks.map((task, index) => {
            const completed = isTaskCompletedToday(
              task.id,
              intelligence.completedTaskDates
            );
            return (
              <Card key={task.id} className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-widest text-primary">
                      Priority {index + 1} · {task.module}
                    </p>
                    <h3 className="mt-1 text-lg font-medium text-foreground">
                      {task.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      intelligence.toggleTask(task.id);
                      if (!completed) {
                      BetaService.trackEvent(
                        'daily_task_completed',
                        '/progress/next-steps'
                      );
                      }
                    }}
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition ${completed ? 'border-success bg-success/10 text-success' : 'border-border-soft bg-surface text-muted-copy hover:border-primary hover:bg-primary/10'}`}
                    aria-label={
                      completed ? 'Mark task incomplete' : 'Mark task complete'
                    }
                  >
                    <Check className="h-5 w-5" />
                  </button>
                </div>
                <p className="flex-1 text-sm leading-6 text-muted-copy">
                  {task.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-copy">
                    {task.estimatedMinutes} min
                  </span>
                  <Button
                    variant="secondary"
                    onClick={() => navigate(task.route)}
                  >
                    Open task
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card id="mistake-log" className="space-y-5" hoverEffect={false}>
          <div className="flex items-center gap-3">
            <ClipboardList className="h-5 w-5 text-primary" />
            <div>
              <h2 className="text-xl font-medium text-foreground">
                Mistake Log / Hata Defteri
              </h2>
              <p className="text-sm text-muted-copy">
                Record patterns worth practising again.
              </p>
            </div>
          </div>
          <form onSubmit={addMistake} className="space-y-3">
            <select
              value={category}
              onChange={(event) =>
                setCategory(event.target.value as MistakeCategory)
              }
              className="min-h-11 w-full rounded-lg border border-border-soft bg-surface px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              {MISTAKE_CATEGORIES.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <p className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs leading-5 text-foreground">
              Suggestion: {MISTAKE_SUGGESTIONS[category]}
            </p>
            <textarea
              value={originalText}
              onChange={(event) => setOriginalText(event.target.value)}
              placeholder="Original sentence or repeated mistake"
              className="min-h-24 w-full rounded-lg border border-border-soft bg-surface-hover p-3 text-sm outline-none focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/20"
            />
            <textarea
              value={correction}
              onChange={(event) => setCorrection(event.target.value)}
              placeholder="Correction and why it is better"
              className="min-h-24 w-full rounded-lg border border-border-soft bg-surface-hover p-3 text-sm outline-none focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/20"
            />
            <Button
              type="submit"
              disabled={!originalText.trim() || !correction.trim()}
            >
              <Plus className="h-4 w-4" /> Add mistake
            </Button>
          </form>
          <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
            {intelligence.mistakeLog.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border-hover bg-surface-hover p-6 text-center text-sm text-muted-copy">
                No mistakes saved yet. Add only patterns you want to revisit.
              </p>
            ) : (
              intelligence.mistakeLog.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-xl border border-border-soft bg-surface p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-error">
                        {entry.category}
                      </p>
                      <p className="mt-2 text-sm text-muted-copy line-through">
                        {entry.originalText}
                      </p>
                      <p className="mt-1 text-sm font-medium text-foreground">
                        {entry.correction}
                      </p>
                    </div>
                    <button
                      onClick={() => intelligence.removeMistake(entry.id)}
                      className="rounded-lg p-2 text-muted-copy hover:bg-error/10 hover:text-error"
                      aria-label="Delete mistake"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="space-y-5" hoverEffect={false}>
          <div className="flex items-center gap-3">
            <FileChartColumn className="h-5 w-5 text-primary" />
            <div>
              <h2 className="text-xl font-medium text-foreground">
                7-Day Progress Report
              </h2>
              <p className="text-sm text-muted-copy">
                Built from existing learning and assessment evidence.
              </p>
            </div>
          </div>
          <dl className="grid gap-3 sm:grid-cols-2">
            {[
              ['Completed tasks', String(report.completedTasks)],
              ['Improved skill', report.improvedSkill],
              ['Weak area', report.weakArea],
              ['Internal progress index', String(report.eloEstimate)],
              ['Engineering CEFR', report.cefrEstimate],
              ['Current learning path', report.currentLevel],
              ['Next week focus', report.nextWeekFocus],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-xl border border-border-soft bg-surface-hover p-4"
              >
                <dt className="text-xs font-medium uppercase tracking-wider text-muted-copy">
                  {label}
                </dt>
                <dd className="mt-2 text-sm font-medium text-foreground">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
          <div>
            <p className="text-sm font-medium text-foreground">
              Repeated mistakes
            </p>
            <p className="mt-1 text-sm text-muted-copy">
              {report.repeatedMistakes.length
                ? report.repeatedMistakes.join(', ')
                : 'No repeated pattern identified yet.'}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-border-soft bg-surface-hover p-3">
              <p className="text-xs font-medium text-muted-copy">Work Tools</p>
              <p className="mt-1 text-sm text-foreground">
                {report.recommendedWorkTools}
              </p>
            </div>
            <div className="rounded-lg border border-border-soft bg-surface-hover p-3">
              <p className="text-xs font-medium text-muted-copy">Quick AI</p>
              <p className="mt-1 text-sm text-foreground">
                {report.recommendedQuickAIAction}
              </p>
            </div>
            <div className="rounded-lg border border-border-soft bg-surface-hover p-3">
              <p className="text-xs font-medium text-muted-copy">
                Phrase category
              </p>
              <p className="mt-1 text-sm text-foreground">
                {report.recommendedPhraseCategory}
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              Recommended next tasks
            </p>
            <ul className="mt-2 space-y-2">
              {report.recommendedNextTasks.map((task) => (
                <li
                  key={task}
                  className="flex items-center gap-2 text-sm text-foreground"
                >
                  <BookOpenCheck className="h-4 w-4 text-success" />
                  {task}
                </li>
              ))}
            </ul>
          </div>
          <Button
            variant="secondary"
            onClick={() => {
              intelligence.markReportGenerated();
              BetaService.trackEvent(
                'seven_day_report_generated',
                '/progress/next-steps'
              );
            }}
          >
            Mark report reviewed
          </Button>
        </Card>
      </div>

      <Card className="space-y-4" hoverEffect={false}>
        <h2 className="text-xl font-medium text-foreground">
          Assessment explanation
        </h2>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-border-soft bg-surface-hover p-4">
            <p className="text-xs font-medium text-muted-copy">
              Why this score
            </p>
            <p className="mt-2 text-sm text-foreground">
              {assessment.confidenceExplanation}
            </p>
          </div>
          <div className="rounded-xl border border-border-soft bg-surface-hover p-4">
            <p className="text-xs font-medium text-muted-copy">What improved</p>
            <p className="mt-2 text-sm text-foreground">
              {assessment.strongestDimensions[0]?.label ??
                'Not enough assessment data yet.'}
            </p>
          </div>
          <div className="rounded-xl border border-border-soft bg-surface-hover p-4">
            <p className="text-xs font-medium text-muted-copy">What is weak</p>
            <p className="mt-2 text-sm text-foreground">
              {assessment.weakestDimensions[0]?.label ??
                'Not enough assessment data yet.'}
            </p>
          </div>
          <div className="rounded-xl border border-border-soft bg-surface-hover p-4">
            <p className="text-xs font-medium text-muted-copy">
              What to do next
            </p>
            <p className="mt-2 text-sm text-foreground">
              {assessment.recommendedNextMissions[0] ??
                'Complete one assessed mission in each core skill.'}
            </p>
          </div>
        </div>
        <p className="text-xs text-muted-copy">
          {assessment.certificateDisclaimer}
        </p>
      </Card>
    </div>
  );
};
