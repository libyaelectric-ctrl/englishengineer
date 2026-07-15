import { useEffect, useReducer, useRef, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useAuthStore } from '@/features/auth';
import { useBillingStore } from '@/features/billing';
import { useAIStore } from '@/features/ai';
import { useSpeakingStore } from '@/features/speaking';
import { useVocabularyStore } from '@/features/vocabulary';
import {
  LearningProfileRepository,
  useLearningCockpit,
  ProfessionId,
  UserLearningProfile,
} from '@/features/profile';
import { useLearningIntelligenceStore } from '@/features/learning-intelligence';
import { ProductAnalyticsService } from '@/features/analytics/product-analytics.service';
import { useLocalizationStore } from '@/features/localization';
import { storage } from '@/shared/storage';
import {
  uiReducer,
  editReducer,
  prefsReducer,
  type ProfileUIState,
  type ProfileEditState,
  type ProfilePrefsState,
} from './ProfilePageReducer';

const getErrorMessage = (error: unknown, fallback: string): string =>
  error instanceof Error ? error.message : fallback;

const splitDisplayName = (displayName = '') => {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' '),
  };
};

export const useProfilePage = () => {
  const location = useLocation();
  const { section } = useParams<{ section: string }>();
  const activeSection = section || 'overview';
  const { currentUser, providerMode, updateProfile, logout } = useAuthStore();
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

  // UI state via useReducer
  const [ui, dispatchUI] = useReducer(uiReducer, {
    isSaving: false,
    message: null as string | null,
    error: null as string | null,
    showClearConfirmation: false,
    clearConfirmation: '',
  } satisfies ProfileUIState);
  const { isSaving, message, error, showClearConfirmation, clearConfirmation } =
    ui;
  const setIsSaving = (v: boolean) =>
    dispatchUI({ type: 'SET_SAVING', value: v });
  const setMessage = (v: string | null) =>
    dispatchUI({ type: 'SET_MESSAGE', value: v });
  const setError = (v: string | null) =>
    dispatchUI({ type: 'SET_ERROR', value: v });
  const setShowClearConfirmation = (v: React.SetStateAction<boolean>) => {
    const nextValue = typeof v === 'function' ? v(ui.showClearConfirmation) : v;
    if (nextValue !== ui.showClearConfirmation) {
      dispatchUI({ type: 'TOGGLE_CLEAR_CONFIRMATION' });
    }
  };
  const setClearConfirmation = (v: string) =>
    dispatchUI({ type: 'SET_CLEAR_CONFIRMATION', value: v });

  const { profile, memory, learningState } = useLearningCockpit(
    currentUser?.id
  );
  const mistakeLog = useLearningIntelligenceStore((state) => state.mistakeLog);
  const language = useLocalizationStore((state) => state.language);
  const setLanguage = useLocalizationStore((state) => state.setLanguage);

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

  const speakingHistory = useSpeakingStore((state) => state.history);
  const voiceMinutesUsed = (() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const totalSeconds = speakingHistory
      .filter((entry) => new Date(entry.timestamp) >= monthStart)
      .reduce(
        (sum, entry) =>
          sum +
          (entry.evaluation?.wordsPerMinute
            ? Math.round(
                (entry.evaluation.wordCount /
                  Math.max(entry.evaluation.wordsPerMinute, 1)) *
                  60
              )
            : 0),
        0
      );
    return Math.round(totalSeconds / 60);
  })();

  // Edit state via useReducer
  const [edit, dispatchEdit] = useReducer(editReducer, {
    isEditMode: false,
    firstName: '',
    lastName: '',
    profession: '',
    track: '',
    subdomain: '',
    industry: '',
    lang: 'en' as 'en' | 'tr',
    goals: [] as string[],
  } satisfies ProfileEditState);
  const {
    isEditMode,
    firstName: editFirstName,
    lastName: editLastName,
    profession: editProfession,
    track: editTrack,
    subdomain: editSubdomain,
    industry: editIndustry,
    lang: editLang,
    goals: editGoals,
  } = edit;
  const setIsEditMode = (v: boolean) =>
    dispatchEdit({ type: 'SET_EDIT_MODE', value: v });
  const setEditFirstName = (v: string) =>
    dispatchEdit({ type: 'SET_FIRST_NAME', value: v });
  const setEditLastName = (v: string) =>
    dispatchEdit({ type: 'SET_LAST_NAME', value: v });
  const setEditProfession = (v: string) =>
    dispatchEdit({ type: 'SET_PROFESSION', value: v });
  const setEditTrack = (v: string) =>
    dispatchEdit({ type: 'SET_TRACK', value: v });
  const setEditSubdomain = (v: string) =>
    dispatchEdit({ type: 'SET_SUBDOMAIN', value: v });
  const setEditIndustry = (v: string) =>
    dispatchEdit({ type: 'SET_INDUSTRY', value: v });
  const setEditLang = (v: 'en' | 'tr') =>
    dispatchEdit({ type: 'SET_LANG', value: v });
  const setEditGoals = (v: string[]) =>
    dispatchEdit({ type: 'SET_GOALS', value: v });

  // Prefs state via useReducer
  const [prefs, dispatchPrefs] = useReducer(prefsReducer, {
    goals: [] as string[],
    minutes: 15,
    tasks: 2,
    missedDays: 0,
    expLevel: '',
    careerGoal: '',
    saved: false,
  } satisfies ProfilePrefsState);
  const {
    goals: prefGoals,
    minutes: prefMinutes,
    tasks: prefTasks,
    missedDays: prefMissedDays,
    expLevel: prefExpLevel,
    careerGoal: prefCareerGoal,
    saved: preferencesSaved,
  } = prefs;
  const setPrefGoals = (v: React.SetStateAction<string[]>) =>
    dispatchPrefs({
      type: 'SET_GOALS',
      value: typeof v === 'function' ? v(prefs.goals) : v,
    });
  const setPrefMinutes = (v: React.SetStateAction<number>) =>
    dispatchPrefs({
      type: 'SET_MINUTES',
      value: typeof v === 'function' ? v(prefs.minutes) : v,
    });
  const setPrefTasks = (v: React.SetStateAction<number>) =>
    dispatchPrefs({
      type: 'SET_TASKS',
      value: typeof v === 'function' ? v(prefs.tasks) : v,
    });
  const setPrefMissedDays = (v: React.SetStateAction<number>) =>
    dispatchPrefs({
      type: 'SET_MISSED_DAYS',
      value: typeof v === 'function' ? v(prefs.missedDays) : v,
    });
  const setPrefExpLevel = (v: React.SetStateAction<string>) =>
    dispatchPrefs({
      type: 'SET_EXP_LEVEL',
      value: typeof v === 'function' ? v(prefs.expLevel) : v,
    });
  const setPrefCareerGoal = (v: React.SetStateAction<string>) =>
    dispatchPrefs({
      type: 'SET_CAREER_GOAL',
      value: typeof v === 'function' ? v(prefs.careerGoal) : v,
    });
  const setPreferencesSaved = (v: React.SetStateAction<boolean>) =>
    dispatchPrefs({
      type: 'SET_SAVED',
      value: typeof v === 'function' ? v(prefs.saved) : v,
    });

  const initializeSpeaking = useSpeakingStore((state) => state.initializeStore);

  useEffect(() => {
    initializeBilling(currentUser?.id || null);
    initializeSpeaking();
  }, [currentUser?.id, initializeBilling, initializeSpeaking]);

  useEffect(() => {
    const billingStatus = new URLSearchParams(location.search).get('billing');
    if (billingStatus === 'success' && currentUser?.id) {
      ProductAnalyticsService.track('checkout_completed', '/profile', {
        metadata: { source: 'checkout_return' },
      });
      refreshBilling(currentUser.id);
    }
  }, [currentUser?.id, location.search, refreshBilling]);

  const prevProfileRef = useRef<string>('');
  useEffect(() => {
    if (!profile) return;
    const profileKey = JSON.stringify({
      goals: profile.goals,
      minutes: profile.dailyTarget?.minutes,
      tasks: profile.dailyTarget?.taskCount,
      missedDays: profile.weeklyTolerance?.allowedMissedDays,
      expLevel: profile.experienceLevel,
      careerGoal: profile.careerGoal,
    });
    if (prevProfileRef.current === profileKey) return;
    prevProfileRef.current = profileKey;
    dispatchPrefs({
      type: 'LOAD_PROFILE',
      goals: profile.goals || [],
      minutes: profile.dailyTarget?.minutes || 15,
      tasks: profile.dailyTarget?.taskCount || 2,
      missedDays: profile.weeklyTolerance?.allowedMissedDays || 0,
      expLevel: profile.experienceLevel || '',
      careerGoal: profile.careerGoal || '',
    });
  }, [profile]);

  const enterEditMode = () => {
    const currentName = splitDisplayName(currentUser?.displayName);
    setEditFirstName(currentName.firstName);
    setEditLastName(currentName.lastName);
    setEditProfession(profile.professionId || '');
    setEditTrack(profile.professionalTrack || 'electrical');
    setEditSubdomain(profile.electricalSubdomain || 'low-voltage');
    setEditIndustry(profile.industryId || '');
    setEditLang(profile.interfaceLanguage || 'en');
    setEditGoals(profile.communicationGoals || []);
    setIsEditMode(true);
    setError(null);
    setMessage(null);
  };

  const handleSaveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    const first = editFirstName.trim();
    const last = editLastName.trim();
    if (!first || !last) {
      setError('First and last name are required.');
      return;
    }
    try {
      setIsSaving(true);
      setError(null);
      await updateProfile({ displayName: `${first} ${last}` });
      LearningProfileRepository.updatePreferences(
        currentUser?.id ?? 'local-user',
        {
          professionId: (editProfession as ProfessionId) || null,
          professionalTrack:
            (editTrack as UserLearningProfile['professionalTrack']) ||
            undefined,
          electricalSubdomain:
            (editSubdomain as UserLearningProfile['electricalSubdomain']) ||
            undefined,
          industryId:
            (editIndustry as UserLearningProfile['industryId']) || null,
          interfaceLanguage: editLang,
          communicationGoals:
            editGoals as UserLearningProfile['communicationGoals'],
        }
      );
      if (editLang !== language) setLanguage(editLang);
      setMessage('Profile overview updated successfully.');
      setIsEditMode(false);
    } catch (saveError: unknown) {
      setError(
        getErrorMessage(saveError, 'Failed to update profile overview.')
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePreferences = (event: React.FormEvent) => {
    event.preventDefault();
    setPreferencesSaved(false);
    try {
      LearningProfileRepository.updatePreferences(
        currentUser?.id ?? 'local-user',
        {
          goals: prefGoals as unknown as UserLearningProfile['goals'],
          dailyTarget: { minutes: prefMinutes, taskCount: prefTasks },
          weeklyTolerance: { allowedMissedDays: prefMissedDays },
          experienceLevel:
            (prefExpLevel as UserLearningProfile['experienceLevel']) ||
            undefined,
          careerGoal: prefCareerGoal,
        }
      );
      setPreferencesSaved(true);
      setMessage('Learning preferences saved successfully.');
      setError(null);
    } catch {
      setError('Failed to save learning preferences.');
    }
  };

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
    } catch (checkoutError: unknown) {
      setError(
        getErrorMessage(checkoutError, 'Billing is not available in demo mode.')
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
    } catch (portalError: unknown) {
      setError(
        getErrorMessage(
          portalError,
          'Billing portal is not available in demo mode.'
        )
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
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `EngVox-local-data-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
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
    const LEARNING_KEYS = [
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
    ];
    LEARNING_KEYS.forEach((key) => storage.remove(key));
    if (currentUser?.id) {
      LearningProfileRepository.reset(currentUser.id);
    }
    storage.clear();
    window.location.assign('/start');
  };

  const completionPercent = (() => {
    let completed = 0;
    if (currentUser?.displayName) completed += 20;
    if (profile?.professionId) completed += 20;
    if (profile?.industryId) completed += 20;
    if (profile?.communicationGoals && profile.communicationGoals.length > 0)
      completed += 10;
    return completed;
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
    isEditMode,
    editFirstName,
    editLastName,
    editProfession,
    editTrack,
    editSubdomain,
    editIndustry,
    editLang,
    editGoals,
    setEditFirstName,
    setEditLastName,
    setEditProfession,
    setEditTrack,
    setEditSubdomain,
    setEditIndustry,
    setEditLang,
    setEditGoals,
    setIsEditMode,
    prefGoals,
    setPrefGoals,
    prefMinutes,
    setPrefMinutes,
    prefTasks,
    setPrefTasks,
    prefMissedDays,
    setPrefMissedDays,
    prefExpLevel,
    setPrefExpLevel,
    prefCareerGoal,
    setPrefCareerGoal,
    preferencesSaved,
    todaysCoachSessions,
    todaysAttempts,
    todaysReviews,
    uploadedDocsCount,
    voiceMinutesUsed,
    enterEditMode,
    handleSaveProfile,
    handleSavePreferences,
    handleUpgrade,
    handleManageSubscription,
    exportLocalData,
    clearLocalData,
    resetLearningProgress,
    completionPercent,
  };
};
