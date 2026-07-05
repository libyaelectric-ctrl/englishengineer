import { useMemo, useState } from 'react';
import {
  Bot,
  Check,
  Clipboard,
  Heart,
  Search,
  Send,
  WifiOff,
} from 'lucide-react';
import { AIService, AIProviderStatus } from '@/features/ai';
import { BetaService } from '@/features/beta';
import {
  MEETING_PHRASES,
  QUICK_AI_ACTIONS,
  SITE_DICTIONARY,
  WorkToolsService,
  useWorkToolsStore,
} from '@/features/work-tools';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { PageHeader } from '@/shared/components/PageHeader';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { useBillingStore, canAccessFeature } from '@/features/billing';
import { Plus, Trash2, Lock, X } from 'lucide-react';
import { storage } from '@/shared/storage';

type QuickTab = 'ai' | 'meeting' | 'dictionary';

const QuickToolsPage = ({ embedded = false }: { embedded?: boolean }) => {
  const {
    quickAIDraft,
    favoritePhraseIds,
    toggleFavorite,
    remember,
    rememberSearch,
  } = useWorkToolsStore();
  const [tab, setTab] = useState<QuickTab>('ai');
  const [input, setInput] = useState(quickAIDraft?.text ?? '');
  const [query, setQuery] = useState('');
  const [result, setResult] = useState('');
  const [status, setStatus] = useState<AIProviderStatus>(() =>
    AIService.getStatus([])
  );
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const subscription = useBillingStore((state) => state.subscription);
  const hasProjectAccess = canAccessFeature(subscription, 'projectWorkspace').allowed;

  const [customTerms, setCustomTerms] = useState<any[]>(() => {
    return storage.get<any[]>('custom_dictionary') ?? [];
  });

  const [isAddingTerm, setIsAddingTerm] = useState(false);
  const [newTerm, setNewTerm] = useState('');
  const [newMeaning, setNewMeaning] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newExplanation, setNewExplanation] = useState('');
  const [newExample, setNewExample] = useState('');
  const [newWrongUsage, setNewWrongUsage] = useState('');
  const [newRelated, setNewRelated] = useState('');
  const [termError, setTermError] = useState<string | null>(null);

  const filteredTerms = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const allTerms = [...customTerms, ...SITE_DICTIONARY];
    return allTerms.filter((item) =>
      `${item.term} ${item.turkishMeaning} ${item.category}`
        .toLowerCase()
        .includes(normalized)
    );
  }, [query, customTerms]);

  const handleAddTerm = () => {
    setTermError(null);
    if (!newTerm.trim() || !newMeaning.trim() || !newCategory.trim()) {
      setTermError('Please fill in Term, Meaning, and Category.');
      return;
    }
    const termId = `custom_term_${Date.now()}`;
    const newEntry = {
      id: termId,
      term: newTerm.trim(),
      turkishMeaning: newMeaning.trim(),
      category: newCategory.trim(),
      technicalExplanation: newExplanation.trim() || 'Custom terminology added to project scope.',
      siteExample: newExample.trim() || 'No example provided.',
      commonWrongUsage: newWrongUsage.trim() || 'None reported.',
      relatedTerms: newRelated.split(',').map((s) => s.trim()).filter((s) => s) || [],
      isCustom: true,
    };
    const updated = [newEntry, ...customTerms];
    setCustomTerms(updated);
    storage.set('custom_dictionary', updated);

    // Reset form
    setNewTerm('');
    setNewMeaning('');
    setNewCategory('');
    setNewExplanation('');
    setNewExample('');
    setNewWrongUsage('');
    setNewRelated('');
    setIsAddingTerm(false);
  };

  const handleDeleteTerm = (id: string) => {
    const updated = customTerms.filter((t) => t.id !== id);
    setCustomTerms(updated);
    storage.set('custom_dictionary', updated);
  };

  const runAction = async (label: string, instruction: string) => {
    if (!input.trim()) return;
    setIsRunning(true);
    try {
      const response = await AIService.run([], 'rewriteText', {
        modeId: 'quick_ai',
        modeName: label,
        prompt: `${instruction}\n\nInput:\n${input.trim()}`,
      });
      setResult(response.text);
      setStatus(response.providerStatus);
      BetaService.trackEvent('quick_ai_action_used', '/quick-tools');
    } finally {
      setIsRunning(false);
    }
  };

  const copy = async (id: string, text: string) => {
    if (await WorkToolsService.copy(text)) {
      remember(id);
      setCopied(id);
      window.setTimeout(() => setCopied(null), 1200);
    }
  };

  return (
    <div className="space-y-7 animate-in fade-in duration-300">
      {!embedded && (
        <PageHeader
          title="Quick Tools"
          description="Fast meeting language, site terminology and provider-controlled AI rewriting."
          badgeText={status.label}
          badgeColor={status.isConnected ? 'emerald' : 'amber'}
        />
      )}

      <div
        className="flex flex-wrap gap-2 rounded-xl border border-border-soft bg-white p-3"
        role="tablist"
      >
        {(
          [
            ['ai', 'Quick AI'],
            ['meeting', 'Meeting Phrasebook'],
            ['dictionary', 'Site Dictionary'],
          ] as const
        ).map(([id, label]) => (
          <Button
            key={id}
            role="tab"
            aria-selected={tab === id}
            variant={tab === id ? 'primary' : 'ghost'}
            onClick={() => setTab(id)}
          >
            {label}
          </Button>
        ))}
      </div>

      {tab === 'ai' && (
        <div className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
          <Card className="space-y-5" hoverEffect={false}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-medium text-foreground">
                  Quick AI Editor
                </h2>
                <p className="mt-1 text-sm text-muted-copy">
                  AI requires an internet-connected backend. No vendor API key
                  is stored in this browser.
                </p>
              </div>
              <StatusBadge
                label={status.label}
                tone={status.isConnected ? 'success' : 'warning'}
              />
            </div>
            {!status.isConnected && (
              <div className="space-y-2 rounded-xl border border-warning/30 bg-warning/5 p-3 text-sm text-foreground">
                <div className="flex flex-wrap gap-2">
                  <StatusBadge label="Backend required" tone="warning" />
                  <StatusBadge label="Mock preview" tone="neutral" />
                </div>
                <div className="flex gap-3">
                  <WifiOff className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    {status.detail} Connect AI backend for real rewriting.
                  </span>
                </div>
              </div>
            )}
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Paste a site message, report note or email draft"
              className="min-h-44 w-full rounded-lg border border-border-soft bg-surface-hover p-4 text-sm leading-6 text-foreground outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10"
            />
            <div className="flex flex-wrap gap-2">
              {QUICK_AI_ACTIONS.map((action) => (
                <Button
                  key={action.id}
                  variant="secondary"
                  disabled={isRunning || !input.trim()}
                  onClick={() =>
                    runAction(action.label, action.systemInstruction)
                  }
                  title={action.expectedOutputStyle}
                >
                  <Bot className="h-4 w-4" /> {action.label}
                </Button>
              ))}
            </div>
          </Card>
          <Card className="space-y-4" hoverEffect={false}>
            <h2 className="text-xl font-medium text-foreground">Result</h2>
            {isRunning ? (
              <div className="space-y-3" aria-live="polite">
                <div className="h-4 animate-pulse rounded-lg bg-surface-hover" />
                <div className="h-4 animate-pulse rounded-lg bg-surface-hover" />
                <div className="h-24 animate-pulse rounded-lg bg-surface-hover" />
              </div>
            ) : result ? (
              <>
                <p className="whitespace-pre-line rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm leading-6 text-foreground">
                  {result}
                </p>
                <Button
                  variant="secondary"
                  onClick={() => copy('quick-ai-result', result)}
                >
                  {copied === 'quick-ai-result' ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Clipboard className="h-4 w-4" />
                  )}{' '}
                  Copy result
                </Button>
              </>
            ) : (
              <div className="rounded-xl border border-dashed border-border-hover bg-surface-hover p-10 text-center text-sm text-muted-copy">
                <Send className="mx-auto mb-3 h-6 w-6" />
                Choose an action to create a result.
              </div>
            )}
          </Card>
        </div>
      )}

      {tab === 'meeting' && (
        <div className="grid gap-4 lg:grid-cols-2">
          {MEETING_PHRASES.map((item) => {
            const favorite = favoritePhraseIds.includes(item.id);
            return (
              <Card key={item.id} className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-widest text-primary">
                      {item.category}
                    </p>
                    <h2 className="mt-1 text-lg font-medium text-foreground">
                      {item.phrase}
                    </h2>
                  </div>
                  <Button
                    variant="ghost"
                    className="px-3"
                    onClick={() => toggleFavorite(item.id)}
                    aria-label={favorite ? 'Remove favorite' : 'Save favorite'}
                  >
                    <Heart
                      className={`h-4 w-4 ${favorite ? 'fill-rose-500 text-rose-500' : ''}`}
                    />
                  </Button>
                </div>
                <p className="text-sm text-foreground">
                  <strong>Turkce:</strong> {item.turkishMeaning}
                </p>
                <p className="text-sm text-muted-copy">
                  <strong>Use:</strong> {item.whenToUse}
                </p>
                <p className="rounded-xl border border-border-soft bg-surface-hover p-3 text-sm italic text-foreground">
                  {item.example}
                </p>
                <Button
                  variant="secondary"
                  onClick={() => copy(item.id, item.phrase)}
                >
                  <Clipboard className="h-4 w-4" /> Copy
                </Button>
              </Card>
            );
          })}
        </div>
      )}

      {tab === 'dictionary' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <label className="flex-1 flex min-h-11 items-center gap-2 rounded-lg border border-border-soft bg-white px-4 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">
              <Search className="h-4 w-4 text-muted-copy" />
              <span className="sr-only">Search site dictionary</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onBlur={() => rememberSearch(query)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') rememberSearch(query);
                }}
                placeholder="Search English, Turkish or category"
                className="w-full bg-transparent text-sm outline-none"
              />
            </label>
            <Button
              type="button"
              onClick={() => {
                if (!hasProjectAccess) {
                  alert("Custom terminology customization requires the Project Plan ($39/mo) or higher. Please upgrade to customize project vocabulary!");
                  return;
                }
                setIsAddingTerm(true);
              }}
              className="gap-1.5 h-11 bg-primary text-white font-medium"
            >
              <Plus className="h-4 w-4" />
              {!hasProjectAccess && <Lock className="h-3 w-3 text-white/85 shrink-0" />}
              Add Term
            </Button>
          </div>

          {isAddingTerm && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-foreground">Add Custom Terminology</h3>
                <button type="button" onClick={() => setIsAddingTerm(false)} className="text-muted-copy hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Term (e.g. Grounding grid)"
                  value={newTerm}
                  onChange={(e) => setNewTerm(e.target.value)}
                  className="rounded-lg border border-border-soft bg-white px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                />
                <input
                  type="text"
                  placeholder="Turkish Meaning (e.g. Topraklama ağı)"
                  value={newMeaning}
                  onChange={(e) => setNewMeaning(e.target.value)}
                  className="rounded-lg border border-border-soft bg-white px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                />
                <input
                  type="text"
                  placeholder="Category (e.g. electrical, civil)"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="rounded-lg border border-border-soft bg-white px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-3">
                <textarea
                  placeholder="Technical Explanation"
                  value={newExplanation}
                  onChange={(e) => setNewExplanation(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-border-soft bg-white px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                />
                <input
                  type="text"
                  placeholder="Site Example (e.g. The grounding grid installation passed inspection.)"
                  value={newExample}
                  onChange={(e) => setNewExample(e.target.value)}
                  className="w-full rounded-lg border border-border-soft bg-white px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Common Wrong Usage (e.g. ground grid)"
                    value={newWrongUsage}
                    onChange={(e) => setNewWrongUsage(e.target.value)}
                    className="rounded-lg border border-border-soft bg-white px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                  <input
                    type="text"
                    placeholder="Related Terms (comma-separated)"
                    value={newRelated}
                    onChange={(e) => setNewRelated(e.target.value)}
                    className="rounded-lg border border-border-soft bg-white px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {termError && (
                <p className="text-xs font-medium text-error">{termError}</p>
              )}

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsAddingTerm(false)}>Cancel</Button>
                <Button type="button" onClick={handleAddTerm} className="bg-primary text-white font-medium">Add to Scope</Button>
              </div>
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            {filteredTerms.map((item) => {
              const favorite = favoritePhraseIds.includes(item.id);
              return (
                <Card key={item.id} className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-widest text-primary">
                        {item.category}
                      </p>
                      <h2 className="mt-1 text-xl font-medium text-foreground">
                        {item.term}
                      </h2>
                      <p className="text-sm font-medium text-foreground">
                        {item.turkishMeaning}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {item.isCustom && (
                        <Button
                          variant="ghost"
                          className="px-2.5 text-error hover:bg-error/10"
                          onClick={() => handleDeleteTerm(item.id)}
                          aria-label="Delete custom term"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        className="px-3"
                        onClick={() => toggleFavorite(item.id)}
                        aria-label={
                          favorite ? 'Remove favorite' : 'Save favorite'
                        }
                      >
                        <Heart
                          className={`h-4 w-4 ${favorite ? 'fill-rose-500 text-rose-500' : ''}`}
                        />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm leading-6 text-muted-copy">
                    {item.technicalExplanation}
                  </p>
                  <p className="rounded-xl border border-border-soft bg-surface-hover p-3 text-sm text-foreground">
                    <strong>Site:</strong> {item.siteExample}
                  </p>
                  <p className="text-sm text-warning">
                    <strong>Common mistake:</strong> {item.commonWrongUsage}
                  </p>
                  <p className="text-xs font-medium text-muted-copy">
                    Related: {item.relatedTerms.join(', ')}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickToolsPage;
