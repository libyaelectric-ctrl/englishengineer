import { Check, ClipboardCheck, ListChecks, Shuffle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/shared/components/Button';
import {
  type GrammarRule,
  type GrammarRuleProgress,
  InteractiveDrillService,
} from '@/features/grammar';
import { PanelShell } from './shared';
import { type ProofIssue } from './types';

const STORAGE_KEYS = { errorNotebook: 'EngVox_grammar_error_notebook' };

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
  } catch { /* localStorage unavailable */ }
};

const normalize = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[.,!?;:]/g, '')
    .replace(/\s+/g, ' ');

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

export const DrillsMode = ({
  selectedRule,
  selectedProgress: _selectedProgress,
  proofText,
  setProofText,
  recordUsage,
}: {
  selectedRule: GrammarRule;
  selectedProgress: GrammarRuleProgress;
  proofText: string;
  setProofText: (text: string) => void;
  recordUsage: (correct: boolean) => void;
}) => {
  const [typedAnswer, setTypedAnswer] = useState('');
  const [sentenceOrder, setSentenceOrder] = useState<string[]>([]);
  const [hintLevel, _setHintLevel] = useState(0);

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

  const words = (reorderDrill?.sentence ?? selectedRule.correctedExampleEnglish).split(/\s+/);
  if (sentenceOrder.length === 0) {
    setSentenceOrder(words);
  }

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

  return (
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
                  onClick={() => setSentenceOrder((w) => [...w.slice(1), w[0]])}
                  className="rounded-[4px] border border-border-soft bg-surface px-2 py-1 text-[11px] font-bold"
                >
                  {word}
                </button>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <Button
                variant="outline"
                onClick={() => setSentenceOrder((w) => [...w].reverse())}
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
  );
};


