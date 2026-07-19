import { useState } from 'react';
import { Bot, Check, Clipboard, Send, WifiOff } from 'lucide-react';
import { AIService, AIProviderStatus } from '@/features/ai';
import { BetaService } from '@/features/beta';
import {
  QUICK_AI_ACTIONS,
  WorkToolsService,
  useWorkToolsStore,
} from '@/features/work-tools';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { StatusBadge } from '@/shared/components/StatusBadge';

type QuickAITabProps = {
  initialDraft: string;
  status: AIProviderStatus;
  onStatusChange: (s: AIProviderStatus) => void;
};

export const QuickAITab = ({
  initialDraft,
  status,
  onStatusChange,
}: QuickAITabProps) => {
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
      <Card
        className="p-5 space-y-5 rounded-[4px] border border-border-soft bg-surface shadow-sm"
        hoverEffect={false}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-foreground">
              Quick AI Editor
            </h2>
            <p className="mt-1 text-xs text-muted-copy font-medium">
              AI requires an internet-connected backend. No vendor API key is
              stored in this browser.
            </p>
          </div>
          <StatusBadge
            label={status.label}
            tone={status.isConnected ? 'success' : 'warning'}
            className="rounded-[4px] font-bold text-[9px] uppercase tracking-wider"
          />
        </div>
        {!status.isConnected && (
          <div className="space-y-2 rounded-[4px] border border-warning/30 bg-warning/5 p-3 text-xs text-foreground font-medium">
            <div className="flex flex-wrap gap-2">
              <StatusBadge
                label="Backend required"
                tone="warning"
                className="rounded-[4px] font-bold text-[9px] uppercase tracking-wider"
              />
              <StatusBadge
                label="Mock preview"
                tone="neutral"
                className="rounded-[4px] font-bold text-[9px] uppercase tracking-wider"
              />
            </div>
            <div className="flex gap-3">
              <WifiOff className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
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
          className="min-h-44 w-full rounded-[4px] border border-border-soft bg-surface-hover p-4 text-xs leading-6 text-foreground outline-none transition focus:border-[#0047bb] focus:ring-0 shadow-sm"
        />
        <div className="flex flex-wrap gap-2">
          {QUICK_AI_ACTIONS.map((action) => (
            <Button
              key={action.id}
              variant="secondary"
              disabled={isRunning || !input.trim()}
              onClick={() => runAction(action.label, action.systemInstruction)}
              title={action.expectedOutputStyle}
              className="h-9 rounded-[4px] border border-border-soft bg-surface hover:bg-surface-hover text-xs font-bold uppercase tracking-wider text-foreground cursor-pointer shadow-sm gap-1.5"
            >
              <Bot className="h-4 w-4 text-muted-copy" /> {action.label}
            </Button>
          ))}
        </div>
      </Card>
      <Card
        className="p-5 space-y-4 rounded-[4px] border border-border-soft bg-surface shadow-sm"
        hoverEffect={false}
      >
        <h2 className="text-base font-bold text-foreground">Result</h2>
        {isRunning ? (
          <div className="space-y-3" aria-live="polite">
            <div className="h-4 animate-pulse rounded-[4px] bg-surface-hover border border-border-soft" />
            <div className="h-4 animate-pulse rounded-[4px] bg-surface-hover border border-border-soft" />
            <div className="h-24 animate-pulse rounded-[4px] bg-surface-hover border border-border-soft" />
          </div>
        ) : result ? (
          <>
            <p className="whitespace-pre-line rounded-[4px] border border-[#0047bb]/25 bg-[#0047bb]/5 p-4 text-xs leading-6 text-foreground font-medium shadow-sm">
              {result}
            </p>
            <Button
              variant="secondary"
              onClick={() => copy('quick-ai-result', result)}
              className="h-9 rounded-[4px] border border-border-soft bg-surface hover:bg-surface-hover text-xs font-bold uppercase tracking-wider text-foreground cursor-pointer shadow-sm gap-1.5"
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
          <div className="rounded-[4px] border border-dashed border-border-soft bg-surface-hover p-10 text-center text-xs text-muted-copy font-medium">
            <Send className="mx-auto mb-3 h-6 w-6 text-muted-copy" />
            Choose an action to create a result.
          </div>
        )}
      </Card>
    </div>
  );
};
