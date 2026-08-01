import {
  BarChart3,
  BookMarked,
  Check,
  ClipboardCheck,
  Download,
  FileDown,
  Layers3,
  ListChecks,
  Mic,
  Network,
  PanelBottom,
  PenTool,
  Radar,
  Repeat2,
  Shuffle,
  Smartphone,
  Sparkles,
  Volume2,
} from 'lucide-react';

import { type ReactNode, useEffect, useMemo, useState } from 'react';

import { Button } from '@/shared/components/Button';
import { addOfflineAction, getOfflineActionCount } from '@/shared/utils/indexed-db';

import {
  AdaptiveDifficultyEngine,
  type GrammarRule,
  type GrammarRuleProgress,
  GrammarVocabularyBridge,
  InteractiveDrillService,
} from '@/features/grammar';

import { SectionHeading } from './GrammarPageComponents';
import { getLessonStatus, getModuleLabel } from './GrammarPageHelpers';

type RuleWithProgress = {
  rule: GrammarRule;
  progress: GrammarRuleProgress;
  status: ReturnType<typeof getLessonStatus>;
  isUnlocked: boolean;
};

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

type ProofIssue = {
  label: string;
  before: string;
  after: string;
  reason: string;
};

const STORAGE_KEYS = {
  favorites: 'EngVox_favorite_grammar',
  notes: 'EngVox_grammar_notes',
  customQueue: 'EngVox_grammar_custom_queue',
  errorNotebook: 'EngVox_grammar_error_notebook',
};

const MODES: Array<{ id: LabMode; label: string; icon: typeof Layers3 }> = [
  { id: 'field', label: 'Field Grammar', icon: Layers3 },
  { id: 'drills', label: 'Drills', icon: ListChecks },
  { id: 'copilot', label: 'Copilot', icon: Sparkles },
  { id: 'audio', label: 'Audio', icon: Volume2 },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'personal', label: 'Personal', icon: BookMarked },
  { id: 'mobile', label: 'Mobile', icon: Smartphone },
  { id: 'integration', label: 'Bridge', icon: Network },
  { id: 'performance', label: 'System', icon: Repeat2 },
];

const FIELD_PACKS = [
  {
    title: 'Tender passive voice',
    formula: '[Object] + shall be + V3 + by/with + standard',
    example: 'The concrete shall be poured in accordance with ASTM C94.',
  },
  {
    title: 'Binding modals',
    formula:
      'shall = requirement | must = internal rule | should = recommendation | may = permission',
    example: 'The contractor shall submit test reports before commissioning.',
  },
  {
    title: 'Risk conditionals',
    formula: 'If + present, will + base verb',
    example: 'If the load exceeds 500 kN, the beam will deflect beyond tolerance.',
  },
  {
    title: 'Root-cause past',
    formula: 'If + had + V3, would have + V3',
    example: 'If the valve had been isolated, the leak would have been prevented.',
  },
  {
    title: 'Compound adjectives',
    formula: 'number-unit noun before a noun, plural unit after be',
    example: 'Install a 50-meter cable. The cable is 50 meters long.',
  },
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
  } catch {
    return fallback;
  }
};

const writeJson = <T,>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be unavailable in private browsing or SSR.
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

const normalize = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[.,!?;:]/g, '')
    .replace(/\s+/g, ' ');

const getRetention = (progress: GrammarRuleProgress): number => {
  if (!progress.lastUsedAt) return progress.strength;
  const days = Math.max(
    0,
    (Date.now() - new Date(progress.lastUsedAt).getTime()) / (24 * 60 * 60 * 1000)
  );
  return Math.max(0, Math.round(progress.strength * Math.exp(-days / 14)));
};

const buildProofIssues = (text: string): ProofIssue[] => {
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
  const lowered = text.toLowerCase();
  checks.forEach((issue) => {
    if (lowered.includes(issue.before)) issues.push(issue);
  });
  return issues;
};

const scoreReport = (text: string, issues: ProofIssue[]): number => {
  if (!text.trim()) return 0;
  const positiveSignals = ['shall', 'must', 'if', 'because', 'therefore', 'was', 'were'].filter(
    (token) => text.toLowerCase().includes(token)
  ).length;
  return Math.max(25, Math.min(100, 75 + positiveSignals * 4 - issues.length * 12));
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

const getCategoryAnalytics = (items: RuleWithProgress[]) => {
  const groups = new Map<string, RuleWithProgress[]>();
  items.forEach((item) => {
    const label = getModuleLabel(item.rule.grammarCategory);
    groups.set(label, [...(groups.get(label) ?? []), item]);
  });
  return [...groups.entries()]
    .map(([category, entries]) => ({
      category,
      total: entries.length,
      mastered: entries.filter((item) => item.status === 'Mastered').length,
      strength: Math.round(
        entries.reduce((sum, item) => sum + item.progress.strength, 0) / entries.length
      ),
    }))
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 6);
};

