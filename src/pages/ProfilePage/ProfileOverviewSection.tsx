import {
  Trophy,
  UserRound,
  Mail,
  ShieldCheck,
  Calendar,
  Briefcase,
  Layers,
} from 'lucide-react';
import { SectionCard } from '@/shared/components/SectionCard';
import {
  PROFESSIONS,
  PROFESSIONAL_TRACKS,
  COMMUNICATION_GOALS,
} from '@/features/profile/profile.preferences';
import type { UserLearningProfile } from '@/features/profile';
import type { Achievement } from '@/core/learning/learning.types';

interface ProfileOverviewSectionProps {
  currentUser: { displayName?: string; email?: string } | null;
  profile: UserLearningProfile;
  subscription: { planId: string };
  learningState: { achievements?: Achievement[] };
  isEditMode: boolean;
  editFirstName: string;
  editLastName: string;
  editProfession: string;
  editTrack: string;
  editSubdomain: string;
  editIndustry: string;
  editLang: 'en' | 'tr';
  editGoals: string[];
  isSaving: boolean;
  setEditFirstName: (v: string) => void;
  setEditLastName: (v: string) => void;
  setIsEditMode: (v: boolean) => void;
  enterEditMode: () => void;
  handleSaveProfile: (e: React.FormEvent) => void;
}

