import { useState } from 'react';

import type { EngineeringDiscipline } from '@/shared/constants/engineering-disciplines';
import { ENGINEERING_DISCIPLINES } from '@/shared/constants/engineering-disciplines';

import { useLocalizationStore } from '@/features/localization';
import { LearningProfileRepository } from '@/features/profile';
import { PROFESSIONS } from '@/features/profile/profile.preferences';

import { ProgressOverviewTab } from '../ProgressPage/ProgressOverviewTab';
import { LanguageDisciplineSection } from './LanguageDisciplineSection';
import { LearningPreferencesSection } from './LearningPreferencesSection';
import { ProfileOverviewSection } from './ProfileOverviewSection';
import { SecuritySection } from './SecuritySection';
import { SkillsProgressSection } from './SkillsProgressSection';
import { useProfilePage } from './useProfilePage';

const ProfileHeader = ({
  currentUser,
  profile,
  subscription,
  completionPercent,
}: {
  currentUser: { displayName?: string } | null;
  profile: { professionId: string | null };
  subscription: { planId: string };
  completionPercent: number;
}) => (
  <header className="flex flex-col gap-4 border-b border-border-soft pb-6">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {currentUser?.displayName || 'Demo Engineer'}
        </h1>
        <p className="mt-1.5 text-xs font-bold uppercase tracking-wider text-muted-copy">
          {PROFESSIONS.find((p) => p.id === profile.professionId)?.label ||
            'Engineering Professional'}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className="rounded-[4px] border border-primary/25 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
          {subscription.planId === 'senior' ? 'Pro Access' : 'Free Trial'}
        </span>
        <span className="rounded-[4px] border border-border-soft bg-surface px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-copy">
          Profile Completion: {completionPercent}%
        </span>
      </div>
    </div>
    <p className="text-xs leading-5 text-muted-copy max-w-2xl font-medium">
      Manage your professional profile, learning preferences and EngVox access.
    </p>
  </header>
);

const AlertBanner = ({
  message,
  error,
  billingError,
}: {
  message: string | null;
  error: string | null;
  billingError: string | null;
}) => {
  if (!message && !error && !billingError) return null;
  return (
    <div
      role="status"
      className={`rounded-[4px] border p-4 text-xs leading-5 shadow-sm font-bold uppercase tracking-wider ${error || billingError ? 'border-rose-500/20 bg-rose-500/5 text-rose-600' : 'border-success/20 bg-success/5 text-success'}`}
    >
      {error || billingError || message}
    </div>
  );
};

const ProfilePage = () => {
  const state = useProfilePage();
  const {
    activeSection,
    currentUser,
    subscription,
    profile,
    memory,
    learningState,
    mistakeLog,
    message,
    error,
    billingError,
    isEditMode,
    isSaving,
    editFirstName,
    editLastName,
    editProfession,
    editDiscipline,
    editSubdomain,
    editIndustry,
    editLang,
    editGoals,
    setEditFirstName,
    setEditLastName,
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
    showClearConfirmation,
    setShowClearConfirmation,
    clearConfirmation,
    setClearConfirmation,
    providerMode,
    enterEditMode,
    handleSaveProfile,
    handleSavePreferences,
    exportLocalData,
    clearLocalData,
    resetLearningProgress,
    completionPercent,
  } = state;

  const disciplineLocked = Boolean(profile?.disciplineLockedAt);
  const [discipline, setDiscipline] = useState<EngineeringDiscipline>(
    () =>
      profile?.discipline ??
      (localStorage.getItem('preselected_discipline') as EngineeringDiscipline) ??
      ENGINEERING_DISCIPLINES[0]
  );
  const [disciplineSaved, setDisciplineSaved] = useState(false);
  const language = useLocalizationStore((s) => s.language);

  const handleDisciplineSave = () => {
    localStorage.setItem('preselected_discipline', discipline);
    if (currentUser?.id) {
      LearningProfileRepository.updatePreferences(currentUser.id, {
        discipline,
        professionalTrack: discipline as never,
        interfaceLanguage: language as never,
      });
    }
    setDisciplineSaved(true);
    setTimeout(() => setDisciplineSaved(false), 2000);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-10 animate-in fade-in duration-300 pt-12 sm:pt-0 text-foreground relative z-10">
      <ProfileHeader
        currentUser={currentUser}
        profile={profile}
        subscription={subscription}
        completionPercent={completionPercent}
      />
      <AlertBanner message={message} error={error} billingError={billingError} />

      {activeSection === 'overview' && (
        <ProfileOverviewSection
          currentUser={currentUser}
          profile={profile}
          subscription={subscription}
          learningState={{ achievements: learningState.achievements }}
          isEditMode={isEditMode}
          editFirstName={editFirstName}
          editLastName={editLastName}
          editProfession={editProfession}
          editDiscipline={editDiscipline}
          editSubdomain={editSubdomain}
          editIndustry={editIndustry}
          editLang={editLang}
          editGoals={editGoals}
          isSaving={isSaving}
          setEditFirstName={setEditFirstName}
          setEditLastName={setEditLastName}
          setIsEditMode={setIsEditMode}
          enterEditMode={enterEditMode}
          handleSaveProfile={handleSaveProfile}
        />
      )}

      {activeSection === 'skills' && (
        <SkillsProgressSection
          profile={profile}
          memory={memory}
          learningState={learningState}
          mistakeLog={mistakeLog}
        />
      )}

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

      {activeSection === 'security' && (
        <SecuritySection
          providerMode={providerMode}
          showClearConfirmation={showClearConfirmation}
          setShowClearConfirmation={setShowClearConfirmation}
          clearConfirmation={clearConfirmation}
          setClearConfirmation={setClearConfirmation}
          exportLocalData={exportLocalData}
          clearLocalData={clearLocalData}
          resetLearningProgress={resetLearningProgress}
        />
      )}

      {activeSection === 'language-discipline' && (
        <LanguageDisciplineSection
          currentDiscipline={discipline}
          profileDiscipline={profile?.discipline}
          onDisciplineChange={setDiscipline}
          onSave={handleDisciplineSave}
          saved={disciplineSaved}
          locked={disciplineLocked}
        />
      )}

      {/* Progress Section */}
      <div className="mt-10 pt-8 border-t border-border-soft">
        <h2 className="text-xl font-bold text-foreground mb-6">Progress</h2>
        <ProgressOverviewTab />
      </div>
    </div>
  );
};

export default ProfilePage;
