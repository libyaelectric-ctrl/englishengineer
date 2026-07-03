import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Award,
  CreditCard,
  Download,
  Gauge,
  Save,
  Target,
  Trash2,
  UserRound,
  ShieldCheck,
  ChevronDown,
  Edit3,
  XCircle,
  ArrowRight,
} from 'lucide-react';
import { SectionCard } from '@/shared/components/SectionCard';
import { Button } from '@/shared/components/Button';
import { CloudSyncStatusPanel, useAuthStore } from '@/features/auth';
import { BillingStatusPanel, useBillingStore } from '@/features/billing';
import {
  LearningProfileEngine,
  LearningProfileRepository,
  SKILL_NAMES,
  useLearningCockpit,
} from '@/features/profile';
import {
  LEARNING_GOALS,
  PROFESSIONS,
  INDUSTRIES,
  COMMUNICATION_GOALS,
  DAILY_DURATION_OPTIONS,
  DAILY_TASK_COUNT_OPTIONS,
  PROFESSIONAL_TRACKS,
  ELECTRICAL_SUBDOMAINS,
  EXPERIENCE_LEVELS,
  COUNTRIES,
  TIMEZONES,
} from '@/features/profile/profile.preferences';
import { ProgressBar } from '@/shared/components/ProgressBar';
import { useLearningIntelligenceStore } from '@/features/learning-intelligence';
import { ProductAnalyticsService } from '@/features/analytics/product-analytics.service';
import {
  AVAILABLE_INTERFACE_LANGUAGES,
  useLocalizationStore,
} from '@/features/localization';
import { storage } from '@/shared/storage';
import { cn } from '@/shared/utils/cn';

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

  // Cockpit learning context
  const { profile, memory, learningState } = useLearningCockpit(
    currentUser?.id
  );
  const mistakeLog = useLearningIntelligenceStore((state) => state.mistakeLog);
  const language = useLocalizationStore((state) => state.language);
  const setLanguage = useLocalizationStore((state) => state.setLanguage);

  // Edit Mode state for Overview Section
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editProfession, setEditProfession] = useState('');
  const [editTrack, setEditTrack] = useState('');
  const [editSubdomain, setEditSubdomain] = useState('');
  const [editIndustry, setEditIndustry] = useState('');
  const [editCountry, setEditCountry] = useState('');
  const [editTimezone, setEditTimezone] = useState('');
  const [editLang, setEditLang] = useState<'en' | 'tr'>('en');
  const [editGoals, setEditGoals] = useState<any[]>([]);

  // Learning preferences states
  const [prefGoals, setPrefGoals] = useState<any[]>([]);
  const [prefMinutes, setPrefMinutes] = useState(15);
  const [prefTasks, setPrefTasks] = useState(2);
  const [prefMissedDays, setPrefMissedDays] = useState(0);
  const [prefExpLevel, setPrefExpLevel] = useState('');
  const [prefCareerGoal, setPrefCareerGoal] = useState('');
  const [preferencesSaved, setPreferencesSaved] = useState(false);

  // Active section for sub-navigation
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    initializeBilling(currentUser?.id || null);
  }, [currentUser?.id, initializeBilling]);

  useEffect(() => {
    const billingStatus = new URLSearchParams(location.search).get('billing');
    if (billingStatus === 'success' && currentUser?.id) {
      ProductAnalyticsService.track('checkout_completed', '/profile', {
        metadata: { source: 'checkout_return' },
      });
      refreshBilling(currentUser.id);
    }
  }, [currentUser?.id, location.search, refreshBilling]);

  // Load preferences from profile
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

  // Sync edit states when enters edit mode
  const enterEditMode = () => {
    const currentName = splitDisplayName(currentUser?.displayName);
    setEditFirstName(currentName.firstName);
    setEditLastName(currentName.lastName);
    setEditProfession(profile.professionId || '');
    setEditTrack(profile.professionalTrack || 'electrical');
    setEditSubdomain(profile.electricalSubdomain || 'low-voltage');
    setEditIndustry(profile.industryId || '');
    setEditCountry(profile.country || 'Türkiye');
    setEditTimezone(profile.timezone || 'Europe/Istanbul');
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

      // Update display name
      await updateProfile({ displayName: `${first} ${last}` });

      // Update profile attributes
      LearningProfileRepository.updatePreferences(
        currentUser?.id ?? 'local-user',
        {
          professionId: (editProfession as any) || null,
          professionalTrack: editTrack as any,
          electricalSubdomain: editSubdomain as any,
          industryId: (editIndustry as any) || null,
          country: editCountry,
          timezone: editTimezone,
          interfaceLanguage: editLang,
          communicationGoals: editGoals,
        }
      );

      if (editLang !== language) {
        setLanguage(editLang);
      }

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
          goals: prefGoals,
          dailyTarget: { minutes: prefMinutes, taskCount: prefTasks },
          weeklyTolerance: { allowedMissedDays: prefMissedDays },
          experienceLevel: prefExpLevel as any,
          careerGoal: prefCareerGoal,
        }
      );
      setPreferencesSaved(true);
      setMessage('Learning preferences saved successfully.');
      setError(null);
    } catch (err) {
      setError('Failed to save learning preferences.');
    }
  };

  const handleUpgrade = async () => {
    if (!currentUser) return;
    if (currentUser.id.startsWith('demo_engineer_')) {
      setError('Demo profiles do not have billing privileges.');
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
        getErrorMessage(checkoutError, 'Checkout session could not be created.')
      );
    }
  };

  const handleManageSubscription = async () => {
    if (!currentUser) return;
    if (currentUser.id.startsWith('demo_engineer_')) {
      setError('Demo profiles do not have billing privileges.');
      return;
    }
    try {
      setError(null);
      await openCustomerPortal(currentUser.id);
    } catch (portalError: unknown) {
      setError(
        getErrorMessage(portalError, 'Customer portal could not be opened.')
      );
    }
  };

  const exportLocalData = () => {
    const payload = {
      product: 'EngineerOS',
      version: '4.0.1',
      exportedAt: new Date().toISOString(),
      scope: 'Local EngineerOS data stored on this device',
      data: storage.exportAll(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `engineeros-local-data-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage('Local EngineerOS data export created.');
    setError(null);
  };

  const clearLocalData = async () => {
    if (providerMode !== 'local' || clearConfirmation !== 'CLEAR') return;
    await logout();
    storage.clear();
    window.location.assign('/start');
  };

  // Tab change helper
  const scrollTo = (id: string) => {
    setActiveSection(id);
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const calculateCompletionPercent = () => {
    let completed = 0;
    if (currentUser?.displayName) completed += 20;
    if (profile?.professionId) completed += 20;
    if (profile?.industryId) completed += 20;
    if (profile?.country) completed += 15;
    if (profile?.timezone) completed += 15;
    if (profile?.communicationGoals && profile.communicationGoals.length > 0)
      completed += 10;
    return completed;
  };

  const completionPercent = calculateCompletionPercent();
  const badges = LearningProfileEngine.getBadges(profile, memory);
  const completedTasks = SKILL_NAMES.reduce(
    (total, skill) => total + profile.skills[skill].completedTasks,
    0
  );
  const weeklyCompleted = learningState.studySessions.filter((session) => {
    const timestamp = new Date(session.timestamp).getTime();
    return timestamp >= Date.now() - 7 * 24 * 60 * 60 * 1000;
  }).length;
  const vocabularyMastery =
    memory.total > 0 ? (memory.mastered / memory.total) * 100 : 0;

  return (
    <div className="mx-auto max-w-5xl space-y-10 animate-in fade-in duration-300">
      {/* Redesigned Header: Profile overview metadata and status */}
      <header className="flex flex-col gap-4 border-b border-border-soft pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-slate-950 sm:text-3xl">
              {currentUser?.displayName || 'Demo Engineer'}
            </h1>
            <p className="mt-1 text-xs font-semibold text-muted-copy">
              {PROFESSIONS.find((p) => p.id === profile.professionId)?.label ||
                'Engineering Professional'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
              {subscription.planId === 'pro' ? 'Pro Access' : 'Free Trial'}
            </span>
            <span className="rounded-full border border-border-soft bg-surface px-3 py-1 text-[10px] font-bold text-muted-copy">
              Profile Completion: {completionPercent}%
            </span>
          </div>
        </div>
        <p className="text-xs leading-5 text-slate-600 max-w-2xl">
          Manage your professional profile, learning preferences and EngineerOS
          access.
        </p>
      </header>

      {/* Sticky Sub-navigation */}
      <nav
        aria-label="Profile section directory"
        className="sticky top-14 z-20 flex overflow-x-auto gap-1.5 border-b border-border-soft bg-background/95 backdrop-blur-md py-3 hide-scrollbar select-none"
      >
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'skills', label: 'Skills & Progress' },
          { id: 'preferences', label: 'Preferences' },
          { id: 'billing', label: 'Billing' },
          { id: 'security', label: 'Security & Data' },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => scrollTo(item.id)}
            className={cn(
              'rounded-[8px] px-3.5 py-1.5 text-xs font-semibold transition-all shrink-0',
              activeSection === item.id
                ? 'bg-primary text-white shadow-sm'
                : 'text-muted-copy hover:bg-surface-hover hover:text-foreground'
            )}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* Alert Messages Banner */}
      {(message || error || billingError) && (
        <div
          role="status"
          className={`rounded-card border p-4 text-xs leading-5 ${
            error || billingError
              ? 'border-error/20 bg-error/5 text-error'
              : 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400'
          }`}
        >
          {error || billingError || message}
        </div>
      )}

      {/* SECTION 1: Profile Overview */}
      {activeSection === 'overview' && (
        <section
          id="overview"
          className="scroll-mt-36 animate-in fade-in duration-200"
        >
          <SectionCard
            title="Profile Overview"
            subtitle="Your professional and regional classification metadata"
            icon={UserRound}
          >
            {!isEditMode ? (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="rounded-card border border-border-soft bg-surface/30 p-4">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-muted-copy">
                      Full Name
                    </span>
                    <p className="mt-1 text-sm font-bold text-foreground">
                      {currentUser?.displayName || 'Not Provided'}
                    </p>
                  </div>
                  <div className="rounded-card border border-border-soft bg-surface/30 p-4">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-muted-copy">
                      Profession / Role
                    </span>
                    <p className="mt-1 text-sm font-bold text-foreground">
                      {PROFESSIONS.find((p) => p.id === profile.professionId)
                        ?.label || 'Not Selected'}
                    </p>
                  </div>
                  <div className="rounded-card border border-border-soft bg-surface/30 p-4">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-muted-copy">
                      Engineering Discipline
                    </span>
                    <p className="mt-1 text-sm font-bold text-foreground">
                      {PROFESSIONAL_TRACKS.find(
                        (t) => t.id === profile.professionalTrack
                      )?.label || 'Electrical Engineering'}
                    </p>
                  </div>
                  {profile.professionalTrack === 'electrical' && (
                    <div className="rounded-card border border-border-soft bg-surface/30 p-4">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-muted-copy">
                        Electrical Subdomain
                      </span>
                      <p className="mt-1 text-sm font-bold text-foreground">
                        {ELECTRICAL_SUBDOMAINS.find(
                          (s) => s.id === profile.electricalSubdomain
                        )?.label || 'Not Selected'}
                      </p>
                    </div>
                  )}
                  <div className="rounded-card border border-border-soft bg-surface/30 p-4">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-muted-copy">
                      Industry Sectors
                    </span>
                    <p className="mt-1 text-sm font-bold text-foreground">
                      {INDUSTRIES.find((i) => i.id === profile.industryId)
                        ?.label || 'Not Selected'}
                    </p>
                  </div>
                  <div className="rounded-card border border-border-soft bg-surface/30 p-4">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-muted-copy">
                      Country / Region
                    </span>
                    <p className="mt-1 text-sm font-bold text-foreground">
                      {profile.country || 'Not Selected'}
                    </p>
                  </div>
                  <div className="rounded-card border border-border-soft bg-surface/30 p-4">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-muted-copy">
                      Timezone
                    </span>
                    <p className="mt-1 text-sm font-mono text-foreground">
                      {profile.timezone || 'Not Selected'}
                    </p>
                  </div>
                  <div className="rounded-card border border-border-soft bg-surface/30 p-4">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-muted-copy">
                      Interface Language
                    </span>
                    <p className="mt-1 text-sm font-bold text-foreground">
                      {profile.interfaceLanguage === 'tr'
                        ? 'Türkçe'
                        : 'English'}
                    </p>
                  </div>
                </div>

                <div className="rounded-card border border-border-soft bg-surface/30 p-4">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-muted-copy">
                    Communication Goals
                  </span>
                  {profile.communicationGoals &&
                  profile.communicationGoals.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {profile.communicationGoals.map((gId) => (
                        <span
                          key={gId}
                          className="rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-[10px] font-semibold text-primary"
                        >
                          {COMMUNICATION_GOALS.find((goal) => goal.id === gId)
                            ?.label || gId}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-1 text-xs text-muted-copy">
                      No goals selected.
                    </p>
                  )}
                </div>

                <div className="flex justify-end border-t border-border-soft pt-4">
                  <Button
                    type="button"
                    onClick={enterEditMode}
                    className="text-xs min-h-9"
                  >
                    <Edit3 className="h-3.5 w-3.5 mr-1" /> Edit Profile
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveProfile} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="edit-first-name"
                      className="text-xs font-bold text-foreground"
                    >
                      First Name
                    </label>
                    <input
                      id="edit-first-name"
                      value={editFirstName}
                      onChange={(event) => setEditFirstName(event.target.value)}
                      className="w-full rounded-input border border-border-soft bg-surface px-3 py-2 text-xs text-foreground outline-none focus:border-border-hover"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label
                      htmlFor="edit-last-name"
                      className="text-xs font-bold text-foreground"
                    >
                      Last Name
                    </label>
                    <input
                      id="edit-last-name"
                      value={editLastName}
                      onChange={(event) => setEditLastName(event.target.value)}
                      className="w-full rounded-input border border-border-soft bg-surface px-3 py-2 text-xs text-foreground outline-none focus:border-border-hover"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block space-y-1.5 text-xs font-bold text-foreground">
                    Profession / Role
                    <select
                      value={editProfession}
                      onChange={(event) =>
                        setEditProfession(event.target.value)
                      }
                      className="w-full rounded-input border border-border-soft bg-surface px-3 py-2 text-xs font-semibold text-foreground outline-none"
                    >
                      <option value="">Select profession</option>
                      {PROFESSIONS.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block space-y-1.5 text-xs font-bold text-foreground">
                    Engineering Track
                    <select
                      value={editTrack}
                      onChange={(event) => setEditTrack(event.target.value)}
                      className="w-full rounded-input border border-border-soft bg-surface px-3 py-2 text-xs font-semibold text-foreground outline-none"
                    >
                      {PROFESSIONAL_TRACKS.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  {editTrack === 'electrical' && (
                    <label className="block space-y-1.5 text-xs font-bold text-foreground">
                      Electrical Subdomain
                      <select
                        value={editSubdomain}
                        onChange={(event) =>
                          setEditSubdomain(event.target.value)
                        }
                        className="w-full rounded-input border border-border-soft bg-surface px-3 py-2 text-xs font-semibold text-foreground outline-none"
                      >
                        {ELECTRICAL_SUBDOMAINS.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}

                  <label className="block space-y-1.5 text-xs font-bold text-foreground">
                    Industry Sector
                    <select
                      value={editIndustry}
                      onChange={(event) => setEditIndustry(event.target.value)}
                      className="w-full rounded-input border border-border-soft bg-surface px-3 py-2 text-xs font-semibold text-foreground outline-none"
                    >
                      <option value="">Select industry</option>
                      {INDUSTRIES.map((i) => (
                        <option key={i.id} value={i.id}>
                          {i.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block space-y-1.5 text-xs font-bold text-foreground">
                    Country / Region
                    <select
                      value={editCountry}
                      onChange={(event) => setEditCountry(event.target.value)}
                      className="w-full rounded-input border border-border-soft bg-surface px-3 py-2 text-xs font-semibold text-foreground outline-none"
                    >
                      {COUNTRIES.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block space-y-1.5 text-xs font-bold text-foreground">
                    Timezone
                    <select
                      value={editTimezone}
                      onChange={(event) => setEditTimezone(event.target.value)}
                      className="w-full rounded-input border border-border-soft bg-surface px-3 py-2 text-xs font-mono text-foreground outline-none"
                    >
                      {TIMEZONES.map((tz) => (
                        <option key={tz} value={tz}>
                          {tz}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block space-y-1.5 text-xs font-bold text-foreground">
                    Interface Language
                    <select
                      value={editLang}
                      onChange={(event) =>
                        setEditLang(event.target.value as 'en' | 'tr')
                      }
                      className="w-full rounded-input border border-border-soft bg-surface px-3 py-2 text-xs font-semibold text-foreground outline-none"
                    >
                      {AVAILABLE_INTERFACE_LANGUAGES.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div>
                  <span className="block text-xs font-bold text-foreground">
                    Communication Goals
                  </span>
                  <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
                    {COMMUNICATION_GOALS.map((goal) => {
                      const isChecked = editGoals.includes(goal.id);
                      return (
                        <label
                          key={goal.id}
                          className={`flex cursor-pointer items-center gap-2 rounded-card border px-3 py-2 text-xs font-semibold transition-all ${
                            isChecked
                              ? 'border-primary/40 bg-primary/10 text-foreground'
                              : 'border-border-soft bg-surface text-muted-copy hover:border-border-hover'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              setEditGoals((curr) =>
                                curr.includes(goal.id)
                                  ? curr.filter((id) => id !== goal.id)
                                  : [...curr, goal.id]
                              );
                            }}
                            className="h-3.5 w-3.5 accent-primary"
                          />
                          {goal.label}
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-border-soft pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSaving}
                    onClick={() => setIsEditMode(false)}
                    className="text-xs"
                  >
                    <XCircle className="h-3.5 w-3.5 mr-1" /> Cancel
                  </Button>
                  <Button type="submit" disabled={isSaving} className="text-xs">
                    <Save className="h-3.5 w-3.5 mr-1" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            )}
          </SectionCard>
        </section>
      )}

      {/* SECTION 2: Skills and Progress */}
      {activeSection === 'skills' && (
        <section
          id="skills"
          className="scroll-mt-36 animate-in fade-in duration-200"
        >
          <SectionCard
            title="Skills & Progress"
            subtitle="Your estimated CEFR levels and study progress breakdown"
            icon={Gauge}
          >
            {/* Unified Progress Cockpit */}
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {SKILL_NAMES.map((skill) => {
                const skillProfile = profile.skills[skill];
                const isSimulated =
                  skill === 'listening' || skill === 'speaking';
                return (
                  <article
                    key={skill}
                    className="rounded-card border border-border-soft bg-surface p-4 relative"
                  >
                    <div className="flex justify-between items-start">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-900 capitalize">
                        {skill}
                      </p>
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold text-primary">
                        {skillProfile.cefrBand} ({skillProfile.elo} ELO)
                      </span>
                    </div>

                    <p className="mt-2 text-[10px] text-muted-copy leading-4">
                      {isSimulated
                        ? skill === 'listening'
                          ? 'Simulated listening talks. Available for practice.'
                          : 'Simulated site meeting discussions. Available for practice.'
                        : `Accuracy: ${skillProfile.accuracy}%. Completed Tasks: ${skillProfile.completedTasks}.`}
                    </p>

                    <ProgressBar
                      value={skillProfile.progressToNextBand}
                      showValue={false}
                      color="cyan"
                      className="mt-4"
                    />
                  </article>
                );
              })}
            </div>

            {/* Quick Metrics */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {[
                ['Streak', `${learningState.streak} days`],
                ['Missions', completedTasks],
                ['Weekly Goal', `${weeklyCompleted}/${profile.weeklyGoal}`],
                ['Mastered words', memory.mastered],
                ['Weak words', memory.weakWords],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-card border border-border-soft bg-surface/30 p-3"
                >
                  <p className="text-[9px] font-bold uppercase tracking-wider text-muted-copy">
                    {label}
                  </p>
                  <p className="mt-1 text-base font-bold text-foreground">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            {/* Vocabulary Progress */}
            <div className="mt-6 rounded-card border border-border-soft bg-surface/20 p-4">
              <span className="text-[9px] font-bold uppercase tracking-wider text-muted-copy">
                Vocabulary Mastery
              </span>
              <div className="mt-2 flex items-center justify-between gap-3 text-xs font-bold">
                <span>
                  {memory.mastered} of {memory.total} terms mastered
                </span>
                <span className="text-primary">
                  {memory.dueToday} terms due today
                </span>
              </div>
              <ProgressBar
                value={vocabularyMastery}
                color="emerald"
                className="mt-3"
              />
            </div>

            {/* Unlocked Badges */}
            <div className="mt-6">
              <span className="text-[9px] font-bold uppercase tracking-wider text-muted-copy">
                Achievements & Badges
              </span>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                {badges
                  .filter((b) => b.unlocked)
                  .slice(0, 4)
                  .map((badge) => (
                    <div
                      key={badge.id}
                      className="flex items-start gap-3 rounded-card border border-emerald-500/20 bg-emerald-500/5 p-3.5"
                    >
                      <Award className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-foreground">
                          {badge.label}
                        </p>
                        <p className="mt-0.5 text-[10px] text-slate-600 leading-4">
                          {badge.description}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Recent Mistakes summary */}
            <div className="mt-6">
              <span className="text-[9px] font-bold uppercase tracking-wider text-muted-copy">
                Mistake Log Summary
              </span>
              {mistakeLog.length === 0 ? (
                <p className="mt-2 rounded-card border border-dashed border-border-soft bg-surface p-4 text-center text-xs text-muted-copy">
                  No mistakes recorded yet.
                </p>
              ) : (
                <div className="mt-2 space-y-2">
                  {mistakeLog.slice(0, 2).map((m) => (
                    <div
                      key={m.id}
                      className="rounded-card border border-border-soft bg-surface p-3 text-xs"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-[9px] text-muted-copy uppercase">
                          {m.category}
                        </span>
                        <span className="text-[9px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">
                          {(m.repetitionCount ?? 1) >= 3
                            ? 'Critical'
                            : `${m.repetitionCount ?? 1}x`}
                        </span>
                      </div>
                      <p className="mt-1 font-bold text-slate-800">
                        "{m.originalText}"
                      </p>
                      <p className="mt-0.5 text-muted-copy">
                        Correction: {m.correction}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Detailed Analytics CTA */}
            <div className="mt-6 flex justify-end border-t border-border-soft pt-4">
              <Link
                to="/analytics"
                className="inline-flex min-h-9 items-center gap-1.5 rounded-[12px] px-4 text-xs font-bold text-primary hover:bg-primary/5 transition-colors"
              >
                View Detailed Analytics <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </SectionCard>
        </section>
      )}

      {/* SECTION 3: Learning Preferences */}
      {activeSection === 'preferences' && (
        <section
          id="preferences"
          className="scroll-mt-36 animate-in fade-in duration-200"
        >
          <SectionCard
            title="Learning Preferences"
            subtitle="Manage your learning goals, target pace, and training rhythm"
            icon={Target}
          >
            <form onSubmit={handleSavePreferences} className="space-y-6">
              <fieldset>
                <legend className="text-xs font-bold text-foreground">
                  Learning Goals
                </legend>
                <p className="mt-0.5 text-[10px] text-muted-copy">
                  Select one or more goals.
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  {LEARNING_GOALS.map((goal) => {
                    const isChecked = prefGoals.includes(goal.id);
                    return (
                      <label
                        key={goal.id}
                        className={`flex cursor-pointer items-center gap-2 rounded-card border px-3 py-2 text-xs font-semibold transition-all ${
                          isChecked
                            ? 'border-primary/40 bg-primary/10 text-foreground'
                            : 'border-border-soft bg-surface text-muted-copy hover:border-border-hover'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            setPrefGoals((curr) =>
                              curr.includes(goal.id)
                                ? curr.filter((id) => id !== goal.id)
                                : [...curr, goal.id]
                            );
                          }}
                          className="h-3.5 w-3.5 accent-primary"
                        />
                        {goal.label}
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-1.5 text-xs font-bold text-foreground">
                  Daily Study Target (Minutes)
                  <select
                    value={prefMinutes}
                    onChange={(event) =>
                      setPrefMinutes(Number(event.target.value))
                    }
                    className="w-full rounded-input border border-border-soft bg-surface px-3 py-2 text-xs font-semibold text-foreground outline-none"
                  >
                    {DAILY_DURATION_OPTIONS.map((val) => (
                      <option key={val} value={val}>
                        {val} minutes
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block space-y-1.5 text-xs font-bold text-foreground">
                  Daily Task Limit
                  <select
                    value={prefTasks}
                    onChange={(event) =>
                      setPrefTasks(Number(event.target.value))
                    }
                    className="w-full rounded-input border border-border-soft bg-surface px-3 py-2 text-xs font-semibold text-foreground outline-none"
                  >
                    {DAILY_TASK_COUNT_OPTIONS.map((val) => (
                      <option key={val} value={val}>
                        {val} tasks
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {/* Collapsible Advanced Preferences */}
              <details className="group border border-border-soft rounded-card bg-surface/10 p-4">
                <summary className="flex cursor-pointer items-center justify-between font-bold text-xs text-slate-800 list-none select-none">
                  <span>Advanced learning preferences</span>
                  <ChevronDown className="h-4 w-4 text-slate-500 transition-transform group-open:rotate-180" />
                </summary>

                <div className="mt-4 space-y-4 pt-3 border-t border-border-soft">
                  <label className="block space-y-1.5 text-xs font-bold text-foreground">
                    Weekly Streak Tolerance (Allowed Missed Days)
                    <select
                      value={prefMissedDays}
                      onChange={(event) =>
                        setPrefMissedDays(Number(event.target.value))
                      }
                      className="w-full rounded-input border border-border-soft bg-surface px-3 py-2 text-xs font-semibold text-foreground outline-none"
                    >
                      {[0, 1, 2, 3].map((val) => (
                        <option key={val} value={val}>
                          {val} missed {val === 1 ? 'day' : 'days'}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block space-y-1.5 text-xs font-bold text-foreground">
                    Experience Level
                    <select
                      value={prefExpLevel}
                      onChange={(event) => setPrefExpLevel(event.target.value)}
                      className="w-full rounded-input border border-border-soft bg-surface px-3 py-2 text-xs font-semibold text-foreground outline-none"
                    >
                      <option value="">Select level</option>
                      {EXPERIENCE_LEVELS.map((el) => (
                        <option key={el.id} value={el.id}>
                          {el.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="pref-career-goal"
                      className="text-xs font-bold text-foreground"
                    >
                      Target Career Goal
                    </label>
                    <input
                      id="pref-career-goal"
                      value={prefCareerGoal}
                      onChange={(event) =>
                        setPrefCareerGoal(event.target.value)
                      }
                      placeholder="e.g. Lead site meetings with confidence"
                      className="w-full rounded-input border border-border-soft bg-surface px-3 py-2 text-xs text-foreground outline-none"
                    />
                  </div>
                </div>
              </details>

              <div className="flex items-center justify-end gap-3 border-t border-border-soft pt-4">
                {preferencesSaved && (
                  <span className="text-xs font-bold text-emerald-500">
                    Saved
                  </span>
                )}
                <Button type="submit" className="text-xs min-h-9">
                  <Save className="h-3.5 w-3.5 mr-1" /> Save Preferences
                </Button>
              </div>
            </form>
          </SectionCard>
        </section>
      )}

      {/* SECTION 4: Account and Billing */}
      {activeSection === 'billing' && (
        <section
          id="billing"
          className="scroll-mt-36 animate-in fade-in duration-200"
        >
          <SectionCard
            title="Account & Billing"
            subtitle="Your subscription details, Stripe billing records, and cloud entitlements"
            icon={CreditCard}
          >
            <div className="space-y-6">
              <BillingStatusPanel
                subscription={subscription}
                providerStatus={providerStatus}
                isLoading={isBillingLoading}
                error={billingError}
                onUpgrade={handleUpgrade}
                onOpenPortal={handleManageSubscription}
              />

              {/* Quota and Usage Summary */}
              <div className="rounded-card border border-border-soft bg-surface/30 p-4 space-y-4">
                <span className="text-[9px] font-bold uppercase tracking-wider text-muted-copy">
                  Usage and Quota limits
                </span>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <div className="flex justify-between text-xs font-semibold">
                      <span>AI Writing corrections</span>
                      <span>
                        {subscription.planId === 'pro'
                          ? 'Unlimited'
                          : '5 / month'}
                      </span>
                    </div>
                    <ProgressBar
                      value={subscription.planId === 'pro' ? 100 : 40}
                      color="cyan"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-semibold">
                      <span>Active Scenario memory</span>
                      <span>
                        {subscription.planId === 'pro'
                          ? 'Unlimited'
                          : '100 items'}
                      </span>
                    </div>
                    <ProgressBar
                      value={subscription.planId === 'pro' ? 100 : 25}
                      color="emerald"
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>
        </section>
      )}

      {/* SECTION 5: Security, Privacy and Data */}
      {activeSection === 'security' && (
        <section
          id="security"
          className="scroll-mt-36 animate-in fade-in duration-200"
        >
          <SectionCard
            title="Security, Privacy & Data"
            subtitle="Local storage data administration, privacy controls, and backup operations"
            icon={ShieldCheck}
          >
            <div className="space-y-6">
              {/* Cloud Sync section */}
              <div className="rounded-card border border-border-soft bg-surface/20 p-4">
                <span className="text-[9px] font-bold uppercase tracking-wider text-muted-copy block mb-2">
                  Cloud Synced Records
                </span>
                <CloudSyncStatusPanel providerMode={providerMode} />
              </div>

              {/* Local Data backup controls */}
              <div className="rounded-card border border-border-soft bg-surface/20 p-4">
                <span className="text-[9px] font-bold uppercase tracking-wider text-muted-copy block mb-1">
                  Local Backups
                </span>
                <p className="text-xs text-slate-600 leading-5 mb-4">
                  Export all stored local progress, CEFR stats, and memory logs
                  into a portable JSON backup file.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={exportLocalData}
                  className="text-xs min-h-9"
                >
                  <Download className="h-3.5 w-3.5 mr-1" /> Export local data
                </Button>
              </div>

              {/* Destructive Controls at the very bottom */}
              <div className="rounded-card border border-error/20 bg-error/5 p-4 border-dashed">
                <span className="text-[9px] font-bold uppercase tracking-wider text-error block mb-1">
                  Destructive actions
                </span>
                <p className="text-xs text-error/80 leading-5 mb-4">
                  Completely erase all study sessions, mistake history, and
                  vocabulary data from this local device. This action is
                  irreversible.
                </p>

                {providerMode === 'local' ? (
                  <>
                    <Button
                      type="button"
                      variant="danger"
                      onClick={() => setShowClearConfirmation((val) => !val)}
                      className="text-xs min-h-9"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" /> Clear this device
                    </Button>

                    {showClearConfirmation && (
                      <div className="mt-4 rounded-card border border-error/25 bg-surface p-4">
                        <label className="text-xs font-bold text-error">
                          Type CLEAR to remove local progress from this browser.
                          <input
                            value={clearConfirmation}
                            onChange={(event) =>
                              setClearConfirmation(
                                event.target.value.toUpperCase()
                              )
                            }
                            className="mt-2 min-h-10 w-full rounded-input border border-error/25 bg-background px-3 text-xs text-foreground outline-none focus:ring-1 focus:ring-error"
                          />
                        </label>
                        <Button
                          type="button"
                          variant="danger"
                          className="mt-3 text-xs"
                          disabled={clearConfirmation !== 'CLEAR'}
                          onClick={() => void clearLocalData()}
                        >
                          Confirm local data removal
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-muted-copy">
                    Cloud account administration is managed via Supabase. Local
                    data clearing is only available in Guest/Local profile
                    modes.
                  </p>
                )}
              </div>
            </div>
          </SectionCard>
        </section>
      )}
    </div>
  );
};

export default ProfilePage;
