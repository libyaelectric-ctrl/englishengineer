import { FormEvent } from 'react';
import {
  AlertCircle,
  Lock,
  RefreshCw,
  Send,
  Terminal,
} from 'lucide-react';
import { SectionCard } from '@/shared/components/SectionCard';
import { Button } from '@/shared/components/Button';
import type { AICoachModeId, AICoachMode } from '@/features/ai';

interface CoachInputFormProps {
  selectedModeId: AICoachModeId;
  selectedMode: AICoachMode | null;
  input: string;
  isModeLocked: boolean;
  requiredFeature: string | null;
  aiEntitlement: { allowed: boolean; reason: string };
  isLoading: boolean;
  error: string | null;
  docLimit: number | 'unlimited';
  docLimitLabel: string;
  uploadedDocsCount: number;
  uploadError: string | null;
  sessions: unknown[];
  onSetInput: (input: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onRegenerate: () => void;
  onClearHistory: () => void;
  onReset: () => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onNavigate: (path: string) => void;
}

export const CoachInputForm = ({
  selectedModeId,
  selectedMode,
  input,
  isModeLocked,
  requiredFeature,
  aiEntitlement,
  isLoading,
  error,
  docLimit,
  docLimitLabel,
  uploadedDocsCount,
  uploadError,
  sessions,
  onSetInput,
  onSubmit,
  onRegenerate,
  onClearHistory,
  onReset,
  onFileUpload,
  onNavigate,
}: CoachInputFormProps) => (
  <SectionCard
    title={`${selectedMode?.name ?? ''} Input`}
    subtitle="Paste notes, transcripts, messages, or study reflections"
    icon={Terminal}
    headerActions={
      <div className="flex flex-wrap gap-1.5">
        <Button
          onClick={onRegenerate}
          variant="outline"
          className="h-7 border-border-soft text-[10px]"
          disabled={sessions.length === 0 || isLoading}
        >
          Regenerate
        </Button>
        <Button
          onClick={onClearHistory}
          variant="outline"
          className="h-7 border-border-soft text-[10px]"
          disabled={sessions.length === 0}
        >
          Clear
        </Button>
        <Button
          onClick={onReset}
          variant="outline"
          className="h-7 border-border-soft text-[10px]"
        >
          Reset
        </Button>
      </div>
    }
  >
    <form onSubmit={onSubmit} className="space-y-4">
      {isModeLocked ? (
        (() => {
          const isProLocked = requiredFeature === 'unlimitedAIFeedback';
          return (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 text-center space-y-4 animate-in fade-in duration-300">
              <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Lock className="h-5 w-5" />
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-foreground">
                  {selectedMode?.name} is a{' '}
                  {isProLocked ? 'Pro' : 'Project'} Plan Feature
                </h4>
                <p className="text-xs text-muted-copy max-w-md mx-auto leading-relaxed">
                  {isProLocked
                    ? 'Upgrade to the Pro Plan ($19/mo) to unlock professional engineering CV optimization, unlimited daily AI requests, and 12-month study history.'
                    : 'Upgrade to the Project Plan ($39/mo) to unlock workspace memory integration, custom scenario generation from documents, LinkedIn profile optimization, and persistent AI agents.'}
                </p>
              </div>
              <Button
                type="button"
                onClick={() => onNavigate('/pricing')}
                className="bg-primary text-white font-medium px-6 py-2 rounded-card hover:bg-primary-hover transition-all"
              >
                Upgrade to {isProLocked ? 'Pro' : 'Project'} Plan
              </Button>
            </div>
          );
        })()
      ) : (
        <>
          {!aiEntitlement.allowed && (
            <div className="rounded-xl border border-warning/20 bg-warning/5 px-4 py-3 text-xs text-warning">
              {aiEntitlement.reason}
              <Button
                type="button"
                onClick={() => onNavigate('/profile')}
                className="mt-3 h-9 bg-primary text-white font-medium"
              >
                Upgrade to Pro
              </Button>
            </div>
          )}
          {selectedModeId === 'document_analysis_assistant' && (
            <div className="rounded-xl border border-border-soft bg-surface-hover p-4 space-y-3">
              <label className="block text-xs font-medium text-foreground">
                Upload Technical Document (TXT, PDF, DOCX) - Limit:{' '}
                {docLimitLabel}
              </label>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <input
                  type="file"
                  accept=".txt,.pdf,.docx"
                  onChange={onFileUpload}
                  disabled={!aiEntitlement.allowed}
                  className="text-xs text-muted-copy file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <span className="text-xs font-mono text-muted-copy bg-border-soft/50 px-2.5 py-1 rounded-full">
                  {uploadedDocsCount} /{' '}
                  {docLimit === 'unlimited' ? '∞' : docLimit} uploads
                  used this month
                </span>
              </div>
              {uploadError && (
                <div className="text-xs text-danger font-medium flex items-center gap-1.5 mt-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {uploadError}
                </div>
              )}
            </div>
          )}
          <textarea
            value={input}
            onChange={(event) => onSetInput(event.target.value)}
            disabled={!aiEntitlement.allowed}
            rows={3}
            className="premium-input w-full resize-none p-3 font-mono text-sm text-foreground"
            placeholder={selectedMode?.placeholder ?? ''}
          />
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-danger/20 bg-danger/5 px-3 py-2 text-xs text-danger">
              <AlertCircle className="h-3.5 w-3.5" />
              {error}
            </div>
          )}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <p className="text-[10px] font-mono text-muted-copy uppercase tracking-widest">
              Mode: {selectedMode?.name ?? ''}
            </p>
            <Button
              type="submit"
              className="h-9 bg-primary text-white font-medium flex items-center justify-center gap-2 text-xs"
              disabled={
                isLoading ||
                input.trim().length === 0 ||
                !aiEntitlement.allowed
              }
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {isLoading ? 'Analyzing...' : 'Run Engineering Copilot'}
            </Button>
          </div>
        </>
      )}
    </form>
  </SectionCard>
);
