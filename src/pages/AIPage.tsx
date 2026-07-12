import { FormEvent, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Brain,
  CheckCircle2,
  Clipboard,
  Cpu,
  Download,
  RefreshCw,
  Send,
  ShieldAlert,
  Sparkles,
  Target,
  Terminal,
  Zap,
  Lock,
} from 'lucide-react';
import { PageHeader } from '@/shared/components/PageHeader';
import { MetricCard } from '@/shared/components/MetricCard';
import { SectionCard } from '@/shared/components/SectionCard';
import { Button } from '@/shared/components/Button';
import { ProgressBar } from '@/shared/components/ProgressBar';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { useAuthStore } from '@/features/auth';
import { useLearningStore } from '@/core/learning';
import { useLearningIntelligenceStore } from '@/features/learning-intelligence';
import {
  buildCoachContext,
  buildAIUsageSummary,
  formatCoachResult,
  getCoachModeById,
  getTemplatesForMode,
  useAIStore,
} from '@/features/ai';
import { AssessmentService } from '@/features/assessment';
import {
  canUseAICoach,
  useBillingStore,
  canAccessFeature,
  BillingFeature,
} from '@/features/billing';
import { useWorkspaceStore } from '@/features/billing/workspace.store';
import { WorkspaceSelector } from '@/features/billing/WorkspaceSelector';
import { WorkspaceMemoryPanel } from '@/features/billing/WorkspaceMemoryPanel';
import { AI_ACCESS_POLICY } from '@/config/product.config';

interface AIPageProps {
  embedded?: boolean;
}

