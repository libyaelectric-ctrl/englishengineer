import { Award, Coins, Flame, Star } from 'lucide-react';
import { MetricCard } from '@/shared/components/MetricCard';

export const GamificationMetrics = ({
  gamification,
  unlockedAchievements,
  totalAchievements,
}: {
  gamification: ReturnType<
    typeof import('@/features/gamification').GamificationService.getSummary
  >;
  unlockedAchievements: number;
  totalAchievements: number;
}) => (
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
      value={`${unlockedAchievements}/${totalAchievements}`}
      icon={Award}
      trend={`${gamification.achievementFeed.length} recent unlocks`}
      statusColor="primary"
    />
  </div>
);
