import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { AppShell } from './AppShell';

vi.mock('@/store/app.store', () => ({
  useAppStore: vi.fn(() => ({ isSidebarOpen: false, toggleSidebar: vi.fn() })),
}));

vi.mock('@/shared/hooks/useKeyboardNavigation', () => ({
  useKeyboardNavigation: vi.fn(),
}));

vi.mock('@/features/beta', () => ({
  BetaAnalyticsTracker: () => null,
  BetaFeedbackWidget: () => null,
}));

vi.mock('@/features/auth', () => ({
  useAuthStore: vi.fn(() => ({
    currentUser: { displayName: 'Test User', email: 'test@test.com', uid: '1' },
    logout: vi.fn(),
  })),
}));

vi.mock('@/features/billing', () => ({
  useBillingStore: vi.fn(() => ({
    subscription: { planId: 'junior' },
  })),
  canAccessFeature: vi.fn(() => ({ allowed: true, requiredPlan: null })),
  LockedFeatureModal: () => null,
}));

vi.mock('@/shared/components/ThemeToggle', () => ({
  ThemeToggle: () => null,
}));

vi.mock('@/shared/components/CommandPalette', () => ({
  default: () => null,
}));

vi.mock('@/config/navigation.config', () => ({
  NAV_ITEMS: [],
}));

vi.mock('@/features/mascot', () => ({
  EngMascot: () => null,
  useMascotEvents: vi.fn(),
}));

vi.mock('@/core/learning', () => ({
  useLearningStore: vi.fn(() => ({ xp: 0, streak: 0, level: 1, studySessions: [] })),
}));

vi.mock('@/features/learning-intelligence', () => ({
  useLearningIntelligenceStore: vi.fn(() => ({ mistakeLog: [] })),
}));

vi.mock('@/features/localization', () => ({
  useLocalizationStore: vi.fn(() => ({ language: 'en' })),
  NAVIGATION_TRANSLATIONS: { en: {} },
  INTERFACE_LANGUAGES: [
    { id: 'en', label: 'English', nativeLabel: 'English', available: true, flag: '🇬🇧' },
    { id: 'tr', label: 'Turkish', nativeLabel: 'Türkçe', available: true, flag: '🇹🇷' },
  ],
}));

vi.mock('@/layouts/MobileBottomNavigation', () => ({
  MobileBottomNavigation: () => <div>Mobile Bottom Nav</div>,
}));

vi.mock('@/layouts/RightSidebar', () => ({
  RightSidebar: () => <div>Right Sidebar</div>,
}));

vi.mock('@/config/product.config', () => ({
  PRODUCT_VERSION: '1.0.0',
}));

describe('AppShell', () => {
  const renderShell = () =>
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<div>Main Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

  it('renders sidebar, main content outlet, and bottom navigation', () => {
    renderShell();

    expect(screen.getByTestId('app-sidebar')).toBeInTheDocument();
    expect(screen.getByText('Main Content')).toBeInTheDocument();
    expect(screen.getByText('Mobile Bottom Nav')).toBeInTheDocument();
    expect(screen.getByText('Right Sidebar')).toBeInTheDocument();
  });

  it('renders EngVox branding in sidebar', () => {
    renderShell();

    expect(screen.getByText('EngVox')).toBeInTheDocument();
  });

  it('renders skip to content link', () => {
    renderShell();

    expect(screen.getByText('Skip to main content')).toBeInTheDocument();
  });
});
