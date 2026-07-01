import { beforeEach, describe, expect, it } from 'vitest';
import {
  EMAIL_TEMPLATES,
  ENGINEERING_TEMPLATES,
  PHRASE_LIBRARY,
} from './work-tools.data';
import { WorkToolsService } from './work-tools.service';

describe('Work Tools content pack', () => {
  beforeEach(() => localStorage.clear());

  it('meets commercial content minimums', () => {
    expect(ENGINEERING_TEMPLATES).toHaveLength(62);
    expect(EMAIL_TEMPLATES).toHaveLength(51);
    expect(PHRASE_LIBRARY).toHaveLength(113);
    expect(ENGINEERING_TEMPLATES.length).toBeGreaterThanOrEqual(40);
    expect(EMAIL_TEMPLATES.length).toBeGreaterThanOrEqual(40);
    expect(PHRASE_LIBRARY.length).toBeGreaterThanOrEqual(100);
  });

  it('keeps engineering templates complete and unique', () => {
    expect(new Set(ENGINEERING_TEMPLATES.map((item) => item.id)).size).toBe(
      ENGINEERING_TEMPLATES.length
    );
    ENGINEERING_TEMPLATES.forEach((item) => {
      expect(item.title && item.category && item.useCase).toBeTruthy();
      expect(
        item.context && item.sampleInput && item.professionalOutput
      ).toBeTruthy();
      expect(
        item.turkishExplanation && item.tone && item.tags.length
      ).toBeTruthy();
    });
  });

  it('keeps every email variant and phrase evidence complete', () => {
    EMAIL_TEMPLATES.forEach((item) => {
      expect(
        item.subject && item.shortVersion && item.professionalVersion
      ).toBeTruthy();
      expect(
        item.politeVersion && item.technicalVersion && item.turkishExplanation
      ).toBeTruthy();
    });
    PHRASE_LIBRARY.forEach((item) => {
      expect(
        item.phrase && item.turkishMeaning && item.usageContext
      ).toBeTruthy();
      expect(item.example && item.tone && item.tags.length).toBeTruthy();
    });
  });

  it('persists favorite and Quick AI draft preferences', () => {
    const initial = WorkToolsService.load();
    const favorite = WorkToolsService.toggleFavorite('phrase-1', initial);
    const withDraft = WorkToolsService.setQuickAIDraft(
      {
        sourceId: 'template-1',
        sourceKind: 'engineering-template',
        title: 'Test template',
        text: 'Professional test text',
      },
      favorite
    );
    WorkToolsService.rememberSearch('busbar', withDraft);
    expect(WorkToolsService.load().favoritePhraseIds).toContain('phrase-1');
    expect(WorkToolsService.load().recentSearches).toContain('busbar');
    expect(withDraft.quickAIDraft?.sourceId).toBe('template-1');
  });
});
