import { describe, expect, it } from 'vitest';
import { getInitialUserLearningProfile } from '@/features/profile';
import { getSharedLesson, LessonPathEngine } from './lesson-path.engine';

describe('shared lesson path with independent skills', () => {
  it('uses the same topic for the same lesson number in every skill', () => {
    const profile = getInitialUserLearningProfile();
    profile.skills.reading.completedTasks = 14;
    profile.skills.speaking.completedTasks = 14;
    const reading = LessonPathEngine.getSkillProgress(profile, 'reading');
    const speaking = LessonPathEngine.getSkillProgress(profile, 'speaking');
    expect(reading.lesson.number).toBe(15);
    expect(speaking.lesson).toEqual(reading.lesson);
    expect(reading.lesson).toEqual(getSharedLesson(15));
  });

  it('allows Reading lesson 50 while Speaking remains on lesson 15', () => {
    const profile = getInitialUserLearningProfile();
    Object.values(profile.skills).forEach((skill) => {
      skill.completedTasks = 20;
    });
    profile.skills.reading.completedTasks = 49;
    profile.skills.speaking.completedTasks = 14;
    expect(
      LessonPathEngine.getSkillProgress(profile, 'reading').lesson.number
    ).toBe(50);
    expect(
      LessonPathEngine.getSkillProgress(profile, 'speaking').lesson.number
    ).toBe(15);
    expect(LessonPathEngine.getCatchUpSkill(profile)).toBe('speaking');
  });
});
