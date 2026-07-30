import { Briefcase, Calendar, Layers, Mail, ShieldCheck, Trophy, UserRound } from 'lucide-react';

import type { Achievement } from '@/core/learning/learning.types';

import { SectionCard } from '@/shared/components/SectionCard';

import type { UserLearningProfile } from '@/features/profile';
import {
  COMMUNICATION_GOALS,
  PROFESSIONAL_TRACKS,
  PROFESSIONS,
} from '@/features/profile/profile.preferences';

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

const IdentityCard = ({
  currentUser,
  profile,
}: {
  currentUser: { displayName?: string } | null;
  profile: { userId?: string };
}) => (
  <div className="rounded-[4px] border border-border-soft bg-surface-hover p-5 flex flex-col sm:flex-row items-center gap-5 shadow-sm relative overflow-hidden">
    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808003_1px,transparent_1px),linear-gradient(to_bottom,#80808003_1px,transparent_1px)] bg-[size:16px_16px]" />
    <div className="h-14 w-14 shrink-0 rounded-[4px] bg-primary text-white flex items-center justify-center font-bold text-lg border border-border-soft shadow-sm select-none relative z-10">
      {currentUser?.displayName ? currentUser.displayName.slice(0, 2).toUpperCase() : 'DE'}
    </div>
    <div className="flex-1 text-center sm:text-left relative z-10">
      <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2">
        <span className="font-mono text-[10px] font-bold text-muted-copy uppercase tracking-widest bg-surface border border-border-soft px-2 py-0.5 rounded-[4px]">
          ID: ENG-{(profile.userId || 'DEMO').slice(0, 6).toUpperCase()}
        </span>
        <span className="rounded-[4px] border border-success/20 bg-success/5 px-2 py-0.5 text-[10px] font-bold text-success uppercase tracking-wider">
          USER-STATUS: ONLINE
        </span>
        <span className="rounded-[4px] border border-primary/25 bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wider">
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
);

