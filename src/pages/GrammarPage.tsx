import { useEffect, useMemo } from 'react';
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
  useGrammarStore,
} from '@/features/grammar';
import { getBaseCefrLevel, useLearningCockpit } from '@/features/profile';
import { Button } from '@/shared/components/Button';
import { PageHeader } from '@/shared/components/PageHeader';
import { SectionCard } from '@/shared/components/SectionCard';
import { ProductAnalyticsService } from '@/features/analytics/product-analytics.service';
import {
  LocalizationService,
  useLocalizationStore,
} from '@/features/localization';

const TABS = ['New', 'Learning', 'Due', 'Strong'] as const;

const GrammarPage = () => {
  const currentUser = useAuthStore((state) => state.currentUser);
  const language = useLocalizationStore((state) => state.language);
  const { profile } = useLearningCockpit(currentUser?.id);
  const level = getBaseCefrLevel(profile.skills.grammar.cefrBand);
  
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

  useEffect(() => {
    let active = true;
    void GrammarRepository.getGrammarRulesByLevel(level).then((items) => {
      if (!active) return;
      setRules(items);
      // Only set initial selectedId if none exists or it's not in the new items
      if (!selectedId || !items.find(i => i.id === selectedId)) {
        setSelectedId(items[0]?.id ?? null);
      }
    });
    return () => {
      active = false;
    };
  }, [level, setRules, setSelectedId, selectedId]);

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
  }, [query, rules, tab]);

  const selectedRule = rules.find((rule) => rule.id === selectedId) ?? visibleRules[0];
  const visibleRuleIndex = selectedRule ? visibleRules.findIndex((rule) => rule.id === selectedRule.id) : -1;
  const nextRule = visibleRuleIndex >= 0 ? visibleRules[visibleRuleIndex + 1] : undefined;
  const previousRule = visibleRuleIndex > 0 ? visibleRules[visibleRuleIndex - 1] : undefined;
  const selectedProgress = selectedRule ? GrammarProgressService.get(selectedRule.id) : null;

  const record = (correct: boolean) => {
    if (!selectedRule) return;
    ProductAnalyticsService.track('grammar_task_started', '/grammar', {
      metadata: { skill: 'grammar', missionId: selectedRule.id, source: 'user' },
    });
    GrammarProgressService.recordUsage(selectedRule.id, correct);
    ProductAnalyticsService.track('grammar_task_completed', '/grammar', {
      metadata: { skill: 'grammar', missionId: selectedRule.id, source: 'user' },
    });
    ProductAnalyticsService.trackOnce('first_task_completed', '/grammar', {
      skill: 'grammar', source: 'user',
    });
    
    // Auto-advance
    if (nextRule) {
      setSelectedId(nextRule.id);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader title="Grammar">
        {/* Search Bar */}
        <div className="relative mb-4">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-muted-copy" />
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="block min-h-11 w-full rounded-xl border border-border-soft bg-surface py-2.5 pl-10 pr-4 text-sm text-foreground shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
            placeholder="Search a topic name or engineering use"
          />
        </div>
        
        {/* Tabs */}
        <div className="grid grid-cols-2 gap-2 rounded-xl border border-border-soft bg-surface p-1.5 sm:grid-cols-4">
          {TABS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setTab(item)}
              className={`min-h-9 rounded-lg px-3 text-sm font-bold transition-all ${
                tab === item
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted-copy hover:bg-primary/5 hover:text-foreground'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </PageHeader>

      {/* Horizontal Topic Bar */}
      <div className="sticky top-[72px] z-10 -mx-4 px-4 py-3 bg-surface/95 backdrop-blur-sm border-b border-border-soft lg:-mx-8 lg:px-8 shadow-sm transition-all">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="shrink-0 rounded-full w-10 h-10 p-0"
            disabled={!previousRule}
            onClick={() => previousRule && setSelectedId(previousRule.id)}
            aria-label="Previous grammar topic"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex-1 overflow-x-auto custom-scrollbar snap-x flex gap-3 pb-1 pt-1">
            {visibleRules.length === 0 ? (
              <div className="w-full text-center text-sm font-medium text-muted-copy py-3">
                No rules found for the current search/tab.
              </div>
            ) : (
              visibleRules.map((rule) => {
                const lessonNumber = rules.findIndex((item) => item.id === rule.id) + 1;
                const isSelected = selectedRule?.id === rule.id;
                return (
                  <button
                    key={rule.id}
                    type="button"
                    onClick={() => setSelectedId(rule.id)}
                    className={`shrink-0 snap-start w-[240px] rounded-xl border p-3 text-left transition-colors ${
                      isSelected 
                        ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20' 
                        : 'border-border-soft bg-surface hover:border-primary/30 hover:bg-primary/5'
                    }`}
                  >
                    <div className="flex flex-col h-full justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold tracking-wider text-primary">
                          LESSON {lessonNumber}
                        </p>
                        <p className="mt-1 text-sm font-bold text-foreground truncate">
                          {rule.title}
                        </p>
                      </div>
                      <p className="text-[11px] font-medium text-muted-copy truncate">
                        {rule.grammarCategory}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
          
          <Button
            type="button"
            variant="outline"
            className="shrink-0 rounded-full w-10 h-10 p-0"
            disabled={!nextRule}
            onClick={() => nextRule && setSelectedId(nextRule.id)}
            aria-label="Next grammar topic"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Flowing Content */}
      {selectedRule && (
        <div className="max-w-4xl mx-auto space-y-6 mt-6 pb-20">
          <SectionCard
            title={selectedRule.ruleTitle || selectedRule.title}
            subtitle={`${selectedRule.cefrLevel} · ${selectedRule.grammarCategory}`}
            icon={Languages}
          >
            <div className="space-y-6">
              {selectedProgress && selectedProgress.reviewStatus !== 'New' && (
                <div className="rounded-xl border border-warning/30 bg-warning/5 p-4 text-sm leading-6 text-foreground shadow-sm">
                  <span className="font-bold text-warning">Why this topic now: </span>
                  <span className="font-medium text-muted-copy">{getGrammarReviewReason(selectedProgress)}</span>
                </div>
              )}
              
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl border border-border-soft bg-surface p-5 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-copy">
                    {LocalizationService.translate('grammar.meaningFunction', language)}
                  </p>
                  <p className="mt-3 text-base font-medium leading-7 text-foreground">
                    {selectedRule.definition}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-copy">
                    {selectedRule.languageFunction}
                  </p>
                </div>
                
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-primary">
                    {LocalizationService.translate('grammar.form', language)}
                  </p>
                  <p className="mt-3 font-mono text-base font-bold text-foreground">
                    {selectedRule.structure}
                  </p>
                </div>
              </div>

              <div className={`grid gap-6 ${language === 'tr' ? 'md:grid-cols-2' : ''}`}>
                <div className="rounded-xl border border-border-soft bg-surface p-5 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-copy">
                    English explanation
                  </p>
                  <p className="mt-3 text-sm leading-7 text-foreground">
                    {selectedRule.explanation}
                  </p>
                </div>
                {language === 'tr' && (
                  <div className="rounded-xl border border-border-soft bg-surface p-5 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-copy">
                      Türkçe destek
                    </p>
                    <p className="mt-3 text-sm leading-7 text-foreground">
                      {selectedRule.turkishExplanation}
                    </p>
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-border-soft bg-surface p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Engineering use
                </p>
                <p className="mt-3 text-sm leading-7 text-muted-copy">
                  {selectedRule.engineeringUseCase}
                </p>
              </div>

              <div className="space-y-3">
                {selectedRule.examples.map((example, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-border-soft bg-surface p-4 shadow-sm"
                  >
                    <p className="text-base font-bold text-foreground">
                      {example.english}
                    </p>
                    <p className="mt-1 text-sm font-medium text-muted-copy">
                      {example.turkish}
                    </p>
                  </div>
                ))}
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-5 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-rose-700">
                    Common mistake
                  </p>
                  <p className="mt-3 text-base font-medium text-rose-900">
                    {selectedRule.badExampleEnglish}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-rose-800">
                    {language === 'tr'
                      ? selectedRule.badExampleTurkishExplanation
                      : selectedRule.commonMistakes}
                  </p>
                </div>
                <div className="rounded-xl border border-success/30 bg-success/5 p-5 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-success">
                    Correct
                  </p>
                  <p className="mt-3 text-base font-bold text-foreground">
                    {selectedRule.correctedExampleEnglish}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-warning/30 bg-warning/5 p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-warning">
                  {LocalizationService.translate('grammar.practice', language)}
                </p>
                <p className="mt-3 text-base font-bold leading-7 text-foreground">
                  {selectedRule.taskPromptTemplate}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-copy">
                  Target output: {selectedRule.minimumUserOutput}
                </p>
              </div>
              
              <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border-soft bg-surface-hover p-4 shadow-sm">
                <span className="mr-auto text-xs font-bold text-muted-copy tracking-wider uppercase">
                  Use this rule in a connected skill task
                </span>
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

              <div className="flex flex-col gap-3 sm:flex-row pt-6 border-t border-border-soft">
                <Button onClick={() => record(true)} className="sm:flex-1 h-12 text-base shadow-sm">
                  <CheckCircle2 className="mr-2 h-5 w-5" /> I used this correctly
                </Button>
                <Button
                  variant="outline"
                  onClick={() => record(false)}
                  className="sm:flex-1 h-12 text-base shadow-sm"
                >
                  <TriangleAlert className="mr-2 h-5 w-5" /> Needs review
                </Button>
              </div>
            </div>
          </SectionCard>
        </div>
      )}
    </div>
  );
};

export default GrammarPage;
