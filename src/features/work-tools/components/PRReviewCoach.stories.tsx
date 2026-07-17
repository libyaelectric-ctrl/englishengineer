import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { WandSparkles, Clipboard, Check, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { SectionCard } from '@/shared/components/SectionCard';

const meta: Meta = {
  title: 'Features/WorkTools/PRReviewCoach',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;

const SAMPLE_REVIEWS = [
  'This code is terrible. Why did you write it this way? Fix it now.',
  'This is completely wrong. The whole approach is bad. Start over.',
  "I can't believe you committed this. This never should have passed review.",
  "Why would anyone use this pattern? It's so stupid and useless.",
];

const PRReviewCoachDemo = ({
  initialInput,
  showResult,
}: {
  initialInput?: string;
  showResult?: boolean;
}) => {
  const [input, setInput] = useState(initialInput ?? '');
  const [result, setResult] = useState(
    showResult
      ? {
          polishedText:
            "I have some concerns about the current implementation approach. Could we discuss alternative patterns that might better address the requirements? I'd suggest we consider a few options before proceeding.",
          toneAnalysis: 'Transformed from aggressive tone to constructive feedback',
          keyChanges: [
            'Removed personal attacks and accusatory language',
            'Added constructive suggestion for collaboration',
            'Framed concerns as discussion points rather than demands',
          ],
          isAiPowered: true,
        }
      : null
  );
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!result?.polishedText) return;
    await navigator.clipboard.writeText(result.polishedText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <div className="space-y-6">
      <SectionCard
        title="PR Review Polite Coach"
        subtitle="Convert harsh or unclear code review comments into professional, constructive feedback"
        icon={WandSparkles}
        headerActions={
          result?.isAiPowered && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3 w-3" /> AI Powered
            </span>
          )
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground">
              Paste harsh review comment
            </label>
            <p className="mt-1 text-xs text-muted-copy">
              Paste the raw, harsh, or unclear code review comment you want to
              transform into professional English.
            </p>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="mt-3 min-h-32 w-full resize-y rounded-lg border border-border-soft bg-surface-hover px-4 py-3 text-sm leading-6 text-foreground outline-none focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/10"
              placeholder="e.g., This code is terrible. Why did you write it this way? Fix it now."
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-muted-copy">Try a sample:</span>
            {SAMPLE_REVIEWS.map((sample, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setInput(sample);
                  setResult(null);
                }}
                className="rounded-md border border-border-soft bg-surface-hover px-2 py-1 text-xs text-muted-copy transition-colors hover:border-border-hover hover:text-foreground"
              >
                Sample {i + 1}
              </button>
            ))}
          </div>

          <Button
            onClick={() => {
              if (!input.trim()) return;
              setResult({
                polishedText: `Thank you for your review feedback. Regarding the points you raised about the code quality — I understand your concerns and would like to discuss the approach. Could we schedule a brief sync to align on the best path forward?`,
                toneAnalysis: 'Polite version of harsh feedback',
                keyChanges: ['Removed aggressive tone', 'Added collaborative language'],
                isAiPowered: false,
              });
            }}
            disabled={!input.trim()}
          >
            <WandSparkles className="h-4 w-4" /> Make Polite
          </Button>
        </div>
      </SectionCard>

      {result && (
        <SectionCard
          title="Polished Review"
          subtitle={result.toneAnalysis}
          icon={Sparkles}
          footer={
            <div className="flex items-center gap-3">
              <Button variant="secondary" onClick={handleCopy}>
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Clipboard className="h-4 w-4" />
                )}
                {copied ? 'Copied' : 'Copy to clipboard'}
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
              <p className="text-xs font-medium text-primary">Original</p>
              <p className="mt-2 text-sm text-foreground line-through opacity-60">
                {input}
              </p>
            </div>

            <div className="flex justify-center">
              <ArrowRight className="h-5 w-5 text-muted-copy" />
            </div>

            <div className="rounded-lg border border-success/20 bg-success/5 p-4">
              <p className="text-xs font-medium text-success">
                Professional Version
              </p>
              <p className="mt-2 text-sm leading-6 text-foreground whitespace-pre-wrap">
                {result.polishedText}
              </p>
            </div>

            {result.keyChanges.length > 0 && (
              <div className="rounded-lg border border-border-soft bg-surface-hover p-4">
                <p className="text-xs font-medium text-muted-copy">Key Changes</p>
                <ul className="mt-2 space-y-1">
                  {result.keyChanges.map((change, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-foreground"
                    >
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      {change}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </SectionCard>
      )}
    </div>
  );
};

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <PRReviewCoachDemo />,
};

export const WithResult: Story = {
  render: () => (
    <PRReviewCoachDemo
      initialInput="This code is terrible. Why did you write it this way? Fix it now."
      showResult
    />
  ),
};
