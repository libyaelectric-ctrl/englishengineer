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
                  INDUSTRIES.find((i) => i.id === profile.industryId)
                    ?.label || 'Not Selected',
                ],
                [
                  'Interface Language',
                  profile.interfaceLanguage === 'tr' ? 'Türkçe' : 'English',
                ],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-xl border border-border-soft bg-surface p-4"
                >
                  <span className="text-[9px] font-medium uppercase tracking-wider text-muted-copy">
                    {label}
                  </span>
                  <p className="mt-1 text-sm font-medium text-foreground">
                    {value}
                  </p>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-border-soft bg-surface p-4">
              <span className="text-[9px] font-medium uppercase tracking-wider text-muted-copy">
                Communication Goals
              </span>
              {profile.communicationGoals &&
              profile.communicationGoals.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {profile.communicationGoals.map((gId) => (
                    <span
                      key={gId}
                      className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-medium text-primary"
                    >
                      {COMMUNICATION_GOALS.find((g) => g.id === gId)
                        ?.label || gId}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-xs text-muted-copy">
                  No goals set yet.
                </p>
              )}
            </div>
            <div className="flex justify-end">
              <button
                onClick={enterEditMode}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border-soft bg-surface px-4 py-2 text-xs font-medium text-foreground hover:bg-background transition-colors"
              >
                Edit Profile
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-1.5 text-xs font-medium text-foreground">
                First Name
                <input
                  value={editFirstName}
                  onChange={(e) => setEditFirstName(e.target.value)}
                  className="w-full rounded-lg border border-border-soft bg-surface px-3 py-2 text-xs text-foreground outline-none"
                />
              </label>
              <label className="block space-y-1.5 text-xs font-medium text-foreground">
                Last Name
                <input
                  value={editLastName}
                  onChange={(e) => setEditLastName(e.target.value)}
                  className="w-full rounded-lg border border-border-soft bg-surface px-3 py-2 text-xs text-foreground outline-none"
                />
              </label>
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-border-soft pt-4">
              <button
                type="button"
                onClick={() => setIsEditMode(false)}
                className="text-xs font-medium text-muted-copy hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-white hover:bg-primary/95 transition-colors disabled:opacity-50"
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
              <p className="text-sm text-muted-copy text-center py-6">
                No badges earned yet. Keep practicing!
              </p>
            );
          }
          return (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {earnedBadges.map((badge) => (
                <div
                  key={badge.id}
                  className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-center space-y-2"
                >
                  <Trophy className="h-6 w-6 mx-auto text-primary" />
                  <p className="text-sm font-bold text-foreground">{badge.title}</p>
                  <p className="text-[10px] text-muted-copy leading-4">{badge.description}</p>
                  {badge.unlockedAt && (
                    <p className="text-[10px] font-medium text-muted-copy">
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
