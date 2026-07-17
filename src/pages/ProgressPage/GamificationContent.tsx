import {
  Award,
  Calendar,
  CheckCircle2,
  Gift,
  Layers,
  Star,
  Trophy,
  Zap,
} from 'lucide-react';
import { type LearningState } from '@/core/learning';
import {
  GamificationService,
  useGamificationStore,
} from '@/features/gamification';
import { SectionCard } from '@/shared/components/SectionCard';
import { ProgressBar } from '@/shared/components/ProgressBar';
import { MissionList, DetailRow, MiniStat, FeedList } from './NextStepsHelpers';
import { PersonalLeaderboard } from './PersonalLeaderboard';

export const GamificationContent = ({
  learningState,
}: {
  learningState: LearningState;
}) => {
  const persistedGamification = useGamificationStore();
  const gamification = GamificationService.getSummary(
    learningState,
    persistedGamification
  );

  return (
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
          <div className="rounded-[4px] border border-[#0047bb]/25 bg-[#0047bb]/5 p-5 shadow-sm">
            <p className="text-[10px] font-mono text-[#0047bb] uppercase tracking-widest font-bold">
              Next Reward
            </p>
            <h3 className="mt-2 text-lg font-bold text-foreground">
              {gamification.nextReward.title}
            </h3>
            <p className="text-xs text-muted-copy mt-2 font-medium">
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
                  className="text-[10px] font-mono uppercase bg-[#0047bb]/10 text-[#0047bb] border border-[#0047bb]/20 px-2 py-1 rounded-[4px] font-bold"
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
  );
};
