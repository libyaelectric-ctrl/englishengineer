import { describe, expect, it } from 'vitest';
import { VOCABULARY_ENTRIES } from './vocabulary.data';
import { VocabularyDiscipline } from './vocabulary.types';

const requiredDisciplines: VocabularyDiscipline[] = [
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Architecture',
  'Construction',
  'Commissioning',
  'QA/QC',
  'HSE',
  'Procurement',
  'Project Management',
  'Hospital Projects',
  'Data Centers',
  'Oil & Gas',
  'Testing & Commissioning',
  'Professional Communication',
];

describe('vocabulary content pack integrity', () => {
  it('contains at least 600 engineering vocabulary entries', () => {
    expect(VOCABULARY_ENTRIES.length).toBeGreaterThanOrEqual(600);
  });

  it('contains beginner A1 and A2 engineering vocabulary', () => {
    expect(VOCABULARY_ENTRIES.some((entry) => entry.CEFR === 'A1')).toBe(true);
    expect(VOCABULARY_ENTRIES.some((entry) => entry.CEFR === 'A2')).toBe(true);
  });

  it('does not contain duplicate vocabulary words', () => {
    const normalized = VOCABULARY_ENTRIES.map((entry) =>
      entry.word.trim().toLowerCase()
    );
    expect(new Set(normalized).size).toBe(normalized.length);
  });

  it('covers all Sprint B required disciplines', () => {
    const disciplines = new Set(
      VOCABULARY_ENTRIES.map((entry) => entry.discipline)
    );
    requiredDisciplines.forEach((discipline) => {
      expect(disciplines.has(discipline)).toBe(true);
    });
  });

  it('keeps entries useful for engineering communication', () => {
    VOCABULARY_ENTRIES.forEach((entry) => {
      expect(entry.meaning.length).toBeGreaterThan(10);
      expect(entry.definition.length).toBeGreaterThan(30);
      expect(entry.example.length).toBeGreaterThan(40);
      expect(entry.collocations.length).toBeGreaterThanOrEqual(3);
      expect(entry.tags.length).toBeGreaterThanOrEqual(3);
    });
  });

  it('does not include software-centric vocabulary leftovers', () => {
    const joined = VOCABULARY_ENTRIES.map((entry) =>
      entry.word.toLowerCase()
    ).join(' ');
    expect(joined).not.toContain('pull request');
    expect(joined).not.toContain('refactoring');
    expect(joined).not.toContain('distributed systems');
  });
});
// @vitest-environment node
