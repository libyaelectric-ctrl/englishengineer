import {
  BarChart3,
  BookMarked,
  Check,
  Download,
  FileDown,
  Layers3,
  Mic,
  Network,
  PanelBottom,
  PenTool,
  Radar,
  Repeat2,
  Smartphone,
  Sparkles,
  Volume2,
} from 'lucide-react';

import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/shared/components/Button';
import { logger } from '@/shared/logger';
import { addOfflineAction, getOfflineActionCount } from '@/shared/utils/indexed-db';

import {
  type GrammarRule,
  type GrammarRuleProgress,
  GrammarVocabularyBridge,
} from '@/features/grammar';

import {
  AnalyticsMode,
  CopilotMode,
  DrillsMode,
  FieldMode,
  MiniMetric,
  PanelShell,
  type ProofIssue,
  type RuleWithProgress,
} from './GrammarEnhancementPanel/index';

type LabMode =
  | 'field'
  | 'drills'
  | 'copilot'
  | 'audio'
  | 'analytics'
  | 'personal'
  | 'mobile'
  | 'integration'
  | 'performance';

const STORAGE_KEYS = {
  favorites: 'EngVox_favorite_grammar',
  notes: 'EngVox_grammar_notes',
  customQueue: 'EngVox_grammar_custom_queue',
};

const MODES: Array<{ id: LabMode; label: string; icon: typeof Layers3 }> = [
  { id: 'field', label: 'Field Grammar', icon: Layers3 },
  { id: 'drills', label: 'Drills', icon: Layers3 },
  { id: 'copilot', label: 'Copilot', icon: Sparkles },
  { id: 'audio', label: 'Audio', icon: Volume2 },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'personal', label: 'Personal', icon: BookMarked },
  { id: 'mobile', label: 'Mobile', icon: Smartphone },
  { id: 'integration', label: 'Bridge', icon: Network },
  { id: 'performance', label: 'System', icon: Repeat2 },
];

const FORMAL_SITE_PAIRS = [
  ['The limit shall not be exceeded.', 'Do not go over the limit.'],
  ['The panel cannot be energized before inspection.', 'Do not switch it on before checks.'],
  ['The deviation should be reported immediately.', 'Tell the lead about the issue now.'],
];

const TECH_TERMS: Record<string, string> = {
  beam: 'kiris',
  load: 'yuk',
  valve: 'vana',
  concrete: 'beton',
  tolerance: 'tolerans',
  contractor: 'yuklenici',
  commissioning: 'devreye alma',
  inspection: 'kontrol',
  deviation: 'sapma',
};

const readJson = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch (e) {
    logger.w('[GrammarEnhancementPanel] Failed to read JSON from localStorage', e);
    return fallback;
  }
};

const writeJson = <T,>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    logger.w('[GrammarEnhancementPanel] Failed to write JSON to localStorage', e);
  }
};

const downloadText = (filename: string, content: string, type = 'text/plain'): void => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

const buildCsv = (rules: GrammarRule[]): string => {
  const rows = rules.map((rule) =>
    [
      rule.id,
      rule.cefrLevel,
      rule.ruleTitle || rule.title,
      rule.structure,
      rule.correctedExampleEnglish,
      rule.turkishExplanation,
    ]
      .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
      .join(',')
  );
  return ['"id","level","rule","formula","example","note"', ...rows].join('\n');
};