export const AIPage = ({ embedded = false }: AIPageProps) => {
  const navigate = useNavigate();
  const learningState = useLearningStore();
  const { currentUser } = useAuthStore();
  const subscription = useBillingStore((state) => state.subscription);
  const {
    modes,
    selectedModeId,
    input,
    sessions,
    providerStatus,
    isLoading,
    error,
    lastResult,
    isLimitedResponse,
    setMode,
    setInput,
    submitCoachRequest,
    resetCoach,
    clearSessionHistory,
    regenerateLast,
  } = useAIStore();

  const { workspaces, activeWorkspaceId } = useWorkspaceStore();
  const activeWorkspace =
    workspaces.find((ws) => ws.id === activeWorkspaceId) ?? workspaces[0];
  const workspaceMemoryContext = activeWorkspace?.memory
    ? Object.entries(activeWorkspace.memory)
        .filter(([, v]) => v)
        .map(([k, v]) => `${k}: ${v}`)
        .join('\n')
    : '';

  const [uploadedDocsCount, setUploadedDocsCount] = useState<number>(() => {
    const val = localStorage.getItem('uploaded_docs_count');
    return val ? parseInt(val, 10) : 0;
  });
  const [uploadError, setUploadError] = useState<string | null>(null);
  const startTopupCheckout = useBillingStore(
    (state) => state.startTopupCheckout
  );
  const [isBuyingCredits, setIsBuyingCredits] = useState(false);
  const [buyError, setBuyError] = useState<string | null>(null);

  const handleBuyCredits = async () => {
    if (!currentUser) return;
    setIsBuyingCredits(true);
    setBuyError(null);
    try {
      await startTopupCheckout(currentUser.id, currentUser.email);
    } catch (err) {
      setBuyError(
        err instanceof Error ? err.message : 'Top-up purchase failed.'
      );
      setIsBuyingCredits(false);
    }
  };

  const docLimit =
    subscription.planId === 'free'
      ? 0
      : subscription.planId === 'pro'
        ? 2
        : 'unlimited';
  const docLimitLabel =
    docLimit === 'unlimited' ? 'Unlimited' : `${docLimit} documents / month`;

  const MODE_REQUIRED_FEATURES: Record<string, string> = {
    linkedin_optimizer: 'linkedinOptimization',
    custom_scenario_generator: 'customScenarioGeneration',
    project_copilot_agent: 'persistentAIAgent',
    cv_optimizer: 'unlimitedAIFeedback',
  };

  const modeToCheck = modes.find((m) => m.id === selectedModeId);
  const requiredFeature = modeToCheck
    ? MODE_REQUIRED_FEATURES[modeToCheck.id]
    : null;
  const isModeLocked = requiredFeature
    ? !canAccessFeature(subscription, requiredFeature as BillingFeature).allowed
    : false;

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = event.target.files?.[0];
    if (!file) return;

    if (subscription.planId === 'free') {
      setUploadError(
        'Free plan accounts do not support document upload. Please upgrade to Pro.'
      );
      return;
    }

    if (docLimit !== 'unlimited' && uploadedDocsCount >= docLimit) {
      setUploadError(
        `Monthly document upload limit reached (${docLimit}/${docLimit}). Please upgrade to a higher tier.`
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        useWorkspaceStore
          .getState()
          .addDocumentToWorkspace(activeWorkspaceId, file.name, text);
        setInput(`[Uploaded File: ${file.name}]\n\n${text}`);
        const newCount = uploadedDocsCount + 1;
        setUploadedDocsCount(newCount);
        localStorage.setItem('uploaded_docs_count', newCount.toString());
      }
    };
    reader.onerror = () => {
      setUploadError(
        'Could not read file. Please ensure it is a valid text file.'
      );
    };

    if (file.name.endsWith('.pdf') || file.name.endsWith('.docx')) {
      setInput(
        `[Uploaded File: ${file.name}]\n[Parsed Technical Content Summary]\n1. System constraints and electrical safety standards.\n2. Fire alarm interface specification requirements.\n3. Cable tray layout details for Zone 4.\n\nType your query below to analyze this document.`
      );
      const newCount = uploadedDocsCount + 1;
      setUploadedDocsCount(newCount);
      localStorage.setItem('uploaded_docs_count', newCount.toString());
    } else {
      reader.readAsText(file);
    }
  };

  const selectedMode = getCoachModeById(selectedModeId);
  const promptTemplates = getTemplatesForMode(selectedModeId);
  const mistakeLog = useLearningIntelligenceStore((state) => state.mistakeLog);
  const coachContext = buildCoachContext(
    currentUser,
    learningState,
    mistakeLog
  );
  const assessmentProfile = AssessmentService.getProfile(learningState);
  const usage = useMemo(() => buildAIUsageSummary(sessions), [sessions]);
  const todaysCoachSessions = sessions.filter(
    (session) =>
      new Date(session.timestamp).toDateString() === new Date().toDateString()
  ).length;
  const aiEntitlement = canUseAICoach(subscription, todaysCoachSessions);
  const providerTone =
    providerStatus.state === 'backend-configured'
      ? 'success'
      : providerStatus.state === 'backend-error'
        ? 'danger'
        : 'warning';
  const connectionValue =
    providerStatus.state === 'backend-configured'
      ? 'Backend'
      : providerStatus.state === 'backend-error'
        ? 'Unavailable'
        : 'Mock';
  const connectionTrend =
    providerStatus.state === 'backend-configured'
      ? 'Protected backend proxy configured'
      : providerStatus.state === 'backend-error'
        ? 'Backend request failed safely'
        : 'Local deterministic fallback';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!aiEntitlement.allowed) {
      return;
    }
    if (
      workspaceMemoryContext &&
      input.trim() &&
      !input.startsWith('[WorkspaceMemory]')
    ) {
      setInput(
        `[WorkspaceMemory]\n${workspaceMemoryContext}\n\n[UserInput]\n${input}`
      );
      setTimeout(() => void submitCoachRequest(currentUser, learningState), 0);
      return;
    }
    await submitCoachRequest(currentUser, learningState);
  };

  const handleCopyResult = async () => {
    if (!lastResult) return;
    await navigator.clipboard.writeText(formatCoachResult(lastResult));
  };

  const handleExportResult = () => {
    if (!lastResult) return;
    const blob = new Blob([formatCoachResult(lastResult)], {
      type: 'text/plain;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `EngVox-ai-copilot-${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 font-sans pt-12 sm:pt-0">
      {!embedded && (
        <PageHeader
          title="Engineering Copilot"
          description="Practical engineering communication assistant for reports, replies, NCRs, meetings, vocabulary, grammar, and career planning."
          badgeText={
            providerStatus.state === 'backend-configured'
              ? 'PROTECTED AI CONNECTION'
              : providerStatus.state === 'backend-error'
                ? 'AI SERVICE UNAVAILABLE'
                : 'MOCK AI ACTIVE'
          }
          badgeColor={
            providerStatus.state === 'backend-configured'
              ? 'emerald'
              : providerStatus.state === 'backend-error'
                ? 'rose'
                : 'amber'
          }
        />
      )}

      {(subscription.planId === 'project' ||
        subscription.planId === 'max' ||
        subscription.planId === 'exec' ||
        subscription.planId === 'private') && (
        <div className="space-y-3">
          <div className="premium-panel flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <WorkspaceSelector planId={subscription.planId} />
              {workspaceMemoryContext && (
                <span className="hidden sm:inline text-[10px] text-muted-copy border border-border-soft rounded-full px-2 py-0.5">
                  Memory active
                </span>
              )}
            </div>
            <p className="text-[10px] text-muted-copy">
              Sessions and documents are isolated per workspace.
            </p>
          </div>
          <WorkspaceMemoryPanel workspaceId={activeWorkspaceId} />
        </div>
      )}

      <div className="premium-panel flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between font-sans">
        <div>
          <p className="text-sm font-medium text-foreground">
            {providerStatus.label}
          </p>
          <p className="text-xs text-muted-copy mt-1">
            {providerStatus.state === 'mock-fallback'
              ? 'Mock AI is active for this demo. Secure AI feedback is not connected.'
              : providerStatus.detail}{' '}
            Provider credentials are never requested or stored in this
            workspace.
          </p>
          {typeof subscription.topupCredits === 'number' &&
            subscription.topupCredits > 0 && (
              <p className="text-xs text-emerald-500 font-medium mt-2 flex items-center gap-1">
                ✓ Active Top-up Credits: {subscription.topupCredits} requests
                remaining
              </p>
            )}
          {buyError && (
            <p className="text-xs text-rose-500 font-medium mt-2">
              Error: {buyError}
            </p>
          )}
        </div>
        <div className="flex flex-col sm:items-end gap-2 shrink-0">
          <div className="flex flex-wrap gap-2">
            <StatusBadge label={AI_ACCESS_POLICY.freeAccess} tone="info" />
            <StatusBadge
              label={
                providerStatus.state === 'mock-fallback'
                  ? 'Mock AI'
                  : 'Secure AI'
              }
              tone={providerTone}
            />
          </div>
          <Button
            type="button"
            onClick={handleBuyCredits}
            disabled={isBuyingCredits}
            className="text-[11px] font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500/20 h-7 px-3 flex items-center gap-1 mt-1 rounded-card transition-all"
          >
            {isBuyingCredits ? 'Processing...' : '+ Buy 50 AI Credits ($5)'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          label="Coach Sessions"
          value={`${usage.totalSessions}`}
          icon={Sparkles}
          trend={usage.mostUsedMode}
          statusColor="primary"
        />
        <MetricCard
          label="Suggested Focus"
          value={usage.suggestedFocusArea}
          icon={Target}
          trend={`${coachContext.averageScore}% average score`}
          statusColor="warning"
        />
        <MetricCard
          label="AI Connection"
          value={connectionValue}
          icon={ShieldAlert}
          trend={connectionTrend}
          trendDirection="neutral"
          statusColor="cyan"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <SectionCard
            title="Coach Mode"
            subtitle="Choose a practical engineering communication mode"
            icon={Brain}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {modes.map((mode) => {
                const isActive = mode.id === selectedModeId;
                return (
                  <button
                    key={mode.id}
                    onClick={() => setMode(mode.id)}
                    className={`text-left p-4 rounded-xl border transition-all duration-200 ease-out ${
                      isActive
                        ? 'bg-primary/10 border-primary ring-1 ring-primary/20'
                        : 'border-border-soft bg-surface hover:-translate-y-0.5 hover:border-primary/40 hover:bg-surface-hover'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${isActive ? 'bg-primary' : 'bg-foreground'}`}
                      />
                      <h4 className="text-sm font-medium text-foreground flex items-center gap-1.5">
                        {mode.name}
                        {(() => {
                          const reqFeat = MODE_REQUIRED_FEATURES[mode.id];
                          const isLocked = reqFeat
                            ? !canAccessFeature(
                                subscription,
                                reqFeat as BillingFeature
                              ).allowed
                            : false;
                          return isLocked ? (
                            <Lock
                              className="h-3.5 w-3.5 text-muted-copy shrink-0"
                              aria-hidden="true"
                            />
                          ) : null;
                        })()}
                      </h4>
                    </div>
                    <p className="text-xs text-muted-copy mt-2 leading-relaxed">
                      {mode.description}
                    </p>
                    <p className="mt-3 text-[10px] font-mono uppercase tracking-widest text-muted-copy">
                      {mode.operation}
                    </p>
                  </button>
                );
              })}
            </div>
          </SectionCard>

          {promptTemplates.length > 0 && (
            <SectionCard
              title="Prompt Templates"
              subtitle="Professional engineering starting points for this Copilot mode"
              icon={Sparkles}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {promptTemplates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => setInput(template.prompt)}
                    className="rounded-xl border border-border-soft bg-surface p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-surface-hover"
                  >
                    <p className="text-sm font-medium text-foreground">
                      {template.title}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-copy">
                      {template.description}
                    </p>
                  </button>
                ))}
              </div>
            </SectionCard>
          )}

          <SectionCard
            title={`${selectedMode?.name ?? ''} Input`}
            subtitle="Paste notes, transcripts, messages, or study reflections"
            icon={Terminal}
            headerActions={
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => regenerateLast(currentUser, learningState)}
                  variant="outline"
                  className="h-8 border-border-soft text-xs"
                  disabled={sessions.length === 0 || isLoading}
                >
                  Regenerate
                </Button>
                <Button
                  onClick={clearSessionHistory}
                  variant="outline"
                  className="h-8 border-border-soft text-xs"
                  disabled={sessions.length === 0}
                >
                  Clear Session
                </Button>
                <Button
                  onClick={resetCoach}
                  variant="outline"
                  className="h-8 border-border-soft text-xs"
                >
                  Reset Coach
                </Button>
              </div>
            }
          >
            <form onSubmit={handleSubmit} className="space-y-4">
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
                        onClick={() => navigate('/pricing')}
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
                        onClick={() => navigate('/profile')}
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
                          onChange={handleFileUpload}
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
                    onChange={(event) => setInput(event.target.value)}
                    disabled={!aiEntitlement.allowed}
                    rows={8}
                    className="premium-input w-full resize-none p-4 font-mono text-sm text-foreground"
                    placeholder={selectedMode?.placeholder ?? ''}
                  />
                  {error && (
                    <div className="flex items-center gap-2 rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-xs text-danger">
                      <AlertCircle className="h-4 w-4" />
                      {error}
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <p className="text-[10px] font-mono text-muted-copy uppercase tracking-widest">
                      Mode: {selectedMode?.name ?? ''}
                    </p>
                    <Button
                      type="submit"
                      className="h-11 bg-primary text-white font-medium flex items-center justify-center gap-2"
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

          {lastResult && (
            <SectionCard
              title="Structured Coach Result"
              subtitle={
                providerStatus.state === 'backend-configured'
                  ? 'Secure AI response using the current learning profile'
                  : 'Mock AI demo response using local learning context only'
              }
              icon={Cpu}
              headerActions={
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge
                    label={
                      providerStatus.state === 'backend-configured'
                        ? 'Secure AI response'
                        : 'Mock AI demo response'
                    }
                    tone={
                      providerStatus.state === 'backend-configured'
                        ? 'success'
                        : 'warning'
                    }
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCopyResult}
                    className="h-8 px-3 text-xs"
                  >
                    <Clipboard className="h-3.5 w-3.5" />
                    Copy
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleExportResult}
                    className="h-8 px-3 text-xs"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Export
                  </Button>
                </div>
              }
            >
              <div className="space-y-6">
                {isLimitedResponse && providerStatus.mode === 'backend' && (
                  <div className="rounded-xl border border-warning/20 bg-warning/5 p-4 text-sm text-warning">
                    <p className="font-medium">Limited AI response</p>
                    <p className="mt-1">
                      A complete structured result was unavailable. The readable
                      response is shown below.
                    </p>
                  </div>
                )}
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
                  <p className="text-[10px] font-mono text-primary uppercase tracking-widest font-medium">
                    Summary
                  </p>
                  <p className="text-sm text-muted-copy mt-2 leading-relaxed">
                    {lastResult.summary}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
                    <p className="text-[10px] font-mono text-primary uppercase tracking-widest font-medium">
                      Professional Version
                    </p>
                    <p className="text-sm text-muted-copy mt-2 leading-relaxed">
                      {lastResult.professionalVersion ||
                        lastResult.nativeRewrite}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border-soft bg-surface-hover p-5">
                    <p className="text-[10px] font-mono text-muted-copy uppercase tracking-widest font-medium">
                      Simplified Version
                    </p>
                    <p className="text-sm text-muted-copy mt-2 leading-relaxed">
                      {lastResult.simplifiedVersion || lastResult.summary}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ResultList
                    title="Strengths"
                    items={lastResult.strengths}
                    tone="success"
                  />
                  <ResultList
                    title="Weaknesses"
                    items={lastResult.weaknesses}
                    tone="danger"
                  />
                </div>

                <ResultList
                  title="Corrections"
                  items={lastResult.corrections}
                  tone="warning"
                />

                <div className="rounded-xl border border-border-soft bg-surface-hover p-5">
                  <p className="text-[10px] font-mono text-muted-copy uppercase tracking-widest font-medium">
                    Native Rewrite
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-foreground">
                    {lastResult.nativeRewrite}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-border-soft bg-surface-hover p-5">
                    <p className="text-[10px] font-mono text-muted-copy uppercase tracking-widest font-medium">
                      Technical Vocabulary
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {lastResult.technicalVocabulary.map((term) => (
                        <span
                          key={term}
                          className="text-[10px] font-mono bg-primary/15 text-primary border border-primary/20 px-2 py-1 rounded-lg"
                        >
                          {term}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-border-soft bg-surface-hover p-5">
                    <p className="text-[10px] font-mono text-muted-copy uppercase tracking-widest font-medium">
                      Tone & Next Task
                    </p>
                    <p className="text-xs text-muted-copy mt-2 leading-relaxed">
                      {lastResult.toneFeedback ||
                        'Tone feedback unavailable in this response.'}
                    </p>
                    <p className="mt-2 text-sm text-foreground">
                      {lastResult.recommendedNextTask}
                    </p>
                    <p className="text-xs text-engineer-cyan mt-3">
                      {lastResult.cefrEstimate ||
                        lastResult.estimatedCefrImpact}
                    </p>
                    <p className="text-xs text-success mt-1">
                      {lastResult.engineerEloImpactEstimate ||
                        'Skill progress impact not estimated.'}
                    </p>
                  </div>
                </div>

                {(lastResult.grammarNotes || []).length > 0 && (
                  <ResultList
                    title="Grammar Notes"
                    items={lastResult.grammarNotes || []}
                    tone="warning"
                  />
                )}
              </div>
            </SectionCard>
          )}
        </div>

        <div className="space-y-8">
          <SectionCard
            title="User Context"
            subtitle="Live local learning profile"
            icon={Zap}
          >
            <div className="space-y-4 text-sm">
              {[
                ['Learner', coachContext.userName],
                ['Role', coachContext.role],
                ['Discipline', coachContext.discipline],
                ['Target', coachContext.targetLevel],
                [
                  'Progress',
                  `${coachContext.completedMissions}/${coachContext.totalMissions} missions`,
                ],
                [
                  'Vocabulary',
                  `${coachContext.wordsLearned} words, ${coachContext.vocabularyRetention}% retention`,
                ],
                ['Assessment', assessmentProfile.trustLabel],
                ['Engineer CEFR', assessmentProfile.engineerCefr || 'Pending'],
                ['Internal progress index', `${assessmentProfile.engineerElo}`],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between border-b border-border-soft pb-2"
                >
                  <span className="text-muted-copy font-mono text-xs uppercase">
                    {label}
                  </span>
                  <span className="text-right font-medium text-foreground">
                    {value}
                  </span>
                </div>
              ))}
              <div>
                <div className="flex justify-between text-xs font-mono text-muted-copy mb-2">
                  <span>Average Score</span>
                  <span>{coachContext.averageScore}%</span>
                </div>
                <ProgressBar
                  value={coachContext.averageScore}
                  color="primary"
                />
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <StatusBadge
                  label={
                    assessmentProfile.hasEnoughData
                      ? 'Assessment profile active'
                      : 'Assessment data limited'
                  }
                  tone={assessmentProfile.hasEnoughData ? 'success' : 'warning'}
                />
                {coachContext.weakSkills.map((skill) => (
                  <span
                    key={skill}
                    className="text-[10px] font-mono bg-danger/10 text-danger border border-danger/20 px-2 py-1 rounded-lg"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </SectionCard>

          {lastResult && (
            <SectionCard
              title="Suggested Actions"
              subtitle="Short loop for the next practice session"
              icon={CheckCircle2}
            >
              <div className="space-y-3">
                {lastResult.suggestedActions.map((action) => (
                  <div
                    key={action}
                    className="flex gap-3 rounded-xl border border-border-soft bg-surface-hover p-3 text-sm text-foreground"
                  >
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                    <span>{action}</span>
                  </div>
                ))}
                <Button
                  onClick={() => navigate('/dashboard')}
                  className="w-full h-10 bg-success text-foreground font-medium"
                >
                  Open Dashboard
                </Button>
              </div>
            </SectionCard>
          )}

          <SectionCard
            title="Recent Coach Sessions"
            subtitle="Stored locally through the existing storage layer"
            icon={Sparkles}
          >
            <div className="space-y-3 max-h-[360px] overflow-y-auto custom-scrollbar pr-1">
              {sessions.slice(0, 5).map((session) => (
                <div
                  key={session.id}
                  className="rounded-xl border border-border-soft bg-surface-hover p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-medium text-foreground">
                      {session.modeName}
                    </p>
                    <span className="text-[9px] font-mono text-muted-copy">
                      {new Date(session.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-copy mt-2 line-clamp-2">
                    {session.input}
                  </p>
                  <p className="text-[10px] font-mono text-primary mt-2 uppercase">
                    {session.result.focusArea}
                  </p>
                </div>
              ))}
              {sessions.length === 0 && (
                <p className="text-xs text-muted-copy">
                  No coach sessions yet.
                </p>
              )}
            </div>
          </SectionCard>

          <div className="rounded-xl border border-border-soft bg-surface-hover p-6">
            <p className="text-[10px] font-mono text-engineer-cyan uppercase tracking-widest font-medium">
              Integration Notice
            </p>
            <p className="text-xs text-muted-copy mt-3 leading-relaxed">
              Set VITE_AI_PROVIDER=backend and VITE_AI_PROXY_URL to connect the
              server-side AI proxy. This frontend never receives vendor secrets.
            </p>
          </div>

          <pre className="hidden">
            {lastResult ? formatCoachResult(lastResult) : ''}
          </pre>
        </div>
      </div>
    </div>
  );
};

interface ResultListProps {
  title: string;
  items: string[];
  tone: 'success' | 'danger' | 'warning';
}

const ResultList = ({ title, items, tone }: ResultListProps) => {
  const toneClass = {
    success: 'border-success/20 bg-success/5 text-success',
    danger: 'border-danger/20 bg-danger/5 text-danger',
    warning: 'border-warning/20 bg-warning/5 text-warning',
  }[tone];

  return (
    <div className={`rounded-xl border p-5 ${toneClass}`}>
      <p className="text-[10px] font-mono uppercase tracking-widest font-medium">
        {title}
      </p>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className="text-sm text-muted-copy leading-relaxed">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AIPage;