export const ProfileOverviewSection = ({
  currentUser,
  profile,
  subscription,
  learningState,
  isEditMode,
  editFirstName,
  editLastName,
  isSaving,
  setEditFirstName,
  setEditLastName,
  setIsEditMode,
  enterEditMode,
  handleSaveProfile,
}: ProfileOverviewSectionProps) => {
  return (
    <section
      id="overview"
      className="animate-in fade-in duration-200 space-y-6"
    >
      <SectionCard
        title="Profile Overview"
        subtitle="Your professional and regional classification metadata"
        icon={UserRound}
      >
        {!isEditMode ? (
          <div className="space-y-6">
            {/* High-Precision ID Module */}
            <div className="rounded-[4px] border border-[#d9d9e3] bg-[#f3f3fd] p-5 flex flex-col sm:flex-row items-center gap-5 shadow-sm relative overflow-hidden">
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808003_1px,transparent_1px),linear-gradient(to_bottom,#80808003_1px,transparent_1px)] bg-[size:16px_16px]" />

              <div className="h-14 w-14 shrink-0 rounded-[4px] bg-[#0047bb] text-white flex items-center justify-center font-bold text-lg border border-[#d9d9e3] shadow-sm select-none relative z-10">
                {currentUser?.displayName
                  ? currentUser.displayName.slice(0, 2).toUpperCase()
                  : 'DE'}
              </div>

              <div className="flex-1 text-center sm:text-left relative z-10">
                <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2">
                  <span className="font-mono text-[9px] font-bold text-muted-copy uppercase tracking-widest bg-white border border-[#d9d9e3] px-2 py-0.5 rounded-[4px]">
                    ID: ENG-
                    {(profile.userId || 'DEMO').slice(0, 6).toUpperCase()}
                  </span>
                  <span className="rounded-[4px] border border-success/20 bg-success/5 px-2 py-0.5 text-[8px] font-bold text-success uppercase tracking-wider">
                    USER-STATUS: ONLINE
                  </span>
                  <span className="rounded-[4px] border border-[#0047bb]/25 bg-[#0047bb]/10 px-2 py-0.5 text-[8px] font-bold text-[#0047bb] uppercase tracking-wider">
                    ID-VERIFIED
                  </span>
                </div>
                <h3 className="text-base font-bold text-foreground mt-2 tracking-tight">
                  {currentUser?.displayName || 'Demo Engineer'}
                </h3>
                <p className="text-xs text-muted-copy mt-0.5 font-medium">
                  Professional credentials verified under system standards
                </p>
              </div>
            </div>

            {/* Grid of Personal Info Modules */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  label: 'Full Name',
                  value: currentUser?.displayName || 'Not Provided',
                  icon: UserRound,
                  code: 'ID-01',
                },
                {
                  label: 'Email Address',
                  value: currentUser?.email || 'demo@engvox.com',
                  icon: Mail,
                  code: 'ID-02',
                },
                {
                  label: 'Account Access',
                  value:
                    subscription.planId === 'pro' ? 'Pro Access' : 'Free Trial',
                  icon: ShieldCheck,
                  code: 'ID-03',
                },
                {
                  label: 'Registration Date',
                  value: 'July 1, 2026',
                  icon: Calendar,
                  code: 'ID-04',
                },
                {
                  label: 'Profession / Role',
                  value:
                    PROFESSIONS.find((p) => p.id === profile.professionId)
                      ?.label || 'Not Selected',
                  icon: Briefcase,
                  code: 'ID-05',
                },
                {
                  label: 'Engineering Track',
                  value:
                    PROFESSIONAL_TRACKS.find(
                      (t) => t.id === profile.professionalTrack
                    )?.label || 'Electrical Engineering',
                  icon: Layers,
                  code: 'ID-06',
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="rounded-[4px] border border-[#d9d9e3] bg-white p-4 shadow-sm flex flex-col justify-between min-h-[90px]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-muted-copy">
                        {item.label}
                      </span>
                      <span className="font-mono text-[8px] font-bold text-muted-copy uppercase tracking-widest bg-[#faf8ff] border border-[#d9d9e3] px-1 rounded-[4px]">
                        {item.code}
                      </span>
                    </div>
                    <div className="mt-2.5 flex items-center gap-2">
                      <Icon className="h-4 w-4 text-[#0047bb] shrink-0" />
                      <p className="text-xs font-bold text-foreground truncate">
                        {item.value}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Communication Goals */}
            <div className="rounded-[4px] border border-[#d9d9e3] bg-white p-4 shadow-sm">
              <span className="text-[9px] font-bold uppercase tracking-wider text-muted-copy">
                Communication Goals
              </span>
              {profile.communicationGoals &&
              profile.communicationGoals.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {profile.communicationGoals.map((gId) => (
                    <span
                      key={gId}
                      className="rounded-[4px] bg-[#0047bb]/10 border border-[#0047bb]/25 px-2.5 py-1 text-[10px] font-bold text-[#0047bb] uppercase tracking-wider"
                    >
                      {COMMUNICATION_GOALS.find((g) => g.id === gId)?.label ||
                        gId}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-xs text-muted-copy font-medium">
                  No goals set yet.
                </p>
              )}
            </div>

            {/* Security & Activity Logs module */}
            <div className="rounded-[4px] border border-[#d9d9e3] bg-[#f3f3fd] p-4 space-y-3 shadow-sm relative overflow-hidden">
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808003_1px,transparent_1px),linear-gradient(to_bottom,#80808003_1px,transparent_1px)] bg-[size:16px_16px]" />
              <div className="flex justify-between items-center relative z-10">
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#0047bb]">
                  Security Status & Activity Logs
                </span>
                <span className="rounded-[4px] bg-success/15 text-success border border-success/20 text-[8px] font-bold px-1.5 py-0.5 uppercase tracking-wider">
                  ENCRYPTED
                </span>
              </div>
              <div className="space-y-1.5 font-mono text-[9px] text-muted-copy relative z-10">
                <div className="flex justify-between">
                  <span>
                    [LOG-001] AUTH: User session initialized successfully
                  </span>
                  <span>JUST NOW</span>
                </div>
                <div className="flex justify-between">
                  <span>
                    [LOG-002] DB-SYNC: Profile local persistence state current
                  </span>
                  <span>10 MIN AGO</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={enterEditMode}
                className="inline-flex items-center gap-1.5 rounded-[4px] border border-[#d9d9e3] bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-foreground hover:bg-[#faf8ff] cursor-pointer transition-colors shadow-sm"
              >
                Edit Profile
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSaveProfile}
            className="space-y-4 animate-in fade-in duration-200"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-1.5 text-[10px] font-bold uppercase tracking-wider text-foreground">
                First Name
                <input
                  value={editFirstName}
                  onChange={(e) => setEditFirstName(e.target.value)}
                  className="w-full rounded-[4px] border border-[#d9d9e3] bg-white px-3 py-2 text-xs text-foreground outline-none focus:border-[#0047bb] focus:ring-1 focus:ring-[#0047bb]/15 transition-colors shadow-sm font-bold"
                />
              </label>
              <label className="block space-y-1.5 text-[10px] font-bold uppercase tracking-wider text-foreground">
                Last Name
                <input
                  value={editLastName}
                  onChange={(e) => setEditLastName(e.target.value)}
                  className="w-full rounded-[4px] border border-[#d9d9e3] bg-white px-3 py-2 text-xs text-foreground outline-none focus:border-[#0047bb] focus:ring-1 focus:ring-[#0047bb]/15 transition-colors shadow-sm font-bold"
                />
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-[#d9d9e3] pt-4">
              <button
                type="button"
                onClick={() => setIsEditMode(false)}
                className="text-xs font-bold uppercase tracking-wider text-muted-copy hover:text-foreground cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 rounded-[4px] bg-[#0047bb] hover:bg-[#0047bb]/90 border border-[#0047bb] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white cursor-pointer transition-colors disabled:opacity-50 shadow-sm"
              >
                {isSaving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        )}
      </SectionCard>

      <SectionCard
        title="Earned Badges"
        subtitle="Achievements unlocked through your progress"
        icon={Trophy}
      >
        {(() => {
          const earnedBadges = (learningState.achievements ?? []).filter(
            (a) => a.unlocked
          );
          if (earnedBadges.length === 0) {
            return (
              <p className="text-sm text-muted-copy text-center py-6 font-medium">
                No badges earned yet. Keep practicing!
              </p>
            );
          }
          return (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {earnedBadges.map((badge) => (
                <div
                  key={badge.id}
                  className="rounded-[4px] border border-[#0047bb]/25 bg-[#0047bb]/5 p-4 text-center space-y-2 shadow-sm animate-in fade-in duration-300"
                >
                  <Trophy className="h-6 w-6 mx-auto text-[#0047bb]" />
                  <p className="text-sm font-bold text-foreground">
                    {badge.title}
                  </p>
                  <p className="text-[10px] text-muted-copy leading-4 font-medium">
                    {badge.description}
                  </p>
                  {badge.unlockedAt && (
                    <p className="text-[10px] font-bold text-muted-copy uppercase tracking-wider">
                      {new Date(badge.unlockedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          );
        })()}
      </SectionCard>
    </section>
  );
};
