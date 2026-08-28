/**
 * Modern Profile Page — Single Page Design
 *
 * Consolidates all profile sections into one scrollable page:
 * - Hero header with avatar and quick stats
 * - Profile info + edit
 * - Learning preferences
 * - Skills & progress
 * - Achievements & badges
 * - Security & data
 */
import {
  Award,
  BookOpen,
  Briefcase,
  Calendar,
  Download,
  Flame,
  Layers,
  Mail,
  Save,
  Shield,
  ShieldCheck,
  Target,
  Trash2,
  TrendingUp,
  Trophy,
  UserRound,
  Zap,
} from 'lucide-react';

import React from 'react';

import { useLearningStore } from '@/core/learning';

import { Heatmap } from '@/shared/components/Heatmap';
import { ProgressBar } from '@/shared/components/ProgressBar';
import { SectionCard } from '@/shared/components/SectionCard';
import { ThemeToggle } from '@/shared/components/ThemeToggle';

import { BILLING_PLANS } from '@/features/billing';
import type { BillingPlanId } from '@/features/billing';
import { LearningProfileEngine, SKILL_NAMES } from '@/features/profile';
import {
  COMMUNICATION_GOALS,
  DAILY_DURATION_OPTIONS,
  DAILY_TASK_COUNT_OPTIONS,
  LEARNING_GOALS,
  PROFESSIONS,
} from '@/features/profile/profile.preferences';
import { LearningProfileRepository } from '@/features/profile/profile.repository';

import { useProfilePage } from './useProfilePage';

