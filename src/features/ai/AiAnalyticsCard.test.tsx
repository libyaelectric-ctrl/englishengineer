import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useAuthStore } from '@/features/auth';

import { AiAnalyticsCard } from './AiAnalyticsCard';
import {
  type AiAdminAnalytics,
  type AiAnalyticsData,
  AiAnalyticsService,
} from './ai-analytics.service';

vi.mock('./ai-analytics.service', () => ({
  AiAnalyticsService: {
    fetch: vi.fn(),
    fetchAdmin: vi.fn(),
  },
}));

vi.mock('@/features/auth', () => ({
  useAuthStore: vi.fn(),
}));

const analyticsData: AiAnalyticsData = {
  userId: 'user_1',
  planId: 'free',
  limits: { used: 2, remaining: 1, daily: 3, monthly: null },
  totalRequests: 3,
  averageDurationMs: 1400,
  totalEstimatedTokens: 6400,
  estimatedCostUsd: 0.0042,
  byOperation: [{ operation: 'writing_rewrite', count: 2 }],
  byDay: [{ date: '2026-08-17', count: 3 }],
};

const adminData: AiAdminAnalytics = {
  totalRequests: 10,
  totalEstimatedTokens: 20000,
  estimatedCostUsd: 0.02,
  topUsers: [
    { userId: 'user_a', totalRequests: 5, totalEstimatedTokens: 10000, estimatedCostUsd: 0.01 },
  ],
};

const mockRole = (role: string) =>
  vi
    .mocked(useAuthStore)
    .mockImplementation((selector) => selector({ currentUser: { role } } as never) as never);

describe('AiAnalyticsCard', () => {
  it('renders usage stats and the quota bar', async () => {
    mockRole('user');
    vi.mocked(AiAnalyticsService.fetch).mockResolvedValue(analyticsData);
    vi.mocked(AiAnalyticsService.fetchAdmin).mockResolvedValue(null);

    render(<AiAnalyticsCard />);

    expect(await screen.findByText('AI Kullanım Analitiği')).toBeTruthy();
    expect(screen.getByText('Yenile')).toBeTruthy();
    expect(screen.getByText('6.400')).toBeTruthy();
    expect(screen.getByText('2 / 3')).toBeTruthy();
    expect(screen.getByText('writing_rewrite')).toBeTruthy();
    expect(screen.queryByText('Yönetici Özeti (tüm kullanıcılar)')).toBeNull();
  });

  it('renders the admin summary for admin users', async () => {
    mockRole('admin');
    vi.mocked(AiAnalyticsService.fetch).mockResolvedValue(analyticsData);
    vi.mocked(AiAnalyticsService.fetchAdmin).mockResolvedValue(adminData);

    render(<AiAnalyticsCard />);

    expect(await screen.findByText('Yönetici Özeti (tüm kullanıcılar)')).toBeTruthy();
    expect(screen.getByText('user_a')).toBeTruthy();
  });

  it('shows an empty state when no usage exists', async () => {
    mockRole('user');
    vi.mocked(AiAnalyticsService.fetch).mockResolvedValue({
      ...analyticsData,
      totalRequests: 0,
      byOperation: [],
      byDay: [],
    });

    render(<AiAnalyticsCard />);

    await waitFor(() => {
      expect(screen.getByText(/Henüz AI kullanımı yok/i)).toBeTruthy();
    });
  });
});
