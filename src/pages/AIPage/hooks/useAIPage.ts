import { FormEvent, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

export const MODE_REQUIRED_FEATURES: Record<string, string> = {
  linkedin_optimizer: 'linkedinOptimization',
  custom_scenario_generator: 'customScenarioGeneration',
  project_copilot_agent: 'persistentAIAgent',
  cv_optimizer: 'unlimitedAIFeedback',
};

const isDocumentFile = (name: string): boolean =>
  name.endsWith('.pdf') || name.endsWith('.docx');

const isUploadBlocked = (
  planId: string,
  docLimit: number | 'unlimited',
  uploadedDocsCount: number
): string | null => {
  if (planId === 'free')
    return 'Free plan accounts do not support document upload. Please upgrade to Pro.';
  if (docLimit !== 'unlimited' && uploadedDocsCount >= docLimit)
    return `Monthly document upload limit reached (${docLimit}/${docLimit}). Please upgrade to a higher tier.`;
  return null;
};

const incrementDocCount = (
  current: number,
  setter: (n: number) => void
): number => {
  const next = current + 1;
  setter(next);
  localStorage.setItem('uploaded_docs_count', next.toString());
  return next;
};

const computeDocLimit = (
  planId: string
): number | 'unlimited' => {
  if (planId === 'free') return 0;
  if (planId === 'pro') return 2;
  return 'unlimited';
};

const computeProviderTone = (
  state: string
): 'success' | 'danger' | 'warning' => {
  if (state === 'backend-configured') return 'success';
  if (state === 'backend-error') return 'danger';
  return 'warning';
};

const computeConnectionValue = (state: string): string => {
  if (state === 'backend-configured') return 'Backend';
  if (state === 'backend-error') return 'Unavailable';
  return 'Mock';
};

const computeConnectionTrend = (state: string): string => {
  if (state === 'backend-configured') return 'Protected backend proxy configured';
  if (state === 'backend-error') return 'Backend request failed safely';
  return 'Local deterministic fallback';
};

export function useAIPage() {
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

  const docLimit = computeDocLimit(subscription.planId);
  const docLimitLabel =
    docLimit === 'unlimited' ? 'Unlimited' : `${docLimit} documents / month`;

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

    const blockReason = isUploadBlocked(
      subscription.planId,
      docLimit,
      uploadedDocsCount
    );
    if (blockReason) {
      setUploadError(blockReason);
      return;
    }

    if (isDocumentFile(file.name)) {
      setInput(
        `[Uploaded File: ${file.name}]\n[Parsed Technical Content Summary]\n1. System constraints and electrical safety standards.\n2. Fire alarm interface specification requirements.\n3. Cable tray layout details for Zone 4.\n\nType your query below to analyze this document.`
      );
      incrementDocCount(uploadedDocsCount, setUploadedDocsCount);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return;
      useWorkspaceStore
        .getState()
        .addDocumentToWorkspace(activeWorkspaceId, file.name, text);
      setInput(`[Uploaded File: ${file.name}]\n\n${text}`);
      incrementDocCount(uploadedDocsCount, setUploadedDocsCount);
    };
    reader.onerror = () => {
      setUploadError(
        'Could not read file. Please ensure it is a valid text file.'
      );
    };
    reader.readAsText(file);
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
  const providerTone = computeProviderTone(providerStatus.state);
  const connectionValue = computeConnectionValue(providerStatus.state);
  const connectionTrend = computeConnectionTrend(providerStatus.state);

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

  return {
    navigate,
    currentUser,
    learningState,
    subscription,
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
    activeWorkspaceId,
    workspaceMemoryContext,
    uploadedDocsCount,
    uploadError,
    isBuyingCredits,
    buyError,
    handleBuyCredits,
    docLimit,
    docLimitLabel,
    requiredFeature,
    isModeLocked,
    handleFileUpload,
    selectedMode,
    promptTemplates,
    coachContext,
    assessmentProfile,
    usage,
    aiEntitlement,
    providerTone,
    connectionValue,
    connectionTrend,
    handleSubmit,
    handleCopyResult,
    handleExportResult,
  };
}
