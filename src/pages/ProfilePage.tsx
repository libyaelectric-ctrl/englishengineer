import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { UserRound } from 'lucide-react';
import { SectionCard } from '@/shared/components/SectionCard';
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
import {
  PROFESSIONS,
  PROFESSIONAL_TRACKS,
  ELECTRICAL_SUBDOMAINS,
  INDUSTRIES,
  COMMUNICATION_GOALS,
} from '@/features/profile/profile.preferences';
import { useLearningIntelligenceStore } from '@/features/learning-intelligence';
import { ProductAnalyticsService } from '@/features/analytics/product-analytics.service';
import { useLocalizationStore } from '@/features/localization';
import { storage } from '@/shared/storage';
import {
  BillingSection,
  SecuritySection,
  SkillsProgressSection,
  LearningPreferencesSection,
} from './ProfilePage/index';

const getErrorMessage = (error: unknown, fallback: string): string =>
  error instanceof Error ? error.message : fallback;

const splitDisplayName = (displayName = '') => {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' '),
  };
};

const ProfilePage = () => {
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

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);
  const [clearConfirmation, setClearConfirmation] = useState('');

  const { profile, memory, learningState } = useLearningCockpit(currentUser?.id);
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

  // Edit Mode state for Overview Section
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editProfession, setEditProfession] = useState('');
  const [editTrack, setEditTrack] = useState('');
  const [editSubdomain, setEditSubdomain] = useState('');
  const [editIndustry, setEditIndustry] = useState('');
  const [editLang, setEditLang] = useState<'en' | 'tr'>('en');
  const [editGoals, setEditGoals] = useState<string[]>([]);

  // Learning preferences states
  const [prefGoals, setPrefGoals] = useState<string[]>([]);
  const [prefMinutes, setPrefMinutes] = useState(15);
  const [prefTasks, setPrefTasks] = useState(2);
  const [prefMissedDays, setPrefMissedDays] = useState(0);
  const [prefExpLevel, setPrefExpLevel] = useState('');
  const [prefCareerGoal, setPrefCareerGoal] = useState('');
  const [preferencesSaved, setPreferencesSaved] = useState(false);

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

  useEffect(() => {
    if (profile) {
      setPrefGoals(profile.goals || []);
      setPrefMinutes(profile.dailyTarget?.minutes || 15);
      setPrefTasks(profile.dailyTarget?.taskCount || 2);
      setPrefMissedDays(profile.weeklyTolerance?.allowedMissedDays || 0);
      setPrefExpLevel(profile.experienceLevel || '');
      setPrefCareerGoal(profile.careerGoal || '');
    }
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
            (editTrack as UserLearningProfile['professionalTrack']) || undefined,
          electricalSubdomain:
            (editSubdomain as UserLearningProfile['electricalSubdomain']) || undefined,
          industryId: (editIndustry as UserLearningProfile['industryId']) || null,
          interfaceLanguage: editLang,
          communicationGoals: editGoals as UserLearningProfile['communicationGoals'],
        }
      );
      if (editLang !== language) setLanguage(editLang);
      setMessage('Profile overview updated successfully.');
      setIsEditMode(false);
    } catch (saveError: unknown) {
      setError(getErrorMessage(saveError, 'Failed to update profile overview.'));
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
          experienceLevel: (prefExpLevel as UserLearningProfile['experienceLevel']) || undefined,
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
      setError('Demo mode: Billing is available after connecting Supabase and Stripe.');
      return;
    }
    try {
      setError(null);
      ProductAnalyticsService.track('checkout_started', '/profile', {
        metadata: { plan: 'pro', source: 'user' },
      });
      await startCheckout(currentUser.id, currentUser.email, 'pro');
    } catch (checkoutError: unknown) {
      setError(getErrorMessage(checkoutError, 'Billing is not available in demo mode.'));
    }
  };

  const handleManageSubscription = async () => {
    if (!currentUser) return;
    if (currentUser.id.startsWith('demo_engineer_')) {
      setError('Demo mode: Subscription management available after connecting Supabase + Stripe.');
      return;
    }
    try {
      setError(null);
      await openCustomerPortal(currentUser.id);
    } catch (portalError: unknown) {
      setError(getErrorMessage(portalError, 'Billing portal is not available in demo mode.'));
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
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
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

  const completionPercent = (() => {
    let completed = 0;
    if (currentUser?.displayName) completed += 20;
    if (profile?.professionId) completed += 20;
    if (profile?.industryId) completed += 20;
    if (profile?.communicationGoals && profile.communicationGoals.length > 0) completed += 10;
    return completed;
  })();

  return (
    <div className="mx-auto max-w-5xl space-y-10 animate-in fade-in duration-300">
      {/* Header */}
      <header className="flex flex-col gap-4 border-b border-border-soft pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-medium text-foreground sm:text-3xl">
              {currentUser?.displayName || 'Demo Engineer'}
            </h1>
            <p className="mt-1 text-xs font-medium text-muted-copy">
              {PROFESSIONS.find((p) => p.id === profile.professionId)?.label || 'Engineering Professional'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-primary">
              {subscription.planId === 'pro' ? 'Pro Access' : 'Free Trial'}
            </span>
            <span className="rounded-full border border-border-soft bg-surface px-3 py-1 text-[10px] font-medium text-muted-copy">
              Profile Completion: {completionPercent}%
            </span>
          </div>
        </div>
        <p className="text-xs leading-5 text-muted-copy max-w-2xl">
          Manage your professional profile, learning preferences and EngVox access.
        </p>
      </header>

      {/* Alert Banner */}
      {(message || error || billingError) && (
        <div
          role="status"
          className={`rounded-xl border p-4 text-xs leading-5 ${
            error || billingError
              ? 'border-error/20 bg-error/5 text-error'
              : 'border-success/25 bg-success/10 text-success'
          }`}
        >
          {error || billingError || message}
        </div>
      )}

      {/* Overview Section */}
      {activeSection === 'overview' && (
        <section id="overview" className="animate-in fade-in duration-200 max-h-[calc(100vh-12rem)] overflow-y-auto">
          <SectionCard
            title="Profile Overview"
            subtitle="Your professional and regional classification metadata"
            icon={UserRound}
          >
            {!isEditMode ? (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    ['Full Name', currentUser?.displayName || 'Not Provided'],
                    ['Profession / Role', PROFESSIONS.find((p) => p.id === profile.professionId)?.label || 'Not Selected'],
                    ['Engineering Discipline', PROFESSIONAL_TRACKS.find((t) => t.id === profile.professionalTrack)?.label || 'Electrical Engineering'],
                    ...(profile.professionalTrack === 'electrical'
                      ? [['Electrical Subdomain', ELECTRICAL_SUBDOMAINS.find((s) => s.id === profile.electricalSubdomain)?.label || 'Not Selected']]
                      : []),
                    ['Industry Sectors', INDUSTRIES.find((i) => i.id === profile.industryId)?.label || 'Not Selected'],
                    ['Interface Language', profile.interfaceLanguage === 'tr' ? 'Türkçe' : 'English'],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-border-soft bg-surface p-4">
                      <span className="text-[9px] font-medium uppercase tracking-wider text-muted-copy">{label}</span>
                      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl border border-border-soft bg-surface p-4">
                  <span className="text-[9px] font-medium uppercase tracking-wider text-muted-copy">Communication Goals</span>
                  {profile.communicationGoals && profile.communicationGoals.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {profile.communicationGoals.map((gId) => (
                        <span key={gId} className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-medium text-primary">
                          {COMMUNICATION_GOALS.find((g) => g.id === gId)?.label || gId}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-muted-copy">No goals set yet.</p>
                  )}
                </div>
                <div className="flex justify-end">
                  <button onClick={enterEditMode} className="inline-flex items-center gap-1.5 rounded-lg border border-border-soft bg-surface px-4 py-2 text-xs font-medium text-foreground hover:bg-background transition-colors">
                    Edit Profile
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                {/* Edit form fields abbreviated for orchestrator */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block space-y-1.5 text-xs font-medium text-foreground">
                    First Name
                    <input value={editFirstName} onChange={(e) => setEditFirstName(e.target.value)} className="w-full rounded-lg border border-border-soft bg-surface px-3 py-2 text-xs text-foreground outline-none" />
                  </label>
                  <label className="block space-y-1.5 text-xs font-medium text-foreground">
                    Last Name
                    <input value={editLastName} onChange={(e) => setEditLastName(e.target.value)} className="w-full rounded-lg border border-border-soft bg-surface px-3 py-2 text-xs text-foreground outline-none" />
                  </label>
                </div>
                <div className="flex items-center justify-end gap-3 border-t border-border-soft pt-4">
                  <button type="button" onClick={() => setIsEditMode(false)} className="text-xs font-medium text-muted-copy hover:text-foreground">Cancel</button>
                  <button type="submit" disabled={isSaving} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-white hover:bg-primary/95 transition-colors disabled:opacity-50">
                    {isSaving ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </form>
            )}
          </SectionCard>
        </section>
      )}

      {/* Skills Section */}
      {activeSection === 'skills' && (
        <SkillsProgressSection
          profile={profile}
          memory={memory}
          learningState={learningState}
          mistakeLog={mistakeLog}
        />
      )}

      {/* Preferences Section */}
      {activeSection === 'preferences' && (
        <LearningPreferencesSection
          prefGoals={prefGoals}
          setPrefGoals={setPrefGoals}
          prefMinutes={prefMinutes}
          setPrefMinutes={setPrefMinutes}
          prefTasks={prefTasks}
          setPrefTasks={setPrefTasks}
          prefMissedDays={prefMissedDays}
          setPrefMissedDays={setPrefMissedDays}
          prefExpLevel={prefExpLevel}
          setPrefExpLevel={setPrefExpLevel}
          prefCareerGoal={prefCareerGoal}
          setPrefCareerGoal={setPrefCareerGoal}
          preferencesSaved={preferencesSaved}
          onSave={handleSavePreferences}
        />
      )}

      {/* Billing Section */}
      {activeSection === 'billing' && (
        <BillingSection
          subscription={subscription}
          providerStatus={providerStatus}
          isBillingLoading={isBillingLoading}
          billingError={billingError}
          onUpgrade={handleUpgrade}
          onOpenPortal={handleManageSubscription}
          todaysCoachSessions={todaysCoachSessions}
          todaysAttempts={todaysAttempts}
          todaysReviews={todaysReviews}
          uploadedDocsCount={uploadedDocsCount}
          voiceMinutesUsed={voiceMinutesUsed}
        />
      )}

      {/* Security Section */}
      {activeSection === 'security' && (
        <SecuritySection
          providerMode={providerMode}
          showClearConfirmation={showClearConfirmation}
          setShowClearConfirmation={setShowClearConfirmation}
          clearConfirmation={clearConfirmation}
          setClearConfirmation={setClearConfirmation}
          exportLocalData={exportLocalData}
          clearLocalData={clearLocalData}
        />
      )}
    </div>
  );
};

export default ProfilePage;
