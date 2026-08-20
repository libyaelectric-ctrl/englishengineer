import { Bolt } from 'lucide-react';

import { useEffect, useMemo, useRef, useState } from 'react';

import { useNavigate, useParams } from 'react-router-dom';

import { PageHeader } from '@/shared/components/PageHeader';
import {
  type PipelineStation,
  UniversalCyberPipeline,
} from '@/shared/components/UniversalCyberPipeline';

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
  const { section } = useParams<{ section: string }>();
  const navigate = useNavigate();
  const activeSection = section || 'today';
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

  const curriculumStations: PipelineStation[] = useMemo(() => {
    return missions.map((mission, idx) => ({
      id: mission.id,
      levelBadge: mission.cefrBand,
      title: mission.title,
      subtitle: mission.skill,
      status: idx === 0 ? 'in-progress' : 'available',
      progressRatio: idx === 0 ? 0.4 : 0,
      totalItems: 1,
      completedItems: 0,
      onAction: () => navigate(mission.route),
    }));
  }, [missions, navigate]);

  const dailyStreak = learningState?.streak ?? 0;
  const dailyXp = learningState?.xp ?? 0;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-7 animate-in fade-in duration-300 pb-8 text-foreground relative z-10 font-sans">
      <PageHeader
        title={translate('learningHub.title')}
        description="Your personalized learning journey and task recommendations."
      />

      <CurriculumActionsGrid
        primaryMission={primaryMission}
        weakestSkill={weakestSkill}
        currentSkillProfile={currentSkillProfile}
        memory={memory}
        setSelectedSkill={setSelectedSkill}
      />

      {activeSection === 'today' && (
        <>
          {curriculumStations.length > 0 && (
            <UniversalCyberPipeline
              title={translate('pipeline.curriculum.title')}
              subtitle={translate('pipeline.curriculum.subtitle')}
              badgeText={`DAY-${dailyStreak + 1}`}
              icon={Bolt}
              stations={curriculumStations}
              activeStationId={curriculumStations[0]?.id}
              onSelectStation={(id) => {
                const target = missions.find((m) => m.id === id);
                if (target) navigate(target.route);
              }}
              translate={translate}
              metrics={[
                {
                  icon: <Bolt className="h-4 w-4 text-emerald-400" />,
                  label: translate('pipeline.metric.streak'),
                  value: dailyStreak,
                },
                {
                  icon: <Bolt className="h-4 w-4 text-cyan-400" />,
                  label: 'XP',
                  value: dailyXp,
                },
                {
                  icon: <Bolt className="h-4 w-4 text-amber-400" />,
                  label: translate('pipeline.metric.tasks'),
                  value: missions.length,
                },
              ]}
            />
          )}
          <CurriculumTodayTab
            isLoading={isLoading}
            missions={missions}
            learningState={learningState}
          />
        </>
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
