import { useEffect, useMemo, useRef, useState } from 'react';

import { useParams } from 'react-router-dom';

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
import { LearningProfileEngine, type SkillName, useLearningCockpit } from '@/features/profile';

import { CurriculumActionsGrid } from './CurriculumActionsGrid';
import { CurriculumFullTab } from './CurriculumFullTab';
import { CurriculumMemoryTab } from './CurriculumMemoryTab';
import { CurriculumTodayTab } from './CurriculumTodayTab';
import { SKILL_META } from './curriculum-data';

const CurriculumPage = () => {
  const { section } = useParams<{ section: string }>();
  const activeSection = section || 'today';
  const currentUser = useAuthStore((state) => state.currentUser);
  const { profile, memory, missions, isLoading, learningState } = useLearningCockpit(
    currentUser?.id
  );
  const mistakeLog = useLearningIntelligenceStore((state) => state.mistakeLog);
  const weakestSkill = useMemo(() => LearningTaskEngine.getWeakestSkill(profile), [profile]);
  const [selectedSkill, setSelectedSkill] = useState<SkillName>('reading');
  const [domain, setDomain] = useState('All');
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
    <div className="mx-auto w-full max-w-5xl space-y-7 animate-in fade-in duration-300 pb-8 text-foreground relative z-10 font-sans">
      <div className="sticky top-0 z-20 border-b border-border-soft bg-background/95 backdrop-blur-xl py-3.5 mb-6">
        <h1 className="text-base font-bold tracking-tight text-foreground">Learning Hub</h1>
      </div>

      <CurriculumActionsGrid
        primaryMission={primaryMission}
        weakestSkill={weakestSkill}
        currentSkillProfile={currentSkillProfile}
        memory={memory}
        setSelectedSkill={setSelectedSkill}
      />

      {activeSection === 'today' && (
        <CurriculumTodayTab
          isLoading={isLoading}
          missions={missions}
          learningState={learningState}
        />
      )}

      {activeSection === 'memory' && (
        <CurriculumMemoryTab
          memory={memory}
          grammarSummary={grammarSummary}
          repeatedMistakes={repeatedMistakes}
          badges={badges}
          unifiedReviewQueue={unifiedReviewQueue}
          reviewPriorities={reviewPriorities}
        />
      )}

      {activeSection === 'full' && (
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
      )}
    </div>
  );
};

export default CurriculumPage;
