import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Clock3,
  Database,
  Headphones,
  Languages,
  Mic2,
  Network,
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

interface GraphNode {
  id: string;
  label: string;
  type: 'hub' | 'skill' | 'topic' | 'grammar';
  x: number;
  y: number;
  color: string;
  size: number;
  description: string;
  status: string;
  strength: number;
  connections: string[];
  linkUrl?: string;
  relatedVocab?: string[];
  relatedGrammar?: string[];
}

const GRAPH_NODES: GraphNode[] = [
  {
    id: 'hub',
    label: 'B2 CEFR Hub',
    type: 'hub',
    x: 400,
    y: 250,
    color: '#6366f1',
    size: 24,
    description:
      'The core alignment hub for B2 level engineering communications, connecting vocabulary domain filters to targeted skill tasks.',
    status: 'Active Target',
    strength: 78,
    connections: [
      'reading',
      'writing',
      'listening',
      'speaking',
      'vocabulary',
      'grammar',
    ],
  },
  {
    id: 'reading',
    label: 'Reading Practice',
    type: 'skill',
    x: 280,
    y: 170,
    color: '#10b981',
    size: 16,
    description:
      'Technical manuals, site constraints, sequence reports, and witness logs.',
    status: 'Proficient',
    strength: 84,
    connections: ['hub', 'topic-coordination', 'topic-hse'],
    linkUrl: '/reading',
  },
  {
    id: 'writing',
    label: 'Writing Practice',
    type: 'skill',
    x: 280,
    y: 330,
    color: '#10b981',
    size: 16,
    description:
      'QA/QC inspector comments, recovery action plans, and professional email correspondence.',
    status: 'Needs Practice',
    strength: 54,
    connections: [
      'hub',
      'topic-inspection',
      'topic-tech-write',
      'grammar-passive',
    ],
    linkUrl: '/writing',
  },
  {
    id: 'listening',
    label: 'Listening Practice',
    type: 'skill',
    x: 520,
    y: 170,
    color: '#10b981',
    size: 16,
    description:
      'Comprehending toolboxes, inspection feedback, site constraint updates, and witness reviews.',
    status: 'Proficient',
    strength: 73,
    connections: ['hub', 'topic-hse'],
    linkUrl: '/listening',
  },
  {
    id: 'speaking',
    label: 'Speaking Practice',
    type: 'skill',
    x: 520,
    y: 330,
    color: '#10b981',
    size: 16,
    description:
      'Site meeting participation, risk warning communication, and witness coordination.',
    status: 'Needs Practice',
    strength: 62,
    connections: ['hub', 'topic-coordination', 'grammar-conditionals'],
    linkUrl: '/speaking',
  },
  {
    id: 'vocabulary',
    label: 'Vocabulary Memory',
    type: 'skill',
    x: 400,
    y: 100,
    color: '#f59e0b',
    size: 16,
    description:
      'Site vocabulary engine, containing MEP, electrical, civil, and safety terminology.',
    status: 'On track',
    strength: 81,
    connections: ['hub', 'topic-inspection'],
    linkUrl: '/vocabulary',
  },
  {
    id: 'grammar',
    label: 'Grammar Foundations',
    type: 'skill',
    x: 400,
    y: 400,
    color: '#ec4899',
    size: 16,
    description:
      'Active/Passive reporting style, relative clauses, and site condition hypotheticals.',
    status: 'On track',
    strength: 70,
    connections: ['hub', 'grammar-passive', 'grammar-conditionals'],
    linkUrl: '/grammar',
  },
  {
    id: 'topic-coordination',
    label: 'Site Coordination',
    type: 'topic',
    x: 140,
    y: 120,
    color: '#3b82f6',
    size: 12,
    description:
      'Clarifying sequence, ownership, and constraint during coordination meetings.',
    status: 'Unlocked',
    strength: 75,
    connections: ['reading', 'speaking'],
    relatedVocab: [
      'constraint',
      'alignment',
      'sequence',
      'milestone',
      'handover',
    ],
    relatedGrammar: ['Passive reports', 'Future possibility'],
  },
  {
    id: 'topic-inspection',
    label: 'QA/QC Inspection',
    type: 'topic',
    x: 140,
    y: 380,
    color: '#3b82f6',
    size: 12,
    description:
      'Standardizing comment format, non-conformance reports, and corrective actions.',
    status: 'Unlocked',
    strength: 68,
    connections: ['writing', 'vocabulary'],
    relatedVocab: [
      'deviation',
      'non-conformance',
      'remediation',
      'tolerance',
      'insulation',
    ],
    relatedGrammar: ['Passive voice (reports)', 'Present perfect for state'],
  },
  {
    id: 'topic-hse',
    label: 'HSE & Safety Rules',
    type: 'topic',
    x: 660,
    y: 120,
    color: '#3b82f6',
    size: 12,
    description:
      'Communicating hazards, emergency guidelines, and warning actions.',
    status: 'Unlocked',
    strength: 88,
    connections: ['listening', 'reading'],
    relatedVocab: ['hazard', 'PPE', 'clearance', 'evacuation', 'compliance'],
    relatedGrammar: ['Imperative statements', 'First conditional constraints'],
  },
  {
    id: 'topic-tech-write',
    label: 'Technical Writing',
    type: 'topic',
    x: 660,
    y: 380,
    color: '#3b82f6',
    size: 12,
    description:
      'Writing specifications, summaries of delays, and request details clearly.',
    status: 'Unlocked',
    strength: 63,
    connections: ['writing', 'grammar'],
    relatedVocab: [
      'specification',
      'scope',
      'variance',
      'contingency',
      'revision',
    ],
    relatedGrammar: ['Relative clauses', 'Gerunds as subjects'],
  },
  {
    id: 'grammar-passive',
    label: 'Passive Voice',
    type: 'grammar',
    x: 240,
    y: 450,
    color: '#a855f7',
    size: 10,
    description:
      'Standardizing reports (e.g., "The cables were pulled...") to sound objective.',
    status: 'Proficient',
    strength: 78,
    connections: ['grammar', 'writing'],
    relatedVocab: [
      'installed',
      'tested',
      'witnessed',
      'rejected',
      'commissioned',
    ],
  },
  {
    id: 'grammar-conditionals',
    label: 'Conditionals',
    type: 'grammar',
    x: 560,
    y: 450,
    color: '#a855f7',
    size: 10,
    description:
      'Discussing safety hazards and recovery (e.g., "If the main breaker trips, the backup system starts").',
    status: 'Needs review',
    strength: 58,
    connections: ['grammar', 'speaking'],
    relatedVocab: ['trip', 'fail-safe', 'contingency', 'backup', 'bypass'],
  },
];

