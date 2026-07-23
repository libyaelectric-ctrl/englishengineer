import { useState, useMemo } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/features/auth';
import { useLearningCockpit } from '@/features/profile';
import { useLearningStore } from '@/core/learning';

import { useBillingStore, canViewAdvancedAnalytics } from '@/features/billing';
import { AnalyticsService, useAnalyticsStore } from '@/features/analytics';
import { SectionCard } from '@/shared/components/SectionCard';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { AssessmentProfilePanel } from '@/pages/ProgressPage/AnalyticsPanels';
import {
  GrammarProgressService,
  ErrorPatternAnalyzer,
  AdaptiveDifficultyEngine,
} from '@/features/grammar';
import { HeroBanner } from './HeroBanner';
import { QuickStats } from './QuickStats';
import { AnalyticsMetricCards } from './AnalyticsMetricCards';
import { AnalyticsChartsSection } from './AnalyticsChartsSection';

import { SkillSidebar } from './SkillSidebar';
import { SKILLS, MIN_ELO, MAX_ELO, getCEFRBand } from './utils';

export const ProgressOverviewTab = () => {
  const { currentUser } = useAuthStore();
  const { profile, learningState } = useLearningCockpit(currentUser?.id);
  const vocabularyPool =
    useLearningStore((state) => state.vocabularyPool) ?? [];
  const grammarPool = useLearningStore((state) => state.grammarPool) ?? [];
  const speakingPool = useLearningStore((state) => state.speakingPool) ?? [];

  const grammarSummary = GrammarProgressService.getSummary();
  const errorPatternSummary = ErrorPatternAnalyzer.getSummary();

  const grammarProgress = GrammarProgressService.getAll();
  const difficultyBreakdown = Object.values(grammarProgress).map((p) =>
    AdaptiveDifficultyEngine.assessDifficulty(p.ruleId, p)
  );
  const difficultyStats = {
    beginner: difficultyBreakdown.filter(
      (d) => d.suggestedDifficulty === 'beginner'
    ).length,
    intermediate: difficultyBreakdown.filter(
      (d) => d.suggestedDifficulty === 'intermediate'
    ).length,
    advanced: difficultyBreakdown.filter(
      (d) => d.suggestedDifficulty === 'advanced'
    ).length,
    challenge: difficultyBreakdown.filter(
      (d) => d.suggestedDifficulty === 'challenge'
    ).length,
  };

  const calculateSkillElo = (skillId: string) => {
    const skillProfile =
      profile?.skills?.[skillId as keyof typeof profile.skills];
    return Math.min(MAX_ELO, Math.max(MIN_ELO, skillProfile?.elo || MIN_ELO));
  };

  const [eloScores] = useState<Record<string, number>>(() => {
    const scores: Record<string, number> = {};
    SKILLS.forEach((s) => {
      scores[s.id] = calculateSkillElo(s.id);
    });
    return scores;
  });

  const totalElo = Math.floor(
    Object.values(eloScores).reduce((a, b) => a + b, 0) / SKILLS.length
  );
  const totalPercentage = Math.min(100, (totalElo / MAX_ELO) * 100);
  const totalCEFR = getCEFRBand(totalElo);

  const highestSkill = useMemo(
    () =>
      SKILLS.reduce((best, s) =>
        eloScores[s.id] > eloScores[best.id] ? s : best
      ),
    [eloScores]
  );
  const lowestSkill = useMemo(
    () =>
      SKILLS.reduce((worst, s) =>
        eloScores[s.id] < eloScores[worst.id] ? s : worst
      ),
    [eloScores]
  );

  const getRank = (elo: number) => {
    if (elo >= 4500)
      return {
        label: 'Grandmaster',
        icon: '👑',
        color:
          'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/40',
      };
    if (elo >= 3500)
      return {
        label: 'Diamond',
        icon: '💎',
        color:
          'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/30 border-sky-200 dark:border-sky-800/40',
      };
    if (elo >= 2500)
      return {
        label: 'Platinum',
        icon: '🏆',
        color:
          'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800/40',
      };
    if (elo >= 1500)
      return {
        label: 'Gold',
        icon: '🥇',
        color:
          'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800/40',
      };
    return {
      label: 'Silver',
      icon: '🥈',
      color: 'text-muted-copy bg-surface-hover border-border-soft',
    };
  };

  const rank = getRank(totalElo);

  const learningState2 = useLearningStore();
  const subscription = useBillingStore((state) => state.subscription);
  const analytics = AnalyticsService.getSummary(learningState2);
  const advancedAnalyticsEntitlement = canViewAdvancedAnalytics(subscription);
  const activeChart = useAnalyticsStore((state) => state.activeChart);
  const setActiveChart = useAnalyticsStore((state) => state.setActiveChart);

  const chartTabs: Array<{
    id: ReturnType<typeof useAnalyticsStore.getState>['activeChart'];
    label: string;
  }> = [
    { id: 'overview', label: 'Overview' },
    { id: 'skills', label: 'Skills' },
    { id: 'xp', label: 'XP' },
    { id: 'elo', label: 'Skill index' },
    { id: 'vocabulary', label: 'Vocabulary' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <HeroBanner totalElo={totalElo} totalPercentage={totalPercentage} />

      <QuickStats
        totalElo={totalElo}
        highestSkillLabel={highestSkill.label}
        peakElo={Math.max(...Object.values(eloScores))}
        sessionsCount={learningState?.studySessions?.length || 0}
        knowledgePoolSize={
          vocabularyPool.length + grammarPool.length + speakingPool.length
        }
        grammarMastered={grammarSummary.strong}
        grammarErrors={errorPatternSummary.totalErrors}
        advancedRules={difficultyStats.advanced + difficultyStats.challenge}
      />

      <AnalyticsMetricCards analytics={analytics} />

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <SectionCard
            title="Assessment Profile"
            subtitle="Engineering communication dimensions derived from existing learning evidence"
            icon={ShieldCheck}
            headerActions={
              <StatusBadge
                label={analytics.assessmentProfile.trustLabel}
                tone={
                  analytics.assessmentProfile.hasEnoughData
                    ? 'success'
                    : 'warning'
                }
              />
            }
          >
            <AssessmentProfilePanel profile={analytics.assessmentProfile} />
          </SectionCard>

          {advancedAnalyticsEntitlement.allowed && (
            <AnalyticsChartsSection
              analytics={analytics}
              activeChart={activeChart}
              setActiveChart={setActiveChart}
              chartTabs={chartTabs}
            />
          )}
        </div>

        <div className="h-full">
          <SkillSidebar
            skills={SKILLS}
            eloScores={eloScores}
            highestSkill={highestSkill}
            lowestSkill={lowestSkill}
            totalCEFR={totalCEFR}
            rank={rank}
            selectedGraphNode={null}
            setSelectedGraphNode={() => {}}
          />
        </div>
      </div>
    </div>
  );
};
