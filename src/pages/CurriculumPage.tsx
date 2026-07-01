import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Clock3,
  Database,
  Headphones,
  Languages,
  Mic2,
  PenTool,
  Sparkles,
  Target,
} from 'lucide-react';
import { useAuthStore } from '@/features/auth';
import {
  LessonPathEngine,
  LearningTaskEngine,
  type LearningTaskRecommendation,
} from '@/features/learning-orchestrator';
import {
  LearningProfileEngine,
  SKILL_NAMES,
  type SkillName,
  useLearningCockpit,
} from '@/features/profile';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { PageHeader } from '@/shared/components/PageHeader';
import { SectionCard } from '@/shared/components/SectionCard';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { ProductAnalyticsService } from '@/features/analytics/product-analytics.service';
import { GrammarProgressService } from '@/features/grammar';
import {
  buildReviewPriorities,
  LearningMemorySummary,
  UnifiedReviewQueueService,
  useLearningIntelligenceStore,
  type UnifiedReviewItem,
} from '@/features/learning-intelligence';

const SKILL_META: Record<
  SkillName,
  { label: string; route: string | null; icon: typeof BookOpen }
> = {
  reading: { label: 'Reading', route: '/reading', icon: BookOpen },
  writing: { label: 'Writing', route: '/writing', icon: PenTool },
  listening: { label: 'Listening', route: '/listening', icon: Headphones },
  speaking: { label: 'Speaking', route: '/speaking', icon: Mic2 },
  vocabulary: { label: 'Vocabulary', route: '/vocabulary', icon: Languages },
  grammar: { label: 'Grammar', route: '/grammar', icon: Database },
};

const DOMAINS = [
  'All',
  'general-english',
  'professional-communication',
  'construction-site',
  'electrical',
  'mechanical',
  'architecture',
  'qa-qc',
  'hse',
];