const GRAPH_LINKS = [
  { source: 'hub', target: 'reading' },
  { source: 'hub', target: 'writing' },
  { source: 'hub', target: 'listening' },
  { source: 'hub', target: 'speaking' },
  { source: 'hub', target: 'vocabulary' },
  { source: 'hub', target: 'grammar' },
  { source: 'topic-coordination', target: 'reading' },
  { source: 'topic-coordination', target: 'speaking' },
  { source: 'topic-inspection', target: 'writing' },
  { source: 'topic-inspection', target: 'vocabulary' },
  { source: 'topic-hse', target: 'listening' },
  { source: 'topic-hse', target: 'reading' },
  { source: 'topic-tech-write', target: 'writing' },
  { source: 'topic-tech-write', target: 'grammar' },
  { source: 'grammar-passive', target: 'grammar' },
  { source: 'grammar-passive', target: 'writing' },
  { source: 'grammar-conditionals', target: 'grammar' },
  { source: 'grammar-conditionals', target: 'speaking' },
];

const CurriculumPage = () => {
  const navigate = useNavigate();
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
  const [selectedGraphNode, setSelectedGraphNode] = useState<GraphNode | null>(
    null
  );

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
            className={`min-h-32 rounded-xl border p-4 text-left transition-all hover:-translate-y-px hover:border-primary hover:bg-surface-hover ${
              index === 0
                ? 'border-primary bg-surface-hover'
                : 'border-border-soft bg-surface'
            }`}
          >
            <span className="text-[10px] font-medium uppercase text-muted-copy">
              {item.label}
            </span>
            <span className="mt-2 block line-clamp-2 text-sm font-medium text-foreground">
              {item.value}
            </span>
            <span className="mt-2 block text-xs text-muted-copy">
              {item.detail}
            </span>
          </button>
        ))}
      </section>

      {activeSection === 'today' && (
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
                    className="h-44 animate-pulse rounded-xl border border-border-soft bg-surface-hover"
                  />
                ))
              : missions.map((mission, index) => (
                  <article
                    key={mission.id}
                    className="flex min-h-44 flex-col rounded-xl border border-border-soft bg-surface p-5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <StatusBadge
                        label={index === 0 ? 'Recommended' : mission.difficulty}
                        tone={index === 0 ? 'info' : 'neutral'}
                      />
                      <span className="text-sm font-medium text-foreground">
                        {mission.cefrBand}
                      </span>
                    </div>
                    <h3 className="mt-4 font-medium text-foreground">
                      {mission.title}
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-6 text-muted-copy">
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
      )}

      {activeSection === 'memory' && (
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
                  <p className="text-xs font-medium text-primary">
                    Unified Review Queue
                  </p>
                  <p className="mt-1 text-sm text-muted-copy">
                    Focus on the most useful improvement first.
                  </p>
                </div>
                <Link
                  to="/learning-plan"
                  className="text-sm font-medium text-primary hover:text-primary"
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
                      className="rounded-xl border border-border-soft bg-surface-hover p-4"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <StatusBadge
                          label={
                            index === 0 ? 'Start here' : `Priority ${index + 1}`
                          }
                          tone={index === 0 ? 'warning' : 'neutral'}
                        />
                        <span className="text-xs font-medium text-muted-copy">
                          {item.priority}
                        </span>
                      </div>
                      <p className="mt-3 text-sm font-medium text-foreground">
                        {item.label}
                      </p>
                      <p className="mt-2 text-xs leading-5 text-muted-copy">
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
      )}

      {activeSection === 'full' && (
        <>
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
                        ? 'border-primary bg-surface-hover'
                        : 'border-border-soft bg-surface hover:border-primary'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <Icon className="h-5 w-5 text-primary" />
                      {skill === weakestSkill && (
                        <span className="text-[9px] font-medium uppercase text-warning">
                          Focus
                        </span>
                      )}
                    </div>
                    <p className="mt-3 text-sm font-medium text-foreground">
                      {meta.label}
                    </p>
                    <p className="mt-1 text-xs text-muted-copy">
                      {skillProfile.cefrBand} ·{' '}
                      {skillProfile.progressToNextBand}%
                    </p>
                    <p className="mt-1 text-xs font-medium text-primary">
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
                <div className="h-72 animate-pulse rounded-xl bg-surface-hover" />
              ) : (
                <div className="space-y-6">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <Card hoverEffect={false} className="p-4">
                      <p className="text-[10px] font-medium uppercase text-muted-copy">
                        Target CEFR
                      </p>
                      <p className="mt-1 text-xl font-medium text-foreground">
                        {recommendation.targetCefr}
                      </p>
                    </Card>
                    <Card hoverEffect={false} className="p-4">
                      <p className="text-[10px] font-medium uppercase text-muted-copy">
                        Safe / Stretch
                      </p>
                      <p className="mt-1 text-xl font-medium text-foreground">
                        75% / 25%
                      </p>
                    </Card>
                    <Card hoverEffect={false} className="p-4">
                      <p className="text-[10px] font-medium uppercase text-muted-copy">
                        Effort
                      </p>
                      <p className="mt-1 text-xl font-medium text-foreground">
                        {recommendation.estimatedMinutes} min
                      </p>
                    </Card>
                    <Card hoverEffect={false} className="p-4">
                      <p className="text-[10px] font-medium uppercase text-muted-copy">
                        AI required
                      </p>
                      <p className="mt-1 text-xl font-medium text-success">
                        No
                      </p>
                    </Card>
                  </div>

                  <div className="rounded-xl border border-primary bg-surface-hover p-4">
                    <p className="text-xs font-medium uppercase text-primary">
                      Why recommended
                    </p>
                    <p className="mt-2 text-sm leading-6 text-foreground">
                      {recommendation.whyRecommended}
                    </p>
                  </div>

                  <div className="rounded-xl border border-border-soft bg-surface p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs font-medium uppercase text-muted-copy">
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
                          className="rounded-lg bg-surface-hover p-3 text-xs leading-5 text-muted-copy"
                        >
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-5 lg:grid-cols-2">
                    <div>
                      <h3 className="font-medium text-foreground">
                        Vocabulary focus
                      </h3>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {recommendation.vocabularyFocus.length > 0 ? (
                          recommendation.vocabularyFocus.map(
                            ({ term, bucket }) => (
                              <span
                                key={term.id}
                                className="rounded-full border border-border-soft bg-surface-hover px-3 py-1 text-xs font-medium text-foreground"
                              >
                                {term.term} · {bucket}
                              </span>
                            )
                          )
                        ) : (
                          <span className="text-sm text-muted-copy">
                            No matching vocabulary for this manual domain.
                            Choose All to use the current-level database set.
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">
                        Grammar focus
                      </h3>
                      <div className="mt-3 space-y-2">
                        {recommendation.grammarFocus.length > 0 ? (
                          recommendation.grammarFocus.map((rule) => (
                            <p
                              key={rule.id}
                              className="rounded-lg border border-border-soft bg-surface-hover p-3 text-sm text-foreground"
                            >
                              {rule.title} · {rule.cefrLevel}
                            </p>
                          ))
                        ) : (
                          <p className="text-sm text-muted-copy">
                            No matching grammar rule for this manual domain.
                          </p>
                        )}
                      </div>
                      {recommendation.grammarFocus.length > 0 && (
                        <p className="mt-2 text-xs font-medium text-muted-copy">
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

                  <div className="rounded-xl border border-border-soft bg-surface-hover p-4">
                    <p className="text-xs font-medium uppercase text-muted-copy">
                      Expected answer
                    </p>
                    <p className="mt-2 text-sm font-medium text-foreground">
                      {recommendation.expectedAnswerType}
                    </p>
                    <p className="mt-2 text-xs leading-5 text-muted-copy">
                      {recommendation.context}
                    </p>
                    <p className="mt-2 text-xs font-medium uppercase text-primary">
                      Weakest-area priority: {recommendation.focusPriority}
                    </p>
                  </div>

                  {selectedMeta.route ? (
                    <Button onClick={() => navigate(selectedMeta.route!)}>
                      Open {selectedMeta.label} workspace
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <p className="rounded-xl border border-warning bg-surface-hover p-4 text-sm text-foreground">
                      Grammar selection is active in this hub. A dedicated
                      Grammar task runner is not connected in this sprint.
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
                <label className="text-sm font-medium text-foreground">
                  Vocabulary/domain focus
                  <select
                    value={domain}
                    onChange={(event) => setDomain(event.target.value)}
                    className="mt-2 min-h-11 w-full rounded-lg border border-border-soft bg-surface px-3 font-normal"
                  >
                    {DOMAINS.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </label>
                <p className="mt-4 text-xs leading-5 text-muted-copy">
                  Difficulty remains bounded to the selected skill: three safe
                  allocations and one controlled stretch allocation.
                </p>
              </SectionCard>

              <SectionCard
                title="Placement Test"
                subtitle={
                  profile.placementCompleted ? 'Completed' : 'Available'
                }
                icon={Clock3}
              >
                <p className="text-sm leading-6 text-muted-copy">
                  {profile.placementCompleted
                    ? `Local placement recommends ${profile.placementBand ?? 'A1'} with ${profile.placementConfidence} confidence.`
                    : 'Take the short Reading, Vocabulary and Grammar placement, or continue at A1.'}
                </p>
                <Link
                  to="/placement"
                  className="mt-4 inline-flex text-sm font-medium text-primary"
                >
                  {profile.placementCompleted
                    ? 'Retake placement'
                    : 'Start placement'}
                </Link>
              </SectionCard>
            </aside>
          </div>
        </>
      )}
      {activeSection === 'graph' && (
        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <div className="rounded-xl border border-border-soft bg-surface p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium text-foreground">
                  Cross-Skill Knowledge Graph
                </h2>
                <p className="text-xs text-muted-copy">
                  Interactive representation of how vocabulary, grammar topics,
                  and core skills connect.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedGraphNode(null)}
                className="text-xs font-medium text-primary hover:underline"
              >
                Reset Selection
              </button>
            </div>

            <div className="relative aspect-video w-full rounded-lg border border-border-soft bg-surface-hover overflow-hidden select-none">
              <svg viewBox="0 0 800 500" className="h-full w-full">
                {/* Connection Links */}
                {GRAPH_LINKS.map((link, idx) => {
                  const source = GRAPH_NODES.find((n) => n.id === link.source);
                  const target = GRAPH_NODES.find((n) => n.id === link.target);
                  if (!source || !target) return null;

                  const isHighlighted = selectedGraphNode
                    ? selectedGraphNode.id === source.id ||
                      selectedGraphNode.id === target.id
                    : false;

                  return (
                    <line
                      key={idx}
                      x1={source.x}
                      y1={source.y}
                      x2={target.x}
                      y2={target.y}
                      stroke={
                        isHighlighted
                          ? 'var(--color-primary, #6366f1)'
                          : '#e2e8f0'
                      }
                      strokeWidth={isHighlighted ? 2.5 : 1.2}
                      strokeDasharray={
                        link.source.startsWith('topic') ||
                        link.target.startsWith('topic')
                          ? '4 4'
                          : undefined
                      }
                      opacity={
                        selectedGraphNode && !isHighlighted ? 0.25 : 0.65
                      }
                      className="transition-all duration-300"
                    />
                  );
                })}

                {/* Nodes */}
                {GRAPH_NODES.map((node) => {
                  const isSelected = selectedGraphNode?.id === node.id;
                  const isHighlighted = selectedGraphNode
                    ? selectedGraphNode.id === node.id ||
                      selectedGraphNode.connections.includes(node.id) ||
                      (node.id === 'hub' &&
                        selectedGraphNode.connections.includes(node.id))
                    : true;

                  return (
                    <g
                      key={node.id}
                      transform={`translate(${node.x}, ${node.y})`}
                      onClick={() => setSelectedGraphNode(node)}
                      className="cursor-pointer group"
                    >
                      {/* Node Outer Glow/Ring */}
                      <circle
                        r={node.size + 6}
                        fill="transparent"
                        stroke={node.color}
                        strokeWidth={isSelected ? 2 : 0}
                        className="transition-all duration-300 group-hover:stroke-2"
                        opacity={0.4}
                      />
                      {/* Node Body */}
                      <circle
                        r={node.size}
                        fill={node.color}
                        opacity={isHighlighted ? 1 : 0.3}
                        className="transition-all duration-300"
                      />
                      {/* Label Text */}
                      <text
                        y={node.size + 16}
                        textAnchor="middle"
                        className="text-[10px] font-medium transition-all duration-300"
                        fill="currentColor"
                        opacity={isHighlighted ? 1 : 0.3}
                      >
                        {node.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Details Panel */}
          <div className="space-y-6">
            <div className="rounded-xl border border-border-soft bg-surface p-5">
              {selectedGraphNode ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-medium text-primary uppercase">
                      {selectedGraphNode.type}
                    </span>
                    <span className="text-xs font-semibold text-foreground">
                      {selectedGraphNode.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-semibold text-foreground">
                      {selectedGraphNode.label}
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-muted-copy">
                      {selectedGraphNode.description}
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-medium text-foreground">
                      <span>Estimated Strength</span>
                      <span>{selectedGraphNode.strength}%</span>
                    </div>
                    <div className="mt-1.5 h-2 w-full rounded-full bg-surface-hover">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-500"
                        style={{ width: `${selectedGraphNode.strength}%` }}
                      />
                    </div>
                  </div>

                  {selectedGraphNode.relatedVocab &&
                    selectedGraphNode.relatedVocab.length > 0 && (
                      <div className="border-t border-border-soft pt-3">
                        <h4 className="text-xs font-medium text-foreground uppercase tracking-wider">
                          Related Vocabulary
                        </h4>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {selectedGraphNode.relatedVocab.map((word) => (
                            <span
                              key={word}
                              className="rounded-md bg-surface-hover border border-border-soft px-2 py-0.5 text-xs text-foreground"
                            >
                              {word}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                  {selectedGraphNode.relatedGrammar &&
                    selectedGraphNode.relatedGrammar.length > 0 && (
                      <div className="border-t border-border-soft pt-3">
                        <h4 className="text-xs font-medium text-foreground uppercase tracking-wider">
                          Grammar Context
                        </h4>
                        <ul className="mt-2 space-y-1 text-xs text-muted-copy list-disc list-inside">
                          {selectedGraphNode.relatedGrammar.map((rule) => (
                            <li key={rule}>{rule}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                  {selectedGraphNode.linkUrl && (
                    <Button
                      onClick={() => navigate(selectedGraphNode.linkUrl!)}
                      className="mt-2 w-full justify-center"
                    >
                      Launch Focused Study
                    </Button>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <Network className="mx-auto h-8 w-8 text-muted-copy" />
                  <p className="mt-3 text-sm font-medium text-foreground">
                    No node selected
                  </p>
                  <p className="mt-1.5 text-xs leading-5 text-muted-copy">
                    Click any node in the knowledge graph network to view
                    related details, vocabulary alignments, and practice
                    shortcuts.
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-border-soft bg-surface p-5">
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Graph Legend
              </h3>
              <div className="mt-3 space-y-2.5">
                {[
                  { color: '#6366f1', label: 'Central CEFR Hub' },
                  {
                    color: '#10b981',
                    label: 'Core Skills (Reading, Writing, etc.)',
                  },
                  {
                    color: '#f59e0b',
                    label: 'Discipline Specific Vocabularies',
                  },
                  { color: '#ec4899', label: 'Grammar Foundations' },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-2 text-xs"
                  >
                    <span
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-muted-copy">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurriculumPage;
