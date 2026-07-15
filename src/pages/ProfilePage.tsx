import { PROFESSIONS } from '@/features/profile/profile.preferences';
import { useProfilePage } from './ProfilePage/useProfilePage';
import {
  ProfileOverviewSection,
  BillingSection,
  SecuritySection,
  SkillsProgressSection,
  LearningPreferencesSection,
} from './ProfilePage/index';

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
    providerStatus,
    isBillingLoading,
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
  } = state;

  return (
    <div className="mx-auto max-w-5xl space-y-10 animate-in fade-in duration-300 pt-12 sm:pt-0">
      {/* Header */}
      <header className="flex flex-col gap-4 border-b border-border-soft pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-medium text-foreground sm:text-3xl">
              {currentUser?.displayName || 'Demo Engineer'}
            </h1>
            <p className="mt-1 text-xs font-medium text-muted-copy">
              {PROFESSIONS.find((p) => p.id === profile.professionId)?.label ||
                'Engineering Professional'}
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
          Manage your professional profile, learning preferences and EngVox
          access.
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
        <ProfileOverviewSection
          currentUser={currentUser}
          profile={profile}
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
          resetLearningProgress={resetLearningProgress}
        />
      )}
    </div>
  );
};

export default ProfilePage;
