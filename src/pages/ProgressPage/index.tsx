/**
 * Progress Page — Modern Single Page Design
 *
 * All sections scroll vertically:
 * 1. Hero Banner (rank, ELO, CEFR)
 * 2. Quick Stats (XP, sessions, knowledge pool, grammar)
 * 3. Analytics Metrics
 * 4. Assessment Profile + Skill Sidebar
 * 5. Analytics Charts
 * 6. Priority Focus (weakest skill recommendation)
 * 7. Gamification & Momentum
 * 8. Targeted Skill Modules
 */
import { ArrowRight, BookOpen, Languages, Mic2, PenTool, Sparkles } from 'lucide-react';

import { useMemo, useState } from 'react';

import { Link } from 'react-router-dom';

import { useLearningStore } from '@/core/learning';

import { PageContainer } from '@/shared/components/PageContainer';
import { SectionCard } from '@/shared/components/SectionCard';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { MAX_ELO, MIN_ELO, RANK_THRESHOLDS } from '@/shared/constants/elo.constants';
import { getRankIcon } from '@/shared/icons/registry';

import { AnalyticsService, useAnalyticsStore } from '@/features/analytics';
import { useAuthStore } from '@/features/auth';
import { canViewAdvancedAnalytics, useBillingStore } from '@/features/billing';
import { GrammarProgressService } from '@/features/grammar';
import { LearningTaskEngine } from '@/features/learning-orchestrator';
import { useLearningCockpit } from '@/features/profile';

import { AnalyticsChartsSection } from './AnalyticsChartsSection';
import { AnalyticsMetricCards } from './AnalyticsMetricCards';
import { AssessmentProfilePanel } from './AnalyticsPanels';
import { HeroBanner } from './HeroBanner';
import { QuickStats } from './QuickStats';
import { SkillSidebar } from './SkillSidebar';
import { SKILLS, getCEFRBand } from './utils';

