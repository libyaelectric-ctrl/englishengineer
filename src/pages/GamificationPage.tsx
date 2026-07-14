import { useMemo } from 'react';
import {
  Award,
  Calendar,
  CheckCircle2,
  Coins,
  Flame,
  Gift,
  Layers,
  Star,
  Trophy,
  Zap,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MetricCard } from '@/shared/components/MetricCard';
import { SectionCard } from '@/shared/components/SectionCard';
import { ProgressBar } from '@/shared/components/ProgressBar';
import { Button } from '@/shared/components/Button';
import { useLearningStore, type LearningState } from '@/core/learning';
import {
  GamificationMissionProgress,
  GamificationService,
  useGamificationStore,
} from '@/features/gamification';
import { canAccessFeature, useBillingStore } from '@/features/billing';

const GamificationPage = () => {
  const navigate = useNavigate();
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

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-8">
      <div className="sticky top-0 z-40 border-b border-border-soft bg-background py-3 shadow-sm -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black tracking-tight text-foreground">Milestones</h1>
          <Button
            onClick={claimDailyLoginReward}
            className="gap-2 bg-primary text-white font-medium rounded-lg"
          >
            <Gift className="h-4 w-4" /> Claim Daily Reward
          </Button>
        </div>
      </div>

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
    </div>
  );
};

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

export default GamificationPage;
