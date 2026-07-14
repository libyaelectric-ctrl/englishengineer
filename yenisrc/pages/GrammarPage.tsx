import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Circle,
  HelpCircle,
  Languages,
  Search,
  Trophy,
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
  type GrammarRule,
} from '@/features/grammar';
import { getBaseCefrLevel, useLearningCockpit } from '@/features/profile';
import { VocabularyRepository } from '@/features/vocabulary';
import { useLearningStore } from '@/core/learning';
import { Button } from '@/shared/components/Button';
import { SectionCard } from '@/shared/components/SectionCard';
import { showToast } from '@/shared/components/Toast';
import { ProductAnalyticsService } from '@/features/analytics/product-analytics.service';
import {
  LocalizationService,
  useLocalizationStore,
} from '@/features/localization';

const TABS = ['New', 'Learning', 'Due', 'Strong'] as const;

type GrammarPanel = 'rule' | 'mistakes' | 'pool';

const formatUnitName = (value: string): string =>
  value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const normalizeKey = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[-_\s]+/g, ' ');

const getLearningStatus = (
  ruleId: string
): 'New' | 'In Progress' | 'Mastered' => {
  const status = GrammarProgressService.get(ruleId).reviewStatus;
  if (status === 'Strong') return 'Mastered';
  if (status === 'New') return 'New';
  return 'In Progress';
};

const statusStyles = {
  New: 'border-border-soft bg-surface text-muted-copy',
  'In Progress': 'border-warning/30 bg-warning/5 text-warning',
  Mastered: 'border-success/30 bg-success/5 text-success',
} as const;

