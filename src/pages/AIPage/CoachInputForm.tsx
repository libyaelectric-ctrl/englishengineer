import { FormEvent } from 'react';
import { AlertCircle, Lock, RefreshCw, Send, Terminal } from 'lucide-react';
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

const PlanLockBanner = ({
  name,
  isProLocked,
  onNavigate,
}: {
  name: string;
  isProLocked: boolean;
  onNavigate: (path: string) => void;
}) => (
  <div className="rounded-[4px] border border-[#0047bb]/25 bg-[#0047bb]/5 p-6 text-center space-y-4 animate-in fade-in duration-300 shadow-sm">
    <div className="mx-auto h-12 w-12 rounded-[4px] bg-[#0047bb]/10 flex items-center justify-center text-[#0047bb]">
      <Lock className="h-5 w-5" />
    </div>
    <div className="space-y-2">
      <h4 className="text-sm font-bold text-foreground">
        {name} is a {isProLocked ? 'Pro' : 'Project'} Plan Feature
      </h4>
      <p className="text-xs text-muted-copy max-w-md mx-auto leading-relaxed font-medium">
        {isProLocked
          ? 'Upgrade to the Pro Plan ($19/mo) to unlock professional engineering CV optimization, unlimited daily AI requests, and 12-month study history.'
          : 'Upgrade to the Project Plan ($39/mo) to unlock workspace memory integration, custom scenario generation from documents, LinkedIn profile optimization, and persistent AI agents.'}
      </p>
    </div>
    <Button
      type="button"
      onClick={() => onNavigate('/pricing')}
      className="h-9 bg-[#0047bb] hover:bg-[#0047bb]/95 text-xs font-bold uppercase tracking-wider text-white shadow-sm cursor-pointer rounded-[4px] px-6 transition-all inline-flex items-center justify-center"
    >
      Upgrade to {isProLocked ? 'Pro' : 'Project'} Plan
    </Button>
  </div>
);

const AIEntitlementWarning = ({
  reason,
  onNavigate,
}: {
  reason: string;
  onNavigate: (path: string) => void;
}) => (
  <div className="rounded-[4px] border border-warning/30 bg-warning/5 px-4 py-3 text-xs text-warning font-bold uppercase tracking-wider shadow-sm">
    {reason}
    <Button
      type="button"
      onClick={() => onNavigate('/profile')}
      className="mt-3 h-9 rounded-[4px] bg-[#0047bb] hover:bg-[#0047bb]/95 text-xs font-bold uppercase tracking-wider text-white shadow-sm cursor-pointer inline-flex items-center justify-center px-4"
    >
      Upgrade to Pro
    </Button>
  </div>
);

const DocumentUploadSection = ({
  docLimitLabel,
  uploadedDocsCount,
  docLimit,
  uploadError,
  onFileUpload,
  allowed,
}: {
  docLimitLabel: string;
  uploadedDocsCount: number;
  docLimit: number | 'unlimited';
  uploadError: string | null;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  allowed: boolean;
}) => (
  <div className="rounded-[4px] border border-border-soft bg-surface-hover p-4 space-y-3 shadow-sm">
    <label
      htmlFor="technical-document-upload"
      className="block text-xs font-bold uppercase tracking-wider text-foreground"
    >
      Upload Technical Document (TXT, PDF, DOCX) - Limit: {docLimitLabel}
    </label>
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <input
        id="technical-document-upload"
        type="file"
        accept=".txt,.pdf,.docx"
        onChange={onFileUpload}
        disabled={!allowed}
        className="text-xs text-muted-copy file:mr-3 file:py-1 file:px-2.5 file:rounded-[4px] file:border file:border-border-soft file:text-[10px] file:font-bold file:uppercase file:tracking-wider file:bg-white file:text-[#0047bb] hover:file:bg-surface-hover cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      />
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-copy bg-surface border border-border-soft px-2.5 py-1 rounded-[4px] font-mono shadow-sm">
        {uploadedDocsCount} / {docLimit === 'unlimited' ? '∞' : docLimit}{' '}
        uploads used this month
      </span>
    </div>
    {uploadError && (
      <div className="text-xs text-danger font-bold uppercase tracking-wider flex items-center gap-1.5 mt-1">
        <AlertCircle className="h-3.5 w-3.5" />
        {uploadError}
      </div>
    )}
  </div>
);

const FormHeaderActions = ({
  sessions,
  isLoading,
  onRegenerate,
  onClearHistory,
  onReset,
}: {
  sessions: unknown[];
  isLoading: boolean;
  onRegenerate: () => void;
  onClearHistory: () => void;
  onReset: () => void;
}) => (
  <div className="flex flex-wrap gap-1.5">
    <Button
      onClick={onRegenerate}
      variant="outline"
      className="h-7 rounded-[4px] border border-border-soft bg-surface hover:bg-surface-hover text-[9px] font-bold uppercase tracking-wider text-foreground cursor-pointer shadow-sm px-2.5"
      disabled={sessions.length === 0 || isLoading}
    >
      Regenerate
    </Button>
    <Button
      onClick={onClearHistory}
      variant="outline"
      className="h-7 rounded-[4px] border border-border-soft bg-surface hover:bg-surface-hover text-[9px] font-bold uppercase tracking-wider text-foreground cursor-pointer shadow-sm px-2.5"
      disabled={sessions.length === 0}
    >
      Clear
    </Button>
    <Button
      onClick={onReset}
      variant="outline"
      className="h-7 rounded-[4px] border border-border-soft bg-surface hover:bg-surface-hover text-[9px] font-bold uppercase tracking-wider text-foreground cursor-pointer shadow-sm px-2.5"
    >
      Reset
    </Button>
  </div>
);

