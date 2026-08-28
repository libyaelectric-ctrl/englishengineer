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
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Compass,
  Cpu,
  Flame,
  Languages,
  Mic2,
  PenTool,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from 'lucide-react';

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
import {
  AdaptiveDifficultyEngine,
  ErrorPatternAnalyzer,
  GrammarProgressService,
} from '@/features/grammar';
import { LearningTaskEngine } from '@/features/learning-orchestrator';
import { useLearningCockpit } from '@/features/profile';

import { AnalyticsChartsSection } from './AnalyticsChartsSection';
import { AnalyticsMetricCards } from './AnalyticsMetricCards';
import { AssessmentProfilePanel } from './AnalyticsPanels';
import { HeroBanner } from './HeroBanner';
import { QuickStats } from './QuickStats';
import { SkillSidebar } from './SkillSidebar';
import { SKILLS, getCEFRBand } from './utils';

const ProgressPage = () => {
  const { currentUser } = useAuthStore();
  const { profile, learningState, missions, memory } = useLearningCockpit(currentUser?.id);
  const vocabularyPool = useLearningStore((state) => state.vocabularyPool) ?? [];
  const grammarPool = useLearningStore((state) => state.grammarPool) ?? [];
  const speakingPool = useLearningStore((state) => state.speakingPool) ?? [];
  const xp = useLearningStore((s) => s.xp);
  const streak = useLearningStore((s) => s.streak);

  // --- Overview data ---
  const grammarSummary = GrammarProgressService.getSummary();
  const errorPatternSummary = ErrorPatternAnalyzer.getSummary();
  const grammarProgress = GrammarProgressService.getAll();
  const difficultyBreakdown = Object.values(grammarProgress).map((p) =>
    AdaptiveDifficultyEngine.assessDifficulty(p.ruleId, p)
  );
  const difficultyStats = {
    beginner: difficultyBreakdown.filter((d) => d.suggestedDifficulty === 'beginner').length,
    intermediate: difficultyBreakdown.filter((d) => d.suggestedDifficulty === 'intermediate')
      .length,
    advanced: difficultyBreakdown.filter((d) => d.suggestedDifficulty === 'advanced').length,
    challenge: difficultyBreakdown.filter((d) => d.suggestedDifficulty === 'challenge').length,
  };

  const calculateSkillElo = (skillId: string) => {
    const skillProfile = profile?.skills?.[skillId as keyof typeof profile.skills];
    return Math.min(MAX_ELO, Math.max(MIN_ELO, skillProfile?.elo || MIN_ELO));
  };

  const [eloScores] = useState<Record<string, number>>(() => {
    const scores: Record<string, number> = {};
    SKILLS.forEach((s) => {
      scores[s.id] = calculateSkillElo(s.id);
    });
    return scores;
  });

  const totalElo = Math.floor(Object.values(eloScores).reduce((a, b) => a + b, 0) / SKILLS.length);
  const totalPercentage = Math.min(100, (totalElo / MAX_ELO) * 100);
  const totalCEFR = getCEFRBand(totalElo);

  const highestSkill = useMemo(
    () => SKILLS.reduce((best, s) => (eloScores[s.id] > eloScores[best.id] ? s : best)),
    [eloScores]
  );
  const lowestSkill = useMemo(
    () => SKILLS.reduce((worst, s) => (eloScores[s.id] < eloScores[worst.id] ? s : worst)),
    [eloScores]
  );

  const getRank = (elo: number) => {
    if (elo >= RANK_THRESHOLDS.GRANDMASTER)
      return {
        label: 'Grandmaster',
        icon: getRankIcon('grandmaster'),
        color:
          'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/40',
      };
    if (elo >= RANK_THRESHOLDS.DIAMOND)
      return {
        label: 'Diamond',
        icon: getRankIcon('diamond'),
        color:
          'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/30 border-sky-200 dark:border-sky-800/40',
      };
    if (elo >= RANK_THRESHOLDS.PLATINUM)
      return {
        label: 'Platinum',
        icon: getRankIcon('platinum'),
        color:
          'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800/40',
      };
    if (elo >= RANK_THRESHOLDS.GOLD)
      return {
        label: 'Gold',
        icon: getRankIcon('gold'),
        color:
          'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800/40',
      };
    return {
      label: 'Silver',
      icon: getRankIcon('silver'),
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

  // --- Next Steps data ---
  const weakestSkill = LearningTaskEngine.getWeakestSkill(profile);

  const skillLinks = [
    {
      name: 'Vocabulary',
      icon: BookOpen,
      href: '/vocabulary',
      desc: 'Expand terminology for technical specifications',
      band: profile?.skills?.vocabulary?.cefrBand ?? 'A1',
      isWeak: weakestSkill === 'vocabulary',
    },
    {
      name: 'Grammar',
      icon: Languages,
      href: '/grammar',
      desc: 'Master technical sentence structures and passive voice',
      band: profile?.skills?.grammar?.cefrBand ?? 'A1',
      isWeak: weakestSkill === 'grammar',
    },
    {
      name: 'Reading',
      icon: BookOpen,
      href: '/reading',
      desc: 'Practice technical reports and site blueprints',
      band: profile?.skills?.reading?.cefrBand ?? 'A1',
      isWeak: weakestSkill === 'reading',
    },
    {
      name: 'Writing',
      icon: PenTool,
      href: '/writing',
      desc: 'Draft formal engineering emails and RFIs',
      band: profile?.skills?.writing?.cefrBand ?? 'A1',
      isWeak: weakestSkill === 'writing',
    },
    {
      name: 'Speaking',
      icon: Mic2,
      href: '/speaking',
      desc: 'AI-assisted technical pronunciation and standups',
      band: profile?.skills?.speaking?.cefrBand ?? 'A1',
      isWeak: weakestSkill === 'speaking',
    },
    {
      name: 'Placement Test',
      icon: Compass,
      href: '/placement',
      desc: 'Calibrate your CEFR band with automated assessment',
      band: 'Benchmark',
      isWeak: false,
    },
  ];

  return (
    <PageContainer className="space-y-6 pt-12 sm:pt-0">
      {/* ─── Hero Banner ──────────────────────────────────── */}
      <HeroBanner totalElo={totalElo} totalPercentage={totalPercentage} />

      {/* ─── Quick Stats ──────────────────────────────────── */}
      <QuickStats
        totalElo={totalElo}
        highestSkillLabel={highestSkill.label}
        peakElo={Math.max(...Object.values(eloScores))}
        sessionsCount={learningState?.studySessions?.length || 0}
        knowledgePoolSize={vocabularyPool.length + grammarPool.length + speakingPool.length}
        grammarMastered={grammarSummary.strong}
        grammarErrors={errorPatternSummary.totalErrors}
        advancedRules={difficultyStats.advanced + difficultyStats.challenge}
      />

      {/* ─── Analytics Metrics ────────────────────────────── */}
      <AnalyticsMetricCards analytics={analytics} />

      {/* ─── Assessment + Skill Sidebar ───────────────────── */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <SectionCard
          title="Assessment Profile"
          subtitle="Engineering communication dimensions derived from existing learning evidence"
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
          highestSkill={highestSkill}
          lowestSkill={lowestSkill}
          totalCEFR={totalCEFR}
          rank={rank}
          selectedGraphNode={null}
          setSelectedGraphNode={() => {}}
        />
      </div>

      {/* ─── Analytics Charts ─────────────────────────────── */}
      {advancedAnalyticsEntitlement.allowed && (
        <AnalyticsChartsSection
          analytics={analytics}
          activeChart={activeChart}
          setActiveChart={setActiveChart}
          chartTabs={chartTabs}
        />
      )}

      {/* ═══ DIVIDER ══════════════════════════════════════════ */}
      <div className="border-t border-border-soft" />

      {/* ─── Priority Focus Hero ──────────────────────────── */}
      <div className="relative overflow-hidden rounded-[var(--radius-card)] border border-primary/30 bg-surface p-6 sm:p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="rounded-[4px] bg-primary/10 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-primary border border-primary/20">
                Recommended Focus Area
              </span>
              {weakestSkill && (
                <StatusBadge label={`Focus: ${weakestSkill.toUpperCase()}`} tone="warning" />
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              Accelerate Your Engineering Path
            </h2>
            <p className="text-xs sm:text-sm text-muted-copy max-w-xl">
              Based on your continuous performance telemetry, focusing on{' '}
              <strong className="text-foreground capitalize">{weakestSkill}</strong> will yield the
              highest CEFR level progression.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 shrink-0">
            <Link
              to="/curriculum"
              className="inline-flex items-center gap-2 rounded-[var(--radius-card)] bg-primary px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-primary/90 transition-all shadow-md"
            >
              <Calendar className="h-4 w-4" /> Today's Mission
            </Link>
            <Link
              to="/learning-path"
              className="inline-flex items-center gap-2 rounded-[var(--radius-card)] border border-border-soft bg-surface px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-foreground hover:bg-surface-hover transition-all"
            >
              <Trophy className="h-4 w-4 text-primary" /> Roadmap
            </Link>
          </div>
        </div>
      </div>

      {/* ─── Gamification Stats ───────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-[var(--radius-card)] border border-border-soft bg-surface p-4">
          <div className="flex items-center gap-2 text-primary">
            <Zap className="h-4 w-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-copy">
              Total XP
            </span>
          </div>
          <p className="mt-2 text-2xl font-black text-foreground">{xp} XP</p>
        </div>
        <div className="rounded-[var(--radius-card)] border border-border-soft bg-surface p-4">
          <div className="flex items-center gap-2 text-amber-500">
            <Flame className="h-4 w-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-copy">
              Streak
            </span>
          </div>
          <p className="mt-2 text-2xl font-black text-foreground">{streak} Days</p>
        </div>
        <div className="rounded-[var(--radius-card)] border border-border-soft bg-surface p-4">
          <div className="flex items-center gap-2 text-emerald-500">
            <Target className="h-4 w-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-copy">
              Active Missions
            </span>
          </div>
          <p className="mt-2 text-2xl font-black text-foreground">{missions.length}</p>
        </div>
        <div className="rounded-[var(--radius-card)] border border-border-soft bg-surface p-4">
          <div className="flex items-center gap-2 text-cyan-500">
            <Cpu className="h-4 w-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-copy">
              Reviews Due
            </span>
          </div>
          <p className="mt-2 text-2xl font-black text-foreground">
            {typeof memory?.dueToday === 'number' ? memory.dueToday : 0}
          </p>
        </div>
      </div>

      {/* ─── Targeted Skill Modules ───────────────────────── */}
      <SectionCard
        title="Targeted Skill Modules"
        subtitle="Direct practice modules calibrated to your engineering discipline"
        icon={Sparkles}
      >
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