// ─── Hero Section ─────────────────────────────────────────────
const ProfileHero = ({
  currentUser,
  profile,
  subscription,
  completionPercent,
  streak,
  xp,
  hearts,
}: {
  currentUser: { displayName?: string; email?: string } | null;
  profile: { professionId: string | null };
  subscription: { planId: string; status?: string };
  completionPercent: number;
  streak: number;
  xp: number;
  hearts: number;
}) => {
  const planId = subscription.planId as BillingPlanId;
  const planName = BILLING_PLANS[planId]?.name ?? 'Free';
  const isFree = planId === 'free' || (planId === 'junior' && subscription.status === 'none');

  return (
    <header className="relative overflow-hidden rounded-[var(--radius-card)] border border-border-soft bg-surface p-6 sm:p-8">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />

      <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
        {/* Avatar */}
        <div className="h-20 w-20 shrink-0 rounded-full bg-gradient-to-br from-primary to-blue-600 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-primary/25">
          {currentUser?.displayName ? currentUser.displayName.slice(0, 2).toUpperCase() : 'DE'}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-extrabold text-foreground truncate">
              {currentUser?.displayName || 'Demo Engineer'}
            </h1>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                isFree
                  ? 'bg-surface-hover text-muted-copy border border-border-soft'
                  : 'bg-primary/10 text-primary border border-primary/25'
              }`}
            >
              {planName}
            </span>
          </div>
          {currentUser?.email && (
            <p className="mt-1 text-sm text-muted-copy font-medium">{currentUser.email}</p>
          )}
          <p className="text-xs text-muted-copy mt-1">
            {PROFESSIONS.find((p) => p.id === profile.professionId)?.label ||
              'Engineering Professional'}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="text-center">
            <div className="flex items-center gap-1 text-amber-500">
              <Zap className="h-4 w-4" />
              <span className="text-lg font-black">{xp}</span>
            </div>
            <p className="text-[10px] font-bold text-muted-copy uppercase">XP</p>
          </div>
          <div className="text-center">
            <div className="flex items-center gap-1 text-orange-500">
              <Flame className="h-4 w-4" />
              <span className="text-lg font-black">{streak}</span>
            </div>
            <p className="text-[10px] font-bold text-muted-copy uppercase">Streak</p>
          </div>
          <div className="text-center">
            <div className="flex items-center gap-1 text-red-500">
              <span className="text-lg font-black">{hearts}</span>
            </div>
            <p className="text-[10px] font-bold text-muted-copy uppercase">Hearts</p>
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* Completion Bar */}
      <div className="mt-6 relative z-10">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-bold text-muted-copy">Profile Completion</span>
          <span className="text-xs font-bold text-primary">{completionPercent}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-surface-hover overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-blue-500 transition-all duration-500"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
      </div>
    </header>
  );
};

// ─── Profile Info Section ─────────────────────────────────────
const ProfileInfoSection = ({
  currentUser,
  profile,
  subscription,
  isEditMode,
  editFirstName,
  editLastName,
  isSaving,
  setEditFirstName,
  setEditLastName,
  setIsEditMode,
  enterEditMode,
  handleSaveProfile,
}: {
  currentUser: { displayName?: string; email?: string } | null;
  profile: {
    userId?: string;
    professionId: string | null;
    discipline?: string;
    communicationGoals?: string[];
  };
  subscription: { planId: string };
  isEditMode: boolean;
  editFirstName: string;
  editLastName: string;
  isSaving: boolean;
  setEditFirstName: (v: string) => void;
  setEditLastName: (v: string) => void;
  setIsEditMode: (v: boolean) => void;
  enterEditMode: () => void;
  handleSaveProfile: (e: React.FormEvent) => void;
}) => {
  const items = [
    { label: 'Full Name', value: currentUser?.displayName || 'Not Provided', icon: UserRound },
    { label: 'Email', value: currentUser?.email || 'demo@engvox.com', icon: Mail },
    {
      label: 'Profession',
      value: PROFESSIONS.find((p) => p.id === profile.professionId)?.label || 'Not Selected',
      icon: Briefcase,
    },
    { label: 'Discipline', value: profile.discipline || 'Not Selected', icon: Layers },
    { label: 'Member Since', value: 'July 2026', icon: Calendar },
    { label: 'Plan', value: subscription.planId === 'senior' ? 'Pro' : 'Free', icon: ShieldCheck },
  ];

  return (
    <SectionCard title="Profile Information" icon={UserRound}>
      {!isEditMode ? (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="flex items-center gap-3 p-3 rounded-[var(--radius-card)] bg-surface-hover border border-border-soft"
                >
                  <Icon className="h-4 w-4 text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-muted-copy uppercase">{item.label}</p>
                    <p className="text-sm font-bold text-foreground truncate">{item.value}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {profile.communicationGoals && profile.communicationGoals.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-muted-copy uppercase mb-2">
                Communication Goals
              </p>
              <div className="flex flex-wrap gap-2">
                {profile.communicationGoals.map((gId) => (
                  <span
                    key={gId}
                    className="px-2.5 py-1 rounded-full bg-primary/10 border border-primary/25 text-[10px] font-bold text-primary uppercase"
                  >
                    {COMMUNICATION_GOALS.find((g) => g.id === gId)?.label || gId}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={enterEditMode}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[var(--radius-card)] border border-border-soft bg-surface text-xs font-bold text-foreground hover:bg-surface-hover transition-colors"
            >
              Edit Profile
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1.5 text-xs font-bold text-foreground">
              First Name
              <input
                value={editFirstName}
                onChange={(e) => setEditFirstName(e.target.value)}
                className="w-full rounded-[var(--radius-card)] border border-border-soft bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-primary transition-colors"
              />
            </label>
            <label className="block space-y-1.5 text-xs font-bold text-foreground">
              Last Name
              <input
                value={editLastName}
                onChange={(e) => setEditLastName(e.target.value)}
                className="w-full rounded-[var(--radius-card)] border border-border-soft bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-primary transition-colors"
              />
            </label>
          </div>
          <div className="flex items-center justify-end gap-3 border-t border-border-soft pt-4">
            <button
              type="button"
              onClick={() => setIsEditMode(false)}
              className="text-xs font-bold text-muted-copy hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[var(--radius-card)] bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      )}
    </SectionCard>
  );
};

// ─── Skills Section ───────────────────────────────────────────
const SkillsSection = ({
  profile,
  memory,
  learningState,
}: {
  profile: Parameters<typeof LearningProfileEngine.getBadges>[0];
  memory: { total: number; mastered: number; dueToday: number; weakWords: number };
  learningState: { streak: number; studySessions: Array<{ timestamp: string; score: number }> };
}) => {
  const completedTasks = SKILL_NAMES.reduce(
    (total, skill) => total + (profile.skills?.[skill]?.completedTasks ?? 0),
    0
  );

  return (
    <SectionCard title="Skills & Progress" icon={TrendingUp}>
      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          {
            label: 'Streak',
            value: `${learningState.streak} days`,
            icon: Flame,
            color: 'text-orange-500',
          },
          {
            label: 'Missions',
            value: completedTasks.toString(),
            icon: Target,
            color: 'text-blue-500',
          },
          {
            label: 'Mastered',
            value: memory.mastered.toString(),
            icon: Award,
            color: 'text-green-500',
          },
          {
            label: 'Due Today',
            value: memory.dueToday.toString(),
            icon: BookOpen,
            color: 'text-amber-500',
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="p-3 rounded-[var(--radius-card)] bg-surface-hover border border-border-soft text-center"
            >
              <Icon className={`h-4 w-4 mx-auto mb-1 ${stat.color}`} />
              <p className="text-lg font-black text-foreground">{stat.value}</p>
              <p className="text-[10px] font-bold text-muted-copy uppercase">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Skill Cards */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {SKILL_NAMES.map((skill) => {
          const skillProfile = profile.skills[skill];
          return (
            <div
              key={skill}
              className="p-4 rounded-[var(--radius-card)] border border-border-soft bg-surface"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-foreground capitalize">{skill}</p>
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                  {skillProfile.cefrBand}
                </span>
              </div>
              <ProgressBar value={skillProfile.progressToNextBand} color="cyan" className="mb-1" />
              <p className="text-[10px] text-muted-copy text-right">
                {skillProfile.progressToNextBand}% to next
              </p>
            </div>
          );
        })}
      </div>

      {/* Heatmap */}
      <div className="mt-6">
        <Heatmap sessions={learningState.studySessions} />
      </div>
    </SectionCard>
  );
};

// ─── Achievements Section ─────────────────────────────────────
const AchievementsSection = ({
  achievements,
}: {
  achievements?: Array<{
    id: string;
    title: string;
    description: string;
    unlocked: boolean;
    unlockedAt: string | null;
  }>;
}) => {
  const earned = (achievements ?? []).filter((a) => a.unlocked);
  const locked = (achievements ?? []).filter((a) => !a.unlocked);

  return (
    <SectionCard title="Achievements & Badges" icon={Trophy}>
      {earned.length === 0 ? (
        <p className="text-sm text-muted-copy text-center py-8">
          No badges earned yet. Keep practicing!
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
            {earned.map((badge) => (
              <div
                key={badge.id}
                className="p-4 rounded-[var(--radius-card)] border border-primary/25 bg-primary/5 text-center"
              >
                <Trophy className="h-6 w-6 mx-auto text-primary mb-2" />
                <p className="text-sm font-bold text-foreground">{badge.title}</p>
                <p className="text-[10px] text-muted-copy mt-1">{badge.description}</p>
                {badge.unlockedAt && (
                  <p className="text-[10px] font-bold text-muted-copy mt-2 uppercase">
                    {new Date(badge.unlockedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>

          {locked.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-muted-copy uppercase mb-3">
                Locked ({locked.length})
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {locked.slice(0, 4).map((badge) => (
                  <div
                    key={badge.id}
                    className="p-3 rounded-[var(--radius-card)] border border-border-soft bg-surface-hover opacity-60"
                  >
                    <Trophy className="h-5 w-5 mx-auto text-muted-copy mb-1" />
                    <p className="text-xs font-bold text-muted-copy text-center">{badge.title}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </SectionCard>
  );
};

// ─── Preferences Section ──────────────────────────────────────
const PreferencesSection = ({
  prefGoals,
  setPrefGoals,
  prefMinutes,
  setPrefMinutes,
  prefTasks,
  setPrefTasks,
  preferencesSaved,
  onSave,
}: {
  prefGoals: string[];
  setPrefGoals: React.Dispatch<React.SetStateAction<string[]>>;
  prefMinutes: number;
  setPrefMinutes: (val: number) => void;
  prefTasks: number;
  setPrefTasks: (val: number) => void;
  preferencesSaved: boolean;
  onSave: (e: React.FormEvent) => void;
}) => (
  <SectionCard title="Learning Preferences" icon={Target}>
    <form onSubmit={onSave} className="space-y-5">
      {/* Goals */}
      <div>
        <p className="text-xs font-bold text-foreground mb-2">Learning Goals</p>
        <div className="grid gap-2 sm:grid-cols-3">
          {LEARNING_GOALS.map((goal) => {
            const isChecked = prefGoals.includes(goal.id);
            return (
              <label
                key={goal.id}
                className={`flex items-center gap-2 px-3 py-2 rounded-[var(--radius-card)] border text-xs font-bold cursor-pointer transition-all ${
                  isChecked
                    ? 'border-primary/40 bg-primary/10 text-foreground'
                    : 'border-border-soft bg-surface-hover text-muted-copy hover:border-primary/30'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() =>
                    setPrefGoals((curr) =>
                      curr.includes(goal.id)
                        ? curr.filter((id) => id !== goal.id)
                        : [...curr, goal.id]
                    )
                  }
                  className="h-3.5 w-3.5 accent-primary"
                />
                {goal.label}
              </label>
            );
          })}
        </div>
      </div>

      {/* Daily Targets */}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5 text-xs font-bold text-foreground">
          Daily Study Target
          <select
            value={prefMinutes}
            onChange={(e) => setPrefMinutes(Number(e.target.value))}
            className="w-full rounded-[var(--radius-card)] border border-border-soft bg-surface px-3 py-2 text-sm font-bold text-foreground outline-none focus:border-primary cursor-pointer"
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
            onChange={(e) => setPrefTasks(Number(e.target.value))}
            className="w-full rounded-[var(--radius-card)] border border-border-soft bg-surface px-3 py-2 text-sm font-bold text-foreground outline-none focus:border-primary cursor-pointer"
          >
            {DAILY_TASK_COUNT_OPTIONS.map((val) => (
              <option key={val} value={val}>
                {val} tasks
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-border-soft pt-4">
        {preferencesSaved && (
          <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-[10px] font-bold animate-pulse">
            Saved!
          </span>
        )}
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[var(--radius-card)] bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-colors"
        >
          <Save className="h-3.5 w-3.5" />
          Save Preferences
        </button>
      </div>
    </form>
  </SectionCard>
);

// ─── Security Section ─────────────────────────────────────────
const SecuritySection = ({
  showClearConfirmation,
  clearConfirmation,
  setClearConfirmation,
  exportLocalData,
  clearLocalData,
  resetLearningProgress,
}: {
  showClearConfirmation: boolean;
  setShowClearConfirmation: (show: boolean | ((prev: boolean) => boolean)) => void;
  clearConfirmation: string;
  setClearConfirmation: (val: string) => void;
  exportLocalData: () => void;
  clearLocalData: () => void;
  resetLearningProgress: () => void;
}) => (
  <SectionCard title="Privacy & Security" icon={Shield}>
    <div className="space-y-4">
      {/* Export */}
      <div className="flex items-center justify-between p-4 rounded-[var(--radius-card)] bg-surface-hover border border-border-soft">
        <div>
          <p className="text-sm font-bold text-foreground">Export Data</p>
          <p className="text-xs text-muted-copy">Download all your learning data as JSON</p>
        </div>
        <button
          onClick={exportLocalData}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-card)] border border-border-soft bg-surface text-xs font-bold text-foreground hover:bg-surface-hover transition-colors"
        >
          <Download className="h-3.5 w-3.5" />
          Export
        </button>
      </div>

      {/* Reset Progress */}
      <div className="flex items-center justify-between p-4 rounded-[var(--radius-card)] bg-surface-hover border border-border-soft">
        <div>
          <p className="text-sm font-bold text-foreground">Reset Progress</p>
          <p className="text-xs text-muted-copy">Reset all learning progress to zero</p>
        </div>
        <button
          onClick={() => {
            if (window.confirm('Are you sure you want to reset all learning progress?')) {
              resetLearningProgress();
            }
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-card)] border border-amber-500/30 bg-amber-500/5 text-xs font-bold text-amber-600 hover:bg-amber-500/10 transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Reset
        </button>
      </div>

      {showClearConfirmation && (
        <div className="p-4 rounded-[var(--radius-card)] border border-rose-500/25 bg-rose-500/5">
          <label htmlFor="clear-confirm" className="text-xs font-bold text-rose-600 block mb-2">
            Type CLEAR to confirm
          </label>
          <input
            id="clear-confirm"
            value={clearConfirmation}
            onChange={(e) => setClearConfirmation(e.target.value.toUpperCase())}
            className="w-full rounded-[var(--radius-card)] border border-rose-500/25 bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-rose-500 mb-3"
          />
          <button
            onClick={clearLocalData}
            disabled={clearConfirmation !== 'CLEAR'}
            className="px-4 py-2 rounded-[var(--radius-card)] bg-rose-600 text-white text-xs font-bold hover:bg-rose-500 transition-colors disabled:opacity-50"
          >
            Confirm Delete
          </button>
        </div>
      )}
    </div>
  </SectionCard>
);

