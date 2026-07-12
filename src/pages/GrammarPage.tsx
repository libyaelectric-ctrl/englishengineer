import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
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

  const currentIdx = visibleRules.findIndex((r) => r.id === selectedRule?.id);

  return (
    <div className="animate-in fade-in duration-300 relative">
      {/* Fixed Title */}
      <div className="sticky top-0 z-40 bg-background pt-4 pb-2 border-b border-border-soft">
        <h1 className="text-2xl font-black tracking-tight text-foreground">Grammar</h1>
      </div>
      {/* Fixed Search */}
      <div className="sticky top-[52px] z-30 bg-background pt-3 pb-2 border-b border-border-soft">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><Search className="h-4 w-4 text-muted-copy" /></div>
          <input value={query} onChange={(e) => setQuery(e.target.value)} className="block min-h-10 w-full rounded-xl border border-border-soft bg-surface py-2 pl-10 pr-4 text-sm text-foreground shadow-sm focus:border-primary focus:ring-1 focus:ring-primary/20" placeholder="Search a topic name or engineering use" />
        </div>
      </div>
      {/* Fixed Tabs */}
      <div className="sticky top-[96px] z-20 bg-background pt-2 pb-2 border-b border-border-soft">
        <div className="grid grid-cols-2 gap-2 rounded-xl border border-border-soft bg-surface p-1.5 sm:grid-cols-4">
          {TABS.map((item) => (
            <button key={item} type="button" onClick={() => setTab(item)} className={`min-h-9 rounded-lg px-3 text-sm font-bold transition-all ${tab === item ? 'bg-primary text-white shadow-sm' : 'text-muted-copy hover:bg-primary/5 hover:text-foreground'}`}>{item}</button>
          ))}
        </div>
      </div>
      {/* Fixed Topic Nav */}
      <div className="sticky top-[148px] z-10 bg-surface/95 backdrop-blur-sm border-b border-border-soft px-4 py-2">
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" className="shrink-0 rounded-full w-8 h-8 p-0" onClick={() => { if (currentIdx > 0) setSelectedId(visibleRules[currentIdx - 1].id); }}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 flex items-center justify-center gap-2 overflow-x-auto">
            {visibleRules.slice(Math.max(0, currentIdx - 1), currentIdx + 3).map((rule) => (
              <button key={rule.id} type="button" onClick={() => setSelectedId(rule.id)} className={`shrink-0 px-3 py-1 rounded-lg text-xs font-bold transition-all ${selectedRule?.id === rule.id ? 'bg-primary text-white' : 'bg-surface-hover text-muted-copy hover:bg-primary/10'}`}>
                {rule.title.length > 20 ? rule.title.slice(0, 20) + '...' : rule.title}
              </button>
            ))}
          </div>
          <Button type="button" variant="outline" className="shrink-0 rounded-full w-8 h-8 p-0" onClick={() => { if (currentIdx < visibleRules.length - 1) setSelectedId(visibleRules[currentIdx + 1].id); }}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {/* Scrollable Content */}
      <div className="pt-4 pb-20">
        <div className="grid lg:grid-cols-[300px_1fr] xl:grid-cols-[350px_1fr]">
          {/* Left: Topic List */}
          <div className="flex flex-col border-r border-border-soft bg-surface/50">
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
              {visibleRules.length === 0 ? (
                <p className="text-center text-sm font-medium text-muted-copy py-3">No rules found.</p>
              ) : visibleRules.map((rule) => {
                const num = rules.findIndex((r) => r.id === rule.id) + 1;
                const sel = selectedRule?.id === rule.id;
                return (
                  <button key={rule.id} type="button" onClick={() => setSelectedId(rule.id)} className={`w-full flex flex-col rounded-xl border p-3 text-left transition-colors ${sel ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20' : 'border-border-soft bg-surface hover:border-primary/30 hover:bg-primary/5'}`}>
                    <p className="text-[10px] font-bold tracking-wider text-primary">LESSON {num}</p>
                    <p className="mt-0.5 text-sm font-bold text-foreground truncate">{rule.title}</p>
                    <p className="text-[11px] font-medium text-muted-copy truncate">{rule.grammarCategory}</p>
                  </button>
                );
              })}
            </div>
          </div>
          {/* Right: Rule Detail */}
          <div className="flex flex-col bg-surface">
            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 lg:p-8">
              {selectedRule ? (
                <div className="max-w-4xl mx-auto space-y-6 pb-20">
                  <SectionCard title={selectedRule.ruleTitle || selectedRule.title} subtitle={`${selectedRule.cefrLevel} · ${selectedRule.grammarCategory}`} icon={Languages}>
                    <div className="space-y-6">
                      {selectedProgress && selectedProgress.reviewStatus !== 'New' && (
                        <div className="rounded-xl border border-warning/30 bg-warning/5 p-4 text-sm leading-6 text-foreground shadow-sm">
                          <span className="font-bold text-warning">Why this topic now: </span>
                          <span className="font-medium text-muted-copy">{getGrammarReviewReason(selectedProgress)}</span>
                        </div>
                      )}
                      <div className="grid gap-6 md:grid-cols-2 items-stretch">
                        <div className="h-full flex flex-col rounded-xl border border-border-soft bg-surface p-5 shadow-sm">
                          <p className="text-xs font-bold uppercase tracking-wider text-muted-copy">{LocalizationService.translate('grammar.meaningFunction', language)}</p>
                          <p className="mt-3 text-base font-medium leading-7 text-foreground">{selectedRule.definition}</p>
                          <p className="mt-auto pt-2 text-sm leading-6 text-muted-copy">{selectedRule.languageFunction}</p>
                        </div>
                        <div className="h-full flex flex-col rounded-xl border border-primary/20 bg-primary/5 p-5 shadow-sm">
                          <p className="text-xs font-bold uppercase tracking-wider text-primary">{LocalizationService.translate('grammar.form', language)}</p>
                          <p className="mt-3 font-mono text-base font-bold text-foreground">{selectedRule.structure}</p>
                        </div>
                      </div>
                      <div className="grid gap-6 md:grid-cols-2 items-stretch">
                        <div className="h-full flex flex-col rounded-xl border border-border-soft bg-surface p-5 shadow-sm">
                          <p className="text-xs font-bold uppercase tracking-wider text-muted-copy">English explanation</p>
                          <p className="mt-3 text-sm leading-7 text-foreground">{selectedRule.explanation}</p>
                        </div>
                        <div className="h-full flex flex-col rounded-xl border border-border-soft bg-surface p-5 shadow-sm">
                          <p className="text-xs font-bold uppercase tracking-wider text-muted-copy">{language === 'tr' ? 'Türkçe destek' : 'Engineering use'}</p>
                          <p className="mt-3 text-sm leading-7 text-foreground">{language === 'tr' ? selectedRule.turkishExplanation : selectedRule.engineeringUseCase}</p>
                        </div>
                      </div>
                      <div className="grid gap-6 md:grid-cols-2 items-stretch">
                        <div className="h-full flex flex-col rounded-xl border border-warning/30 bg-warning/5 p-5 shadow-sm">
                          <p className="text-xs font-bold uppercase tracking-wider text-warning">{LocalizationService.translate('grammar.practice', language)}</p>
                          <p className="mt-3 text-base font-bold leading-7 text-foreground">{selectedRule.taskPromptTemplate}</p>
                          <p className="mt-auto pt-2 text-sm leading-6 text-muted-copy">Target output: {selectedRule.minimumUserOutput}</p>
                        </div>
                        {language !== 'tr' && <div className="h-full flex flex-col rounded-xl border border-border-soft bg-surface p-5 shadow-sm"><p className="text-xs font-bold uppercase tracking-wider text-muted-copy">Engineering use</p><p className="mt-3 text-sm leading-7 text-foreground">{selectedRule.engineeringUseCase}</p></div>}
                      </div>
                      <div className="grid gap-6 md:grid-cols-2 items-stretch">
                        <div className="h-full flex flex-col rounded-xl border border-rose-200 bg-rose-50 p-5 shadow-sm">
                          <p className="text-xs font-bold uppercase tracking-wider text-rose-700">Common mistake</p>
                          <p className="mt-3 text-base font-bold text-rose-900">{selectedRule.badExampleEnglish}</p>
                          <p className="mt-auto pt-2 text-sm leading-6 text-rose-800">{language === 'tr' ? selectedRule.badExampleTurkishExplanation : selectedRule.commonMistakes}</p>
                        </div>
                        <div className="h-full flex flex-col rounded-xl border border-success/30 bg-success/5 p-5 shadow-sm">
                          <p className="text-xs font-bold uppercase tracking-wider text-success">Correct</p>
                          <p className="mt-3 text-base font-bold text-foreground">{selectedRule.correctedExampleEnglish}</p>
                        </div>
                      </div>
                      <div className="grid gap-6 md:grid-cols-2 items-stretch">
                        {selectedRule.examples.map((ex, i) => (
                          <div key={i} className="h-full flex flex-col rounded-xl border border-border-soft bg-surface p-5 shadow-sm">
                            <p className="text-base font-bold text-foreground">{ex.english}</p>
                            <p className="mt-auto pt-1 text-sm font-medium text-muted-copy">{ex.turkish}</p>
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border-soft bg-surface-hover p-4 shadow-sm">
                        <span className="mr-auto text-xs font-bold text-muted-copy tracking-wider uppercase">Use this rule in a connected skill task</span>
                        {selectedRule.skillUse.includes('reading') && <Link className="inline-flex min-h-10 items-center rounded-lg border border-border-hover bg-surface px-4 text-sm font-bold text-foreground transition-colors hover:border-primary/30 hover:bg-primary/5" to="/reading">Reading</Link>}
                        {selectedRule.skillUse.includes('writing') && <Link className="inline-flex min-h-10 items-center rounded-lg border border-border-hover bg-surface px-4 text-sm font-bold text-foreground transition-colors hover:border-primary/30 hover:bg-primary/5" to="/writing">Writing</Link>}
                      </div>
                      <div className="flex flex-col gap-3 sm:flex-row pt-6 border-t border-border-soft">
                        <Button onClick={() => record(true)} className="sm:flex-1 h-12 text-base shadow-sm"><CheckCircle2 className="mr-2 h-5 w-5" /> I used this correctly</Button>
                        <Button variant="outline" onClick={() => record(false)} className="sm:flex-1 h-12 text-base shadow-sm"><TriangleAlert className="mr-2 h-5 w-5" /> Needs review</Button>
                      </div>
                    </div>
                  </SectionCard>
                </div>
              ) : (
                <p className="text-center text-muted-copy py-20">Select a topic from the list.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrammarPage;
