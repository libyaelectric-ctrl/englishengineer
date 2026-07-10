import { describe, expect, it } from 'vitest';
import { ProfessionalContentLibrary } from './content-library.service';

describe('professional content library', () => {
  it('contains at least 30 definitions for every requested activity', () => {
    expect(ProfessionalContentLibrary.listening.length).toBeGreaterThanOrEqual(
      30
    );
    expect(ProfessionalContentLibrary.roleplay.length).toBeGreaterThanOrEqual(
      30
    );
    expect(ProfessionalContentLibrary.writing.length).toBeGreaterThanOrEqual(
      30
    );
  });

  it('does not claim verified audio for script-only lessons', () => {
    expect(
      ProfessionalContentLibrary.listening.every(
        (item) => item.status !== 'audio_verified' || Boolean(item.audioUrl)
      )
    ).toBe(true);
  });

  it('supports level-specific engine queries', () => {
    const b1 = ProfessionalContentLibrary.getForLevel('B1');
    expect(b1.listening.every((item) => item.cefrLevel === 'B1')).toBe(true);
    expect(b1.roleplay.every((item) => item.level === 'B1')).toBe(true);
    expect(b1.writing.every((item) => item.level === 'B1')).toBe(true);
  });

  it('all listening lessons have required fields', () => {
    ProfessionalContentLibrary.listening.forEach((lesson) => {
      expect(lesson.id).toBeTruthy();
      expect(lesson.title).toBeTruthy();
      expect(lesson.cefrLevel).toBeTruthy();
      expect(lesson.transcript).toBeTruthy();
      expect(lesson.comprehensionQuestions.length).toBeGreaterThan(0);
    });
  });

  it('all roleplay scenarios have evaluation rubric', () => {
    ProfessionalContentLibrary.roleplay.forEach((scenario) => {
      expect(scenario.id).toBeTruthy();
      expect(scenario.evaluationRubric.length).toBeGreaterThan(0);
      expect(scenario.vocabularyTargets.length).toBeGreaterThan(0);
    });
  });

  it('all writing tasks have rubric and vocabulary targets', () => {
    ProfessionalContentLibrary.writing.forEach((task) => {
      expect(task.id).toBeTruthy();
      expect(task.rubric.length).toBeGreaterThan(0);
      expect(task.vocabularyTargets.length).toBeGreaterThan(0);
      expect(task.commonMistakes.length).toBeGreaterThan(0);
    });
  });

  it('covers all CEFR levels across activities', () => {
    const levels = new Set([
      ...ProfessionalContentLibrary.listening.map((l) => l.cefrLevel),
      ...ProfessionalContentLibrary.roleplay.map((r) => r.level),
      ...ProfessionalContentLibrary.writing.map((w) => w.level),
    ]);
    expect(levels.has('A1')).toBe(true);
    expect(levels.has('C2')).toBe(true);
  });

  it('returns empty arrays for levels with no content', () => {
    const empty = ProfessionalContentLibrary.getForLevel('A1');
    expect(Array.isArray(empty.listening)).toBe(true);
    expect(Array.isArray(empty.roleplay)).toBe(true);
    expect(Array.isArray(empty.writing)).toBe(true);
  });
});
