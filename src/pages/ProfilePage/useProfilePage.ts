import { useEffect, useReducer, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useAuthStore } from '@/features/auth';
import { useBillingStore } from '@/features/billing';
import { useAIStore } from '@/features/ai';
import { useSpeakingStore } from '@/features/speaking';
import { useVocabularyStore } from '@/features/vocabulary';
import { useLearningCockpit } from '@/features/profile';
import { useLearningIntelligenceStore } from '@/features/learning-intelligence';
import { ProductAnalyticsService } from '@/features/analytics/product-analytics.service';
import { storage } from '@/shared/storage';
import { uiReducer, type ProfileUIState } from './ProfilePageReducer';
import { useProfileEdit } from './useProfileEdit';
import { useProfilePreferences } from './useProfilePreferences';

export const useProfilePage = () => {
  const location = useLocation();
  const { section } = useParams<{ section: string }>();
  const activeSection = section || 'overview';
  const { currentUser, providerMode, logout } = useAuthStore();
  const {
    subscription,
    providerStatus,
    isLoading: isBillingLoading,
    error: billingError,
    initializeBilling,
    refreshBilling,
    startCheckout,
    openCustomerPortal,
  } = useBillingStore();

  // UI state
  const [ui, dispatchUI] = useReducer(uiReducer, {
    isSaving: false,
    message: null as string | null,
    error: null as string | null,
    showClearConfirmation: false,
    clearConfirmation: '',
  } satisfies ProfileUIState);
  const { isSaving, message, error, showClearConfirmation, clearConfirmation } =
    ui;
  const setMessage = (v: string | null) =>
    dispatchUI({ type: 'SET_MESSAGE', value: v });
  const setError = (v: string | null) =>
    dispatchUI({ type: 'SET_ERROR', value: v });
  const setShowClearConfirmation = (v: React.SetStateAction<boolean>) => {
    const next = typeof v === 'function' ? v(ui.showClearConfirmation) : v;
    if (next !== ui.showClearConfirmation)
      dispatchUI({ type: 'TOGGLE_CLEAR_CONFIRMATION' });
  };
  const setClearConfirmation = (v: string) =>
    dispatchUI({ type: 'SET_CLEAR_CONFIRMATION', value: v });

  const { profile, memory, learningState } = useLearningCockpit(
    currentUser?.id
  );
  const mistakeLog = useLearningIntelligenceStore((s) => s.mistakeLog);
  const { sessions } = useAIStore();
  const todaysCoachSessions = sessions.filter(
    (s) => new Date(s.timestamp).toDateString() === new Date().toDateString()
  ).length;
  const todaysAttempts = learningState.studySessions.filter(
    (s) => new Date(s.timestamp).toDateString() === new Date().toDateString()
  ).length;
  const todaysReviews = useVocabularyStore
    .getState()
    .history.filter(
      (h) => new Date(h.timestamp).toDateString() === new Date().toDateString()
    ).length;
  const [uploadedDocsCount] = useState<number>(() => {
    const val = localStorage.getItem('uploaded_docs_count');
    return val ? parseInt(val, 10) : 0;
  });
  const speakingHistory = useSpeakingStore((s) => s.history);
  const voiceMinutesUsed = (() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const totalSeconds = speakingHistory
      .filter((e) => new Date(e.timestamp) >= monthStart)
      .reduce(
        (sum, e) =>
          sum +
          (e.evaluation?.wordsPerMinute
            ? Math.round(
                (e.evaluation.wordCount /
                  Math.max(e.evaluation.wordsPerMinute, 1)) *
                  60
              )
            : 0),
        0
      );
    return Math.round(totalSeconds / 60);
  })();

  // Sub-hooks
  const edit = useProfileEdit(profile, setMessage, setError);
  const prefs = useProfilePreferences(profile, setMessage, setError);

  const initializeSpeaking = useSpeakingStore((s) => s.initializeStore);
  useEffect(() => {
    initializeBilling(currentUser?.id || null);
    initializeSpeaking();
  }, [currentUser?.id, initializeBilling, initializeSpeaking]);

  useEffect(() => {
    if (
      new URLSearchParams(location.search).get('billing') === 'success' &&
      currentUser?.id
    ) {
      ProductAnalyticsService.track('checkout_completed', '/profile', {
        metadata: { source: 'checkout_return' },
      });
      refreshBilling(currentUser.id);
    }
  }, [currentUser?.id, location.search, refreshBilling]);

  const handleUpgrade = async () => {
    if (!currentUser) return;
    if (currentUser.id.startsWith('demo_engineer_')) {
      setError(
        'Demo mode: Billing is available after connecting Supabase and Stripe.'
      );
      return;
    }
    try {
      setError(null);
      ProductAnalyticsService.track('checkout_started', '/profile', {
        metadata: { plan: 'pro', source: 'user' },
      });
      await startCheckout(currentUser.id, currentUser.email, 'pro');
    } catch (e: unknown) {
      setError(
        e instanceof Error
          ? e.message
          : 'Billing is not available in demo mode.'
      );
    }
  };

  const handleManageSubscription = async () => {
    if (!currentUser) return;
    if (currentUser.id.startsWith('demo_engineer_')) {
      setError(
        'Demo mode: Subscription management available after connecting Supabase + Stripe.'
      );
      return;
    }
    try {
      setError(null);
      await openCustomerPortal(currentUser.id);
    } catch (e: unknown) {
      setError(
        e instanceof Error
          ? e.message
          : 'Billing portal is not available in demo mode.'
      );
    }
  };

  const exportLocalData = () => {
    const payload = {
      product: 'EngVox',
      version: '4.0.1',
      exportedAt: new Date().toISOString(),
      scope: 'Local EngVox data stored on this device',
      data: storage.exportAll(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EngVox-local-data-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage('Local EngVox data export created.');
    setError(null);
  };

  const clearLocalData = async () => {
    if (providerMode !== 'local' || clearConfirmation !== 'CLEAR') return;
    await logout();
    storage.clear();
    window.location.assign('/start');
  };

  const resetLearningProgress = async () => {
    if (clearConfirmation !== 'CLEAR') return;
    [
      'learning_state',
      'EngVox_vocabulary_menu',
      'EngVox_grammar_progress',
      'EngVox_reading_state',
      'EngVox_writing_state',
      'EngVox_listening_state',
      'EngVox_speaking_state',
      'EngVox_vocabulary_state',
      'EngVox_vocabulary_memory',
      'EngVox_placement_result',
      'task_evaluation_records',
      'learning_intelligence',
      'gamification_pro_state',
      'streak_data',
      'ai_coach_pro_state',
    ].forEach((k) => storage.remove(k));
    if (currentUser?.id)
      (await import('@/features/profile')).LearningProfileRepository.reset(
        currentUser.id
      );
    storage.clear();
    window.location.assign('/start');
  };

  const completionPercent = (() => {
    let c = 0;
    if (currentUser?.displayName) c += 20;
    if (profile?.professionId) c += 20;
    if (profile?.industryId) c += 20;
    if (profile?.communicationGoals && profile.communicationGoals.length > 0)
      c += 10;
    return c;
  })();

  return {
    activeSection,
    currentUser,
    providerMode,
    subscription,
    providerStatus,
    isBillingLoading,
    billingError,
    profile,
    memory,
    learningState,
    mistakeLog,
    isSaving,
    message,
    error,
    showClearConfirmation,
    setShowClearConfirmation,
    clearConfirmation,
    setClearConfirmation,
    completionPercent,
    todaysCoachSessions,
    todaysAttempts,
    todaysReviews,
    uploadedDocsCount,
    voiceMinutesUsed,
    ...edit,
    ...prefs,
    handleUpgrade,
    handleManageSubscription,
    exportLocalData,
    clearLocalData,
    resetLearningProgress,
  };
};
