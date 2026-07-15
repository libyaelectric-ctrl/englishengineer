import { useState } from 'react';
import { Bot, Check, Clipboard, Send, WifiOff } from 'lucide-react';
import { AIService, AIProviderStatus } from '@/features/ai';
import { BetaService } from '@/features/beta';
import { QUICK_AI_ACTIONS, WorkToolsService, useWorkToolsStore } from '@/features/work-tools';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { StatusBadge } from '@/shared/components/StatusBadge';

type QuickAITabProps = {
  initialDraft: string;
  status: AIProviderStatus;
  onStatusChange: (s: AIProviderStatus) => void;
};

export const QuickAITab = ({ initialDraft, status, onStatusChange }: QuickAITabProps) => {
  const { remember } = useWorkToolsStore();
  const [input, setInput] = useState(initialDraft);
  const [result, setResult] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

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
      onStatusChange(response.providerStatus);
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
          className="min-h-44 w-full rounded-lg border border-border-soft bg-surface-hover p-4 text-sm leading-6 text-foreground outline-none transition focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/10"
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
  );
};
