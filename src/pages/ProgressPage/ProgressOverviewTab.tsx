import { useState, useMemo } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/features/auth';
import { useLearningCockpit } from '@/features/profile';
import { useLearningStore } from '@/core/learning';
import type { GraphNode } from '@/pages/CurriculumPage/curriculum-data';
import { useBillingStore, canViewAdvancedAnalytics } from '@/features/billing';
import { AnalyticsService, useAnalyticsStore } from '@/features/analytics';
import { SectionCard } from '@/shared/components/SectionCard';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { AssessmentProfilePanel } from '@/pages/ProgressPage/AnalyticsPanels';
import { HeroBanner } from './HeroBanner';
import { QuickStats } from './QuickStats';
import { AnalyticsMetricCards } from './AnalyticsMetricCards';
import { KnowledgeGraph } from './KnowledgeGraph';
import { AnalyticsChartsSection } from './AnalyticsChartsSection';
import { RecentSessions } from './RecentSessions';
import { SkillSidebar } from './SkillSidebar';
import { SKILLS, MIN_ELO, MAX_ELO, getCEFRBand } from './utils';

export const ProgressOverviewTab = () => {
  const { currentUser } = useAuthStore();
  const { profile, learningState } = useLearningCockpit(currentUser?.id);
  const vocabularyPool =
    useLearningStore((state) => state.vocabularyPool) ?? [];
  const grammarPool = useLearningStore((state) => state.grammarPool) ?? [];
  const [selectedGraphNode, setSelectedGraphNode] = useState<GraphNode | null>(
    null
  );

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
        color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      };
    if (elo >= 3500)
      return {
        label: 'Diamond',
        icon: '💎',
        color: 'text-cyan-600 bg-cyan-50 border-cyan-200',
      };
    if (elo >= 2500)
      return {
        label: 'Platinum',
        icon: '🏆',
        color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
      };
    if (elo >= 1500)
      return {
        label: 'Gold',
        icon: '🥇',
        color: 'text-amber-600 bg-amber-50 border-amber-200',
      };
    return {
      label: 'Silver',
      icon: '🥈',
      color: 'text-slate-600 bg-slate-50 border-slate-200',
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
    <div className="space-y-5 animate-in fade-in duration-300">
      <HeroBanner totalElo={totalElo} totalPercentage={totalPercentage} />

      <QuickStats
        totalElo={totalElo}
        highestSkillLabel={highestSkill.label}
        peakElo={Math.max(...Object.values(eloScores))}
        sessionsCount={learningState?.studySessions?.length || 0}
        knowledgePoolSize={vocabularyPool.length + grammarPool.length}
      />

      <AnalyticsMetricCards analytics={analytics} />

      <SectionCard
        title="Assessment Profile"
        subtitle="Engineering communication dimensions derived from existing learning evidence"
        icon={ShieldCheck}
        headerActions={
          <StatusBadge
            label={analytics.assessmentProfile.trustLabel}
            tone={
              analytics.assessmentProfile.hasEnoughData ? 'success' : 'warning'
            }
          />
        }
      >
        <AssessmentProfilePanel profile={analytics.assessmentProfile} />
      </SectionCard>

      <KnowledgeGraph
        selectedGraphNode={selectedGraphNode}
        setSelectedGraphNode={setSelectedGraphNode}
      />

      {advancedAnalyticsEntitlement.allowed && (
        <AnalyticsChartsSection
          analytics={analytics}
          activeChart={activeChart}
          setActiveChart={setActiveChart}
          chartTabs={chartTabs}
        />
      )}

      <RecentSessions sessions={analytics.recentSessions} />

      <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
        <div>{/* Main content rendered above */}</div>
        <SkillSidebar
          skills={SKILLS}
          eloScores={eloScores}
          highestSkill={highestSkill}
          lowestSkill={lowestSkill}
          totalCEFR={totalCEFR}
          rank={rank}
          selectedGraphNode={selectedGraphNode}
          setSelectedGraphNode={setSelectedGraphNode}
        />
      </div>
    </div>
  );
};
