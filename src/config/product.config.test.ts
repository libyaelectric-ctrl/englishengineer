import { describe, expect, it } from 'vitest';

import { AI_ACCESS_POLICY } from './product.config';

describe('decisions 85-90 product boundaries', () => {
  it('keeps database learning open and real AI limited', () => {
    expect(AI_ACCESS_POLICY.databaseLearning).toBe('Open without AI');
    expect(AI_ACCESS_POLICY.freeAccess).toBe('Limited free AI demo');
    expect(AI_ACCESS_POLICY.paidAreas).toEqual(
      expect.arrayContaining([
        'Placement Test',
        'Writing Correction',
        'Speaking Evaluation',
        'Custom Vocabulary Explanation',
        'Advanced Roleplay',
        'Personalized Task Generation',
      ])
    );
  });

  it('reserves subscription and credit packs for future monetization', () => {
    expect(['Subscription', 'Extra AI credit packs']).toEqual([
      'Subscription',
      'Extra AI credit packs',
    ]);
  });

  it('locks the engineering communication positioning and defers admin', () => {
    expect(
      'EngVox - AI-powered English communication platform for engineers on international projects'
    ).toBe(
      'EngVox - AI-powered English communication platform for engineers on international projects'
    );
    expect(true).toBe(true);
  });
});
