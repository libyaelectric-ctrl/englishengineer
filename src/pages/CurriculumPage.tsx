import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuthStore } from '@/features/auth';
import {
  LearningTaskEngine,
  type LearningTaskRecommendation,
} from '@/features/learning-orchestrator';
import {
  LearningProfileEngine,
  type SkillName,
  useLearningCockpit,
} from '@/features/profile';
import { ProductAnalyticsService } from '@/features/analytics/product-analytics.service';
import { GrammarProgressService } from '@/features/grammar';
import {
  buildReviewPriorities,
  UnifiedReviewQueueService,
  useLearningIntelligenceStore,
  type UnifiedReviewItem,
} from '@/features/learning-intelligence';
import { SKILL_META } from './CurriculumPage/curriculum-data';
import { CurriculumActionsGrid } from './CurriculumPage/CurriculumActionsGrid';
import { CurriculumTodayTab } from './CurriculumPage/CurriculumTodayTab';
import { CurriculumMemoryTab } from './CurriculumPage/CurriculumMemoryTab';
import { CurriculumFullTab } from './CurriculumPage/CurriculumFullTab';

const CurriculumPage = () => {
  const { section } = useParams<{ section: string }>();
  const activeSection = section || 'today';
  const currentUser = useAuthStore((state) => state.currentUser);
  const { profile, memory, missions, isLoading } = useLearningCockpit(
    currentUser?.id
  );
  const mistakeLog = useLearningIntelligenceStore((state) => state.mistakeLog);
  const weakestSkill = useMemo(
    () => LearningTaskEngine.getWeakestSkill(profile),
    [profile]
  );
  const [selectedSkill, setSelectedSkill] = useState<SkillName>('reading');
  const [domain, setDomain] = useState('All');
  const [recommendation, setRecommendation] =
    useState<LearningTaskRecommendation | null>(null);
  const [recommendationLoading, setRecommendationLoading] = useState(true);
  const [unifiedReviewQueue, setUnifiedReviewQueue] = useState<
    UnifiedReviewItem[]
  >([]);

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
    void LearningTaskEngine.createRecommendation(profile, selectedSkill, {
      domain: domain === 'All' ? undefined : domain,
      recommended: selectedSkill === weakestSkill,
    }).then((next) => {
      if (!active) return;
      setRecommendation(next);
      setRecommendationLoading(false);
    });
    return () => {
      active = false;
    };
  }, [domain, profile, selectedSkill, weakestSkill]);

  useEffect(() => {
    let active = true;
    void UnifiedReviewQueueService.buildQueue(profile).then((queue) => {
      if (active) setUnifiedReviewQueue(queue);
    });
    return () => {
      active = false;
    };
  }, [profile]);

  const selectedMeta = SKILL_META[selectedSkill];
  const reviewPriorities = buildReviewPriorities([
    ...(memory.weakWords > 0
      ? [
          {
            id: 'weak-words',
            label: `${memory.weakWords} weak vocabulary items`,
            source: 'weak-word' as const,
            severity: memory.weakWords,
          },
        ]
      : []),
    ...(memory.dueToday > 0
      ? [
          {
            id: 'due-vocabulary',
            label: `${memory.dueToday} vocabulary items due`,
            source: 'due-item' as const,
            severity: memory.dueToday,
          },
        ]
      : []),
    ...mistakeLog
      .filter((item) => (item.repetitionCount ?? 1) >= 3)
      .map((item) => ({
        id: item.id,
        label: `${item.category}: ${item.originalText}`,
        source: 'repeated-mistake' as const,
        severity: item.repetitionCount,
      })),
    {
      id: `skill-${weakestSkill}`,
      label: `${weakestSkill[0].toUpperCase()}${weakestSkill.slice(1)} needs focused practice`,
      source: 'skill-weakness' as const,
      severity: Math.round(profile.skills[weakestSkill].weaknessScore / 10),
    },
  ]);
  const primaryMission = missions[0];
  const currentSkillProfile = profile.skills[weakestSkill];
  const grammarSummary = GrammarProgressService.getSummary(360);
  const badges = LearningProfileEngine.getBadges(profile, memory);
  const repeatedMistakes = mistakeLog.filter(
    (item) => (item.repetitionCount ?? 1) >= 3
  ).length;

  return (
    <div className="mx-auto max-w-5xl space-y-7 animate-in fade-in duration-300 pb-8 text-foreground relative z-10 font-sans">
      <div className="sticky top-0 z-40 border-b border-[#d9d9e3] bg-[#faf8ff] py-3.5 shadow-sm -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Learning Hub
        </h1>
      </div>

      <CurriculumActionsGrid
        primaryMission={primaryMission}
        weakestSkill={weakestSkill}
        currentSkillProfile={currentSkillProfile}
        memory={memory}
        setSelectedSkill={setSelectedSkill}
      />

      {activeSection === 'today' && (
        <CurriculumTodayTab isLoading={isLoading} missions={missions} />
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
