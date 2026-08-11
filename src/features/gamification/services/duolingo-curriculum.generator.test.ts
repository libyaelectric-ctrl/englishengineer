import { describe, it, expect } from 'vitest';
import { generateDuolingoUnits } from './duolingo-curriculum.generator';

describe('duolingo-curriculum.generator', () => {
  it('generates units for civil engineering', () => {
    const units = generateDuolingoUnits('civil');
    expect(units.length).toBe(3);
    expect(units[0].discipline).toBe('civil');
    expect(units[0].levels.length).toBe(4);
  });

  it('generates 5 questions per level containing all required types', () => {
    const units = generateDuolingoUnits('software');
    const firstLevel = units[0].levels[0];
    expect(firstLevel.questions.length).toBe(5);

    const questionTypes = firstLevel.questions.map((q) => q.type);
    expect(questionTypes).toContain('multiple_choice');
    expect(questionTypes).toContain('fill_blank');
    expect(questionTypes).toContain('listening');
    expect(questionTypes).toContain('writing');
    expect(questionTypes).toContain('speaking');
  });
});