// eslint-disable-next-line complexity -- large progress dashboard with many skill/rank sections
const ProgressPage = () => {
  const { currentUser } = useAuthStore();
  const { profile, missions } = useLearningCockpit(currentUser?.id);
  const lStore = useLearningStore((s) => ({
    vocabularyPool: s.vocabularyPool || [],
    grammarPool: s.grammarPool || [],
    speakingPool: s.speakingPool || [],
    xp: s.xp,
    streak: s.streak,
  }));
  const [eloScores] = useState<Record<string, number>>(() => {
    const scores: Record<string, number> = {};
    SKILLS.forEach((s) => {
      const p = profile?.skills?.[s.id as keyof typeof profile.skills];
      scores[s.id] = Math.min(MAX_ELO, Math.max(MIN_ELO, p?.elo || MIN_ELO));
    });
    return scores;
  });
  const totalElo = Math.floor(Object.values(eloScores).reduce((a, b) => a + b, 0) / SKILLS.length);
  const rank = useMemo(() => {
    if (totalElo >= RANK_THRESHOLDS.GRANDMASTER)
      return {
        label: 'Grandmaster',
        icon: getRankIcon('grandmaster'),
        color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30',
      };
    if (totalElo >= RANK_THRESHOLDS.DIAMOND)
      return {
        label: 'Diamond',
        icon: getRankIcon('diamond'),
        color: 'text-sky-600 bg-sky-50 dark:bg-sky-950/30',
      };
    return {
      label: 'Silver',
      icon: getRankIcon('silver'),
      color: 'text-muted-copy bg-surface-hover',
    };
  }, [totalElo]);
  const analytics = AnalyticsService.getSummary(useLearningStore.getState());
  const weakestSkill = LearningTaskEngine.getWeakestSkill(profile);
  const skillLinks = [
    {
      name: 'Vocabulary',
      icon: BookOpen,
      href: '/vocabulary',
      desc: 'Expand terminology',
      band: profile?.skills?.vocabulary?.cefrBand ?? 'A1',
      isWeak: weakestSkill === 'vocabulary',
    },
    {
      name: 'Grammar',
      icon: Languages,
      href: '/grammar',
      desc: 'Sentence structures',
      band: profile?.skills?.grammar?.cefrBand ?? 'A1',
      isWeak: weakestSkill === 'grammar',
    },
    {
      name: 'Reading',
      icon: BookOpen,
      href: '/reading',
      desc: 'Technical reports',
      band: profile?.skills?.reading?.cefrBand ?? 'A1',
      isWeak: weakestSkill === 'reading',
    },
    {
      name: 'Writing',
      icon: PenTool,
      href: '/writing',
      desc: 'Engineering emails',
      band: profile?.skills?.writing?.cefrBand ?? 'A1',
      isWeak: weakestSkill === 'writing',
    },
    {
      name: 'Speaking',
      icon: Mic2,
      href: '/speaking',
      desc: 'Pronunciation',
      band: profile?.skills?.speaking?.cefrBand ?? 'A1',
      isWeak: weakestSkill === 'speaking',
    },
  ];
  return (
    <PageContainer className="space-y-6">
      <HeroBanner totalElo={totalElo} totalPercentage={Math.min(100, (totalElo / MAX_ELO) * 100)} />
      <QuickStats
        totalElo={totalElo}
        highestSkillLabel={
          SKILLS.reduce((a, b) => (eloScores[a.id] > eloScores[b.id] ? a : b)).label
        }
        peakElo={Math.max(...Object.values(eloScores))}
        sessionsCount={missions.length}
        knowledgePoolSize={
          lStore.vocabularyPool.length + lStore.grammarPool.length + lStore.speakingPool.length
        }
        grammarMastered={GrammarProgressService.getSummary().strong}
        grammarErrors={0}
        advancedRules={0}
      />
      <AnalyticsMetricCards analytics={analytics} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <SectionCard
          title="Assessment Profile"
          headerActions={
            <StatusBadge
              label={analytics.assessmentProfile.trustLabel}
              tone={analytics.assessmentProfile.hasEnoughData ? 'success' : 'warning'}
            />
          }
        >
          <AssessmentProfilePanel profile={analytics.assessmentProfile} />
        </SectionCard>
        <SkillSidebar
          skills={SKILLS}
          eloScores={eloScores}
          highestSkill={SKILLS.reduce((a, b) => (eloScores[a.id] > eloScores[b.id] ? a : b))}
          lowestSkill={SKILLS.reduce((a, b) => (eloScores[a.id] < eloScores[b.id] ? a : b))}
          totalCEFR={getCEFRBand(totalElo)}
          rank={rank}
          selectedGraphNode={null}
          setSelectedGraphNode={() => {}}
        />
      </div>
      {canViewAdvancedAnalytics(useBillingStore.getState().subscription).allowed && (
        <AnalyticsChartsSection
          analytics={analytics}
          activeChart={useAnalyticsStore.getState().activeChart}
          setActiveChart={useAnalyticsStore.getState().setActiveChart}
          chartTabs={[
            { id: 'overview', label: 'Overview' },
            { id: 'skills', label: 'Skills' },
            { id: 'xp', label: 'XP' },
          ]}
        />
      )}
      <div className="border-t border-border-soft" />
      <SectionCard title="Targeted Modules" icon={Sparkles}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {skillLinks.map((skill) => {
            const Icon = skill.icon;
            return (
              <Link
                key={skill.name}
                to={skill.href}
                className={`group relative flex flex-col justify-between rounded-[var(--radius-card)] border p-5 transition-all duration-150 hover:shadow-md ${
                  skill.isWeak
                    ? 'border-primary/40 bg-primary/5 hover:border-primary'
                    : 'border-border-soft bg-surface hover:border-border-hover hover:bg-surface-hover'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="rounded-[4px] bg-primary/10 p-2 text-primary">
                        <Icon className="h-4 w-4" />
                      </div>
                      <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                        {skill.name}
                      </h3>
                    </div>
                    <span className="rounded-[4px] border border-border-soft bg-surface px-2 py-0.5 text-[10px] font-mono font-bold text-primary">
                      {skill.band}
                    </span>
                  </div>
                  <p className="mt-2.5 text-xs text-muted-copy leading-relaxed">{skill.desc}</p>
                </div>

                <div className="mt-4 flex items-center justify-between pt-3 border-t border-border-soft/60">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                    Start Exercise
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-copy transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </div>
              </Link>
            );
          })}
        </div>
      </SectionCard>
    </PageContainer>
  );
};

export default ProgressPage;
