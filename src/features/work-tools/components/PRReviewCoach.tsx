import { useState } from 'react';
import {
  Clipboard,
  Check,
  Sparkles,
  ArrowRight,
  WandSparkles,
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { PRReviewCoachService, type PRReviewResult } from '../pr-review-coach';

const SAMPLE_REVIEWS = [
  'This code is terrible. Why did you write it this way? Fix it now.',
  'This is completely wrong. The whole approach is bad. Start over.',
  "I can't believe you committed this. This never should have passed review.",
  "Why would anyone use this pattern? It's so stupid and useless.",
];

export const PRReviewCoach = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<PRReviewResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handlePolish = async () => {
    if (!input.trim()) return;
    setIsProcessing(true);
    try {
      const response = await PRReviewCoachService.polishReview({
        rawText: input,
      });
      setResult(response);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = async () => {
    if (!result?.polishedText) return;
    await navigator.clipboard.writeText(result.polishedText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  const handleSample = (sample: string) => {
    setInput(sample);
    setResult(null);
  };

  return (
    <div className="space-y-6">
      <Card className="p-5 space-y-4 border-l-4 border-l-primary shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex items-center justify-between border-b border-border-soft pb-2">
          <span className="font-mono text-[9px] uppercase tracking-widest text-primary font-bold bg-primary/5 px-2 py-0.5 rounded">
            PR-REVIEW-COACH // MENTOR
          </span>
          {result?.isAiPowered && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold text-primary">
              <Sparkles className="h-2.5 w-2.5" /> AI POWERED
            </span>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-wider text-muted-copy">
            Technical Code Review Refactoring
          </p>
          <h2 className="text-base font-black tracking-tight text-foreground">
            PR Review Polite Coach
          </h2>
          <p className="text-xs leading-relaxed text-muted-copy">
            Convert harsh or unclear code review comments into professional,
            constructive feedback.
          </p>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-border-soft bg-surface-hover p-4 space-y-2">
            <label
              htmlFor="pr-review-input"
              className="block text-sm font-medium text-foreground animate-in fade-in"
            >
              Paste harsh review comment
            </label>
            <p className="text-[10px] text-muted-copy leading-normal">
              Paste the raw, harsh, or unclear code review comment you want to
              transform into professional English.
            </p>
            <textarea
              id="pr-review-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-24 w-full resize-y rounded-lg border border-border-soft bg-surface px-3 py-2 text-xs leading-5 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              placeholder="e.g., This code is terrible. Why did you write it this way? Fix it now."
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] text-muted-copy">Try a sample:</span>
            {SAMPLE_REVIEWS.map((sample, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSample(sample)}
                className="rounded-md border border-border-soft bg-surface-hover px-2 py-1 text-[10px] text-muted-copy transition-colors hover:border-border-hover hover:text-foreground cursor-pointer"
              >
                Sample {i + 1}
              </button>
            ))}
          </div>

          <div className="pt-2">
            <Button
              onClick={handlePolish}
              disabled={!input.trim() || isProcessing}
              size="sm"
            >
              {isProcessing ? (
                'Processing...'
              ) : (
                <>
                  <WandSparkles className="h-3.5 w-3.5" /> Make Polite
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {result && (
        <Card className="p-5 space-y-4 border-l-4 border-l-success shadow-sm hover:shadow-md transition-all duration-300 animate-in fade-in slide-in-from-bottom duration-300">
          <div className="flex items-center justify-between border-b border-border-soft pb-2">
            <span className="font-mono text-[9px] uppercase tracking-widest text-success font-bold bg-success/5 px-2 py-0.5 rounded">
              ORCHESTRATED-OUTPUT // REFACTORED
            </span>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-wider text-muted-copy">
              Feedback Analysis & Tone Adjustment
            </p>
            <p className="text-xs text-muted-copy leading-relaxed">
              {result.toneAnalysis}
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
              <p className="font-mono text-[9px] font-bold uppercase tracking-wider text-primary">
                [ORIGINAL HARSH REVIEW]
              </p>
              <p className="mt-2 text-xs text-foreground line-through opacity-60">
                {input}
              </p>
            </div>

            <div className="flex justify-center animate-in zoom-in duration-200">
              <ArrowRight className="h-4 w-4 text-muted-copy" />
            </div>

            <div className="rounded-lg border border-success/20 bg-success/5 p-4">
              <p className="font-mono text-[9px] font-bold uppercase tracking-wider text-success">
                [ORCHESTRATED PROFESSIONAL VERSION]
              </p>
              <p className="mt-2 text-xs leading-relaxed text-foreground whitespace-pre-wrap font-semibold">
                {result.polishedText}
              </p>
            </div>

            {result.keyChanges.length > 0 && (
              <div className="rounded-lg border border-border-soft bg-surface-hover p-4">
                <p className="font-mono text-[9px] font-bold uppercase tracking-wider text-muted-copy">
                  [REFACTORING KEY ACTIONS]
                </p>
                <ul className="mt-2 space-y-1.5">
                  {result.keyChanges.map((change, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-xs text-foreground"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
                      <span>{change}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 border-t border-border-soft pt-3">
            <Button variant="secondary" size="sm" onClick={handleCopy}>
              {copied ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Clipboard className="h-3.5 w-3.5" />
              )}
              {copied ? 'Copied' : 'Copy review'}
            </Button>
            {result.isAiPowered && (
              <span className="text-[10px] font-mono uppercase text-muted-copy">
                AI-Refined Output
              </span>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
