// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { WRITING_MISSIONS } from './writing.data';

const requiredCategories = [
  'Daily Site Progress Report',
  'Weekly Progress Report',
  'Consultant Reply',
  'Material Submittal',
  'NCR Response',
  'MIR Comment',
  'ITP Observation',
  'FAT Report',
  'SAT Report',
  'Generator Load Test',
  'LV Panel Issue',
  'Fire Alarm Commissioning',
  'Cable Tray Installation',
  'Method Statement Review',
  'Shop Drawing Revision',
  'Delay Explanation',
  'Contractor Instruction',
  'Procurement Follow-up',
  'Technical Clarification',
  'Punch List',
  'Safety Observation',
  'LOTO Instruction',
  'Coordination Meeting Minutes',
  'Commissioning Summary',
  'Handover Report',
];

describe('writing mission content pack', () => {
  it('contains at least 25 professional engineering writing missions', () => {
    expect(WRITING_MISSIONS).toHaveLength(27);
  });

  it('covers every required Sprint B writing category', () => {
    const titles = new Set(WRITING_MISSIONS.map((mission) => mission.title));
    requiredCategories.forEach((category) => {
      expect(titles.has(category)).toBe(true);
    });
  });

  it('includes complete educational metadata for every mission', () => {
    WRITING_MISSIONS.forEach((mission) => {
      expect(mission.id).toMatch(/^writing_/);
      expect(mission.discipline.length).toBeGreaterThan(2);
      expect(mission.cefrLevel.length).toBeGreaterThan(1);
      expect(mission.scenario?.length).toBeGreaterThan(30);
      expect(mission.task?.length).toBeGreaterThan(20);
      expect(mission.expectedStructure?.length).toBeGreaterThanOrEqual(4);
      expect(mission.targetVocabulary?.length).toBeGreaterThanOrEqual(5);
      expect(mission.grammarFocus?.length).toBeGreaterThanOrEqual(2);
      expect(mission.assessmentRubric?.clarity).toBeTruthy();
      expect(mission.sampleExcellentAnswer?.length).toBeGreaterThan(60);
      expect(mission.sampleWeakAnswer?.length).toBeGreaterThan(20);
      expect(mission.feedbackHints?.length).toBeGreaterThanOrEqual(3);
      expect(mission.corrections).toHaveLength(3);
    });
  });

  it('does not include software-centric writing leftovers', () => {
    const joined = JSON.stringify(WRITING_MISSIONS).toLowerCase();
    expect(joined).not.toContain('pull request');
    expect(joined).not.toContain('rfc migration');
    expect(joined).not.toContain('refactoring');
    expect(joined).not.toContain('distributed systems');
  });
});