export const GrammarEnhancementPanel = ({
  selectedRule,
  selectedProgress,
  rules,
  rulesWithProgress,
  query,
  setQuery,
  selectRule,
  recordUsage,
}: {
  selectedRule: GrammarRule;
  selectedProgress: GrammarRuleProgress;
  rules: GrammarRule[];
  rulesWithProgress: RuleWithProgress[];
  query: string;
  setQuery: (query: string) => void;
  selectRule: (id: string) => void;
  recordUsage: (correct: boolean) => void;
}) => {
  const [mode, setMode] = useState<LabMode>('field');
  const [proofText, setProofText] = useState(
    'We poured the concrete yesterday therefore the test failed. The report should be submitted today.'
  );
  const [voiceAccent, setVoiceAccent] = useState<'US' | 'UK'>('US');
  const [speechRate, setSpeechRate] = useState(0.9);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [customQueue, setCustomQueue] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [offlineCount, setOfflineCount] = useState(0);
  const [isOnline, setIsOnline] = useState(
    typeof navigator === 'undefined' ? true : navigator.onLine
  );
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const bridge = useMemo(
    () => GrammarVocabularyBridge.extractVocabularyFromRule(selectedRule).slice(0, 12),
    [selectedRule]
  );
  const selectedNote = notes[selectedRule.id] ?? '';
  const masteredCount = rulesWithProgress.filter((item) => item.status === 'Mastered').length;

  const proofIssues = useMemo(() => {
    const issues: ProofIssue[] = [];
    const checks: ProofIssue[] = [
      {
        label: 'Binding modal',
        before: 'should be submitted',
        after: 'shall be submitted',
        reason:
          'Tender and specification language needs a binding modal when the action is mandatory.',
      },
      {
        label: 'Passive report style',
        before: 'we poured',
        after: 'the concrete was poured',
        reason: 'Formal site reports usually focus on the work item, not the actor.',
      },
      {
        label: 'Third conditional',
        before: 'if we checked',
        after: 'if we had checked',
        reason: 'Root-cause analysis of a missed past action needs had + V3.',
      },
      {
        label: 'Compound adjective',
        before: '50 meters beam',
        after: '50-meter beam',
        reason: 'A number-unit adjective before a noun stays singular and takes a hyphen.',
      },
      {
        label: 'Technical punctuation',
        before: 'therefore the test failed',
        after: 'therefore, the test failed',
        reason: 'Use a comma after therefore when it introduces a result clause.',
      },
    ];
    const lowered = proofText.toLowerCase();
    checks.forEach((issue) => {
      if (lowered.includes(issue.before)) issues.push(issue);
    });
    return issues;
  }, [proofText]);

  useEffect(() => {
    setNotes(readJson<Record<string, string>>(STORAGE_KEYS.notes, {}));
    setCustomQueue(readJson<string[]>(STORAGE_KEYS.customQueue, []));
    setFavorites(readJson<string[]>(STORAGE_KEYS.favorites, []));
    void getOfflineActionCount().then(setOfflineCount);
  }, []);

  useEffect(() => {
    const updateOnline = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', updateOnline);
    window.addEventListener('offline', updateOnline);
    return () => {
      window.removeEventListener('online', updateOnline);
      window.removeEventListener('offline', updateOnline);
    };
  }, []);

  const saveNote = (value: string) => {
    const next = { ...notes, [selectedRule.id]: value };
    setNotes(next);
    writeJson(STORAGE_KEYS.notes, next);
  };

  const toggleQueue = (id: string) => {
    const next = customQueue.includes(id)
      ? customQueue.filter((item) => item !== id)
      : [...customQueue, id];
    setCustomQueue(next);
    writeJson(STORAGE_KEYS.customQueue, next);
  };

  const toggleFavorite = (id: string) => {
    const next = favorites.includes(id)
      ? favorites.filter((item) => item !== id)
      : [...favorites, id];
    setFavorites(next);
    writeJson(STORAGE_KEYS.favorites, next);
  };

  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = voiceAccent === 'US' ? 'en-US' : 'en-GB';
    utterance.rate = speechRate;
    window.speechSynthesis.speak(utterance);
  };

  const exportQueue = () => {
    const selected = rules.filter((rule) => customQueue.includes(rule.id));
    downloadText(
      'grammar-custom-queue.csv',
      buildCsv(selected.length ? selected : [selectedRule]),
      'text/csv'
    );
  };

  const exportPocketGuide = () => {
    const guide = rules
      .slice(0, 60)
      .map(
        (rule) =>
          `${rule.cefrLevel} | ${rule.ruleTitle || rule.title}\n${rule.structure}\n${rule.correctedExampleEnglish}`
      )
      .join('\n\n');
    downloadText('grammar-pocket-guide.txt', guide);
  };

  const queueOfflineSync = async () => {
    await addOfflineAction('grammar-progress-sync', {
      ruleId: selectedRule.id,
      strength: selectedProgress.strength,
      queuedAt: new Date().toISOString(),
    });
    setOfflineCount(await getOfflineActionCount());
  };

  const handleSwipeEnd = (clientX: number) => {
    if (touchStart === null) return;
    const delta = clientX - touchStart;
    setTouchStart(null);
    if (Math.abs(delta) < 60) return;
    const index = rules.findIndex((rule) => rule.id === selectedRule.id);
    const next = delta < 0 ? rules[index + 1] : rules[index - 1];
    if (next) selectRule(next.id);
  };

  return (
    <section
      className="space-y-4"
      onTouchStart={(event) => setTouchStart(event.touches[0]?.clientX ?? null)}
      onTouchEnd={(event) => handleSwipeEnd(event.changedTouches[0]?.clientX ?? 0)}
    >
      <div className="rounded-[4px] border border-border-soft bg-surface p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-9">
          {MODES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setMode(id)}
              className={`inline-flex min-h-9 items-center justify-center gap-1.5 rounded-[4px] border px-2 text-[10px] font-bold uppercase tracking-wide transition-colors ${
                mode === id
                  ? 'border-primary bg-primary text-white'
                  : 'border-border-soft bg-background text-muted-copy hover:border-primary/40 hover:text-primary'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {mode === 'field' && <FieldMode setQuery={setQuery} />}

      {mode === 'drills' && (
        <DrillsMode
          selectedRule={selectedRule}
          selectedProgress={selectedProgress}
          proofText={proofText}
          setProofText={setProofText}
          recordUsage={recordUsage}
        />
      )}

      {mode === 'copilot' && (
        <CopilotMode
          selectedRule={selectedRule}
          selectedProgress={selectedProgress}
          proofIssues={proofIssues}
        />
      )}

      {mode === 'audio' && (
        <PanelShell
          title="Audio, Accent, and Grammar Rhythm"
          subtitle="US/UK speech synthesis, speed control, formal-site contrast, stress marking, and listening intent checks."
          icon={Volume2}
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-[4px] border border-border-soft bg-background p-3">
              <div className="flex flex-wrap items-center gap-2">
                {(['US', 'UK'] as const).map((accent) => (
                  <button
                    key={accent}
                    type="button"
                    onClick={() => setVoiceAccent(accent)}
                    className={`rounded-[4px] border px-3 py-1 text-xs font-bold ${
                      voiceAccent === accent
                        ? 'border-primary bg-primary text-white'
                        : 'border-border-soft bg-surface text-muted-copy'
                    }`}
                  >
                    {accent}
                  </button>
                ))}
                <label className="flex items-center gap-2 text-xs font-bold text-muted-copy">
                  {speechRate.toFixed(2)}x
                  <input
                    type="range"
                    min="0.75"
                    max="1.25"
                    step="0.05"
                    value={speechRate}
                    onChange={(event) => setSpeechRate(Number(event.target.value))}
                  />
                </label>
              </div>
              <Button
                onClick={() => speak(selectedRule.correctedExampleEnglish)}
                className="mt-3 rounded-[4px]"
              >
                <Volume2 className="h-3.5 w-3.5" /> Play Example
              </Button>
              <p className="mt-3 text-xs leading-relaxed text-muted-copy">
                Stress cue: pause after if-clauses, lower tone after warnings, and keep shall short
                and firm in specification sentences.
              </p>
            </div>
            <div className="space-y-2">
              {FORMAL_SITE_PAIRS.map(([formal, site]) => (
                <div
                  key={formal}
                  className="rounded-[4px] border border-border-soft bg-background p-3"
                >
                  <button
                    type="button"
                    onClick={() => speak(formal)}
                    className="text-left text-xs font-bold text-foreground"
                  >
                    Formal: {formal}
                  </button>
                  <button
                    type="button"
                    onClick={() => speak(site)}
                    className="mt-1 block text-left text-[11px] text-muted-copy"
                  >
                    Site speech: {site}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </PanelShell>
      )}

      {mode === 'analytics' && (
        <AnalyticsMode
          selectedProgress={selectedProgress}
          rules={rules}
          rulesWithProgress={rulesWithProgress}
        />
      )}

      {mode === 'personal' && (
        <PanelShell
          title="Personalization and Outputs"
          subtitle="Favorites, custom review queues, printable pocket guide, Anki/CSV export, and lesson notes."
          icon={BookMarked}
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-[4px] border border-border-soft bg-background p-3">
              <p className="text-xs font-black uppercase tracking-wide">Personal Lesson Notes</p>
              <textarea
                value={selectedNote}
                onChange={(event) => saveNote(event.target.value)}
                className="mt-2 min-h-28 w-full rounded-[4px] border border-border-soft bg-surface p-3 text-xs outline-none focus:border-primary"
                placeholder="Write a site-specific note for this rule"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={() => toggleFavorite(selectedRule.id)}
                  className="rounded-[4px]"
                >
                  <BookMarked className="h-3.5 w-3.5" />
                  {favorites.includes(selectedRule.id) ? 'Favorited' : 'Favorite'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => toggleQueue(selectedRule.id)}
                  className="rounded-[4px]"
                >
                  <FileDown className="h-3.5 w-3.5" />
                  {customQueue.includes(selectedRule.id) ? 'Queued' : 'Add Queue'}
                </Button>
              </div>
            </div>
            <div className="rounded-[4px] border border-border-soft bg-background p-3">
              <p className="text-xs font-black uppercase tracking-wide">Exports</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <Button variant="outline" onClick={exportPocketGuide} className="rounded-[4px]">
                  <FileDown className="h-3.5 w-3.5" /> Pocket Guide
                </Button>
                <Button variant="outline" onClick={exportQueue} className="rounded-[4px]">
                  <Download className="h-3.5 w-3.5" /> Anki CSV
                </Button>
              </div>
              <div className="mt-4 max-h-48 space-y-1 overflow-y-auto">
                {rules.slice(0, 24).map((rule) => (
                  <label
                    key={rule.id}
                    className="flex items-center gap-2 rounded-[4px] border border-border-soft bg-surface px-2 py-1 text-[11px]"
                  >
                    <input
                      type="checkbox"
                      checked={customQueue.includes(rule.id)}
                      onChange={() => toggleQueue(rule.id)}
                    />
                    <span className="truncate">{rule.ruleTitle || rule.title}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </PanelShell>
      )}

      {mode === 'mobile' && (
        <PanelShell
          title="Mobile and Offline Ergonomics"
          subtitle="Swipe navigation, thumb bar, bottom-sheet search, IndexedDB offline work, and haptic feedback."
          icon={Smartphone}
        >
          <div className="grid gap-4 md:grid-cols-3">
            <MiniMetric label="Network" value={isOnline ? 'Online' : 'Offline'} />
            <MiniMetric label="Offline queue" value={offlineCount} />
            <MiniMetric
              label="Touch support"
              value={navigator.maxTouchPoints > 0 ? 'Ready' : 'Desktop'}
            />
          </div>
          <div className="mt-4 rounded-[4px] border border-border-soft bg-background p-3">
            <div className="flex items-center gap-2">
              <PanelBottom className="h-4 w-4 text-primary" />
              <p className="text-xs font-black uppercase tracking-wide">Mobile Search Sheet</p>
            </div>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="mt-3 min-h-10 w-full rounded-[4px] border border-border-soft bg-surface px-3 text-sm outline-none focus:border-primary"
              placeholder="Search rules from the mobile sheet"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="outline" onClick={queueOfflineSync} className="rounded-[4px]">
                <Repeat2 className="h-3.5 w-3.5" /> Queue Offline Sync
              </Button>
              <Button
                variant="outline"
                onClick={() => navigator.vibrate?.(20)}
                className="rounded-[4px]"
              >
                <Smartphone className="h-3.5 w-3.5" /> Test Haptic
              </Button>
            </div>
          </div>
        </PanelShell>
      )}

      {mode === 'integration' && (
        <PanelShell
          title="Cross-Skill Bridges"
          subtitle="Writing, reading, speaking, vocabulary hover meaning, and advanced unlock conditions."
          icon={Network}
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-[4px] border border-border-soft bg-background p-3">
              <p className="text-xs font-black uppercase tracking-wide">Vocabulary Bridge</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {bridge.map((term) => (
                  <span
                    key={term}
                    title={TECH_TERMS[term.toLowerCase()] ?? 'technical grammar-linked term'}
                    className="rounded-[4px] border border-success/30 bg-success/5 px-2 py-1 text-[10px] font-bold text-success"
                  >
                    {term}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-[4px] border border-border-soft bg-background p-3">
              <p className="text-xs font-black uppercase tracking-wide">Skill Unlocks</p>
              <div className="mt-3 space-y-2 text-xs text-muted-copy">
                <p>
                  Writing reports can point errors back to this grammar lesson through the stored
                  rule id.
                </p>
                <p>
                  Reading articles can underline matching grammar patterns from the vocabulary and
                  category bridge.
                </p>
                <p>
                  C1/C2 report templates unlock after 100 mastered grammar rules. Current:{' '}
                  <span className="font-bold text-foreground">{masteredCount}/100</span>
                </p>
              </div>
            </div>
          </div>
        </PanelShell>
      )}

      {mode === 'performance' && (
        <PanelShell
          title="Performance and Data Architecture"
          subtitle="Virtualized maps, lazy level seeds, IndexedDB cache, optimistic updates, and grammar CI audit readiness."
          icon={Repeat2}
        >
          <div className="grid gap-3 md:grid-cols-5">
            <MiniMetric label="Rules loaded" value={rules.length} />
            <MiniMetric label="Lazy seeds" value="On" />
            <MiniMetric label="IndexedDB" value="On" />
            <MiniMetric label="Optimistic UI" value="On" />
            <MiniMetric label="Audit script" value="Ready" />
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {[
              [
                'Virtualization',
                'The lesson map uses a compact table mode and can render large lists without expanding every card.',
              ],
              [
                'Lazy loading',
                'Each CEFR seed is dynamically imported and cached only when requested.',
              ],
              [
                'Offline cache',
                'Grammar seeds and offline actions are stored in IndexedDB for job-site use.',
              ],
              [
                'Optimistic updates',
                'Practice results update the interface immediately and queue sync when offline.',
              ],
            ].map(([title, body]) => (
              <div
                key={title}
                className="rounded-[4px] border border-border-soft bg-background p-3"
              >
                <p className="text-xs font-black uppercase tracking-wide">{title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-copy">{body}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-[4px] border border-primary/20 bg-primary/5 p-3">
            <div className="flex items-center gap-2">
              <Radar className="h-4 w-4 text-primary" />
              <p className="text-xs font-black uppercase tracking-wide">CI content audit</p>
            </div>
            <p className="mt-2 text-xs text-muted-copy">
              Run the grammar verifier before release to detect missing formulas, translations, and
              audio metadata across the 360-rule curriculum.
            </p>
          </div>
        </PanelShell>
      )}

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border-soft bg-background/95 p-2 shadow-xl backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-md gap-2">
          <Button onClick={() => recordUsage(true)} className="min-h-11 flex-1 rounded-[4px]">
            <Check className="h-3.5 w-3.5" /> Correct
          </Button>
          <Button
            variant="outline"
            onClick={() => recordUsage(false)}
            className="min-h-11 flex-1 rounded-[4px]"
          >
            <PenTool className="h-3.5 w-3.5" /> Review
          </Button>
          <Button
            variant="outline"
            onClick={() => speak(selectedRule.correctedExampleEnglish)}
            className="min-h-11 rounded-[4px]"
          >
            <Mic className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </section>
  );
};