const ErrorBanner = ({ error }: { error: string }) => (
  <div className="flex items-center gap-2 rounded-[4px] border border-danger/25 bg-danger/5 px-3 py-2 text-xs font-bold uppercase tracking-wider text-danger shadow-sm">
    <AlertCircle className="h-3.5 w-3.5" />
    {error}
  </div>
);

const FormActions = ({
  selectedMode,
  input,
  isLoading,
  allowed,
}: {
  selectedMode: AICoachMode | null;
  input: string;
  isLoading: boolean;
  allowed: boolean;
}) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
    <p className="text-[9px] font-bold uppercase tracking-wider text-muted-copy">
      Mode: {selectedMode?.name ?? ''}
    </p>
    <Button
      type="submit"
      className="h-9 rounded-[4px] bg-[#0047bb] hover:bg-[#0047bb]/95 text-xs font-bold uppercase tracking-wider text-white shadow-sm cursor-pointer flex items-center justify-center gap-2 px-4"
      disabled={isLoading || input.trim().length === 0 || !allowed}
    >
      {isLoading ? (
        <RefreshCw className="h-4 w-4 animate-spin" />
      ) : (
        <Send className="h-4 w-4" />
      )}
      {isLoading ? 'Analyzing...' : 'Run Engineering Copilot'}
    </Button>
  </div>
);

const FormBody = ({
  selectedModeId,
  selectedMode,
  input,
  aiEntitlement,
  isLoading,
  error,
  docLimit,
  docLimitLabel,
  uploadedDocsCount,
  uploadError,
  onSetInput,
  onFileUpload,
  onNavigate,
}: {
  selectedModeId: AICoachModeId;
  selectedMode: AICoachMode | null;
  input: string;
  aiEntitlement: { allowed: boolean; reason: string };
  isLoading: boolean;
  error: string | null;
  docLimit: number | 'unlimited';
  docLimitLabel: string;
  uploadedDocsCount: number;
  uploadError: string | null;
  onSetInput: (input: string) => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onNavigate: (path: string) => void;
}) => (
  <>
    {!aiEntitlement.allowed && (
      <AIEntitlementWarning
        reason={aiEntitlement.reason}
        onNavigate={onNavigate}
      />
    )}
    {selectedModeId === 'document_analysis_assistant' && (
      <DocumentUploadSection
        docLimitLabel={docLimitLabel}
        uploadedDocsCount={uploadedDocsCount}
        docLimit={docLimit}
        uploadError={uploadError}
        onFileUpload={onFileUpload}
        allowed={aiEntitlement.allowed}
      />
    )}
    <textarea
      value={input}
      onChange={(event) => onSetInput(event.target.value)}
      disabled={!aiEntitlement.allowed}
      rows={3}
      className="w-full resize-none p-3 font-mono text-sm text-foreground rounded-[4px] border border-border-soft bg-surface-hover focus:border-[#0047bb] focus:ring-0 shadow-sm"
      placeholder={selectedMode?.placeholder ?? ''}
      aria-label="Technical note content input"
    />
    {error && <ErrorBanner error={error} />}
    <FormActions
      selectedMode={selectedMode}
      input={input}
      isLoading={isLoading}
      allowed={aiEntitlement.allowed}
    />
  </>
);

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
  <div className="rounded-xl border border-[#0047bb]/25 bg-surface/80 p-3.5 shadow-sm space-y-3 font-sans">
    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-border-soft/60">
      <div className="flex items-center gap-2">
        <Terminal className="h-4 w-4 text-[#0047bb]" />
        <span className="text-xs font-bold uppercase tracking-wider text-foreground">
          {selectedMode?.name ?? 'Copilot'} Prompt Input
        </span>
      </div>
      <FormHeaderActions
        sessions={sessions}
        isLoading={isLoading}
        onRegenerate={onRegenerate}
        onClearHistory={onClearHistory}
        onReset={onReset}
      />
    </div>

    <form onSubmit={onSubmit} className="space-y-3">
      {isModeLocked ? (
        <PlanLockBanner
          name={selectedMode?.name ?? ''}
          isProLocked={requiredFeature === 'unlimitedAIFeedback'}
          onNavigate={onNavigate}
        />
      ) : (
        <FormBody
          selectedModeId={selectedModeId}
          selectedMode={selectedMode}
          input={input}
          aiEntitlement={aiEntitlement}
          isLoading={isLoading}
          error={error}
          docLimit={docLimit}
          docLimitLabel={docLimitLabel}
          uploadedDocsCount={uploadedDocsCount}
          uploadError={uploadError}
          onSetInput={onSetInput}
          onFileUpload={onFileUpload}
          onNavigate={onNavigate}
        />
      )}
    </form>
  </div>
);