const GrammarPage = () => {
  const currentUser = useAuthStore((state) => state.currentUser);
  const language = useLocalizationStore((state) => state.language);
  const { profile } = useLearningCockpit(currentUser?.id);
  const level = getBaseCefrLevel(profile.skills.grammar.cefrBand);
  const [showHint, setShowHint] = useState(false);
  const [quickQuizOpen, setQuickQuizOpen] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [expandedCategoryIds, setExpandedCategoryIds] = useState<Set<string>>(
    new Set()
  );
  const [vocabularyTagIndex, setVocabularyTagIndex] = useState<
    Record<string, string>
  >({});
  const [activePanel, setActivePanel] = useState<GrammarPanel>('rule');
  // Bumped every time this page mutates progress directly, so derived lists
  // (which read GrammarProgressService's localStorage-backed data) refresh
  // even though the underlying rule objects haven't changed.
  const [progressVersion, setProgressVersion] = useState(0);
  const [poolRules, setPoolRules] = useState<GrammarRule[]>([]);

  const {
    rules,
    selectedId,
    tab,
    query,
    setRules,
    setSelectedId,
    setTab,
    setQuery,
  } = useGrammarStore();

  const grammarPoolIds = useLearningStore((state) => state.grammarPool);

  useEffect(() => {
    let active = true;
    void GrammarRepository.getGrammarRulesByLevel(level).then((items) => {
      if (!active) return;
      setRules(items);
      if (!selectedId || !items.find((i) => i.id === selectedId)) {
        setSelectedId(items[0]?.id ?? null);
      }
    });
    return () => {
      active = false;
    };
  }, [level, setRules, setSelectedId, selectedId]);

  useEffect(() => {
    let active = true;
    void VocabularyRepository.getVocabularyByLevel(level).then((terms) => {
      if (!active) return;
      const index: Record<string, string> = {};
      terms.forEach((term) => {
        [
          term.id,
          term.term,
          term.normalizedTerm,
          term.grammarDomainAlias,
          ...term.tags,
          ...term.grammarFits,
        ].forEach((key) => {
          if (key) index[normalizeKey(key)] = term.term;
        });
      });
      setVocabularyTagIndex(index);
    });
    return () => {
      active = false;
    };
  }, [level]);

  // Keep the Personal Pool panel populated with full rule details. Pool
  // entries can come from earlier CEFR levels, so we look each one up
  // individually rather than relying on the currently loaded `rules` list.
  useEffect(() => {
    let active = true;
    void Promise.all(
      grammarPoolIds.map((id) => GrammarRepository.getGrammarRuleById(id))
    ).then((results) => {
      if (!active) return;
      setPoolRules(
        results.filter((rule): rule is GrammarRule => Boolean(rule))
      );
    });
    return () => {
      active = false;
    };
  }, [grammarPoolIds]);

  const visibleRules = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return rules.filter((rule) => {
      const status = GrammarProgressService.get(rule.id).reviewStatus;
      const matchesTab = tab === 'New' ? status === 'New' : status === tab;
      const matchesQuery =
        !normalizedQuery ||
        [
          rule.title,
          rule.structure,
          rule.turkishExplanation,
          rule.engineeringUseCase,
        ]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery);
      return matchesTab && matchesQuery;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, rules, tab, progressVersion]);

  const unitGroups = useMemo(() => {
    const groups = new Map<string, typeof visibleRules>();
    visibleRules.forEach((rule) => {
      const items = groups.get(rule.grammarCategory) ?? [];
      groups.set(rule.grammarCategory, [...items, rule]);
    });
    return Array.from(groups.entries())
      .map(([category, items]) => ({
        category,
        items: [...items].sort(
          (a, b) =>
            a.difficulty - b.difficulty || a.title.localeCompare(b.title)
        ),
        mastered: items.filter(
          (rule) => getLearningStatus(rule.id) === 'Mastered'
        ).length,
      }))
      .sort((a, b) => a.category.localeCompare(b.category));
  }, [visibleRules]);

  // The next rule in a stable curriculum order (difficulty, then
  // prerequisites, then title) that the learner hasn't mastered yet. This
  // gives everyone a single obvious "next step" through all ~316 topics,
  // independent of whatever tab/search filter happens to be active.
  const nextInPath = useMemo(() => {
    const ordered = sortByCurriculumOrder(rules);
    return ordered.find((rule) => getLearningStatus(rule.id) !== 'Mastered');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rules, progressVersion]);

  const selectedRule =
    rules.find((rule) => rule.id === selectedId) ?? visibleRules[0];
  const visibleRuleIndex = selectedRule
    ? visibleRules.findIndex((rule) => rule.id === selectedRule.id)
    : -1;
  const nextRule =
    visibleRuleIndex >= 0 ? visibleRules[visibleRuleIndex + 1] : undefined;
  const selectedProgress = selectedRule
    ? GrammarProgressService.get(selectedRule.id)
    : null;

  useEffect(() => {
    if (!selectedRule) return;
    setExpandedCategoryIds((prev) => {
      if (prev.has(selectedRule.grammarCategory)) return prev;
      const next = new Set(prev);
      next.add(selectedRule.grammarCategory);
      return next;
    });
  }, [selectedRule]);

  const linkedVocabularyMatches = useMemo(() => {
    if (!selectedRule) return [];
    return selectedRule.linkedVocabularyTags
      .map((tag) => ({
        tag,
        term: vocabularyTagIndex[normalizeKey(tag)],
      }))
      .filter((item): item is { tag: string; term: string } =>
        Boolean(item.term)
      )
      .slice(0, 8);
  }, [selectedRule, vocabularyTagIndex]);

  const getProgressIndicator = (ruleId: string) => {
    const progress = GrammarProgressService.get(ruleId);
    const correctCount = Math.min(progress.correctUsages, 3);
    const transferCount =
      2 - getMissingGrammarTransferEvidence(progress).length;
    return `${correctCount}/3 practice · ${transferCount}/2 transfer`;
  };

  const goToRule = (ruleId: string) => {
    setSelectedId(ruleId);
    setActivePanel('rule');
    setShowHint(false);
  };

  const record = (correct: boolean) => {
    if (!selectedRule) return;
    ProductAnalyticsService.track('grammar_task_started', '/grammar', {
      metadata: {
        skill: 'grammar',
        missionId: selectedRule.id,
        source: 'user',
      },
    });
    GrammarProgressService.recordUsage(selectedRule.id, correct);
    setProgressVersion((v) => v + 1);
    showToast(
      correct
        ? 'Great job! Rule recorded as correct.'
        : 'No worries — this rule needs more practice.',
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

    if (nextRule) {
      setSelectedId(nextRule.id);
    }
  };

  const currentIdx = visibleRules.findIndex((r) => r.id === selectedRule?.id);

  const mistakeRules = useMemo(
    () =>
      rules.filter((rule) => {
        const progress = GrammarProgressService.get(rule.id);
        return progress.correctUsages === 0 && progress.reviewStatus !== 'New';
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rules, progressVersion]
  );

  const masteredInLevel = rules.filter(
    (rule) => getLearningStatus(rule.id) === 'Mastered'
  ).length;

  return (
    <div className="animate-in fade-in duration-300 relative">
      <div className="sticky top-0 z-40 flex flex-col bg-background py-3 border-b border-border-soft shadow-sm space-y-3 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex flex-wrap items-center gap-2 justify-between">
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            Grammar
            <span className="ml-2 text-sm font-medium text-muted-copy">
              ({rules.length} topics)
            </span>
          </h1>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-success/30 bg-success/5 px-3 py-1 text-xs font-bold text-success">
              🏆 {masteredInLevel} mastered
            </span>
            <button
              type="button"
              onClick={() =>
                setActivePanel((p) => (p === 'pool' ? 'rule' : 'pool'))
              }
              className={`rounded-full border px-3 py-1 text-xs font-bold transition-colors ${
                activePanel === 'pool'
                  ? 'border-primary bg-primary text-white'
                  : 'border-primary/20 bg-primary/5 text-primary hover:bg-primary/10'
              }`}
            >
              <Trophy className="mr-1 inline h-3 w-3" />
              {grammarPoolIds.length} in pool
            </button>
          </div>
        </div>

        <div className="relative w-full">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-muted-copy" />
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="block min-h-10 w-full rounded-xl border border-border-soft bg-surface py-2 pl-10 pr-4 text-sm text-foreground shadow-sm focus:border-primary focus:ring-1 focus:ring-primary/20"
            placeholder="Search a topic name or engineering use"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 rounded-xl border border-border-soft bg-surface p-1.5 sm:grid-cols-4">
          {TABS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setTab(item);
                setActivePanel('rule');
              }}
              className={`min-h-9 rounded-lg px-3 text-sm font-bold transition-all ${
                tab === item
                  ? 'bg-foreground text-background shadow-sm'
                  : 'text-muted-copy hover:bg-surface-hover hover:text-foreground'
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {nextInPath && nextInPath.id !== selectedRule?.id && (
          <button
            type="button"
            onClick={() => goToRule(nextInPath.id)}
            className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-left transition-colors hover:bg-primary/10"
          >
            <ArrowRight className="h-5 w-5 shrink-0 text-primary" />
            <span className="min-w-0 flex-1">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-primary">
                Next in your path
              </span>
              <span className="block truncate text-sm font-bold text-foreground">
                {nextInPath.title}
              </span>
            </span>
            <span className="shrink-0 text-xs font-bold text-primary">
              Go
            </span>
          </button>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setActivePanel((p) => (p === 'mistakes' ? 'rule' : 'mistakes'))
            }
            className="text-xs h-9"
          >
            {activePanel === 'mistakes'
              ? 'Close Review'
              : `Review Mistakes (${mistakeRules.length})`}
          </Button>
        </div>

        <div className="max-h-72 overflow-y-auto custom-scrollbar rounded-xl border border-border-soft bg-surface p-2">
          <div className="mb-2 flex items-center justify-between px-2">
            <span className="text-xs font-black uppercase text-muted-copy">
              Units
            </span>
            <span className="text-[10px] font-mono text-muted-copy">
              {visibleRules.length} visible topics
            </span>
          </div>
          <div className="space-y-2">
            {unitGroups.map((group) => {
              const isExpanded = expandedCategoryIds.has(group.category);
              return (
                <div
                  key={group.category}
                  className="overflow-hidden rounded-lg border border-border-soft bg-background"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setExpandedCategoryIds((prev) => {
                        const next = new Set(prev);
                        if (next.has(group.category))
                          next.delete(group.category);
                        else next.add(group.category);
                        return next;
                      });
                    }}
                    className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-surface-hover"
                  >
                    <ChevronDown
                      className={`h-4 w-4 text-muted-copy transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    />
                    <span className="flex-1 text-sm font-black text-foreground">
                      {formatUnitName(group.category)}
                    </span>
                    <span className="rounded-full border border-border-soft bg-surface px-2 py-0.5 text-[11px] font-bold text-muted-copy">
                      {group.mastered}/{group.items.length}
                    </span>
                  </button>
                  {isExpanded && (
                    <div className="border-t border-border-soft p-1">
                      {group.items.map((rule) => {
                        const learningStatus = getLearningStatus(rule.id);
                        const isSelected = selectedRule?.id === rule.id;
                        return (
                          <button
                            key={rule.id}
                            type="button"
                            onClick={() => goToRule(rule.id)}
                            className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left transition-colors ${
                              isSelected
                                ? 'bg-foreground text-background'
                                : 'text-foreground hover:bg-surface-hover'
                            }`}
                          >
                            {learningStatus === 'Mastered' ? (
                              <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                            ) : (
                              <Circle className="h-4 w-4 shrink-0 text-muted-copy" />
                            )}
                            <span className="min-w-0 flex-1 truncate text-xs font-semibold">
                              {rule.title}
                            </span>
                            <span
                              className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold ${statusStyles[learningStatus]}`}
                            >
                              {learningStatus}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            className="shrink-0 rounded-full w-10 h-10 p-0"
            onClick={() => {
              if (currentIdx > 0) goToRule(visibleRules[currentIdx - 1].id);
            }}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 flex items-center justify-center gap-3 overflow-x-auto custom-scrollbar py-1">
            {visibleRules
              .slice(Math.max(0, currentIdx - 2), currentIdx + 3)
              .map((rule) => (
                <button
                  key={rule.id}
                  type="button"
                  onClick={() => goToRule(rule.id)}
                  className={`shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                    selectedRule?.id === rule.id
                      ? 'bg-foreground text-background shadow-md'
                      : 'bg-surface-hover text-muted-copy hover:bg-surface hover:text-foreground'
                  }`}
                >
                  {GrammarProgressService.get(rule.id).reviewStatus ===
                    'Strong' && '🏆 '}
                  {rule.title.length > 25
                    ? rule.title.slice(0, 25) + '...'
                    : rule.title}
                  <span className="ml-1 text-[10px] opacity-70">
                    {getProgressIndicator(rule.id)}
                  </span>
                </button>
              ))}
          </div>
          <Button
            type="button"
            variant="outline"
            className="shrink-0 rounded-full w-10 h-10 p-0"
            onClick={() => {
              if (currentIdx < visibleRules.length - 1)
                goToRule(visibleRules[currentIdx + 1].id);
            }}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex justify-center -mt-2 pb-1">
          <span className="text-[10px] font-mono text-muted-copy">
            {currentIdx + 1} / {visibleRules.length}
          </span>
        </div>
      </div>
      <div className="pt-4 pb-20">
        <div className="w-full">
          {activePanel === 'mistakes' && (
            <SectionCard
              title="Review Mistakes"
              subtitle="Rules you got wrong and haven't practiced enough"
              icon={TriangleAlert}
            >
              {mistakeRules.length > 0 ? (
                <div className="space-y-2">
                  {mistakeRules.map((rule) => (
                    <div
                      key={rule.id}
                      className="flex items-center justify-between rounded-lg border border-border-soft bg-surface p-3"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground">
                          {rule.title}
                        </p>
                        <p className="text-xs text-muted-copy">
                          {rule.grammarCategory}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => goToRule(rule.id)}
                        className="h-8 px-3 text-xs"
                      >
                        Practice
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-copy">
                  No pending mistakes right now — nice work.
                </p>
              )}
            </SectionCard>
          )}

          {activePanel === 'pool' && (
            <SectionCard
              title="Personal Pool"
              subtitle="Grammar rules you've mastered are moved here and stay available for Reading & Writing practice"
              icon={Trophy}
            >
              {poolRules.length > 0 ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  {poolRules.map((rule) => (
                    <div
                      key={rule.id}
                      className="flex items-center justify-between gap-2 rounded-lg border border-success/30 bg-success/5 p-3"
                    >
                      <div className="min-w-0 space-y-1">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {rule.title}
                        </p>
                        <p className="text-xs text-muted-copy">
                          {rule.cefrLevel} · {rule.grammarCategory}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => goToRule(rule.id)}
                        className="h-8 shrink-0 px-3 text-xs"
                      >
                        Review
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-copy">
                  Nothing here yet. Get 3 correct practice reps and 2 Reading
                  or Writing transfer hits on a rule, and it moves into your
                  pool automatically.
                </p>
              )}
            </SectionCard>
          )}

          {activePanel === 'rule' && selectedRule ? (
            <div className="max-w-4xl mx-auto space-y-6 pb-20">
              <SectionCard
                title={selectedRule.ruleTitle || selectedRule.title}
                subtitle={`${selectedRule.cefrLevel} · ${selectedRule.grammarCategory}`}
                icon={Languages}
              >
                <div className="space-y-6">
                  {selectedProgress &&
                    selectedProgress.reviewStatus !== 'New' && (
                      <div className="rounded-xl border border-warning/30 bg-warning/5 p-4 text-sm leading-6 text-foreground shadow-sm">
                        <span className="font-bold text-warning">
                          Why this topic now:{' '}
                        </span>
                        <span className="font-medium text-muted-copy">
                          {getGrammarReviewReason(selectedProgress)}
                        </span>
                      </div>
                    )}
                  {selectedProgress && (
                    <div className="rounded-xl border border-border-soft bg-surface p-4 text-sm leading-6 text-foreground shadow-sm">
                      <span className="font-bold text-foreground">
                        Mastery check:{' '}
                      </span>
                      <span className="font-medium text-muted-copy">
                        {Math.min(selectedProgress.correctUsages, 3)}/3 grammar
                        practice,{' '}
                        {2 -
                          getMissingGrammarTransferEvidence(selectedProgress)
                            .length}
                        /2 Reading/Writing transfer.
                      </span>
                      {getMissingGrammarTransferEvidence(selectedProgress)
                        .length > 0 && (
                        <span className="ml-2 font-medium text-warning">
                          Missing:{' '}
                          {getMissingGrammarTransferEvidence(
                            selectedProgress
                          ).join(', ')}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 shadow-sm">
                    <div className="mb-4 flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      <p className="text-sm font-black text-primary">
                        Neden bu konu?
                      </p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-xs font-bold uppercase text-muted-copy">
                          Teacher intro
                        </p>
                        <p className="mt-2 text-sm leading-7 text-foreground">
                          Today you use this pattern to turn known words into a
                          clear engineering sentence. The goal is not to
                          memorize the name; the goal is to say the work,
                          status, risk, or request correctly.
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase text-muted-copy">
                          Where you use it
                        </p>
                        <p className="mt-2 text-sm leading-7 text-foreground">
                          {selectedRule.engineeringUseCase ||
                            selectedRule.languageFunction}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase text-muted-copy">
                          Turkish learner note
                        </p>
                        <p className="mt-2 text-sm leading-7 text-foreground">
                          {selectedRule.turkishExplanation ||
                            selectedRule.commonMistakes}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase text-muted-copy">
                          Common trap
                        </p>
                        <p className="mt-2 text-sm font-bold text-rose-800">
                          {selectedRule.badExampleEnglish}
                        </p>
                        <p className="mt-1 text-sm font-bold text-success">
                          {selectedRule.correctedExampleEnglish}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2 items-stretch">
                    <div className="h-full flex flex-col rounded-xl border border-border-soft bg-surface p-5 shadow-sm">
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-copy">
                        {LocalizationService.translate(
                          'grammar.meaningFunction',
                          language
                        )}
                      </p>
                      <p className="mt-3 text-base font-medium leading-7 text-foreground">
                        {selectedRule.definition}
                      </p>
                      <p className="mt-auto pt-2 text-sm leading-6 text-muted-copy">
                        {selectedRule.languageFunction}
                      </p>
                    </div>
                    <div className="h-full flex flex-col rounded-xl border border-primary/20 bg-primary/5 p-5 shadow-sm">
                      <p className="text-xs font-bold uppercase tracking-wider text-primary">
                        {LocalizationService.translate(
                          'grammar.form',
                          language
                        )}
                      </p>
                      <p className="mt-3 font-mono text-base font-bold text-foreground">
                        {selectedRule.structure}
                      </p>
                    </div>
                  </div>
                  <div className="h-full flex flex-col rounded-xl border border-border-soft bg-surface p-5 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-copy">
                      {language === 'tr'
                        ? 'Türkçe destek'
                        : 'English explanation'}
                    </p>
                    <p className="mt-3 text-sm leading-7 text-foreground">
                      {language === 'tr'
                        ? selectedRule.turkishExplanation
                        : selectedRule.explanation}
                    </p>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2 items-stretch">
                    <div className="h-full flex flex-col rounded-xl border border-warning/30 bg-warning/5 p-5 shadow-sm">
                      <p className="text-xs font-bold uppercase tracking-wider text-warning">
                        {LocalizationService.translate(
                          'grammar.practice',
                          language
                        )}
                      </p>
                      <p className="mt-3 text-base font-bold leading-7 text-foreground">
                        {selectedRule.taskPromptTemplate}
                      </p>
                      <p className="mt-auto pt-2 text-sm leading-6 text-muted-copy">
                        Target output: {selectedRule.minimumUserOutput}
                      </p>
                    </div>
                    <div className="h-full flex flex-col rounded-xl border border-rose-200 bg-rose-50 p-5 shadow-sm">
                      <p className="text-xs font-bold uppercase tracking-wider text-rose-700">
                        Common mistake
                      </p>
                      <p className="mt-3 text-base font-bold text-rose-900">
                        {selectedRule.badExampleEnglish}
                      </p>
                      <p className="mt-auto pt-2 text-sm leading-6 text-rose-800">
                        {language === 'tr'
                          ? selectedRule.badExampleTurkishExplanation
                          : selectedRule.commonMistakes}
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2 items-stretch">
                    {selectedRule.examples.map((ex, i) => (
                      <div
                        key={i}
                        className="h-full flex flex-col rounded-xl border border-border-soft bg-surface p-5 shadow-sm"
                      >
                        <p className="text-base font-bold text-foreground">
                          {ex.english}
                        </p>
                        <p className="mt-auto pt-1 text-sm font-medium text-muted-copy">
                          {ex.turkish}
                        </p>
                      </div>
                    ))}
                  </div>
                  {linkedVocabularyMatches.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border-soft bg-surface-hover p-4 shadow-sm">
                      <span className="mr-auto text-xs font-bold text-muted-copy tracking-wider uppercase">
                        You saw these first in Vocabulary
                      </span>
                      {linkedVocabularyMatches.map((item) => (
                        <span
                          key={`${item.tag}-${item.term}`}
                          className="inline-flex min-h-8 items-center rounded-full border border-success/30 bg-success/5 px-3 text-xs font-bold text-success"
                        >
                          {item.term}
                        </span>
                      ))}
                      {selectedRule.skillUse.includes('reading') && (
                        <Link
                          className="inline-flex min-h-10 items-center rounded-lg border border-border-hover bg-surface px-4 text-sm font-bold text-foreground transition-colors hover:border-primary/30 hover:bg-primary/5"
                          to="/reading"
                        >
                          Reading
                        </Link>
                      )}
                      {selectedRule.skillUse.includes('writing') && (
                        <Link
                          className="inline-flex min-h-10 items-center rounded-lg border border-border-hover bg-surface px-4 text-sm font-bold text-foreground transition-colors hover:border-primary/30 hover:bg-primary/5"
                          to="/writing"
                        >
                          Writing
                        </Link>
                      )}
                    </div>
                  )}
                  <div className="flex flex-col gap-3 sm:flex-row pt-6 border-t border-border-soft">
                    <Button
                      onClick={() => {
                        record(true);
                        setShowHint(false);
                      }}
                      className="sm:flex-1 h-12 text-base shadow-sm"
                    >
                      <CheckCircle2 className="mr-2 h-5 w-5" /> I used this
                      correctly
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        record(false);
                        setShowHint(false);
                      }}
                      className="sm:flex-1 h-12 text-base shadow-sm"
                    >
                      <TriangleAlert className="mr-2 h-5 w-5" /> Needs review
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowHint((h) => !h)}
                      className="sm:flex-1 h-12 text-base shadow-sm"
                    >
                      <HelpCircle className="mr-2 h-5 w-5" />{' '}
                      {showHint ? 'Hide Hint' : 'Show Hint'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setQuickQuizOpen((q) => !q);
                        if (!quickQuizOpen) setQuizAnswers({});
                      }}
                      className="sm:flex-1 h-12 text-base shadow-sm"
                    >
                      {quickQuizOpen ? 'Close Quiz' : 'Quick Quiz'}
                    </Button>
                  </div>
                  {quickQuizOpen && selectedRule && (
                    <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-5">
                      <p className="font-bold text-primary text-sm">
                        Quick Quiz — 3 Questions
                      </p>
                      {(
                        [
                          {
                            q: 'What is the structure of this rule?',
                            choices: [
                              selectedRule.structure,
                              selectedRule.definition,
                              selectedRule.explanation,
                              selectedRule.engineeringUseCase,
                            ],
                            correct: 0,
                          },
                          {
                            q: 'Which category does this rule belong to?',
                            choices: [
                              selectedRule.grammarCategory,
                              'Vocabulary',
                              'Pronunciation',
                              'Writing',
                            ],
                            correct: 0,
                          },
                          {
                            q: 'What is the correct example?',
                            choices: [
                              selectedRule.correctedExampleEnglish,
                              selectedRule.badExampleEnglish,
                              'N/A',
                              'N/A',
                            ],
                            correct: 0,
                          },
                        ] as const
                      ).map((item, qi) => (
                        <div key={qi} className="space-y-2">
                          <p className="text-sm font-semibold text-foreground">
                            Q{qi + 1}: {item.q}
                          </p>
                          <div className="grid gap-2">
                            {item.choices.map((choice, ci) => {
                              const letter = String.fromCharCode(65 + ci);
                              const isSelected = quizAnswers[qi] === letter;
                              const isRevealed =
                                Object.keys(quizAnswers).length === 3;
                              const isCorrect = ci === item.correct;
                              return (
                                <button
                                  key={ci}
                                  type="button"
                                  onClick={() =>
                                    setQuizAnswers((prev) => ({
                                      ...prev,
                                      [qi]: letter,
                                    }))
                                  }
                                  disabled={isRevealed}
                                  className={`w-full text-left p-3 rounded-lg border transition-all text-xs font-medium ${
                                    isRevealed
                                      ? isCorrect
                                        ? 'border-success bg-success/10 text-foreground'
                                        : isSelected
                                          ? 'border-rose-400 bg-rose-50 text-foreground'
                                          : 'border-border-soft bg-surface text-muted-copy opacity-50'
                                      : isSelected
                                        ? 'border-primary bg-primary/10 text-foreground'
                                        : 'border-border-soft bg-surface text-muted-copy hover:border-primary/20 hover:bg-primary/5'
                                  }`}
                                >
                                  <span className="font-bold mr-2">
                                    {letter}.
                                  </span>{' '}
                                  {choice}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                      {Object.keys(quizAnswers).length === 3 && (
                        <div className="text-center pt-2 border-t border-primary/20">
                          <p className="text-lg font-black text-primary">
                            Score:{' '}
                            {
                              [0, 1, 2].filter((i) => {
                                const correctIdx = [0, 0, 0][i];
                                return (
                                  quizAnswers[i] ===
                                  String.fromCharCode(65 + correctIdx)
                                );
                              }).length
                            }{' '}
                            / 3
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                  {showHint && (
                    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm leading-6">
                      <p className="font-bold text-primary mb-1">
                        Rule Explanation
                      </p>
                      <p className="text-foreground">
                        {selectedRule.explanation}
                      </p>
                      {selectedRule.turkishExplanation && (
                        <p className="mt-2 text-muted-copy">
                          {selectedRule.turkishExplanation}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </SectionCard>
            </div>
          ) : activePanel === 'rule' ? (
            <p className="text-center text-muted-copy py-20">
              Select a topic from the list.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default GrammarPage;
