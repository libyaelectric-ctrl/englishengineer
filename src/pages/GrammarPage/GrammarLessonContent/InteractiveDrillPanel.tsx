import { useState } from 'react';

import { cn } from '@/shared/utils/cn';

import type { Rule } from './types';

type DrillMode = 'fill_blank' | 'correction' | 'reordering';

const DRILL_LABELS: Record<DrillMode, string> = {
  fill_blank: '✏️ Fill in the Blank',
  correction: '🔍 Error Correction',
  reordering: '🔀 Word Reordering',
};

export const InteractiveDrillPanel = ({ selectedRule }: { selectedRule: Rule }) => {
  const [activeDrill, setActiveDrill] = useState<DrillMode | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [wordTokens, setWordTokens] = useState<string[]>([]);
  const [selectedTokens, setSelectedTokens] = useState<string[]>([]);
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);
  const [hintsUsed, setHintsUsed] = useState(0);

  const firstExample = selectedRule.examples[0];

  const fillSentence = (() => {
    if (!firstExample) return { blanked: '', correct: '' };
    const words = firstExample.english.split(' ');
    const idx = Math.min(Math.floor(words.length / 2), words.length - 1);
    const correct = words[idx].replace(/[.,!?;:]/g, '');
    const blanked = words.map((w, i) => (i === idx ? '______' : w)).join(' ');
    return { blanked, correct };
  })();

  const openDrill = (mode: DrillMode) => {
    setActiveDrill((prev) => (prev === mode ? null : mode));
    setUserAnswer('');
    setResult(null);
    setHintsUsed(0);
    if (mode === 'reordering' && firstExample) {
      const words = firstExample.english.split(' ').filter(Boolean);
      const shuffled = [...words].sort(() => Math.random() - 0.5);
      setWordTokens(shuffled);
      setSelectedTokens([]);
    }
  };

  const normalise = (s: string) =>
    s.trim().toLowerCase().replace(/[.,!?;:]/g, '').replace(/\s+/g, ' ');

  const checkFillOrCorrection = () => {
    const expected =
      activeDrill === 'fill_blank' ? fillSentence.correct : selectedRule.correctedExampleEnglish;
    setResult(normalise(userAnswer) === normalise(expected) ? 'correct' : 'wrong');
  };

  const checkReordering = () => {
    const joined = selectedTokens.join(' ');
    setResult(normalise(joined) === normalise(firstExample?.english ?? '') ? 'correct' : 'wrong');
  };

  const toggleToken = (token: string, fromSelected: boolean) => {
    if (fromSelected) {
      setSelectedTokens((prev) => {
        const idx = prev.lastIndexOf(token);
        return idx !== -1 ? [...prev.slice(0, idx), ...prev.slice(idx + 1)] : prev;
      });
      setWordTokens((prev) => [...prev, token]);
    } else {
      setWordTokens((prev) => {
        const idx = prev.indexOf(token);
        return idx !== -1 ? [...prev.slice(0, idx), ...prev.slice(idx + 1)] : prev;
      });
      setSelectedTokens((prev) => [...prev, token]);
    }
    setResult(null);
  };

  if (!firstExample) return null;

  return (
    <div className="rounded-[4px] border border-primary/20 bg-surface p-4 shadow-sm space-y-3">
      <p className="text-[11px] font-bold uppercase tracking-wider text-primary">
        🎯 Interactive Drills
      </p>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(DRILL_LABELS) as DrillMode[]).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => openDrill(mode)}
            className={cn(
              'rounded-[4px] border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer',
              activeDrill === mode
                ? 'border-primary bg-primary text-white'
                : 'border-border-soft bg-background text-muted-copy hover:border-primary/40 hover:text-primary'
            )}
          >
            {DRILL_LABELS[mode]}
          </button>
        ))}
      </div>

      {activeDrill === 'fill_blank' && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-copy">
            Fill in the missing word in the sentence:
          </p>
          <p className="rounded border border-border-soft bg-background px-3 py-2 text-sm font-mono font-bold text-foreground">
            {fillSentence.blanked}
          </p>
          <p className="text-[10px] text-muted-copy italic">Turkish: {firstExample.turkish}</p>
          {hintsUsed > 0 && (
            <p className="text-[10px] text-amber-600 font-bold">
              💡 Hint: Starts with &ldquo;{fillSentence.correct[0]}&rdquo; (
              {fillSentence.correct.length} letters)
            </p>
          )}
          <div className="flex items-center gap-2">
            <input
              value={userAnswer}
              onChange={(e) => {
                setUserAnswer(e.target.value);
                setResult(null);
              }}
              placeholder="Type your answer..."
              className="flex-1 rounded border border-border-soft bg-background px-3 py-1.5 text-xs outline-none focus:border-primary text-foreground"
            />
            <button
              type="button"
              onClick={checkFillOrCorrection}
              className="rounded bg-primary px-3 py-1.5 text-xs font-bold text-white hover:bg-primary/90 transition-colors cursor-pointer"
            >
              Check
            </button>
            <button
              type="button"
              onClick={() => setHintsUsed((h) => h + 1)}
              className="rounded border border-border-soft px-3 py-1.5 text-xs font-bold text-muted-copy hover:text-primary transition-colors cursor-pointer"
            >
              Hint
            </button>
          </div>
          {result === 'correct' && (
            <p className="text-xs font-bold text-success">✅ Correct! Great job.</p>
          )}
          {result === 'wrong' && (
            <p className="text-xs font-bold text-rose-600">
              ❌ Not quite. Expected: <span className="font-mono">{fillSentence.correct}</span>
            </p>
          )}
        </div>
      )}

      {activeDrill === 'correction' && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-copy">
            Find and correct the grammar mistake:
          </p>
          <p className="rounded border border-rose-300 bg-rose-50 dark:bg-rose-950/30 px-3 py-2 text-sm font-bold text-rose-800 dark:text-rose-300">
            {selectedRule.badExampleEnglish}
          </p>
          <p className="text-[10px] text-muted-copy italic">
            {selectedRule.badExampleTurkishExplanation || selectedRule.commonMistakes}
          </p>
          <div className="flex items-center gap-2">
            <input
              value={userAnswer}
              onChange={(e) => {
                setUserAnswer(e.target.value);
                setResult(null);
              }}
              placeholder="Write the corrected sentence..."
              className="flex-1 rounded border border-border-soft bg-background px-3 py-1.5 text-xs outline-none focus:border-primary text-foreground"
            />
            <button
              type="button"
              onClick={checkFillOrCorrection}
              className="rounded bg-primary px-3 py-1.5 text-xs font-bold text-white hover:bg-primary/90 transition-colors cursor-pointer"
            >
              Check
            </button>
          </div>
          {result === 'correct' && (
            <p className="text-xs font-bold text-success">✅ Correct! You spotted the mistake.</p>
          )}
          {result === 'wrong' && (
            <p className="text-xs font-bold text-rose-600">
              ❌ Not quite. Correct answer:{' '}
              <span className="font-mono">{selectedRule.correctedExampleEnglish}</span>
            </p>
          )}
        </div>
      )}

      {activeDrill === 'reordering' && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-muted-copy">
            Tap words to build the sentence in the correct order:
          </p>
          <div className="min-h-9 flex flex-wrap gap-1.5 rounded border-2 border-dashed border-primary/30 bg-primary/5 p-2">
            {selectedTokens.length === 0 && (
              <span className="text-[10px] text-muted-copy italic">
                Tap words below to place them here…
              </span>
            )}
            {selectedTokens.map((token, i) => (
              <button
                key={`sel-${i}-${token}`}
                type="button"
                onClick={() => toggleToken(token, true)}
                className="rounded border border-primary bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary cursor-pointer hover:bg-primary hover:text-white transition-colors"
              >
                {token}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {wordTokens.map((token, i) => (
              <button
                key={`pool-${i}-${token}`}
                type="button"
                onClick={() => toggleToken(token, false)}
                className="rounded border border-border-soft bg-background px-2 py-0.5 text-xs font-semibold text-foreground cursor-pointer hover:border-primary/40 hover:text-primary transition-colors"
              >
                {token}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={checkReordering}
              className="rounded bg-primary px-3 py-1.5 text-xs font-bold text-white hover:bg-primary/90 transition-colors cursor-pointer"
            >
              Check Order
            </button>
            <button
              type="button"
              onClick={() => openDrill('reordering')}
              className="rounded border border-border-soft px-3 py-1.5 text-xs font-bold text-muted-copy hover:text-primary transition-colors cursor-pointer"
            >
              Reset
            </button>
          </div>
          {result === 'correct' && (
            <p className="text-xs font-bold text-success">✅ Perfect order!</p>
          )}
          {result === 'wrong' && (
            <p className="text-xs font-bold text-rose-600">
              ❌ Not quite right. Expected:{' '}
              <span className="font-mono">{firstExample.english}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
};
