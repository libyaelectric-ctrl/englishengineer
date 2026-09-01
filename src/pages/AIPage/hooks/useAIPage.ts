import { FormEvent, useMemo, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { useLearningStore } from '@/core/learning';

import { logger } from '@/shared/logger';

import {
  buildAIUsageSummary,
  buildCoachContext,
  formatCoachResult,
  getCoachModeById,
  getTemplatesForMode,
  useAIStore,
} from '@/features/ai';
import { AssessmentService } from '@/features/assessment';
import { useAuthStore } from '@/features/auth';
import {
  BillingFeature,
  canAccessFeature,
  canUseAICoach,
  useBillingStore,
} from '@/features/billing';
import { useWorkspaceStore } from '@/features/billing/workspace.store';
import { useLearningIntelligenceStore } from '@/features/learning-intelligence';

export const MODE_REQUIRED_FEATURES: Record<string, string> = {
  linkedin_optimizer: 'linkedinOptimization',
  custom_scenario_generator: 'customScenarioGeneration',
  project_copilot_agent: 'persistentAIAgent',
  cv_optimizer: 'unlimitedAIFeedback',
};

const isDocumentFile = (name: string): boolean => name.endsWith('.pdf') || name.endsWith('.docx');

const isUploadBlocked = (
  planId: string,
  docLimit: number | 'unlimited',
  uploadedDocsCount: number
): string | null => {
  if (planId === 'free' || planId === 'junior')
    return 'Free plan accounts do not support document upload. Please upgrade to Pro.';
  if (docLimit !== 'unlimited' && uploadedDocsCount >= docLimit)
    return `Monthly document upload limit reached (${docLimit}/${docLimit}). Please upgrade to a higher tier.`;
  return null;
};

const incrementDocCount = (current: number, setter: (n: number) => void): number => {
  const next = current + 1;
  setter(next);
  localStorage.setItem('uploaded_docs_count', next.toString());
  return next;
};

const computeDocLimit = (planId: string): number | 'unlimited' => {
  if (planId === 'free' || planId === 'junior') return 0;
  if (planId === 'senior') return 2;
  return 'unlimited';
};

const computeProviderTone = (mode: string, state: string): 'success' | 'danger' | 'warning' => {
  if (mode === 'backend' && state === 'backend-configured') return 'success';
  if (state === 'backend-error') return 'danger';
  return 'warning';
};

const computeConnectionValue = (mode: string, state: string): string => {
  if (mode === 'backend' && state === 'backend-configured') return 'Secure AI';
  if (mode === 'backend' && state === 'mock-fallback') return 'Demo Mode';
  if (state === 'backend-error') return 'Error';
  return 'Mock AI';
};

const computeConnectionTrend = (mode: string, state: string): string => {
  if (mode === 'backend' && state === 'backend-configured')
    return 'Live LLM connected through protected backend proxy';
  if (mode === 'backend' && state === 'mock-fallback')
    return 'Backend connected but running in demo mode';
  if (state === 'backend-error') return 'Backend connection failed — fallback responses active';
  return 'No backend detected — local deterministic fallback';
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
  const activeWorkspace = workspaces.find((ws) => ws.id === activeWorkspaceId) ?? workspaces[0];
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
  const [isBuyingCredits, setIsBuyingCredits] = useState(false);
  const [buyError, setBuyError] = useState<string | null>(null);

  const { startTopupCheckout } = useBillingStore();

  const handleBuyCredits = async () => {
    if (!currentUser) return;
    setIsBuyingCredits(true);
    setBuyError(null);
    try {
      await startTopupCheckout(currentUser.id, currentUser.email);
    } catch (err) {
      setBuyError(err instanceof Error ? err.message : 'Top-up purchase failed.');
      setIsBuyingCredits(false);
    }
  };

  const docLimit = computeDocLimit(subscription.planId);
  const docLimitLabel = docLimit === 'unlimited' ? 'Unlimited' : `${docLimit} documents / month`;

  const modeToCheck = modes.find((m) => m.id === selectedModeId);
  const requiredFeature = modeToCheck ? MODE_REQUIRED_FEATURES[modeToCheck.id] : null;
  const isModeLocked = requiredFeature
    ? !canAccessFeature(subscription, requiredFeature as BillingFeature).allowed
    : false;

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = event.target.files?.[0];
    if (!file) return;

    const blockReason = isUploadBlocked(subscription.planId, docLimit, uploadedDocsCount);
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
      useWorkspaceStore.getState().addDocumentToWorkspace(activeWorkspaceId, file.name, text);
      setInput(`[Uploaded File: ${file.name}]\n\n${text}`);
      incrementDocCount(uploadedDocsCount, setUploadedDocsCount);
    };
    reader.onerror = () => {
      setUploadError('Could not read file. Please ensure it is a valid text file.');
    };
    reader.readAsText(file);
  };

  const selectedMode = getCoachModeById(selectedModeId);
  const promptTemplates = getTemplatesForMode(selectedModeId);
  const mistakeLog = useLearningIntelligenceStore((state) => state.mistakeLog);
  const coachContext = buildCoachContext(currentUser, learningState, mistakeLog);
  const assessmentProfile = AssessmentService.getProfile(learningState);
  const usage = useMemo(() => buildAIUsageSummary(sessions), [sessions]);
  const todaysCoachSessions = sessions.filter(
    (session) => new Date(session.timestamp).toDateString() === new Date().toDateString()
  ).length;
  const aiEntitlement = canUseAICoach(subscription, todaysCoachSessions);
  const providerTone = computeProviderTone(providerStatus.mode, providerStatus.state);
  const connectionValue = computeConnectionValue(providerStatus.mode, providerStatus.state);
  const connectionTrend = computeConnectionTrend(providerStatus.mode, providerStatus.state);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!aiEntitlement.allowed) {
      return;
    }
    if (workspaceMemoryContext && input.trim() && !input.startsWith('[WorkspaceMemory]')) {
      setInput(`[WorkspaceMemory]\n${workspaceMemoryContext}\n\n[UserInput]\n${input}`);
      setTimeout(() => void submitCoachRequest(currentUser, learningState), 0);
      return;
    }
    await submitCoachRequest(currentUser, learningState);
  };

  const handleCopyResult = async () => {
    if (!lastResult) return;
    try {
      const { copyToClipboard } = await import('@/shared/utils/capacitor');
      await copyToClipboard(formatCoachResult(lastResult));
    } catch (e) {
      logger.w('[Clipboard] Failed to copy', e);
    }
  };

  const handleExportResult = async () => {
    if (!lastResult) return;
    const { downloadFile } = await import('@/shared/utils/capacitor');
    await downloadFile(
      formatCoachResult(lastResult),
      `EngVox-ai-copilot-${new Date().toISOString().slice(0, 10)}.txt`,
      'text/plain'
    );
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
