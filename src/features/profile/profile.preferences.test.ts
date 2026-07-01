import { beforeEach, describe, expect, it } from 'vitest';
import { DAILY_DURATION_OPTIONS, PROFESSIONS } from './profile.preferences';
import { LearningProfileRepository } from './profile.repository';

describe('Learning profile preferences', () => {
  beforeEach(() => {
    localStorage.clear();
    LearningProfileRepository.reset('preference-test');
  });
  it('offers every 15-minute duration from 15 through 180', () => {
    expect(DAILY_DURATION_OPTIONS).toEqual(
      Array.from({ length: 12 }, (_, index) => (index + 1) * 15)
    );
  });
  it('stores multiple goals, role, minutes, and task count', () => {
    const profile = LearningProfileRepository.updatePreferences(
      'preference-test',
      {
        goals: ['work', 'engineering', 'management'],
        professionId: 'project-manager',
        dailyTarget: { minutes: 60, taskCount: 5 },
      }
    );
    expect(profile.goals).toEqual(['work', 'engineering', 'management']);
    expect(profile.professionId).toBe('project-manager');
    expect(profile.dailyTarget).toEqual({ minutes: 60, taskCount: 5 });
  });
  it('uses clean professional labels', () => {
    expect(PROFESSIONS).toHaveLength(12);
    expect(PROFESSIONS.map(({ label }) => label)).toContain('QA/QC Engineer');
    expect(PROFESSIONS.map(({ label }) => label)).toContain('Other');
    expect(
      PROFESSIONS.every(
        ({ label }) => !/[�Ã]/.test(label) && /^[A-Z]/.test(label)
      )
    ).toBe(true);
  });
});
