import { describe, expect, it } from 'vitest';
import {
  ADMIN_PANEL_ENABLED,
  AI_ACCESS_POLICY,
  FUTURE_MONETIZATION_OPTIONS,
  PRODUCT_POSITIONING,
} from './product.config';

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
    expect(FUTURE_MONETIZATION_OPTIONS).toEqual([
      'Subscription',
      'Extra AI credit packs',
    ]);
  });

  it('locks the engineering communication positioning and defers admin', () => {
    expect(PRODUCT_POSITIONING).toBe(
      'EngineerOS - AI-powered English communication platform for engineers on international projects'
    );
    expect(ADMIN_PANEL_ENABLED).toBe(false);
  });
});
