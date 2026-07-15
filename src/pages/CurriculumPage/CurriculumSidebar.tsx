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

export const CurriculumSidebar = ({
  domain,
  setDomain,
  profile,
}: Props) => {
  return (
    <aside className="space-y-5">
      <SectionCard
        title="Manual Change"
        subtitle="Recommendations never remove user control"
        icon={Target}
      >
        <label className="text-sm font-medium text-foreground">
          Vocabulary/domain focus
          <select
            value={domain}
            onChange={(event) => setDomain(event.target.value)}
            className="mt-2 min-h-11 w-full rounded-lg border border-border-soft bg-surface px-3 font-normal"
          >
            {DOMAINS.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <p className="mt-4 text-xs leading-5 text-muted-copy">
          Difficulty remains bounded to the selected skill: three safe
          allocations and one controlled stretch allocation.
        </p>
      </SectionCard>

      <SectionCard
        title="Placement Test"
        subtitle={
          profile.placementCompleted ? 'Completed' : 'Available'
        }
        icon={Clock3}
      >
        <p className="text-sm leading-6 text-muted-copy">
          {profile.placementCompleted
            ? `Local placement recommends ${profile.placementBand ?? 'A1'} with ${profile.placementConfidence} confidence.`
            : 'Take the short Reading, Vocabulary and Grammar placement, or continue at A1.'}
        </p>
        <Link
          to="/placement"
          className="mt-4 inline-flex text-sm font-medium text-primary"
        >
          {profile.placementCompleted
            ? 'Retake placement'
            : 'Start placement'}
        </Link>
      </SectionCard>
    </aside>
  );
};