// ─── Main Profile Page ────────────────────────────────────────
const ProfilePage = () => {
  const state = useProfilePage();
  const xp = useLearningStore((s) => s.xp);
  const streak = useLearningStore((s) => s.streak);
  const hearts = useLearningStore((s) => s.hearts);
  const studySessions = useLearningStore((s) => s.studySessions);
  const achievements = useLearningStore(
    (s) => (s as unknown as { achievements: unknown }).achievements
  );
  const {
    currentUser,
    subscription,
    profile,
    memory,
    message,
    error,
    billingError,
    isEditMode,
    isSaving,
    editFirstName,
    editLastName,
    setEditFirstName,
    setEditLastName,
    setIsEditMode,
    enterEditMode,
    handleSaveProfile,
    prefGoals,
    setPrefGoals,
    prefMinutes,
    setPrefMinutes,
    prefTasks,
    setPrefTasks,
    preferencesSaved,
    showClearConfirmation,
    setShowClearConfirmation,
    clearConfirmation,
    setClearConfirmation,
    exportLocalData,
    clearLocalData,
    resetLearningProgress,
    completionPercent,
  } = state;

  const profileData = LearningProfileRepository.getProfile(currentUser?.id || 'local-user');

  return (
    <div className="max-w-5xl mx-auto space-y-6 px-4 py-6 sm:px-6">
      {/* Alert */}
      {(message || error || billingError) && (
        <div
          role="status"
          className={`rounded-[var(--radius-card)] border p-4 text-sm font-bold ${
            error || billingError
              ? 'border-rose-500/20 bg-rose-500/5 text-rose-600'
              : 'border-green-500/20 bg-green-500/5 text-green-600'
          }`}
        >
          {error || billingError || message}
        </div>
      )}

      {/* Hero */}
      <ProfileHero
        currentUser={currentUser}
        profile={profile}
        subscription={subscription}
        completionPercent={completionPercent}
        streak={streak}
        xp={xp}
        hearts={hearts}
      />

      {/* Profile Info */}
      <ProfileInfoSection
        currentUser={currentUser}
        profile={profile}
        subscription={subscription}
        isEditMode={isEditMode}
        editFirstName={editFirstName}
        editLastName={editLastName}
        isSaving={isSaving}
        setEditFirstName={setEditFirstName}
        setEditLastName={setEditLastName}
        setIsEditMode={setIsEditMode}
        enterEditMode={enterEditMode}
        handleSaveProfile={handleSaveProfile}
      />

      {/* Skills */}
      <SkillsSection
        profile={profileData ?? profile}
        memory={memory}
        learningState={{ streak, studySessions }}
      />

      {/* Achievements */}
      <AchievementsSection
        achievements={
          achievements as Array<{
            id: string;
            title: string;
            description: string;
            unlocked: boolean;
            unlockedAt: string | null;
          }>
        }
      />

      {/* Preferences */}
      <PreferencesSection
        prefGoals={prefGoals}
        setPrefGoals={setPrefGoals}
        prefMinutes={prefMinutes}
        setPrefMinutes={setPrefMinutes}
        prefTasks={prefTasks}
        setPrefTasks={setPrefTasks}
        preferencesSaved={preferencesSaved}
        onSave={(e) => {
          e.preventDefault();
          // Save handler from useProfilePage
        }}
      />

      {/* Security */}
      <SecuritySection
        showClearConfirmation={showClearConfirmation}
        setShowClearConfirmation={setShowClearConfirmation}
        clearConfirmation={clearConfirmation}
        setClearConfirmation={setClearConfirmation}
        exportLocalData={exportLocalData}
        clearLocalData={clearLocalData}
        resetLearningProgress={resetLearningProgress}
      />
    </div>
  );
};

export default ProfilePage;
