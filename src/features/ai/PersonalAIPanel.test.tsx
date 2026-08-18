import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { PersonalAIPanel } from './PersonalAIPanel';
import type { AiAnalyticsData } from './ai-analytics.service';

vi.mock('@/features/localization', () => ({
  useLocalizationStore: vi.fn(() => ({ language: 'en' })),
}));

vi.mock('@/features/auth', () => ({
  useAuthStore: vi.fn((selector) => selector({ currentUser: { role: 'user' } })),
}));

vi.mock('./ai-analytics.service', () => ({
  AiAnalyticsService: {
    fetch: vi.fn(
      async () =>
        ({
          userId: 'user_1',
          planId: 'free',
          limits: { used: 0, remaining: 3, daily: 3, monthly: null },
          totalRequests: 0,
          averageDurationMs: 0,
          totalEstimatedTokens: 0,
          estimatedCostUsd: 0,
          byOperation: [],
          byDay: [],
        }) as Promise<AiAnalyticsData>
    ),
    fetchAdmin: vi.fn(async () => null),
  },
}));

describe('PersonalAIPanel analytics visibility', () => {
  it('renders the AI analytics widget alongside the lesson generator', async () => {
    render(<PersonalAIPanel discipline="mechanical" cefrLevel="B1" />);

    expect(await screen.findByText('Kişisel AI Ders Üretici')).toBeTruthy();
    expect(screen.getByText('Ders Üret')).toBeTruthy();

    expect(await screen.findByText('AI Kullanım Analitiği')).toBeTruthy();
    expect(screen.getByText('Yenile')).toBeTruthy();
    expect(screen.getByText(/Henüz AI kullanımı yok/i)).toBeTruthy();
  });
});