const InfoGrid = ({
  currentUser,
  profile,
  subscription,
}: {
  currentUser: { displayName?: string; email?: string } | null;
  profile: UserLearningProfile;
  subscription: { planId: string };
}) => {
  const items = [
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
      value: subscription.planId === 'pro' ? 'Pro Access' : 'Free Trial',
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
      value: PROFESSIONS.find((p) => p.id === profile.professionId)?.label || 'Not Selected',
      icon: Briefcase,
      code: 'ID-05',
    },
    {
      label: 'Engineering Track',
      value:
        PROFESSIONAL_TRACKS.find((t) => t.id === profile.professionalTrack)?.label ||
        'Electrical Engineering',
      icon: Layers,
      code: 'ID-06',
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className="rounded-[4px] border border-border-soft bg-surface p-4 shadow-sm flex flex-col justify-between min-h-[90px]"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-copy">
                {item.label}
              </span>
              <span className="font-mono text-[10px] font-bold text-muted-copy uppercase tracking-widest bg-surface-hover border border-border-soft px-1 rounded-[4px]">
                {item.code}
              </span>
            </div>
            <div className="mt-2.5 flex items-center gap-2">
              <Icon className="h-4 w-4 text-primary shrink-0" />
              <p className="text-xs font-bold text-foreground truncate">{item.value}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const CommunicationGoalsSection = ({ goals }: { goals?: string[] }) => (
  <div className="rounded-[4px] border border-border-soft bg-surface p-4 shadow-sm">
    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-copy">
      Communication Goals
    </span>
    {goals && goals.length > 0 ? (
      <div className="mt-2 flex flex-wrap gap-2">
        {goals.map((gId) => (
          <span
            key={gId}
            className="rounded-[4px] bg-primary/10 border border-primary/25 px-2.5 py-1 text-[10px] font-bold text-primary uppercase tracking-wider"
          >
            {COMMUNICATION_GOALS.find((g) => g.id === gId)?.label || gId}
          </span>
        ))}
      </div>
    ) : (
      <p className="mt-2 text-xs text-muted-copy font-medium">No goals set yet.</p>
    )}
  </div>
);

const SecurityLogsCard = () => (
  <div className="rounded-[4px] border border-border-soft bg-surface-hover p-4 space-y-3 shadow-sm relative overflow-hidden">
    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808003_1px,transparent_1px),linear-gradient(to_bottom,#80808003_1px,transparent_1px)] bg-[size:16px_16px]" />
    <div className="flex justify-between items-center relative z-10">
      <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
        Security Status & Activity Logs
      </span>
      <span className="rounded-[4px] bg-success/15 text-success border border-success/20 text-[10px] font-bold px-1.5 py-0.5 uppercase tracking-wider">
        ENCRYPTED
      </span>
    </div>
    <div className="space-y-1.5 font-mono text-[10px] text-muted-copy relative z-10">
      <div className="flex justify-between">
        <span>[LOG-001] AUTH: User session initialized successfully</span>
        <span>JUST NOW</span>
      </div>
      <div className="flex justify-between">
        <span>[LOG-002] DB-SYNC: Profile local persistence state current</span>
        <span>10 MIN AGO</span>
      </div>
    </div>
  </div>
);

const BadgesSection = ({ achievements }: { achievements?: Achievement[] }) => {
  const earnedBadges = (achievements ?? []).filter((a) => a.unlocked);

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
          className="rounded-[4px] border border-primary/25 bg-primary/5 p-4 text-center space-y-2 shadow-sm animate-in fade-in duration-300"
        >
          <Trophy className="h-6 w-6 mx-auto text-primary" />
          <p className="text-sm font-bold text-foreground">{badge.title}</p>
          <p className="text-[10px] text-muted-copy leading-4 font-medium">{badge.description}</p>
          {badge.unlockedAt && (
            <p className="text-[10px] font-bold text-muted-copy uppercase tracking-wider">
              {new Date(badge.unlockedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

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
    <section id="overview" className="animate-in fade-in duration-200 space-y-6">
      <SectionCard
        title="Profile Overview"
        subtitle="Your professional and regional classification metadata"
        icon={UserRound}
      >
        {!isEditMode ? (
          <div className="space-y-6">
            <IdentityCard currentUser={currentUser} profile={profile} />
            <InfoGrid currentUser={currentUser} profile={profile} subscription={subscription} />
            <CommunicationGoalsSection goals={profile.communicationGoals} />
            <SecurityLogsCard />
            <div className="flex justify-end">
              <button
                onClick={enterEditMode}
                className="inline-flex items-center gap-1.5 rounded-[4px] border border-border-soft bg-surface px-4 py-2 text-xs font-bold uppercase tracking-wider text-foreground hover:bg-surface-hover cursor-pointer transition-colors shadow-sm"
              >
                Edit Profile
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSaveProfile} className="space-y-4 animate-in fade-in duration-200">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-1.5 text-[10px] font-bold uppercase tracking-wider text-foreground">
                First Name
                <input
                  value={editFirstName}
                  onChange={(e) => setEditFirstName(e.target.value)}
                  className="w-full rounded-[4px] border border-border-soft bg-surface px-3 py-2 text-xs text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/15 transition-colors shadow-sm font-bold"
                />
              </label>
              <label className="block space-y-1.5 text-[10px] font-bold uppercase tracking-wider text-foreground">
                Last Name
                <input
                  value={editLastName}
                  onChange={(e) => setEditLastName(e.target.value)}
                  className="w-full rounded-[4px] border border-border-soft bg-surface px-3 py-2 text-xs text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/15 transition-colors shadow-sm font-bold"
                />
              </label>
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-border-soft pt-4">
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
                className="inline-flex items-center gap-1.5 rounded-[4px] bg-primary hover:bg-primary/90 border border-primary px-4 py-2 text-xs font-bold uppercase tracking-wider text-white cursor-pointer transition-colors disabled:opacity-50 shadow-sm"
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
        <BadgesSection achievements={learningState.achievements} />
      </SectionCard>
    </section>
  );
};
