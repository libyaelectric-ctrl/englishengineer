import { beforeEach, describe, expect, it } from 'vitest';
import type { VocabularyTerm } from '../types/vocabulary.types';
import {
  CANONICAL_VOCABULARY_TOTAL,
  getVocabularyReviewReason,
  searchVocabularyMenu,
  VocabularyMenuService,
} from './vocabulary.menu';

const term = {
  id: 'vocab_architecture_a1_0001',
  term: 'height',
  turkishMeaning: `y\u00c3\u00bckseklik`,
  cefrLevel: 'A1',
  domain: 'architecture',
  contentDomain: 'engineering',
  lifeContext: 'site',
  partOfSpeech: 'noun',
  skillUse: ['reading', 'writing', 'vocabulary'],
} as VocabularyTerm;

describe('Vocabulary menu progress', () => {
  beforeEach(() => {
    localStorage.clear();
    VocabularyMenuService.reset();
  });

  it('treats all canonical words as New when progress is empty', () => {
    expect(VocabularyMenuService.getSummary()).toEqual({
      total: CANONICAL_VOCABULARY_TOTAL,
      newWords: CANONICAL_VOCABULARY_TOTAL,
      learning: 0,
      mastered: 0,
      weak: 0,
      forgotten: 0,
      leeches: 0,
      dueToday: 0,
    });
  });

  it('masters only on the third correct review', () => {
    const now = new Date('2026-06-29T10:00:00.000Z');
    expect(VocabularyMenuService.reviewWord(term.id, true, now).status).toBe(
      'Learned'
    );
    expect(VocabularyMenuService.reviewWord(term.id, true, now).status).toBe(
      'Learned'
    );
    const mastered = VocabularyMenuService.reviewWord(term.id, true, now);
    expect(mastered.status).toBe('Mastered');
    expect(mastered.correctReviews).toBe(3);
  });

  it('marks a wrong review Weak, due immediately, and Forgotten after three failures', () => {
    const now = new Date('2026-06-29T10:00:00.000Z');
    VocabularyMenuService.reviewWord(term.id, false, now, term.term);
    VocabularyMenuService.reviewWord(term.id, false, now, term.term);
    const progress = VocabularyMenuService.reviewWord(
      term.id,
      false,
      now,
      term.term
    );
    const summary = VocabularyMenuService.getSummary(
      VocabularyMenuService.getState(),
      CANONICAL_VOCABULARY_TOTAL,
      now
    );
    expect(progress.status).toBe('Struggling');
    expect(progress.isWeak).toBe(true);
    expect(progress.isForgotten).toBe(true);
    expect(progress.isLeech).toBe(true);
    expect(summary.weak).toBe(1);
    expect(summary.forgotten).toBe(1);
    expect(summary.leeches).toBe(1);
    expect(summary.dueToday).toBe(1);
  });

  it('searches canonical fields, skill use, derived status, and advanced filters', () => {
    const state = VocabularyMenuService.getState();
    expect(searchVocabularyMenu([term], 'height', state)).toEqual([term]);
    expect(searchVocabularyMenu([term], `y\u00fckseklik`, state)).toEqual([
      term,
    ]);
    expect(searchVocabularyMenu([term], 'noun', state)).toEqual([term]);
    expect(searchVocabularyMenu([term], 'reading', state)).toEqual([term]);
    expect(searchVocabularyMenu([term], 'New', state)).toEqual([term]);
    expect(
      searchVocabularyMenu([term], '', state, new Date(), {
        contentDomain: 'engineering',
        lifeContext: 'site',
      })
    ).toEqual([term]);
  });

  it('keeps My Vocabulary separate from canonical progress and totals', () => {
    VocabularyMenuService.addToMyVocabulary({
      term: 'fluxuator',
      turkishMeaning: `ak\u0131 d\u00fczenleyici`,
      exampleSentence: 'Check the fluxuator before startup.',
      cefrLevel: 'B1',
      domain: 'commissioning',
    });
    const state = VocabularyMenuService.getState();
    expect(state.myVocabulary).toHaveLength(1);
    expect(state.progress).toEqual({});
    expect(VocabularyMenuService.getSummary(state).total).toBe(5000);
    expect(VocabularyMenuService.getSummary(state).newWords).toBe(5000);
  });

  it('archives a custom word without deleting it or changing canonical totals', () => {
    const word = VocabularyMenuService.addToMyVocabulary({
      term: 'handover pack',
      turkishMeaning: 'devir paketi',
      exampleSentence: 'Archive the handover pack.',
      cefrLevel: 'B1',
      domain: 'commissioning',
    });
    VocabularyMenuService.archiveMyVocabulary(
      word.id,
      new Date('2026-06-29T12:00:00Z')
    );
    const state = VocabularyMenuService.getState();
    expect(state.myVocabulary).toHaveLength(1);
    expect(state.myVocabulary[0].archivedAt).not.toBeNull();
    expect(VocabularyMenuService.getSummary(state).total).toBe(5000);
  });

  it('keeps mastered words in rare SRS and marks a later failure forgotten', () => {
    const learnedAt = new Date('2026-06-01T10:00:00Z');
    VocabularyMenuService.reviewWord(term.id, true, learnedAt);
    VocabularyMenuService.reviewWord(term.id, true, learnedAt);
    const mastered = VocabularyMenuService.reviewWord(term.id, true, learnedAt);
    expect(mastered.nextReviewDate).toBe('2026-06-08T10:00:00.000Z');
    expect(
      VocabularyMenuService.getSummary(
        undefined,
        5000,
        new Date('2026-06-08T10:00:00Z')
      ).dueToday
    ).toBe(1);
    expect(
      VocabularyMenuService.reviewWord(
        term.id,
        false,
        new Date('2026-06-08T10:00:00Z')
      ).isForgotten
    ).toBe(true);
  });

  it('explains why weak and scheduled words return to review', () => {
    const now = new Date('2026-06-29T10:00:00.000Z');
    const weak = VocabularyMenuService.reviewWord(
      term.id,
      false,
      now,
      term.term
    );
    expect(getVocabularyReviewReason(weak, now)).toContain('weak recall');

    const mastered = {
      ...weak,
      status: 'Mastered' as const,
      isWeak: false,
      isForgotten: false,
      correctReviews: 3,
      wrongReviews: 0,
      nextReviewDate: now.toISOString(),
    };
    expect(getVocabularyReviewReason(mastered, now)).toContain(
      'maintenance review'
    );
  });
});
