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
import { PageHeader } from '@/shared/components/PageHeader';
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
      <PageHeader
        title="Grammar Workspace"
        description="Practice the embedded 360-rule grammar database at your independent Grammar level."
        badgeText={`${profile.skills.grammar.cefrBand} · CURRENT LEVEL`}
        badgeColor="primary"
      />

      <SkillEntryBrief skill="grammar" />

      <SectionCard
        title="Your grammar path"
        subtitle="Move through named topics in order; practice feeds Learning Memory"
        icon={Languages}
      >
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div>
            <p className="text-xs font-bold text-blue-700">
              {level} PATH · {rules.length} NAMED TOPICS
            </p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">
              {selectedRule?.title ?? 'Choose your first grammar topic'}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
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
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-blue-600 transition-[width] duration-300"
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
          statusColor="emerald"
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
          className="min-h-11 w-full rounded-[12px] border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
        />
      </SectionCard>

      <div
        role="tablist"
        aria-label="Grammar progress"
        className="grid grid-cols-2 gap-2 rounded-[16px] border border-slate-200 bg-white p-2 sm:grid-cols-4"
      >
        {TABS.map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={tab === item}
            onClick={() => setTab(item)}
            className={`min-h-11 rounded-[10px] px-3 text-sm font-bold transition-colors ${tab === item ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-sky-50'}`}
          >
            {item}
          </button>
        ))}
      </div>

      {visibleRules.length === 0 ? (
        <div className="rounded-[16px] border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <p className="font-bold text-slate-800">
            No {tab.toLowerCase()} rules in this view.
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Choose New to begin, or clear the search.
          </p>
          <Button className="mt-4" onClick={() => setTab('New')}>
            Open New Rules
          </Button>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[minmax(240px,0.38fr)_minmax(0,0.62fr)]">
          <aside className="max-h-[70vh] space-y-2 overflow-y-auto rounded-[16px] border border-slate-200 bg-white p-3">
            {visibleRules.map((rule) => {
              const lessonNumber = rules.findIndex(
                (item) => item.id === rule.id
              );
              return (
                <button
                  key={rule.id}
                  type="button"
                  onClick={() => setSelectedId(rule.id)}
                  className={`w-full rounded-[12px] border p-3 text-left transition-colors ${selectedRule?.id === rule.id ? 'border-blue-300 bg-blue-50' : 'border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/40'}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-blue-700">
                        LESSON {lessonNumber + 1}
                      </p>
                      <p className="mt-1 text-sm font-black text-slate-900">
                        {rule.title}
                      </p>
                    </div>
                    <StatusBadge
                      label={GrammarProgressService.get(rule.id).reviewStatus}
                      tone="neutral"
                    />
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
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
                  <div className="rounded-[12px] border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
                    <span className="font-black">Why this topic now: </span>
                    {getGrammarReviewReason(selectedProgress)}
                  </div>
                )}
                <div className="rounded-[12px] border border-slate-200 bg-white p-4">
                  <p className="text-xs font-black uppercase text-slate-500">
                    {LocalizationService.translate(
                      'grammar.meaningFunction',
                      language
                    )}
                  </p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-slate-800">
                    {selectedRule.definition}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {selectedRule.languageFunction}
                  </p>
                </div>
                <div className="rounded-[12px] border border-sky-200 bg-sky-50 p-4">
                  <p className="text-xs font-black uppercase text-sky-700">
                    {LocalizationService.translate('grammar.form', language)}
                  </p>
                  <p className="mt-2 font-mono text-sm font-bold text-slate-900">
                    {selectedRule.structure}
                  </p>
                </div>
                <div
                  className={`grid gap-4 ${language === 'tr' ? 'md:grid-cols-2' : ''}`}
                >
                  <div className="rounded-[12px] border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-black uppercase text-slate-500">
                      English explanation
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">
                      {selectedRule.explanation}
                    </p>
                  </div>
                  {language === 'tr' && (
                    <div className="rounded-[12px] border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-black uppercase text-slate-500">
                        Türkçe destek
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-700">
                        {selectedRule.turkishExplanation}
                      </p>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900">
                    Engineering use
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {selectedRule.engineeringUseCase}
                  </p>
                </div>
                <div className="space-y-2">
                  {selectedRule.examples.slice(0, 3).map((example) => (
                    <div
                      key={example.english}
                      className="rounded-[10px] border border-slate-200 bg-white p-3"
                    >
                      <p className="text-sm font-semibold text-slate-900">
                        {example.english}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {example.turkish}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="rounded-[12px] border border-rose-200 bg-rose-50 p-4">
                  <p className="text-xs font-black uppercase text-rose-700">
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
                <div className="rounded-[12px] border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-xs font-black uppercase text-emerald-700">
                    Correct
                  </p>
                  <p className="mt-2 text-sm font-semibold text-emerald-950">
                    {selectedRule.correctedExampleEnglish}
                  </p>
                </div>
                <div className="rounded-[12px] border border-amber-200 bg-amber-50 p-4">
                  <p className="text-xs font-black uppercase text-amber-800">
                    {LocalizationService.translate(
                      'grammar.practice',
                      language
                    )}
                  </p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-amber-950">
                    {selectedRule.taskPromptTemplate}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-amber-800">
                    Target output: {selectedRule.minimumUserOutput}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 rounded-[12px] border border-slate-200 bg-slate-50 p-4">
                  <span className="mr-auto text-xs font-bold text-slate-600">
                    Use this rule in a connected skill task.
                  </span>
                  {selectedRule.skillUse.includes('reading') && (
                    <Link
                      className="inline-flex min-h-10 items-center rounded-[12px] border border-slate-300 bg-white px-3 text-sm font-bold text-slate-700 transition-colors hover:border-sky-300 hover:bg-sky-50"
                      to="/reading"
                    >
                      Reading
                    </Link>
                  )}
                  {selectedRule.skillUse.includes('writing') && (
                    <Link
                      className="inline-flex min-h-10 items-center rounded-[12px] border border-slate-300 bg-white px-3 text-sm font-bold text-slate-700 transition-colors hover:border-sky-300 hover:bg-sky-50"
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
                <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
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
