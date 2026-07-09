import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Languages,
  Search,
  TriangleAlert,
} from 'lucide-react';
import { useAuthStore } from '@/features/auth';
import {
  GrammarProgressService,
  GrammarRepository,
  getGrammarReviewReason,
  type GrammarRule,
} from '@/features/grammar';
import { getBaseCefrLevel, useLearningCockpit } from '@/features/profile';
import { Button } from '@/shared/components/Button';
import { MetricCard } from '@/shared/components/MetricCard';

import { SectionCard } from '@/shared/components/SectionCard';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { SkillEntryBrief } from '@/features/learning-orchestrator';
import { ProductAnalyticsService } from '@/features/analytics/product-analytics.service';
import {
  LocalizationService,
  useLocalizationStore,
} from '@/features/localization';

type GrammarTab = 'New' | 'Learning' | 'Due' | 'Strong';
const TABS: GrammarTab[] = ['New', 'Learning', 'Due', 'Strong'];

const GrammarPage = () => {
  const currentUser = useAuthStore((state) => state.currentUser);
  const language = useLocalizationStore((state) => state.language);
  const { profile } = useLearningCockpit(currentUser?.id);
  const level = getBaseCefrLevel(profile.skills.grammar.cefrBand);
  const [rules, setRules] = useState<GrammarRule[]>([]);
  const [tab, setTab] = useState<GrammarTab>('New');
  const [query, setQuery] = useState('');
  const [revision, setRevision] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const summary = useMemo(
    () => GrammarProgressService.getSummary(360),
    [revision]
  );

  useEffect(() => {
    let active = true;
    void GrammarRepository.getGrammarRulesByLevel(level).then((items) => {
      if (!active) return;
      setRules(items);
      setSelectedId((current) => current ?? items[0]?.id ?? null);
    });
    return () => {
      active = false;
    };
  }, [level]);

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
  }, [query, revision, rules, tab]);
  const selectedRule =
    visibleRules.find((rule) => rule.id === selectedId) ?? visibleRules[0];
  const selectedRuleIndex = selectedRule
    ? rules.findIndex((rule) => rule.id === selectedRule.id)
    : -1;
  const visibleRuleIndex = selectedRule
    ? visibleRules.findIndex((rule) => rule.id === selectedRule.id)
    : -1;
  const nextRule =
    visibleRuleIndex >= 0 ? visibleRules[visibleRuleIndex + 1] : undefined;
  const previousRule =
    visibleRuleIndex > 0 ? visibleRules[visibleRuleIndex - 1] : undefined;
  const selectedProgress = selectedRule
    ? GrammarProgressService.get(selectedRule.id)
    : null;

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
    setRevision((value) => value + 1);
    setSelectedId(nextRule?.id ?? null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="sticky top-0 z-20 border-b border-border-soft bg-background py-3"><div className="flex items-center justify-between"><h1 className="text-lg font-semibold text-foreground">Grammar</h1></div></div>

      <SkillEntryBrief skill="grammar" />

      <SectionCard
        title="Your grammar path"
        subtitle="Move through named topics in order; practice feeds Learning Memory"
        icon={Languages}
      >
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div>
            <p className="text-xs font-medium text-primary">
              {level} PATH · {rules.length} NAMED TOPICS
            </p>
            <h2 className="mt-2 text-2xl font-medium text-foreground">
              {selectedRule?.title ?? 'Choose your first grammar topic'}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-copy">
              {selectedRule
                ? `Lesson ${selectedRuleIndex + 1} of ${rules.length} · ${selectedRule.grammarCategory}`
                : 'Your current-level grammar path is loading.'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={!previousRule}
              onClick={() => previousRule && setSelectedId(previousRule.id)}
              aria-label="Previous grammar topic"
            >
              <ArrowLeft className="h-4 w-4" /> Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={!nextRule}
              onClick={() => nextRule && setSelectedId(nextRule.id)}
              aria-label="Next grammar topic"
            >
              Next <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-surface-hover">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-300"
            style={{
              width: `${rules.length > 0 ? ((selectedRuleIndex + 1) / rules.length) * 100 : 0}%`,
            }}
          />
        </div>
      </SectionCard>

      <div className="grid grid-cols-3 gap-3">
        <MetricCard
          label="Current lesson"
          value={selectedRuleIndex >= 0 ? selectedRuleIndex + 1 : 1}
          icon={Languages}
          statusColor="primary"
        />
        <MetricCard
          label="Review due"
          value={summary.due}
          icon={TriangleAlert}
          statusColor="rose"
        />
        <MetricCard
          label="Strong"
          value={summary.strong}
          icon={CheckCircle2}
          statusColor="success"
        />
      </div>

      <SectionCard
        title="Find a topic"
        subtitle={`Search only inside your ordered ${level} grammar path`}
        icon={Search}
      >
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="Search grammar"
          placeholder="Search a topic name or engineering use"
          className="min-h-11 w-full rounded-lg border border-border-soft bg-surface px-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
        />
      </SectionCard>

      <div
        role="tablist"
        aria-label="Grammar progress"
        className="grid grid-cols-2 gap-2 rounded-xl border border-border-soft bg-surface p-2 sm:grid-cols-4"
      >
        {TABS.map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={tab === item}
            onClick={() => setTab(item)}
            className={`min-h-11 rounded-lg px-3 text-sm font-medium transition-colors ${tab === item ? 'bg-primary text-white' : 'text-muted-copy hover:bg-primary/5'}`}
          >
            {item}
          </button>
        ))}
      </div>

      {visibleRules.length === 0 ? (
        <div className="rounded-xl border border-dashed border-hover bg-surface-hover p-8 text-center">
          <p className="font-medium text-foreground">
            No {tab.toLowerCase()} rules in this view.
          </p>
          <p className="mt-2 text-sm text-muted-copy">
            Choose New to begin, or clear the search.
          </p>
          <Button className="mt-4" onClick={() => setTab('New')}>
            Open New Rules
          </Button>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[minmax(240px,0.38fr)_minmax(0,0.62fr)]">
          <aside className="max-h-[70vh] space-y-2 overflow-y-auto rounded-xl border border-border-soft bg-surface p-3">
            {visibleRules.map((rule) => {
              const lessonNumber = rules.findIndex(
                (item) => item.id === rule.id
              );
              return (
                <button
                  key={rule.id}
                  type="button"
                  onClick={() => setSelectedId(rule.id)}
                  className={`w-full rounded-lg border p-3 text-left transition-colors ${selectedRule?.id === rule.id ? 'border-primary bg-primary/5' : 'border-border-soft bg-surface hover:border-primary/30 hover:bg-primary/5'}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[10px] font-medium text-primary">
                        LESSON {lessonNumber + 1}
                      </p>
                      <p className="mt-1 text-sm font-medium text-foreground">
                        {rule.title}
                      </p>
                    </div>
                    <StatusBadge
                      label={GrammarProgressService.get(rule.id).reviewStatus}
                      tone="neutral"
                    />
                  </div>
                  <p className="mt-2 text-xs text-muted-copy">
                    {rule.grammarCategory}
                  </p>
                </button>
              );
            })}
          </aside>

          {selectedRule && (
            <SectionCard
              title={selectedRule.ruleTitle || selectedRule.title}
              subtitle={`${selectedRule.cefrLevel} · ${selectedRule.grammarCategory}`}
              icon={Languages}
            >
              <div className="space-y-5">
                {selectedProgress && (
                  <div className="rounded-lg border border-warning/30 bg-warning/5 p-4 text-sm leading-6 text-foreground">
                    <span className="font-medium">Why this topic now: </span>
                    {getGrammarReviewReason(selectedProgress)}
                  </div>
                )}
                <div className="rounded-lg border border-border-soft bg-surface p-4">
                  <p className="text-xs font-medium uppercase text-muted-copy">
                    {LocalizationService.translate(
                      'grammar.meaningFunction',
                      language
                    )}
                  </p>
                  <p className="mt-2 text-sm font-medium leading-6 text-foreground">
                    {selectedRule.definition}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-copy">
                    {selectedRule.languageFunction}
                  </p>
                </div>
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <p className="text-xs font-medium uppercase text-primary">
                    {LocalizationService.translate('grammar.form', language)}
                  </p>
                  <p className="mt-2 font-mono text-sm font-medium text-foreground">
                    {selectedRule.structure}
                  </p>
                </div>
                <div
                  className={`grid gap-4 ${language === 'tr' ? 'md:grid-cols-2' : ''}`}
                >
                  <div className="rounded-lg border border-border-soft bg-surface-hover p-4">
                    <p className="text-xs font-medium uppercase text-muted-copy">
                      English explanation
                    </p>
                    <p className="mt-2 text-sm leading-6 text-foreground">
                      {selectedRule.explanation}
                    </p>
                  </div>
                  {language === 'tr' && (
                    <div className="rounded-lg border border-border-soft bg-surface-hover p-4">
                      <p className="text-xs font-medium uppercase text-muted-copy">
                        Türkçe destek
                      </p>
                      <p className="mt-2 text-sm leading-6 text-foreground">
                        {selectedRule.turkishExplanation}
                      </p>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Engineering use
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-copy">
                    {selectedRule.engineeringUseCase}
                  </p>
                </div>
                <div className="space-y-2">
                  {selectedRule.examples.slice(0, 3).map((example) => (
                    <div
                      key={example.english}
                      className="rounded-lg border border-border-soft bg-surface p-3"
                    >
                      <p className="text-sm font-medium text-foreground">
                        {example.english}
                      </p>
                      <p className="mt-1 text-xs text-muted-copy">
                        {example.turkish}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-4">
                  <p className="text-xs font-medium uppercase text-rose-700">
                    Common mistake
                  </p>
                  <p className="mt-2 text-sm text-rose-900">
                    {selectedRule.badExampleEnglish}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-rose-800">
                    {language === 'tr'
                      ? selectedRule.badExampleTurkishExplanation
                      : selectedRule.commonMistakes}
                  </p>
                </div>
                <div className="rounded-lg border border-success/30 bg-success/5 p-4">
                  <p className="text-xs font-medium uppercase text-success">
                    Correct
                  </p>
                  <p className="mt-2 text-sm font-medium text-foreground">
                    {selectedRule.correctedExampleEnglish}
                  </p>
                </div>
                <div className="rounded-lg border border-warning/30 bg-warning/5 p-4">
                  <p className="text-xs font-medium uppercase text-warning">
                    {LocalizationService.translate(
                      'grammar.practice',
                      language
                    )}
                  </p>
                  <p className="mt-2 text-sm font-medium leading-6 text-foreground">
                    {selectedRule.taskPromptTemplate}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-muted-copy">
                    Target output: {selectedRule.minimumUserOutput}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border-soft bg-surface-hover p-4">
                  <span className="mr-auto text-xs font-medium text-muted-copy">
                    Use this rule in a connected skill task.
                  </span>
                  {selectedRule.skillUse.includes('reading') && (
                    <Link
                      className="inline-flex min-h-10 items-center rounded-lg border border-border-hover bg-surface px-3 text-sm font-medium text-foreground transition-colors hover:border-primary/30 hover:bg-primary/5"
                      to="/reading"
                    >
                      Reading
                    </Link>
                  )}
                  {selectedRule.skillUse.includes('writing') && (
                    <Link
                      className="inline-flex min-h-10 items-center rounded-lg border border-border-hover bg-surface px-3 text-sm font-medium text-foreground transition-colors hover:border-primary/30 hover:bg-primary/5"
                      to="/writing"
                    >
                      Writing
                    </Link>
                  )}
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button onClick={() => record(true)} className="sm:flex-1">
                    <CheckCircle2 className="h-4 w-4" /> I used this correctly
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => record(false)}
                    className="sm:flex-1"
                  >
                    <TriangleAlert className="h-4 w-4" /> Needs review
                  </Button>
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-border-soft pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={!previousRule}
                    onClick={() =>
                      previousRule && setSelectedId(previousRule.id)
                    }
                  >
                    <ArrowLeft className="h-4 w-4" /> Previous topic
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={!nextRule}
                    onClick={() => nextRule && setSelectedId(nextRule.id)}
                  >
                    Next topic <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </SectionCard>
          )}
        </div>
      )}
    </div>
  );
};

export default GrammarPage;
