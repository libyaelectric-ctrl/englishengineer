import type { SkillName } from '@/shared/types/domain.types';

export interface SharedLesson {
  id: string;
  number: number;
  title: string;
  communicationGoal: string;
}

export interface SkillLessonProgress {
  skill: SkillName;
  lesson: SharedLesson;
  completedLessons: number;
  isCatchUpPriority: boolean;
}
