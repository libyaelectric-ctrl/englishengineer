import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  FileText,
  HelpCircle,
  PenLine,
  Search,
  Target,
  TriangleAlert,
} from 'lucide-react';
import { useAuthStore } from '@/features/auth';
import {
  GrammarProgressService,
  GrammarRepository,
  getGrammarReviewReason,
  getMissingGrammarTransferEvidence,
  sortByCurriculumOrder,
  useGrammarStore,
  type GrammarRuleProgress,
} from '@/features/grammar';
import { CEFR_LEVELS, type CefrLevel } from '@/features/level-system';
import { getBaseCefrLevel, useLearningCockpit } from '@/features/profile';
import { VocabularyRepository } from '@/features/vocabulary';
import { useLearningStore } from '@/core/learning';
import { Button } from '@/shared/components/Button';
import { showToast } from '@/shared/components/Toast';
import { ProductAnalyticsService } from '@/features/analytics/product-analytics.service';

type LessonStatus =
  | 'New'
  | 'Practicing'
  | 'Needs Reading/Writing'
  | 'Mastered';
const MODULE_LABELS: Record<string, string> = {
  'sentence-structure': 'Sentence Basics',
  tense: 'Talking About Time',
  questions: 'Asking Clearly',
  negatives: 'Saying What Is Not True',
  'modal-verbs': 'Permission and Obligation',
  'passive-voice': 'Reporting Work Professionally',
  conditionals: 'Risks and Consequences',
  conjunctions: 'Connecting Ideas',
  'adjectives-adverbs': 'Describing Clearly',
  'sentence-patterns': 'Useful Site Patterns',
  'site-communication-patterns': 'Site Communication',
  articles: 'Nouns and Articles',
  prepositions: 'Place and Direction',
  'relative-clauses': 'Adding Detail',
  nominalization: 'Formal Technical Writing',
  hedging: 'Careful Professional Language',
  'formal-email': 'Professional Email',
  'technical-reporting': 'Technical Reporting',
  'contractual-language': 'Contract Language',
  'risk-language': 'Risk and Consequence',
  'dispute-language': 'Claims and Disputes',
  'executive-summary': 'Executive Summaries',
};

const STATUS_STYLES: Record<LessonStatus, string> = {
  New: 'border-border-soft bg-surface text-muted-copy',
  Practicing: 'border-primary/25 bg-primary/5 text-primary',
  'Needs Reading/Writing': 'border-warning/30 bg-warning/5 text-warning',
  Mastered: 'border-success/30 bg-success/5 text-success',
};

const EMPTY_LEVEL_COUNTS: Record<CefrLevel, number> = {
  A1: 0,
  A2: 0,
  B1: 0,
  B2: 0,
  C1: 0,
  C2: 0,
};

const normalizeKey = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[-_\s]+/g, ' ');

const toTitle = (value: string): string =>
  value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const getModuleLabel = (category: string): string =>
  MODULE_LABELS[category] ?? toTitle(category);

const getLessonStatus = (progress: GrammarRuleProgress): LessonStatus => {
  if (progress.reviewStatus === 'Strong') return 'Mastered';
  const practiceReady = progress.correctUsages >= 3 && progress.strength >= 70;
  if (practiceReady) return 'Needs Reading/Writing';
  if (
    progress.reviewStatus !== 'New' ||
    progress.exposures > 0 ||
    progress.correctUsages > 0 ||
    progress.incorrectUsages > 0
  ) {
    return 'Practicing';
  }
  return 'New';
};

const getPracticeCount = (progress: GrammarRuleProgress): number =>
  Math.min(progress.correctUsages, 3);

const getTransferCount = (progress: GrammarRuleProgress): number =>
  2 - getMissingGrammarTransferEvidence(progress).length;

const compact = (value: string, fallback: string): string =>
  value.trim() ? value : fallback;

const getStatusLabel = (status: LessonStatus, compactLabel = false): string => {
  if (status === 'Needs Reading/Writing') {
    return compactLabel ? 'R/W' : status;
  }
  return status;
};

