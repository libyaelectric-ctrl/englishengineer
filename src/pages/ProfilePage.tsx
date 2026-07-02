import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Award,
  BookMarked,
  ClipboardList,
  CreditCard,
  Download,
  Gauge,
  RotateCcw,
  Save,
  Target,
  Trash2,
  UserRound,
} from 'lucide-react';
import { PageHeader } from '@/shared/components/PageHeader';
import { SectionCard } from '@/shared/components/SectionCard';
import { Button } from '@/shared/components/Button';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { CloudSyncStatusPanel, useAuthStore } from '@/features/auth';
import { BillingStatusPanel, useBillingStore } from '@/features/billing';
import {
  LearningProfileEngine,
  LearningProfileRepository,
  LearningPreferencesForm,
  SKILL_NAMES,
  SkillCockpitCard,
  SkillRadar,
  useLearningCockpit,
} from '@/features/profile';
import { ProgressBar } from '@/shared/components/ProgressBar';
import { useLearningIntelligenceStore } from '@/features/learning-intelligence';
import { LessonPathEngine } from '@/features/learning-orchestrator';
import { ProductAnalyticsService } from '@/features/analytics/product-analytics.service';
import {
  AVAILABLE_INTERFACE_LANGUAGES,
  LocalizationService,
  useLocalizationStore,
} from '@/features/localization';
import { storage } from '@/shared/storage';

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
  const [name, setName] = useState(() =>
    splitDisplayName(currentUser?.displayName)
  );
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);
  const [clearConfirmation, setClearConfirmation] = useState('');
  const { profile, memory, learningState } = useLearningCockpit(
    currentUser?.id
  );
  const mistakeLog = useLearningIntelligenceStore((state) => state.mistakeLog);
  const language = useLocalizationStore((state) => state.language);
  const setLanguage = useLocalizationStore((state) => state.setLanguage);

  useEffect(() => {
    setName(splitDisplayName(currentUser?.displayName));
  }, [currentUser?.displayName]);

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

  useEffect(() => {
    if (subscription.planId === 'free') {
      ProductAnalyticsService.trackOnce('paywall_viewed', '/profile', {
        plan: 'free',
        source: 'system',
      });
    }
    if (subscription.cancelAtPeriodEnd) {
      ProductAnalyticsService.trackOnce(
        'subscription_cancel_at_period_end_detected',
        '/profile',
        {
          plan: subscription.planId,
          subscriptionStatus: subscription.status,
          source: 'system',
        }
      );
    }
  }, [
    subscription.cancelAtPeriodEnd,
    subscription.planId,
    subscription.status,
  ]);

  const resetName = () => {
    setName(splitDisplayName(currentUser?.displayName));
    setMessage(null);
    setError(null);
  };

  const saveName = async (event: React.FormEvent) => {
    event.preventDefault();
    const firstName = name.firstName.trim();
    const lastName = name.lastName.trim();
    if (!firstName || !lastName) {
      setError('First name and last name are required.');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      await updateProfile({ displayName: `${firstName} ${lastName}` });
      setMessage('Profile updated successfully.');
    } catch (saveError: unknown) {
      setError(getErrorMessage(saveError, 'Profile update failed.'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpgrade = async () => {
    if (!currentUser) return;
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
    <div className="mx-auto max-w-7xl space-y-6 animate-in fade-in duration-300">
      <PageHeader
        title="EngineerOS Profile"
        description="Independent skill levels, engineering communication progress and account controls."
        badgeText={currentUser ? 'PROFILE READY' : 'LOCAL MODE'}
        badgeColor={currentUser ? 'emerald' : 'amber'}
      />

      <CloudSyncStatusPanel providerMode={providerMode} />

      <nav
        aria-label="Profile sections"
        className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm"
      >
        <a
          href="#overview"
          className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-bold text-white"
        >
          Overview
        </a>
        <Link
          to="/analytics"
          className="rounded-lg px-4 py-2 text-sm font-bold text-slate-600 hover:bg-sky-50"
        >
          Analytics
        </Link>
        <Link
          to="/gamification"
          className="rounded-lg px-4 py-2 text-sm font-bold text-slate-600 hover:bg-sky-50"
        >
          Gamification
        </Link>
        <a
          href="#mistake-log"
          className="rounded-lg px-4 py-2 text-sm font-bold text-slate-600 hover:bg-sky-50"
        >
          Mistake Log
        </a>
        <a
          href="#settings"
          className="rounded-lg px-4 py-2 text-sm font-bold text-slate-600 hover:bg-sky-50"
        >
          Settings
        </a>
      </nav>

      {(message || error || billingError) && (
        <div
          className={`rounded-xl border p-4 text-sm ${
            error || billingError
              ? 'border-rose-200 bg-rose-50 text-rose-700'
              : 'border-emerald-200 bg-emerald-50 text-emerald-700'
          }`}
        >
          {error || billingError || message}
        </div>
      )}

      <div
        id="overview"
        className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]"
      >
        <SectionCard
          title="Independent Skill Profile"
          subtitle="Each communication skill progresses independently"
          icon={Gauge}
        >
          <SkillRadar profile={profile} />
          <p className="mt-4 text-sm leading-6 text-slate-600">
            Your EngineerOS level is skill-based. Reading, Writing, Listening,
            Speaking, Vocabulary and Grammar progress independently.
          </p>
        </SectionCard>

        <SectionCard
          title="Professional Progress"
          subtitle="Progress from completed learning activity"
          icon={Target}
        >
          <div className="grid grid-cols-2 gap-3">
            {[
              ['Streak', `${learningState.streak} days`],
              ['Missions', completedTasks],
              ['Weekly goal', `${weeklyCompleted}/${profile.weeklyGoal}`],
              ['Mastered words', memory.mastered],
              ['Weak words', memory.weakWords],
              ['Badges', badges.filter((badge) => badge.unlocked).length],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-[12px] border border-slate-200 bg-slate-50 p-3"
              >
                <p className="text-[10px] font-black uppercase text-slate-500">
                  {label}
                </p>
                <p className="mt-1 text-xl font-black text-slate-950">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Skill Cards"
        subtitle="All new profiles begin at A1 and progress separately"
        icon={Gauge}
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {SKILL_NAMES.map((skill) => (
            <SkillCockpitCard
              key={skill}
              profile={profile.skills[skill]}
              lessonNumber={
                LessonPathEngine.getSkillProgress(profile, skill).lesson.number
              }
              compact
            />
          ))}
        </div>
      </SectionCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          title="Vocabulary Mastery"
          subtitle="Progress against the canonical repository"
          icon={BookMarked}
        >
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-3xl font-black text-slate-950">
                {memory.mastered}
              </p>
              <p className="mt-1 text-sm font-medium text-slate-500">
                of {memory.total || '...'} terms mastered
              </p>
            </div>
            <StatusBadge
              label={`${memory.dueToday} due today`}
              tone={memory.dueToday > 0 ? 'warning' : 'neutral'}
            />
          </div>
          <ProgressBar
            value={vocabularyMastery}
            showValue
            color="emerald"
            className="mt-5"
          />
          <div className="mt-5 grid grid-cols-3 gap-3 text-center">
            {[
              ['New', memory.new],
              ['Learning', memory.learning],
              ['Forgotten', memory.forgotten],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-[10px] border border-slate-200 bg-slate-50 p-3"
              >
                <p className="text-[10px] font-bold uppercase text-slate-500">
                  {label}
                </p>
                <p className="mt-1 text-lg font-black text-slate-950">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Learning Badges"
          subtitle="Unlocked only from recorded progress"
          icon={Award}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className={`rounded-[12px] border p-4 ${
                  badge.unlocked
                    ? 'border-emerald-200 bg-emerald-50'
                    : 'border-slate-200 bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Award
                    className={`h-4 w-4 ${
                      badge.unlocked ? 'text-emerald-700' : 'text-slate-400'
                    }`}
                  />
                  <p className="text-sm font-black text-slate-900">
                    {badge.label}
                  </p>
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  {badge.description}
                </p>
                <p className="mt-2 text-[10px] font-black uppercase text-slate-500">
                  {badge.unlocked ? 'Unlocked' : 'Locked'}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard
        id="mistake-log"
        title="Mistake Log"
        subtitle="Repeated patterns stay inside your profile and influence review recommendations"
        icon={ClipboardList}
      >
        {mistakeLog.length === 0 ? (
          <p className="rounded-[12px] border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
            No mistakes logged yet. Task errors will appear here without
            cluttering the main navigation.
          </p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {mistakeLog.slice(0, 6).map((mistake) => (
              <div
                key={mistake.id}
                className="rounded-[12px] border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-black uppercase text-slate-600">
                    {mistake.category}
                  </p>
                  <StatusBadge
                    label={
                      (mistake.repetitionCount ?? 1) >= 3
                        ? 'Critical'
                        : `${mistake.repetitionCount ?? 1}x`
                    }
                    tone={
                      (mistake.repetitionCount ?? 1) >= 3 ? 'danger' : 'neutral'
                    }
                  />
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-900">
                  {mistake.originalText}
                </p>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  {mistake.correction}
                </p>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <SectionCard
          title="Learning Preferences"
          subtitle="Goals, role, daily target and weekly streak tolerance"
          icon={Target}
        >
          <LearningPreferencesForm userId={currentUser?.id ?? 'local-user'} />
        </SectionCard>

        <SectionCard
          id="settings"
          title={LocalizationService.translate(
            'profile.nameLanguage',
            language
          )}
          subtitle="Essential account display settings"
          icon={UserRound}
        >
          <form onSubmit={saveName} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="profile-first-name"
                  className="text-xs font-bold text-slate-700"
                >
                  {LocalizationService.translate('profile.firstName', language)}
                </label>
                <input
                  id="profile-first-name"
                  value={name.firstName}
                  onChange={(event) =>
                    setName((current) => ({
                      ...current,
                      firstName: event.target.value,
                    }))
                  }
                  className="w-full rounded-[10px] border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                  placeholder="Enter first name"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="profile-last-name"
                  className="text-xs font-bold text-slate-700"
                >
                  {LocalizationService.translate('profile.lastName', language)}
                </label>
                <input
                  id="profile-last-name"
                  value={name.lastName}
                  onChange={(event) =>
                    setName((current) => ({
                      ...current,
                      lastName: event.target.value,
                    }))
                  }
                  className="w-full rounded-[10px] border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                  placeholder="Enter last name"
                />
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={resetName}
                disabled={isSaving}
              >
                <RotateCcw className="h-4 w-4" /> Reset
              </Button>
              <Button type="submit" disabled={isSaving}>
                <Save className="h-4 w-4" />
                {isSaving
                  ? 'Saving...'
                  : LocalizationService.translate('profile.save', language)}
              </Button>
            </div>
          </form>
          <label className="mt-5 block border-t border-slate-200 pt-5 text-xs font-bold text-slate-700">
            Interface language
            <select
              value={language}
              onChange={(event) => {
                const next = event.target.value as 'en' | 'tr';
                setLanguage(next);
                LearningProfileRepository.updatePreferences(
                  currentUser?.id ?? 'local-user',
                  { interfaceLanguage: next }
                );
              }}
              className="mt-2 min-h-11 w-full rounded-[12px] border border-slate-200 bg-white px-3 text-sm font-normal text-slate-900"
            >
              {AVAILABLE_INTERFACE_LANGUAGES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        </SectionCard>

        <SectionCard
          title="Subscription Control"
          subtitle="Plan and billing access"
          icon={CreditCard}
        >
          <BillingStatusPanel
            subscription={subscription}
            providerStatus={providerStatus}
            isLoading={isBillingLoading}
            error={billingError}
            onUpgrade={handleUpgrade}
            onOpenPortal={handleManageSubscription}
          />
        </SectionCard>

        <SectionCard
          title="Data and Privacy"
          subtitle="Export or clear only the EngineerOS data stored on this device"
          icon={Download}
        >
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="button" variant="outline" onClick={exportLocalData}>
              <Download className="h-4 w-4" /> Export local data
            </Button>
            {providerMode === 'local' && (
              <Button
                type="button"
                variant="danger"
                onClick={() => setShowClearConfirmation((value) => !value)}
              >
                <Trash2 className="h-4 w-4" /> Clear this device
              </Button>
            )}
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-500">
            This does not claim to delete a Supabase cloud account. Verified
            cloud account deletion remains unavailable until the production
            backend flow is connected.
          </p>
          {showClearConfirmation && providerMode === 'local' && (
            <div className="mt-4 rounded-[12px] border border-rose-200 bg-rose-50 p-4">
              <label className="text-xs font-bold text-rose-900">
                Type CLEAR to remove local progress from this browser.
                <input
                  value={clearConfirmation}
                  onChange={(event) =>
                    setClearConfirmation(event.target.value.toUpperCase())
                  }
                  className="mt-2 min-h-11 w-full rounded-[12px] border border-rose-200 bg-white px-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-rose-200"
                />
              </label>
              <Button
                type="button"
                variant="danger"
                className="mt-3"
                disabled={clearConfirmation !== 'CLEAR'}
                onClick={() => void clearLocalData()}
              >
                Confirm local data removal
              </Button>
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
};

export default ProfilePage;
