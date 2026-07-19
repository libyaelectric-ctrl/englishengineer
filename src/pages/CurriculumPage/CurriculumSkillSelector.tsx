import { Target } from 'lucide-react';
import {
  SKILL_NAMES,
  type SkillName,
  type UserLearningProfile,
} from '@/features/profile';
import { LessonPathEngine } from '@/features/learning-orchestrator';
import { SectionCard } from '@/shared/components/SectionCard';
import { SKILL_META, ICON_MAP } from './curriculum-data';

interface Props {
  selectedSkill: SkillName;
  weakestSkill: string;
  profile: UserLearningProfile;
  setSelectedSkill: (skill: SkillName) => void;
  setDomain: (domain: string) => void;
}

export const CurriculumSkillSelector = ({
  selectedSkill,
  weakestSkill,
  profile,
  setSelectedSkill,
  setDomain,
}: Props) => {
  return (
    <SectionCard
      id="curriculum"
      title="Choose a skill"
      subtitle="Continue any skill independently without losing the shared lesson topic"
      icon={Target}
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {SKILL_NAMES.map((skill) => {
          const meta = SKILL_META[skill];
          const Icon = ICON_MAP[meta.icon] || ICON_MAP.BookOpen;
          const skillProfile = profile.skills[skill];
          return (
            <button
              key={skill}
              type="button"
              onClick={() => {
                setSelectedSkill(skill);
                setDomain('All');
              }}
              className={`rounded-[4px] border p-4 text-left transition-all cursor-pointer shadow-sm ${
                selectedSkill === skill
                  ? 'border-[#0047bb]/40 bg-[#0047bb]/5'
                  : 'border-border-soft bg-surface hover:border-[#0047bb]'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <Icon className="h-5 w-5 text-[#0047bb]" />
                {skill === weakestSkill && (
                  <span className="text-[9px] font-bold uppercase tracking-wider text-warning">
                    Focus
                  </span>
                )}
              </div>
              <p className="mt-3 text-sm font-bold text-foreground">
                {meta.label}
              </p>
              <p className="mt-1 text-xs text-muted-copy font-medium">
                {skillProfile.cefrBand} · {skillProfile.progressToNextBand}%
              </p>
              <p className="mt-1 text-xs font-bold text-[#0047bb] uppercase tracking-wider">
                Lesson{' '}
                {
                  LessonPathEngine.getSkillProgress(profile, skill).lesson
                    .number
                }
              </p>
            </button>
          );
        })}
      </div>
    </SectionCard>
  );
};