const GrammarPage = () => {
  const currentUser = useAuthStore((state) => state.currentUser);
  const { profile } = useLearningCockpit(currentUser?.id);
  const level = getBaseCefrLevel(profile.skills.grammar.cefrBand);
  const grammarPoolIds = useLearningStore((state) => state.grammarPool);

  const { rules, selectedId, query, setRules, setSelectedId, setQuery } =
    useGrammarStore();

  const lessonStripRef = useRef<HTMLDivElement>(null);

  const [vocabularyIndex, setVocabularyIndex] = useState<
    Record<string, string>
  >({});
  const [quizOpen, setQuizOpen] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [progressVersion, setProgressVersion] = useState(0);
  const [levelCounts, setLevelCounts] =
    useState<Record<CefrLevel, number>>(EMPTY_LEVEL_COUNTS);

  useEffect(() => {
    let active = true;
    void GrammarRepository.getGrammarRulesByLevel(level).then((items) => {
      if (!active) return;
      const ordered = sortByCurriculumOrder(items);
      setRules(ordered);
      if (!selectedId || !ordered.some((rule) => rule.id === selectedId)) {
        setSelectedId(ordered[0]?.id ?? null);
      }
    });
    return () => {
      active = false;
    };
  }, [level, selectedId, setRules, setSelectedId]);

  useEffect(() => {
    let active = true;
    void Promise.all(
      CEFR_LEVELS.map(async (cefrLevel) => {
        const levelRules = await GrammarRepository.getGrammarRulesByLevel(
          cefrLevel
        );
        return [cefrLevel, levelRules.length] as const;
      })
    ).then((entries) => {
      if (!active) return;
      setLevelCounts({
        A1: entries.find(([cefrLevel]) => cefrLevel === 'A1')?.[1] ?? 0,
        A2: entries.find(([cefrLevel]) => cefrLevel === 'A2')?.[1] ?? 0,
        B1: entries.find(([cefrLevel]) => cefrLevel === 'B1')?.[1] ?? 0,
        B2: entries.find(([cefrLevel]) => cefrLevel === 'B2')?.[1] ?? 0,
        C1: entries.find(([cefrLevel]) => cefrLevel === 'C1')?.[1] ?? 0,
        C2: entries.find(([cefrLevel]) => cefrLevel === 'C2')?.[1] ?? 0,
      });
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    void VocabularyRepository.getVocabularyForUserSkillLevel(
      'grammar',
      level
    ).then((terms) => {
      if (!active) return;
      const next: Record<string, string> = {};
      terms.forEach((term) => {
        [
          term.id,
          term.term,
          term.normalizedTerm,
          term.grammarDomainAlias,
          ...term.tags,
          ...term.grammarFits,
          ...term.relatedTerms,
        ].forEach((key) => {
          if (key) next[normalizeKey(key)] = term.term;
        });
      });
      setVocabularyIndex(next);
    });
    return () => {
      active = false;
    };
  }, [level]);

  const rulesWithProgress = useMemo(
    () =>
      rules.map((rule) => {
        const progress = GrammarProgressService.get(rule.id);
        return {
          rule,
          progress,
          status: getLessonStatus(progress),
        };
      }),
    // progress is stored outside React state, so this version keeps the view fresh.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rules, progressVersion]
  );

  const visibleRules = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return rulesWithProgress.filter(({ rule }) => {
      return (
        !normalizedQuery ||
        [
          rule.title,
          rule.ruleTitle,
          rule.structure,
          rule.engineeringUseCase,
          rule.turkishExplanation,
          getModuleLabel(rule.grammarCategory),
        ]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery)
      );
    });
  }, [query, rulesWithProgress]);

  const totalGrammarLessons = CEFR_LEVELS.reduce(
    (total, cefrLevel) => total + levelCounts[cefrLevel],
    0
  );

  useEffect(() => {
    if (visibleRules.length === 0) return;
    if (
      !selectedId ||
      !visibleRules.some(({ rule }) => rule.id === selectedId)
    ) {
      setSelectedId(visibleRules[0].rule.id);
    }
  }, [selectedId, setSelectedId, visibleRules]);

  const selectedRule =
    rules.find((rule) => rule.id === selectedId) ??
    visibleRules[0]?.rule ??
    rules[0] ??
    null;
  const selectedProgress = selectedRule
    ? GrammarProgressService.get(selectedRule.id)
    : null;
  const selectedStatus = selectedProgress
    ? getLessonStatus(selectedProgress)
    : 'New';
  const selectedModule = selectedRule
    ? getModuleLabel(selectedRule.grammarCategory)
    : '';

  const pathGroups = useMemo(() => {
    const groups = new Map<string, typeof visibleRules>();
    visibleRules.forEach((entry) => {
      const module = getModuleLabel(entry.rule.grammarCategory);
      groups.set(module, [...(groups.get(module) ?? []), entry]);
    });
    return Array.from(groups.entries()).map(([module, entries]) => ({
      module,
      entries,
      mastered: entries.filter((entry) => entry.status === 'Mastered').length,
    }));
  }, [visibleRules]);

  const linkedVocabulary = useMemo(() => {
    if (!selectedRule) return [];
    return selectedRule.linkedVocabularyTags
      .map((tag) => ({ tag, term: vocabularyIndex[normalizeKey(tag)] }))
      .filter((item): item is { tag: string; term: string } =>
        Boolean(item.term)
      )
      .slice(0, 8);
  }, [selectedRule, vocabularyIndex]);

  const nextLesson = useMemo(
    () =>
      rulesWithProgress.find(
        (entry) =>
          entry.status !== 'Mastered' && entry.rule.id !== selectedRule?.id
      )?.rule ?? null,
    [rulesWithProgress, selectedRule]
  );

  const reviewTargets = rulesWithProgress
    .filter(
      (entry) =>
        entry.progress.reviewStatus === 'Due' ||
        entry.progress.incorrectUsages > entry.progress.correctUsages
    )
    .slice(0, 5);

  const masteredCount = rulesWithProgress.filter(
    (entry) => entry.status === 'Mastered'
  ).length;

  const selectRule = (ruleId: string) => {
    setSelectedId(ruleId);
    setQuizOpen(false);
    setHintOpen(false);
    setQuizAnswers({});
  };

  const scrollLessonStrip = (direction: 'left' | 'right') => {
    lessonStripRef.current?.scrollBy({
      left: direction === 'left' ? -420 : 420,
      behavior: 'smooth',
    });
  };

  const recordUsage = (correct: boolean) => {
    if (!selectedRule) return;
    ProductAnalyticsService.track('grammar_task_started', '/grammar', {
      metadata: {
        skill: 'grammar',
        missionId: selectedRule.id,
        source: 'user',
      },
    });
    GrammarProgressService.recordUsage(selectedRule.id, correct);
    setProgressVersion((version) => version + 1);
    showToast(
      correct
        ? 'Good. Practice evidence was saved.'
        : 'Saved for review. This lesson will stay in practice.',
      correct ? 'success' : 'info'
    );
    ProductAnalyticsService.track('grammar_task_completed', '/grammar', {
      metadata: {
        skill: 'grammar',
        missionId: selectedRule.id,
        source: 'user',
      },
    });
    ProductAnalyticsService.trackOnce('first_task_completed', '/grammar', {
      skill: 'grammar',
      source: 'user',
    });
  };

  const quizItems = selectedRule
    ? [
        {
          question: 'Which structure are you practicing?',
          choices: [
            selectedRule.structure,
            selectedRule.engineeringUseCase,
            selectedRule.commonMistakes,
          ],
          correct: 0,
        },
        {
          question: 'Which sentence is safer?',
          choices: [
            selectedRule.correctedExampleEnglish,
            selectedRule.badExampleEnglish,
            selectedRule.definition,
          ],
          correct: 0,
        },
        {
          question: 'Where does this lesson help you most?',
          choices: [
            selectedRule.engineeringUseCase,
            selectedRule.grammarCategory,
            'Pronunciation only',
          ],
          correct: 0,
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-background pb-16 text-foreground">
      <header className="sticky top-0 z-20 -mx-4 border-b border-border-soft bg-background/95 px-4 py-3 shadow-sm backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wide text-primary">
              {level} Grammar Path
            </p>
            <h1 className="mt-0.5 truncate text-sm font-black tracking-tight sm:text-base">
              Learn grammar by building real engineering sentences
            </h1>
          </div>
        </div>

        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex flex-1 gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {CEFR_LEVELS.map((cefrLevel) => (
              <button
                key={cefrLevel}
                type="button"
                onClick={() => {
                  if (cefrLevel !== level) {
                    /* level change handled elsewhere */
                  }
                }}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-bold transition-colors ${
                  cefrLevel === level
                    ? 'border-primary/40 bg-primary/5 text-primary'
                    : 'border-border-soft bg-surface text-muted-copy hover:text-foreground'
                }`}
              >
                <span>{cefrLevel}</span>
                <span className="text-[10px] opacity-60">{levelCounts[cefrLevel]}</span>
              </button>
            ))}
          </div>
          <label className="relative flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-copy" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="min-h-10 w-full rounded-lg border border-border-soft bg-surface px-10 text-sm outline-none focus:border-primary/50"
              placeholder="Search..."
            />
          </label>
        </div>

        <div className="mt-3 rounded-lg border border-border-soft bg-surface p-2">
          <div className="flex items-center justify-between gap-3 px-1">
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-wide">
                Complete Grammar Map
              </p>
              <p className="text-xs font-bold text-muted-copy">
                {totalGrammarLessons} lessons loaded from 6 CEFR levels
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => scrollLessonStrip('left')}
                className="grid h-9 w-9 place-items-center rounded-lg border border-border-soft bg-background text-muted-copy hover:text-foreground"
                aria-label="Scroll lessons left"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollLessonStrip('right')}
                className="grid h-9 w-9 place-items-center rounded-lg border border-border-soft bg-background text-muted-copy hover:text-foreground"
                aria-label="Scroll lessons right"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div
            ref={lessonStripRef}
            className="mt-2 flex gap-2 overflow-x-auto scroll-smooth pb-1"
          >
            {pathGroups.length === 0 ? (
              <p className="px-2 py-3 text-sm text-muted-copy">
                No lessons match this filter.
              </p>
            ) : (
              pathGroups.map((group) => (
                <div
                  key={group.module}
                  className="flex shrink-0 items-stretch gap-2"
                >
                  <div className="flex w-44 shrink-0 flex-col justify-between rounded-lg border border-border-soft bg-background px-3 py-2">
                    <span className="line-clamp-2 text-xs font-black leading-4">
                      {group.module}
                    </span>
                    <span className="mt-2 text-[11px] font-bold text-muted-copy">
                      {group.mastered}/{group.entries.length} mastered
                    </span>
                  </div>
                  {group.entries.map(({ rule, status }) => {
                    const selected = rule.id === selectedRule?.id;
                    return (
                      <button
                        key={rule.id}
                        type="button"
                        onClick={() => selectRule(rule.id)}
                        className={`flex w-56 shrink-0 flex-col justify-between rounded-lg border px-3 py-2 text-left transition-colors ${
                          selected
                            ? 'border-foreground bg-foreground text-background'
                            : 'border-border-soft bg-background hover:border-primary/40'
                        }`}
                      >
                        <span className="line-clamp-2 text-xs font-black leading-4">
                          {rule.title}
                        </span>
                        <span className="mt-2 flex items-center justify-between gap-2">
                          {status === 'Mastered' ? (
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                          ) : (
                            <Circle className="h-4 w-4 shrink-0 text-muted-copy" />
                          )}
                          <StatusPill status={status} compact />
                        </span>
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      </header>

      <main className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="min-w-0 space-y-5">
          {selectedRule && selectedProgress ? (
            <>
              <div className="min-w-0 rounded-lg border border-border-soft bg-surface p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wide text-primary">
                      {selectedModule}
                    </p>
                    <h2 className="mt-1 break-words text-2xl font-black">
                      {selectedRule.ruleTitle || selectedRule.title}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-muted-copy">
                      {compact(
                        selectedRule.engineeringUseCase,
                        selectedRule.languageFunction
                      )}
                    </p>
                  </div>
                  <StatusPill status={selectedStatus} />
                </div>
              </div>

              <LessonBlock
                icon={Target}
                title="Today's Objective"
                body={`Use "${selectedRule.structure}" to ${selectedRule.languageFunction.toLowerCase()} in a real engineering context.`}
              />

              <LessonBlock
                icon={BookOpen}
                title="Why This Matters"
                body="Grammar is the bridge between the words you know and the message you need to produce. This lesson helps you turn vocabulary into a clear site sentence, report sentence, or professional reply."
              />

              <div className="rounded-lg border border-border-soft bg-surface p-5">
                <SectionHeading
                  title="Words You Will Use Today"
                  subtitle="Grammar should reuse vocabulary before it introduces new language."
                />
                {linkedVocabulary.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {linkedVocabulary.map((item) => (
                      <span
                        key={`${item.tag}-${item.term}`}
                        className="rounded-full border border-success/30 bg-success/5 px-3 py-1 text-xs font-bold text-success"
                      >
                        {item.term}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-muted-copy">
                    No confirmed Vocabulary match yet. This lesson stays in
                    Grammar until matching vocabulary is available.
                  </p>
                )}
              </div>

              <div className="rounded-lg border border-border-soft bg-surface p-5">
                <SectionHeading
                  title="Teacher Explanation"
                  subtitle="Learn the use, not only the grammar name."
                />
                <p className="mt-3 text-sm leading-7">
                  {compact(selectedRule.explanation, selectedRule.definition)}
                </p>
                <p className="mt-3 rounded-lg border border-border-soft bg-background p-4 text-sm leading-7 text-muted-copy">
                  Turkish speaker note: {selectedRule.turkishExplanation}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-5">
                  <p className="text-xs font-bold uppercase tracking-wide text-primary">
                    Structure
                  </p>
                  <p className="mt-3 break-words font-mono text-lg font-black">
                    {selectedRule.structure}
                  </p>
                  <p className="mt-3 break-words text-sm text-muted-copy">
                    Target output: {selectedRule.minimumUserOutput}
                  </p>
                </div>
                <div className="rounded-lg border border-warning/30 bg-warning/5 p-5">
                  <p className="text-xs font-bold uppercase tracking-wide text-warning">
                    Guided Practice
                  </p>
                  <p className="mt-3 break-words text-sm font-bold leading-6">
                    {selectedRule.taskPromptTemplate}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-border-soft bg-surface p-5">
                <SectionHeading
                  title="Examples"
                  subtitle="Read the pattern before you try to produce it."
                />
                <div className="mt-4 grid gap-3">
                  {selectedRule.examples.map((example, index) => (
                    <div
                      key={`${example.english}-${index}`}
                      className="rounded-lg border border-border-soft bg-background p-4"
                    >
                      <p className="break-words font-bold">
                        {example.english}
                      </p>
                      <p className="mt-1 break-words text-sm text-muted-copy">
                        {example.turkish}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-rose-200 bg-rose-50 p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-rose-700">
                  Common Turkish Mistake
                </p>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <div>
                    <p className="break-words text-sm font-bold text-rose-900">
                      {selectedRule.badExampleEnglish}
                    </p>
                    <p className="mt-2 break-words text-sm leading-6 text-rose-800">
                      {selectedRule.badExampleTurkishExplanation ||
                        selectedRule.commonMistakes}
                    </p>
                  </div>
                  <div className="rounded-lg border border-success/30 bg-white p-4">
                    <p className="text-xs font-bold uppercase text-success">
                      Better
                    </p>
                    <p className="mt-2 break-words text-sm font-bold">
                      {selectedRule.correctedExampleEnglish}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border-soft bg-surface p-5">
                <SectionHeading
                  title="Practice"
                  subtitle="Save honest evidence. Mastery also needs Reading and Writing use."
                />
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <Button onClick={() => recordUsage(true)}>
                    <CheckCircle2 className="h-4 w-4" />
                    Used Correctly
                  </Button>
                  <Button variant="outline" onClick={() => recordUsage(false)}>
                    <TriangleAlert className="h-4 w-4" />
                    Needs Review
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setQuizOpen((open) => !open);
                      setQuizAnswers({});
                    }}
                  >
                    <HelpCircle className="h-4 w-4" />
                    Mini Quiz
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setHintOpen((v) => !v)}
                  >
                    <BookOpen className="h-4 w-4" />
                    Hint
                  </Button>
                </div>

                {hintOpen && (
                  <p className="mt-4 rounded-lg border border-border-soft bg-background p-4 text-sm leading-7 text-muted-copy">
                    {getGrammarReviewReason(selectedProgress)}
                  </p>
                )}

                {quizOpen && (
                  <div className="mt-4 space-y-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
                    {quizItems.map((item, questionIndex) => (
                      <div key={item.question}>
                        <p className="text-sm font-bold">
                          {questionIndex + 1}. {item.question}
                        </p>
                        <div className="mt-2 grid gap-2">
                          {item.choices.map((choice, choiceIndex) => {
                            const letter = String.fromCharCode(
                              65 + choiceIndex
                            );
                            const selected =
                              quizAnswers[questionIndex] === letter;
                            const revealed =
                              Object.keys(quizAnswers).length === 3;
                            const correct = choiceIndex === item.correct;
                            return (
                              <button
                                key={`${item.question}-${choice}`}
                                type="button"
                                disabled={revealed}
                                onClick={() =>
                                  setQuizAnswers((prev) => ({
                                    ...prev,
                                    [questionIndex]: letter,
                                  }))
                                }
                                className={`break-words rounded-lg border p-3 text-left text-xs font-semibold transition-colors ${
                                  revealed
                                    ? correct
                                      ? 'border-success bg-success/10'
                                      : selected
                                        ? 'border-rose-300 bg-rose-50'
                                        : 'border-border-soft bg-surface opacity-60'
                                    : selected
                                      ? 'border-primary bg-primary/10'
                                      : 'border-border-soft bg-surface hover:border-primary/30'
                                }`}
                              >
                                <span className="mr-2 font-black">
                                  {letter}.
                                </span>
                                {choice}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {linkedVocabulary.length > 0 && (
                <div className="rounded-lg border border-border-soft bg-surface p-5">
                  <SectionHeading
                    title="Use It in Skills"
                    subtitle="Use this lesson in Reading and Writing to prove mastery."
                  />
                  <div className="mt-4 flex flex-wrap gap-3">
                    {selectedRule.skillUse.includes('reading') && (
                      <Link
                        to="/reading"
                        className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border-soft bg-background px-4 text-sm font-bold hover:border-primary/40"
                      >
                        <FileText className="h-4 w-4" />
                        Reading
                      </Link>
                    )}
                    {selectedRule.skillUse.includes('writing') && (
                      <Link
                        to="/writing"
                        className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border-soft bg-background px-4 text-sm font-bold hover:border-primary/40"
                      >
                        <PenLine className="h-4 w-4" />
                        Writing
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-lg border border-border-soft bg-surface p-8 text-center text-muted-copy">
              Select a grammar lesson to begin.
            </div>
          )}
        </section>

        <aside className="space-y-5">
          <section className="lg:sticky lg:top-[18rem]">
            <div className="mb-5 grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-border-soft bg-surface px-3 py-2 text-center">
                <p className="text-lg font-black">{rules.length}</p>
                <p className="text-[10px] font-bold uppercase text-muted-copy">This Level</p>
              </div>
              <div className="rounded-lg border border-border-soft bg-surface px-3 py-2 text-center">
                <p className="text-lg font-black">{totalGrammarLessons}</p>
                <p className="text-[10px] font-bold uppercase text-muted-copy">Total Map</p>
              </div>
              <div className="rounded-lg border border-border-soft bg-surface px-3 py-2 text-center">
                <p className="text-lg font-black">{masteredCount}</p>
                <p className="text-[10px] font-bold uppercase text-muted-copy">Mastered</p>
              </div>
              <div className="rounded-lg border border-border-soft bg-surface px-3 py-2 text-center">
                <p className="text-lg font-black">{grammarPoolIds.length}</p>
                <p className="text-[10px] font-bold uppercase text-muted-copy">Pool</p>
              </div>
            </div>

            <SectionHeading
              title="Mastery"
              subtitle="A rule is mastered after practice, Reading, and Writing."
            />
            {selectedRule && selectedProgress && (
              <div className="mt-3 space-y-3 rounded-lg border border-border-soft bg-surface p-4">
                <MasteryRow
                  label="Practice"
                  value={`${getPracticeCount(selectedProgress)}/3`}
                  complete={getPracticeCount(selectedProgress) >= 3}
                />
                <MasteryRow
                  label="Reading"
                  value={
                    selectedProgress.skillEvidence.reading
                      ? `${selectedProgress.skillEvidence.reading.score}%`
                      : 'Missing'
                  }
                  complete={Boolean(selectedProgress.skillEvidence.reading)}
                />
                <MasteryRow
                  label="Writing"
                  value={
                    selectedProgress.skillEvidence.writing
                      ? `${selectedProgress.skillEvidence.writing.score}%`
                      : 'Missing'
                  }
                  complete={Boolean(selectedProgress.skillEvidence.writing)}
                />
                <MasteryRow
                  label="R/W Evidence"
                  value={`${getTransferCount(selectedProgress)}/2`}
                  complete={getTransferCount(selectedProgress) >= 2}
                />
                {getMissingGrammarTransferEvidence(selectedProgress).length >
                  0 && (
                  <p className="rounded-lg border border-warning/30 bg-warning/5 p-3 text-xs font-semibold text-warning">
                    Missing:{' '}
                    {getMissingGrammarTransferEvidence(selectedProgress).join(
                      ', '
                    )}
                  </p>
                )}
              </div>
            )}

            <div className="mt-5 rounded-lg border border-border-soft bg-surface p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-copy">
                Next Step
              </p>
              {nextLesson ? (
                <button
                  type="button"
                  onClick={() => selectRule(nextLesson.id)}
                  className="mt-3 flex w-full items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3 text-left hover:bg-primary/10"
                >
                  <ArrowRight className="h-4 w-4 text-primary" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold">
                      {nextLesson.title}
                    </span>
                    <span className="text-xs text-muted-copy">
                      {getModuleLabel(nextLesson.grammarCategory)}
                    </span>
                  </span>
                </button>
              ) : (
                <p className="mt-3 text-sm text-muted-copy">
                  This level has no pending grammar lesson.
                </p>
              )}
            </div>

            <div className="mt-5 rounded-lg border border-border-soft bg-surface p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-copy">
                Review Queue
              </p>
              {reviewTargets.length > 0 ? (
                <div className="mt-3 space-y-2">
                  {reviewTargets.map(({ rule, status }) => (
                    <button
                      key={rule.id}
                      type="button"
                      onClick={() => selectRule(rule.id)}
                      className="flex w-full items-center gap-2 rounded-lg border border-border-soft bg-background p-3 text-left hover:border-warning/40"
                    >
                      <TriangleAlert className="h-4 w-4 shrink-0 text-warning" />
                      <span className="min-w-0 flex-1 truncate text-xs font-bold">
                        {rule.title}
                      </span>
                      <StatusPill status={status} compact />
                    </button>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-muted-copy">
                  No urgent grammar review right now.
                </p>
              )}
            </div>
          </section>
        </aside>
      </main>
    </div>
  );
};

const SectionHeading = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) => (
  <div>
    <h2 className="text-sm font-black uppercase tracking-wide">{title}</h2>
    <p className="mt-1 text-xs leading-5 text-muted-copy">{subtitle}</p>
  </div>
);

const StatusPill = ({
  status,
  compact = false,
}: {
  status: LessonStatus;
  compact?: boolean;
}) => (
  <span
    className={`shrink-0 whitespace-nowrap rounded-full border font-bold ${
      compact ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'
    } ${STATUS_STYLES[status]}`}
  >
    {getStatusLabel(status, compact)}
  </span>
);

const LessonBlock = ({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Target;
  title: string;
  body: string;
}) => (
  <div className="min-w-0 rounded-lg border border-border-soft bg-surface p-5">
    <div className="flex items-center gap-2">
      <Icon className="h-5 w-5 text-primary" />
      <h2 className="text-sm font-black uppercase tracking-wide">{title}</h2>
    </div>
    <p className="mt-3 break-words text-sm leading-7 text-muted-copy">
      {body}
    </p>
  </div>
);

const MasteryRow = ({
  label,
  value,
  complete,
}: {
  label: string;
  value: string;
  complete: boolean;
}) => (
  <div className="flex items-center justify-between gap-3 rounded-lg border border-border-soft bg-background px-3 py-2">
    <span className="min-w-0 break-words text-sm font-bold">{label}</span>
    <span
      className={`text-xs font-black ${
        complete ? 'text-success' : 'text-muted-copy'
      }`}
    >
      {value}
    </span>
  </div>
);

export default GrammarPage;
