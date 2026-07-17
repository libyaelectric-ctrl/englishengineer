import { Trophy } from 'lucide-react';
import { SectionCard } from '@/shared/components/SectionCard';
import { UserRound } from 'lucide-react';
import {
  PROFESSIONS,
  PROFESSIONAL_TRACKS,
  ELECTRICAL_SUBDOMAINS,
  INDUSTRIES,
  COMMUNICATION_GOALS,
} from '@/features/profile/profile.preferences';
import type { UserLearningProfile } from '@/features/profile';
import type { Achievement } from '@/core/learning/learning.types';

interface ProfileOverviewSectionProps {
  currentUser: { displayName?: string } | null;
  profile: UserLearningProfile;
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
      className="animate-in fade-in duration-200 max-h-[calc(100vh-12rem)] overflow-y-auto"
    >
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
                [
                  'Profession / Role',
                  PROFESSIONS.find((p) => p.id === profile.professionId)
                    ?.label || 'Not Selected',
                ],
                [
                  'Engineering Discipline',
                  PROFESSIONAL_TRACKS.find(
                    (t) => t.id === profile.professionalTrack
                  )?.label || 'Electrical Engineering',
                ],
                ...(profile.professionalTrack === 'electrical'
                  ? [
                      [
                        'Electrical Subdomain',
                        ELECTRICAL_SUBDOMAINS.find(
                          (s) => s.id === profile.electricalSubdomain
                        )?.label || 'Not Selected',
                      ],
                    ]
                  : []),
                [
                  'Industry Sectors',
                  INDUSTRIES.find((i) => i.id === profile.industryId)?.label ||
                    'Not Selected',
                ],
                [
                  'Interface Language',
                  profile.interfaceLanguage === 'tr' ? 'Türkçe' : 'English',
                ],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-[4px] border border-[#d9d9e3] bg-white p-4 shadow-sm"
                >
                  <span className="text-[9px] font-bold uppercase tracking-wider text-muted-copy">
                    {label}
                  </span>
                  <p className="mt-1 text-sm font-bold text-foreground">
                    {value}
                  </p>
                </div>
              ))}
            </div>
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
