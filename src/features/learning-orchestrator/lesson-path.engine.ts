import type { SkillName, UserLearningProfile } from '@/features/profile/profile.types';
import {
  getSkillLessonNumber,
  LESSON_PATH_LENGTH,
} from '@/features/profile/profile.utils';
import { SKILL_NAMES } from '@/features/profile/profile.types';
import type { SharedLesson, SkillLessonProgress } from './lesson-path.types';

const TOPICS = [
  [
    'Introductions',
    'Introduce yourself, your role and your immediate responsibility.',
  ],
  [
    'Daily routine',
    'Describe routine work with clear time and sequence language.',
  ],
  [
    'Locations and access',
    'Explain where equipment, people and work areas are located.',
  ],
  ['Tools and materials', 'Identify tools, materials and their basic purpose.'],
  ['Instructions', 'Understand and give one clear action at a time.'],
  [
    'Progress updates',
    'Report completed work, current work and the next action.',
  ],
  ['Safety conditions', 'State a hazard, control and responsible person.'],
  ['Inspection readiness', 'Confirm scope, evidence and outstanding checks.'],
  [
    'Technical clarification',
    'Ask for and provide precise technical clarification.',
  ],
  ['Coordination', 'Describe an interface, constraint and agreed owner.'],
  [
    'Quality observations',
    'Record a factual observation and corrective action.',
  ],
  ['Delay and impact', 'Explain cause, schedule impact and mitigation.'],
  ['Testing', 'Describe a test method, result and acceptance condition.'],
  ['Client communication', 'Present status and request a clear decision.'],
  ['Handover', 'Summarize readiness, open items and next responsibility.'],
] as const;

export const getSharedLesson = (number: number): SharedLesson => {
  const safeNumber = Math.max(1, Math.min(LESSON_PATH_LENGTH, number));
  const phase = Math.floor((safeNumber - 1) / TOPICS.length) + 1;
  const [title, communicationGoal] = TOPICS[(safeNumber - 1) % TOPICS.length];
  return {
    id: `shared-lesson-${safeNumber}`,
    number: safeNumber,
    title: `${title} · Stage ${phase}`,
    communicationGoal,
  };
};

export const LessonPathEngine = {
  getSkillProgress(
    profile: UserLearningProfile,
    skill: SkillName
  ): SkillLessonProgress {
    const completedLessons = Math.min(
      LESSON_PATH_LENGTH,
      profile.skills[skill].completedTasks
    );
    const lessonNumber = getSkillLessonNumber(completedLessons);
    const minimumLesson = Math.min(
      ...SKILL_NAMES.map((name) =>
        getSkillLessonNumber(profile.skills[name].completedTasks)
      )
    );
    return {
      skill,
      lesson: getSharedLesson(lessonNumber),
      completedLessons,
      isCatchUpPriority: lessonNumber === minimumLesson,
    };
  },

  getAllSkillProgress(profile: UserLearningProfile): SkillLessonProgress[] {
    return SKILL_NAMES.map((skill) => this.getSkillProgress(profile, skill));
  },

  getCatchUpSkill(profile: UserLearningProfile): SkillName {
    return [...SKILL_NAMES].sort((left, right) => {
      const leftLesson = getSkillLessonNumber(
        profile.skills[left].completedTasks
      );
      const rightLesson = getSkillLessonNumber(
        profile.skills[right].completedTasks
      );
      return (
        leftLesson - rightLesson ||
        profile.skills[right].weaknessScore - profile.skills[left].weaknessScore
      );
    })[0];
  },
};
