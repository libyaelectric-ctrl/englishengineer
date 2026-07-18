import { PROFESSIONS } from '@/features/profile/profile.preferences';
import { useProfilePage } from './ProfilePage/useProfilePage';
import {
  ProfileOverviewSection,
  SecuritySection,
  SkillsProgressSection,
  LearningPreferencesSection,
} from './ProfilePage/index';

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
  <header className="flex flex-col gap-4 border-b border-[#d9d9e3] pb-6">
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
        <span className="rounded-[4px] border border-[#0047bb]/25 bg-[#0047bb]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#0047bb]">
          {subscription.planId === 'pro' ? 'Pro Access' : 'Free Trial'}
        </span>
        <span className="rounded-[4px] border border-[#d9d9e3] bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-copy">
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
    editTrack,
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

  return (
    <div className="mx-auto max-w-5xl space-y-10 animate-in fade-in duration-300 pt-12 sm:pt-0 text-foreground relative z-10">
      <ProfileHeader
        currentUser={currentUser}
        profile={profile}
        subscription={subscription}
        completionPercent={completionPercent}
      />
      <AlertBanner
        message={message}
        error={error}
        billingError={billingError}
      />

      {activeSection === 'overview' && (
        <ProfileOverviewSection
          currentUser={currentUser}
          profile={profile}
          subscription={subscription}
          learningState={learningState}
          isEditMode={isEditMode}
          editFirstName={editFirstName}
          editLastName={editLastName}
          editProfession={editProfession}
          editTrack={editTrack}
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
    </div>
  );
};

export default ProfilePage;
