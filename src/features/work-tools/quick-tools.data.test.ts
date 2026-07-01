import { describe, expect, it } from 'vitest';
import {
  MEETING_PHRASES,
  QUICK_AI_ACTIONS,
  SITE_DICTIONARY,
} from './quick-tools.data';

describe('Quick Tools content pack', () => {
  it('meets meeting, dictionary and AI action minimums', () => {
    expect(MEETING_PHRASES).toHaveLength(91);
    expect(SITE_DICTIONARY).toHaveLength(323);
    expect(QUICK_AI_ACTIONS).toHaveLength(13);
    expect(MEETING_PHRASES.length).toBeGreaterThanOrEqual(75);
    expect(SITE_DICTIONARY.length).toBeGreaterThanOrEqual(300);
    expect(QUICK_AI_ACTIONS.length).toBeGreaterThanOrEqual(13);
  });

  it('keeps meeting phrases complete', () => {
    MEETING_PHRASES.forEach((item) => {
      expect(item.phrase && item.turkishMeaning && item.whenToUse).toBeTruthy();
      expect(
        item.example && item.tone && item.category && item.tags.length
      ).toBeTruthy();
    });
  });

  it('keeps dictionary entries complete and unique', () => {
    expect(new Set(SITE_DICTIONARY.map((item) => item.id)).size).toBe(
      SITE_DICTIONARY.length
    );
    SITE_DICTIONARY.forEach((item) => {
      expect(
        item.term && item.turkishMeaning && item.technicalExplanation
      ).toBeTruthy();
      expect(
        item.siteExample && item.commonWrongUsage && item.category
      ).toBeTruthy();
      expect(item.relatedTerms.length + item.tags.length).toBeGreaterThan(0);
    });
  });

  it('documents expected behavior for every Quick AI action', () => {
    QUICK_AI_ACTIONS.forEach((action) => {
      expect(action.systemInstruction).toContain('Never invent');
      expect(
        action.expectedOutputStyle &&
          action.exampleInput &&
          action.exampleOutput
      ).toBeTruthy();
    });
  });
});
// @vitest-environment node
