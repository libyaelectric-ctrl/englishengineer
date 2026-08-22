/**
 * Curriculum Page — Modern Single Page Design
 *
 * All sections scroll vertically:
 * 1. Learning Hub Header
 * 2. Actions Grid (quick actions)
 * 3. Today's Tasks & Missions
 * 4. Memory & Review Queue
 * 5. Full Curriculum & Recommendations
 */

import { useEffect, useMemo, useRef, useState } from 'react';

import { PageContainer } from '@/shared/components/PageContainer';
import { PageHeader } from '@/shared/components/PageHeader';

import { ProductAnalyticsService } from '@/features/analytics/product-analytics.service';
import { useAuthStore } from '@/features/auth';
import { GrammarProgressService } from '@/features/grammar';
import {
  type UnifiedReviewItem,
  UnifiedReviewQueueService,
  buildReviewPrioritiesFromInput,
  useLearningIntelligenceStore,
} from '@/features/learning-intelligence';
import {
  LearningTaskEngine,
  type LearningTaskRecommendation,
} from '@/features/learning-orchestrator';
import { useLocalizationStore } from '@/features/localization';
import { LearningProfileEngine, type SkillName, useLearningCockpit } from '@/features/profile';

import { CurriculumActionsGrid } from './CurriculumActionsGrid';
import { CurriculumFullTab } from './CurriculumFullTab';
import { CurriculumMemoryTab } from './CurriculumMemoryTab';
import { CurriculumTodayTab } from './CurriculumTodayTab';
import { SKILL_META } from './curriculum-data';

const CurriculumPage = () => {
  const translate = useLocalizationStore((s) => s.translate);
  const currentUser = useAuthStore((state) => state.currentUser);
  const { profile, memory, missions, isLoading, learningState } = useLearningCockpit(
    currentUser?.id
  );
  const mistakeLog = useLearningIntelligenceStore((state) => state.mistakeLog);
  const weakestSkill = useMemo(() => LearningTaskEngine.getWeakestSkill(profile), [profile]);
  const [selectedSkill, setSelectedSkill] = useState<SkillName>('reading');
  const [domain, setDomain] = useState('All');

  useEffect(() => {
    if (profile?.discipline && domain === 'All') {
      setDomain(profile.discipline);
    }
  }, [profile?.discipline, domain]);

  const [recommendation, setRecommendation] = useState<LearningTaskRecommendation | null>(null);
  const [recommendationLoading, setRecommendationLoading] = useState(true);
  const [unifiedReviewQueue, setUnifiedReviewQueue] = useState<UnifiedReviewItem[]>([]);

  useEffect(() => {
    ProductAnalyticsService.track('review_queue_opened', '/curriculum', {
      metadata: { source: 'user' },
    });
  }, []);

  const prevWeakestRef = useRef(weakestSkill);
  useEffect(() => {
    if (prevWeakestRef.current !== weakestSkill) {
      prevWeakestRef.current = weakestSkill;
      setSelectedSkill(weakestSkill);
    }
  }, [weakestSkill]);

  useEffect(() => {
    let active = true;
    setRecommendationLoading(true);
    LearningTaskEngine.createRecommendation(profile, selectedSkill, {
      domain: domain === 'All' ? undefined : domain,
      recommended: selectedSkill === weakestSkill,
    })
      .then((next) => {
        if (!active) return;
        setRecommendation(next);
        setRecommendationLoading(false);
      })
      .catch(() => {
        if (active) setRecommendationLoading(false);
      });
    return () => {
      active = false;
    };
  }, [domain, profile, selectedSkill, weakestSkill]);

  useEffect(() => {
    let active = true;
    UnifiedReviewQueueService.buildQueue(profile)
      .then((queue) => {
        if (active) setUnifiedReviewQueue(queue);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [profile]);

  const selectedMeta = SKILL_META[selectedSkill];
  const reviewPriorities = buildReviewPrioritiesFromInput({
    weakWords: memory.weakWords,
    dueToday: memory.dueToday,
    mistakeLog,
    focusSkill: {
      skill: weakestSkill,
      weaknessScore: profile.skills[weakestSkill].weaknessScore,
      label: `${weakestSkill[0].toUpperCase()}${weakestSkill.slice(1)}`,
    },
  });
  const primaryMission = missions[0];
  const currentSkillProfile = profile.skills[weakestSkill];
  const grammarSummary = GrammarProgressService.getSummary(360);
  const badges = LearningProfileEngine.getBadges(profile, memory);
  const repeatedMistakes = mistakeLog.filter((item) => (item.repetitionCount ?? 1) >= 3).length;

  return (
    <PageContainer className="w-full space-y-7 pb-8 relative z-10 font-sans pt-12 sm:pt-0">
      {/* ─── Learning Hub Header ────────────────────────── */}
      <PageHeader
        title={translate('learningHub.title')}
        description="Your personalized learning journey and task recommendations."
      />

      {/* ─── Quick Nav Anchors ──────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        <a href="#actions" className="inline-flex items-center gap-1.5 rounded-[4px] border border-border-soft bg-surface px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-foreground hover:bg-surface-hover transition-all">
          Actions
        </a>
        <a href="#today" className="inline-flex items-center gap-1.5 rounded-[4px] border border-border-soft bg-surface px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-foreground hover:bg-surface-hover transition-all">
          Today
        </a>
        <a href="#memory" className="inline-flex items-center gap-1.5 rounded-[4px] border border-border-soft bg-surface px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-foreground hover:bg-surface-hover transition-all">
          Memory
        </a>
        <a href="#full" className="inline-flex items-center gap-1.5 rounded-[4px] border border-border-soft bg-surface px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-foreground hover:bg-surface-hover transition-all">
          Full Curriculum
        </a>
      </div>

      {/* ─── Actions Grid ───────────────────────────────── */}
      <div id="actions">
        <CurriculumActionsGrid
          primaryMission={primaryMission}
          weakestSkill={weakestSkill}
          currentSkillProfile={currentSkillProfile}
          memory={memory}
          setSelectedSkill={setSelectedSkill}
        />
      </div>

      {/* ─── Today's Tasks ──────────────────────────────── */}
      <div id="today">
        <CurriculumTodayTab
          isLoading={isLoading}
          missions={missions}
          learningState={learningState}
        />
      </div>

      {/* ═══ DIVIDER ══════════════════════════════════════════ */}
      <div className="border-t border-border-soft" />

      {/* ─── Memory & Review Queue ──────────────────────── */}
      <div id="memory">
        <CurriculumMemoryTab
          memory={memory}
          grammarSummary={grammarSummary}
          repeatedMistakes={repeatedMistakes}
          badges={badges}
          unifiedReviewQueue={unifiedReviewQueue}
          reviewPriorities={reviewPriorities}
        />
      </div>

      {/* ═══ DIVIDER ══════════════════════════════════════════ */}
      <div className="border-t border-border-soft" />

      {/* ─── Full Curriculum ────────────────────────────── */}
      <div id="full">
        <CurriculumFullTab
          profile={profile}
          selectedSkill={selectedSkill}
          weakestSkill={weakestSkill}
          domain={domain}
          setDomain={setDomain}
          setSelectedSkill={setSelectedSkill}
          recommendation={recommendation}
          recommendationLoading={recommendationLoading}
          selectedMeta={selectedMeta}
        />
      </div>
    </PageContainer>
  );
};

export default CurriculumPage;