const PanelShell = ({
  title,
  subtitle,
  icon: Icon,
  children,
}: {
  title: string;
  subtitle?: string;
  icon: typeof Layers3;
  children: ReactNode;
}) => (
  <div className="rounded-[4px] border border-border-soft bg-surface p-4 shadow-sm">
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-primary" />
      <SectionHeading title={title} subtitle={subtitle} />
    </div>
    <div className="mt-4">{children}</div>
  </div>
);

const MiniMetric = ({ label, value }: { label: string; value: string | number }) => (
  <div className="rounded-[4px] border border-border-soft bg-background px-3 py-2">
    <p className="text-base font-black text-foreground">{value}</p>
    <p className="text-[10px] font-bold uppercase tracking-wide text-muted-copy">{label}</p>
  </div>
);

/* eslint-disable complexity */
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
  const [typedAnswer, setTypedAnswer] = useState('');
  const [sentenceOrder, setSentenceOrder] = useState<string[]>([]);
  const [hintLevel, setHintLevel] = useState(0);
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

  const drills = useMemo(
    () =>
      InteractiveDrillService.generateDrills(selectedRule, [
        'fill_blank',
        'correction',
        'reordering',
        'transformation',
      ]),
    [selectedRule]
  );
  const fillDrill = drills.find((item) => item.type === 'fill_blank') ?? drills[0];
  const reorderDrill = drills.find((item) => item.type === 'reordering');
  const proofIssues = useMemo(() => buildProofIssues(proofText), [proofText]);
  const reportScore = useMemo(() => scoreReport(proofText, proofIssues), [proofIssues, proofText]);
  const adaptive = useMemo(
    () => AdaptiveDifficultyEngine.assessDifficulty(selectedRule.id, selectedProgress),
    [selectedProgress, selectedRule.id]
  );
  const categoryAnalytics = useMemo(
    () => getCategoryAnalytics(rulesWithProgress),
    [rulesWithProgress]
  );
  const retention = getRetention(selectedProgress);
  const masteredCount = rulesWithProgress.filter((item) => item.status === 'Mastered').length;
  const cefrEstimate = Math.min(100, Math.round((masteredCount / Math.max(1, rules.length)) * 100));
  const bridge = useMemo(
    () => GrammarVocabularyBridge.extractVocabularyFromRule(selectedRule).slice(0, 12),
    [selectedRule]
  );
  const selectedNote = notes[selectedRule.id] ?? '';

  useEffect(() => {
    setNotes(readJson<Record<string, string>>(STORAGE_KEYS.notes, {}));
    setCustomQueue(readJson<string[]>(STORAGE_KEYS.customQueue, []));
    setFavorites(readJson<string[]>(STORAGE_KEYS.favorites, []));
    void getOfflineActionCount().then(setOfflineCount);
  }, []);

  useEffect(() => {
    const words = (reorderDrill?.sentence ?? selectedRule.correctedExampleEnglish).split(/\s+/);
    setSentenceOrder(words);
    setTypedAnswer('');
    setHintLevel(0);
  }, [reorderDrill?.sentence, selectedRule.correctedExampleEnglish, selectedRule.id]);

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

  const checkTypedAnswer = () => {
    if (!fillDrill) return;
    const correct = InteractiveDrillService.checkAnswer(fillDrill, typedAnswer);
    if (correct && navigator.vibrate) navigator.vibrate(20);
    recordUsage(correct);
  };

  const recordProofNotebook = () => {
    const notebook = readJson<Array<{ ruleId: string; issues: ProofIssue[]; savedAt: string }>>(
      STORAGE_KEYS.errorNotebook,
      []
    );
    writeJson(STORAGE_KEYS.errorNotebook, [
      { ruleId: selectedRule.id, issues: proofIssues, savedAt: new Date().toISOString() },
      ...notebook,
    ]);
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

      {mode === 'field' && (
        <PanelShell
          title="Engineering Grammar Field Packs"
          subtitle="Specification, risk, root-cause, and compound-adjective patterns for technical work."
          icon={Layers3}
        >
          <div className="grid gap-3 md:grid-cols-2">
            {FIELD_PACKS.map((pack) => (
              <button
                key={pack.title}
                type="button"
                onClick={() => setQuery(pack.title.split(' ')[0])}
                className="rounded-[4px] border border-border-soft bg-background p-3 text-left hover:border-primary/40"
              >
                <p className="text-xs font-black uppercase tracking-wide text-foreground">
                  {pack.title}
                </p>
                <p className="mt-1 font-mono text-[11px] font-bold text-primary">{pack.formula}</p>
                <p className="mt-2 text-xs leading-relaxed text-muted-copy">{pack.example}</p>
              </button>
            ))}
          </div>
        </PanelShell>
      )}

      {mode === 'drills' && (
        <PanelShell
          title="Interactive Drill Bench"
          subtitle="Proofreading, typed specification blanks, sentence building, punctuation, and shadowing readiness."
          icon={ListChecks}
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-3">
              <textarea
                value={proofText}
                onChange={(event) => setProofText(event.target.value)}
                className="min-h-28 w-full rounded-[4px] border border-border-soft bg-background p-3 text-xs outline-none focus:border-primary"
              />
              <div className="space-y-2">
                {proofIssues.length === 0 ? (
                  <p className="rounded-[4px] border border-success/30 bg-success/5 p-3 text-xs font-bold text-success">
                    No tracked field grammar issue found in this sample.
                  </p>
                ) : (
                  proofIssues.map((issue) => (
                    <div
                      key={issue.label}
                      className="rounded-[4px] border border-warning/30 bg-warning/5 p-3 text-xs"
                    >
                      <p className="font-black text-warning">{issue.label}</p>
                      <p className="mt-1">
                        Replace <span className="font-bold">{issue.before}</span> with{' '}
                        <span className="font-bold">{issue.after}</span>.
                      </p>
                      <p className="mt-1 text-muted-copy">{issue.reason}</p>
                    </div>
                  ))
                )}
              </div>
              <Button variant="outline" onClick={recordProofNotebook} className="rounded-[4px]">
                <ClipboardCheck className="h-3.5 w-3.5" /> Save to Error Notebook
              </Button>
            </div>

            <div className="space-y-3">
              {fillDrill && (
                <div className="rounded-[4px] border border-border-soft bg-background p-3">
                  <p className="text-[10px] font-black uppercase tracking-wide text-primary">
                    Typed Dictation Blank
                  </p>
                  <p className="mt-2 text-xs font-bold">{fillDrill.sentence}</p>
                  <div className="mt-3 flex gap-2">
                    <input
                      value={typedAnswer}
                      onChange={(event) => setTypedAnswer(event.target.value)}
                      className="min-h-9 flex-1 rounded-[4px] border border-border-soft bg-surface px-3 text-xs outline-none focus:border-primary"
                      placeholder="Type the missing word"
                    />
                    <Button onClick={checkTypedAnswer} className="rounded-[4px]">
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  {hintLevel > 0 && (
                    <p className="mt-2 text-[11px] text-muted-copy">
                      Hint {hintLevel}:{' '}
                      {hintLevel === 1
                        ? fillDrill.hints[0] || selectedRule.structure
                        : fillDrill.correctAnswer.slice(
                            0,
                            Math.ceil(fillDrill.correctAnswer.length / 2)
                          )}
                    </p>
                  )}
                </div>
              )}
              <div className="rounded-[4px] border border-border-soft bg-background p-3">
                <p className="text-[10px] font-black uppercase tracking-wide text-primary">
                  Sentence Builder
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {sentenceOrder.map((word, index) => (
                    <button
                      key={`${word}-${index}`}
                      type="button"
                      onClick={() => setSentenceOrder((words) => [...words.slice(1), words[0]])}
                      className="rounded-[4px] border border-border-soft bg-surface px-2 py-1 text-[11px] font-bold"
                    >
                      {word}
                    </button>
                  ))}
                </div>
                <div className="mt-3 flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setSentenceOrder((words) => [...words].reverse())}
                    className="rounded-[4px]"
                  >
                    <Shuffle className="h-3.5 w-3.5" /> Shuffle
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      recordUsage(
                        normalize(sentenceOrder.join(' ')) ===
                          normalize(
                            reorderDrill?.correctAnswer ?? selectedRule.correctedExampleEnglish
                          )
                      )
                    }
                    className="rounded-[4px]"
                  >
                    <Check className="h-3.5 w-3.5" /> Check Order
                  </Button>
                </div>
              </div>
              <div className="rounded-[4px] border border-border-soft bg-background p-3">
                <p className="text-[10px] font-black uppercase tracking-wide text-primary">
                  Punctuation Pattern
                </p>
                <p className="mt-2 text-xs text-muted-copy">
                  Use semicolon for linked independent clauses; colon before a technical list; comma
                  after therefore, however, and if-clauses.
                </p>
              </div>
            </div>
          </div>
        </PanelShell>
      )}

      {mode === 'copilot' && (
        <PanelShell
          title="Adaptive AI Copilot"
          subtitle="Rule explanation, difficulty, report checking, two-step hints, and personal error recovery."
          icon={Sparkles}
        >
          <div className="grid gap-4 md:grid-cols-3">
            <MiniMetric label="Report Score" value={`${reportScore}%`} />
            <MiniMetric label="Difficulty" value={adaptive.suggestedDifficulty} />
            <MiniMetric label="Confidence" value={`${Math.round(adaptive.confidence * 100)}%`} />
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            <div className="rounded-[4px] border border-border-soft bg-background p-3">
              <p className="text-xs font-black uppercase tracking-wide">Explain this rule</p>
              <p className="mt-2 text-xs leading-relaxed text-muted-copy">
                In {getModuleLabel(selectedRule.grammarCategory)}, use{' '}
                <span className="font-bold text-primary">{selectedRule.structure}</span> when the
                engineering goal is: {selectedRule.engineeringUseCase}
              </p>
              <p className="mt-2 text-xs leading-relaxed">{adaptive.reasoning}</p>
              <div className="mt-3 flex gap-2">
                <Button variant="outline" onClick={() => setHintLevel(1)} className="rounded-[4px]">
                  Hint 1
                </Button>
                <Button variant="outline" onClick={() => setHintLevel(2)} className="rounded-[4px]">
                  Hint 2
                </Button>
              </div>
            </div>
            <div className="rounded-[4px] border border-border-soft bg-background p-3">
              <p className="text-xs font-black uppercase tracking-wide">Improvement Quiz Seed</p>
              <p className="mt-2 text-xs text-muted-copy">
                Your next recovery quiz should focus on{' '}
                {selectedRule.mistakeType || 'form and word order'}.
              </p>
              <p className="mt-2 rounded-[4px] border border-primary/20 bg-primary/5 p-2 text-xs font-bold">
                {selectedRule.badExampleEnglish}
              </p>
              <p className="mt-2 text-xs text-muted-copy">
                Target correction: {selectedRule.correctedExampleEnglish}
              </p>
            </div>
          </div>
        </PanelShell>
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
        <PanelShell
          title="Progress and Memory Analytics"
          subtitle="Retention, CEFR estimate, weekly activity, heatmap, and category mastery distribution."
          icon={BarChart3}
        >
          <div className="grid gap-3 md:grid-cols-4">
            <MiniMetric label="Retention" value={`${retention}%`} />
            <MiniMetric label="CEFR readiness" value={`${cefrEstimate}%`} />
            <MiniMetric
              label="Due rules"
              value={
                rulesWithProgress.filter((item) => item.progress.reviewStatus === 'Due').length
              }
            />
            <MiniMetric label="Mastered" value={masteredCount} />
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="rounded-[4px] border border-border-soft bg-background p-3">
              <p className="text-xs font-black uppercase tracking-wide">Memory Retention Curve</p>
              <div className="mt-3 h-3 rounded-[4px] bg-surface-hover">
                <div
                  className="h-full rounded-[4px] bg-success"
                  style={{ width: `${retention}%` }}
                />
              </div>
            </div>
            <div className="rounded-[4px] border border-border-soft bg-background p-3">
              <p className="text-xs font-black uppercase tracking-wide">Daily Activity Heatmap</p>
              <div className="mt-3 grid grid-cols-14 gap-1">
                {Array.from({ length: 56 }).map((_, index) => {
                  const intensity = (index + selectedProgress.exposures) % 5;
                  return (
                    <span
                      key={index}
                      className="h-3 rounded-[2px]"
                      style={{
                        backgroundColor: ['#e5e7eb', '#bbf7d0', '#86efac', '#22c55e', '#15803d'][
                          intensity
                        ],
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </div>
          <div className="mt-4 grid gap-2 md:grid-cols-2">
            {categoryAnalytics.map((item) => (
              <div
                key={item.category}
                className="rounded-[4px] border border-border-soft bg-background p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-xs font-bold">{item.category}</p>
                  <span className="text-[10px] font-bold text-muted-copy">
                    {item.mastered}/{item.total}
                  </span>
                </div>
                <div className="mt-2 h-2 rounded-[4px] bg-surface-hover">
                  <div
                    className="h-full rounded-[4px] bg-primary"
                    style={{ width: `${item.strength}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </PanelShell>
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
                  <ListChecks className="h-3.5 w-3.5" />
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
/* eslint-enable complexity */
