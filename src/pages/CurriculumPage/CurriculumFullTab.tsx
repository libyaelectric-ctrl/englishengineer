import type { SkillName, UserLearningProfile } from '@/features/profile';
import type { LearningTaskRecommendation } from '@/features/learning-orchestrator';
import { CurriculumSkillSelector } from './CurriculumSkillSelector';
import { CurriculumRecommendationBrief } from './CurriculumRecommendationBrief';
import { CurriculumSidebar } from './CurriculumSidebar';

interface SkillMeta {
  label: string;
  route: string | null;
  icon: string;
}

interface Props {
  profile: UserLearningProfile;
  selectedSkill: SkillName;
  weakestSkill: string;
  domain: string;
  setDomain: (domain: string) => void;
  setSelectedSkill: (skill: SkillName) => void;
  recommendation: LearningTaskRecommendation | null;
  recommendationLoading: boolean;
  selectedMeta: SkillMeta;
}

export const CurriculumFullTab = ({
  profile,
  selectedSkill,
  weakestSkill,
  domain,
  setDomain,
  setSelectedSkill,
  recommendation,
  recommendationLoading,
  selectedMeta,
}: Props) => {
  return (
    <>
      <CurriculumSkillSelector
        selectedSkill={selectedSkill}
        weakestSkill={weakestSkill}
        profile={profile}
        setSelectedSkill={setSelectedSkill}
        setDomain={setDomain}
      />

      <div
        id="gate-progress"
        className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]"
      >
        <CurriculumRecommendationBrief
          selectedMeta={selectedMeta}
          recommendation={recommendation}
          recommendationLoading={recommendationLoading}
        />

        <CurriculumSidebar
          domain={domain}
          setDomain={setDomain}
          profile={profile}
        />
      </div>
    </>
  );
};