const CurriculumPage = () => {
  const navigate = useNavigate();
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

  useEffect(() => {
    setSelectedSkill(weakestSkill);
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
    <div className="space-y-7 animate-in fade-in duration-300">
      <PageHeader
        title="Learning Hub"
        description="One clear next lesson, six independent skills, and one connected Learning Memory."
        badgeText="START AT A1"
        badgeColor="primary"
      />

      <nav
        aria-label="Learning Hub sections"
        className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm"
      >
        <a
          href="#today"
          className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-bold text-white"
        >
          Today
        </a>
        <a
          href="#curriculum"
          className="rounded-lg px-4 py-2 text-sm font-bold text-slate-600 hover:bg-sky-50"
        >
          Curriculum
        </a>
        <a
          href="#review"
          className="rounded-lg px-4 py-2 text-sm font-bold text-slate-600 hover:bg-sky-50"
        >
          Learning Memory
        </a>
      </nav>

      <section
        className="grid gap-3 md:grid-cols-3"
        aria-label="Learning actions"
      >
        {[
          {
            label: 'Continue Learning',
            value: primaryMission?.title ?? 'Build your first task',
            detail: primaryMission
              ? `${primaryMission.estimatedMinutes} min`
              : 'Ready at A1',
            action: () => navigate(primaryMission?.route ?? '/reading'),
          },
          {
            label: "Today's Best Task",
            value: primaryMission?.reason ?? 'Start with a current-level task',
            detail: primaryMission?.cefrBand ?? currentSkillProfile.cefrBand,
            action: () => navigate(primaryMission?.route ?? '/reading'),
          },
          {
            label: 'Improve Next',
            value: weakestSkill[0].toUpperCase() + weakestSkill.slice(1),
            detail: `${currentSkillProfile.cefrBand} · independent skill priority`,
            action: () => setSelectedSkill(weakestSkill),
          },
          {
            label: 'Due Review',
            value: `${memory.dueToday} items`,
            detail:
              memory.weakWords > 0
                ? `${memory.weakWords} weak words`
                : 'Queue is current',
            action: () => navigate('/vocabulary'),
          },
        ].map((item, index) => (
          <button
            key={item.label}
            type="button"
            onClick={item.action}
            className={`min-h-32 rounded-[16px] border p-4 text-left transition-all hover:-translate-y-px hover:border-sky-200 hover:bg-sky-50/50 hover:shadow-sm ${
              index === 0
                ? 'border-sky-200 bg-sky-50'
                : 'border-slate-200 bg-white'
            }`}
          >
            <span className="text-[10px] font-black uppercase text-slate-500">
              {item.label}
            </span>
            <span className="mt-2 block line-clamp-2 text-sm font-black text-slate-950">
              {item.value}
            </span>
            <span className="mt-2 block text-xs text-slate-500">
              {item.detail}
            </span>
          </button>
        ))}
      </section>

      <SectionCard
        id="today"
        title="Recommended Today"
        subtitle="Chosen from independent skill progress, vocabulary memory, current-level databases, and weaknesses"
        icon={Sparkles}
      >
        <div className="grid gap-4 lg:grid-cols-3">
          {isLoading
            ? [0, 1, 2].map((item) => (
                <div
                  key={item}
                  className="h-44 animate-pulse rounded-xl border border-slate-200 bg-slate-50"
                />
              ))
            : missions.map((mission, index) => (
                <article
                  key={mission.id}
                  className="flex min-h-44 flex-col rounded-xl border border-slate-200 bg-white p-5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <StatusBadge
                      label={index === 0 ? 'Recommended' : mission.difficulty}
                      tone={index === 0 ? 'info' : 'neutral'}
                    />
                    <span className="text-sm font-black text-slate-900">
                      {mission.cefrBand}
                    </span>
                  </div>
                  <h3 className="mt-4 font-black text-slate-950">
                    {mission.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">
                    {mission.reason}
                  </p>
                  <Button
                    variant="ghost"
                    className="mt-3 justify-start px-0"
                    onClick={() => navigate(mission.route)}
                  >
                    Review recommendation <ArrowRight className="h-4 w-4" />
                  </Button>
                </article>
              ))}
        </div>
      </SectionCard>

      <SectionCard
        id="review"
        title="Learning Memory"
        subtitle="Everything you learn shapes what comes next"
        icon={BookOpen}
      >
        <div className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
          <LearningMemorySummary
            vocabulary={memory}
            grammar={grammarSummary}
            repeatedMistakes={repeatedMistakes}
            badges={badges}
          />
          <div>
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-blue-700">
                  Unified Review Queue
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Focus on the most useful improvement first.
                </p>
              </div>
              <Link
                to="/learning-plan"
                className="text-sm font-bold text-blue-700 hover:text-blue-800"
              >
                View plan
              </Link>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {(unifiedReviewQueue.length > 0
                ? unifiedReviewQueue
                : reviewPriorities
              )
                .slice(0, 4)
                .map((item, index) => (
                  <div
                    key={item.id}
                    className="rounded-[14px] border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <StatusBadge
                        label={
                          index === 0 ? 'Start here' : `Priority ${index + 1}`
                        }
                        tone={index === 0 ? 'warning' : 'neutral'}
                      />
                      <span className="text-xs font-black text-slate-500">
                        {item.priority}
                      </span>
                    </div>
                    <p className="mt-3 text-sm font-black text-slate-900">
                      {item.label}
                    </p>
                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      {item.reason}
                    </p>
                    {'route' in item && (
                      <Button
                        variant="ghost"
                        className="mt-3 px-0"
                        onClick={() =>
                          navigate((item as UnifiedReviewItem).route)
                        }
                      >
                        Practice now <ArrowRight className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        id="curriculum"
        title="Choose a skill"
        subtitle="Continue any skill independently without losing the shared lesson topic"
        icon={Target}
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {SKILL_NAMES.map((skill) => {
            const meta = SKILL_META[skill];
            const Icon = meta.icon;
            const skillProfile = profile.skills[skill];
            return (
              <button
                key={skill}
                type="button"
                onClick={() => {
                  setSelectedSkill(skill);
                  setDomain('All');
                }}
                className={`rounded-xl border p-4 text-left transition-colors ${
                  selectedSkill === skill
                    ? 'border-sky-300 bg-sky-50'
                    : 'border-slate-200 bg-white hover:border-sky-200'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <Icon className="h-5 w-5 text-sky-700" />
                  {skill === weakestSkill && (
                    <span className="text-[9px] font-black uppercase text-amber-700">
                      Focus
                    </span>
                  )}
                </div>
                <p className="mt-3 text-sm font-black text-slate-950">
                  {meta.label}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {skillProfile.cefrBand} · {skillProfile.progressToNextBand}%
                </p>
                <p className="mt-1 text-xs font-bold text-sky-700">
                  Lesson{' '}
                  {
                    LessonPathEngine.getSkillProgress(profile, skill).lesson
                      .number
                  }
                </p>
              </button>
            );
          })}
        </div>
      </SectionCard>

      <div
        id="gate-progress"
        className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]"
      >
        <SectionCard
          title={`${selectedMeta.label} Entry Brief`}
          subtitle="Review the recommendation before starting; manual changes are optional"
          icon={selectedMeta.icon}
        >
          {recommendationLoading || !recommendation ? (
            <div className="h-72 animate-pulse rounded-xl bg-slate-50" />
          ) : (
            <div className="space-y-6">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Card hoverEffect={false} className="p-4">
                  <p className="text-[10px] font-black uppercase text-slate-500">
                    Target CEFR
                  </p>
                  <p className="mt-1 text-xl font-black text-slate-950">
                    {recommendation.targetCefr}
                  </p>
                </Card>
                <Card hoverEffect={false} className="p-4">
                  <p className="text-[10px] font-black uppercase text-slate-500">
                    Safe / Stretch
                  </p>
                  <p className="mt-1 text-xl font-black text-slate-950">
                    75% / 25%
                  </p>
                </Card>
                <Card hoverEffect={false} className="p-4">
                  <p className="text-[10px] font-black uppercase text-slate-500">
                    Effort
                  </p>
                  <p className="mt-1 text-xl font-black text-slate-950">
                    {recommendation.estimatedMinutes} min
                  </p>
                </Card>
                <Card hoverEffect={false} className="p-4">
                  <p className="text-[10px] font-black uppercase text-slate-500">
                    AI required
                  </p>
                  <p className="mt-1 text-xl font-black text-emerald-700">No</p>
                </Card>
              </div>

              <div className="rounded-xl border border-sky-200 bg-sky-50 p-4">
                <p className="text-xs font-black uppercase text-sky-700">
                  Why recommended
                </p>
                <p className="mt-2 text-sm leading-6 text-sky-950">
                  {recommendation.whyRecommended}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-black uppercase text-slate-500">
                    Lesson {recommendation.lessonNumber}
                  </p>
                  <StatusBadge
                    label={recommendation.sharedLessonTitle}
                    tone="info"
                  />
                </div>
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  {Object.values(recommendation.explanation).map((line) => (
                    <p
                      key={line}
                      className="rounded-[10px] bg-slate-50 p-3 text-xs leading-5 text-slate-600"
                    >
                      {line}
                    </p>
                  ))}
                </div>
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                <div>
                  <h3 className="font-black text-slate-950">
                    Vocabulary focus
                  </h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {recommendation.vocabularyFocus.length > 0 ? (
                      recommendation.vocabularyFocus.map(({ term, bucket }) => (
                        <span
                          key={term.id}
                          className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700"
                        >
                          {term.term} · {bucket}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-500">
                        No matching vocabulary for this manual domain. Choose
                        All to use the current-level database set.
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-black text-slate-950">Grammar focus</h3>
                  <div className="mt-3 space-y-2">
                    {recommendation.grammarFocus.length > 0 ? (
                      recommendation.grammarFocus.map((rule) => (
                        <p
                          key={rule.id}
                          className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700"
                        >
                          {rule.title} · {rule.cefrLevel}
                        </p>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">
                        No matching grammar rule for this manual domain.
                      </p>
                    )}
                  </div>
                  {recommendation.grammarFocus.length > 0 && (
                    <p className="mt-2 text-xs font-bold text-slate-500">
                      Review state:{' '}
                      {
                        GrammarProgressService.get(
                          recommendation.grammarFocus[0].id
                        ).reviewStatus
                      }{' '}
                      ·{' '}
                      {
                        GrammarProgressService.get(
                          recommendation.grammarFocus[0].id
                        ).strength
                      }
                      % strength
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-black uppercase text-slate-500">
                  Expected answer
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-800">
                  {recommendation.expectedAnswerType}
                </p>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  {recommendation.context}
                </p>
                <p className="mt-2 text-xs font-black uppercase text-sky-700">
                  Weakest-area priority: {recommendation.focusPriority}
                </p>
              </div>

              {selectedMeta.route ? (
                <Button onClick={() => navigate(selectedMeta.route!)}>
                  Open {selectedMeta.label} workspace
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  Grammar selection is active in this hub. A dedicated Grammar
                  task runner is not connected in this sprint.
                </p>
              )}
            </div>
          )}
        </SectionCard>

        <aside className="space-y-5">
          <SectionCard
            title="Manual Change"
            subtitle="Recommendations never remove user control"
            icon={Target}
          >
            <label className="text-sm font-bold text-slate-700">
              Vocabulary/domain focus
              <select
                value={domain}
                onChange={(event) => setDomain(event.target.value)}
                className="mt-2 min-h-11 w-full rounded-[10px] border border-slate-200 bg-white px-3 font-normal"
              >
                {DOMAINS.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <p className="mt-4 text-xs leading-5 text-slate-500">
              Difficulty remains bounded to the selected skill: three safe
              allocations and one controlled stretch allocation.
            </p>
          </SectionCard>

          <SectionCard
            title="Placement Test"
            subtitle={profile.placementCompleted ? 'Completed' : 'Available'}
            icon={Clock3}
          >
            <p className="text-sm leading-6 text-slate-600">
              {profile.placementCompleted
                ? `Local placement recommends ${profile.placementBand ?? 'A1'} with ${profile.placementConfidence} confidence.`
                : 'Take the short Reading, Vocabulary and Grammar placement, or continue at A1.'}
            </p>
            <Link
              to="/placement"
              className="mt-4 inline-flex text-sm font-bold text-sky-700"
            >
              {profile.placementCompleted
                ? 'Retake placement'
                : 'Start placement'}
            </Link>
          </SectionCard>
        </aside>
      </div>
    </div>
  );
};

export default CurriculumPage;
