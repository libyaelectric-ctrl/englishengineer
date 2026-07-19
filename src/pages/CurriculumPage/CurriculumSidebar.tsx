import { Link } from 'react-router-dom';
import { Clock3, Target } from 'lucide-react';
import { SectionCard } from '@/shared/components/SectionCard';
import type { UserLearningProfile } from '@/features/profile';
import { DOMAINS } from './curriculum-data';

interface Props {
  domain: string;
  setDomain: (domain: string) => void;
  profile: UserLearningProfile;
}

export const CurriculumSidebar = ({ domain, setDomain, profile }: Props) => {
  return (
    <aside className="space-y-5">
      <SectionCard
        title="Manual Change"
        subtitle="Recommendations never remove user control"
        icon={Target}
      >
        <label className="text-xs font-bold uppercase tracking-wider text-foreground">
          Vocabulary/domain focus
          <select
            value={domain}
            onChange={(event) => setDomain(event.target.value)}
            className="mt-2 min-h-10 w-full rounded-[4px] border border-border-soft bg-surface px-3 text-xs font-bold uppercase tracking-wider text-foreground cursor-pointer focus:border-[#0047bb] focus:ring-0 shadow-sm"
          >
            {DOMAINS.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <p className="mt-4 text-xs leading-5 text-muted-copy font-medium">
          Difficulty remains bounded to the selected skill: three safe
          allocations and one controlled stretch allocation.
        </p>
      </SectionCard>

      <SectionCard
        title="Placement Test"
        subtitle={profile.placementCompleted ? 'Completed' : 'Available'}
        icon={Clock3}
      >
        <p className="text-xs leading-5 text-muted-copy font-medium">
          {profile.placementCompleted
            ? `Local placement recommends ${profile.placementBand ?? 'A1'} with ${profile.placementConfidence} confidence.`
            : 'Take the short Reading, Vocabulary and Grammar placement, or continue at A1.'}
        </p>
        <Link
          to="/placement"
          className="mt-4 w-full h-9 inline-flex items-center justify-center rounded-[4px] border border-border-soft bg-surface hover:bg-surface-hover text-xs font-bold uppercase tracking-wider text-[#0047bb] cursor-pointer shadow-sm"
        >
          {profile.placementCompleted ? 'Retake placement' : 'Start placement'}
        </Link>
      </SectionCard>
    </aside>
  );
};
