import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { MemoryRouter } from 'react-router-dom';

import { Sidebar } from './Sidebar';

vi.mock('@/store/app.store', () => ({
  useAppStore: vi.fn(() => ({ isSidebarOpen: true, toggleSidebar: vi.fn() })),
}));

vi.mock('zustand/shallow', () => ({
  useShallow: vi.fn((fn: unknown) => fn),
}));

vi.mock('@/features/auth', () => ({
  useAuthStore: vi.fn(() => ({
    currentUser: { displayName: 'John Doe', email: 'john@test.com', uid: '1' },
    logout: vi.fn(),
  })),
}));

vi.mock('@/features/billing', () => ({
  useBillingStore: vi.fn(() => ({
    subscription: { planId: 'senior' },
  })),
  canAccessFeature: vi.fn(() => ({ allowed: true, requiredPlan: null })),
  LockedFeatureModal: () => null,
}));

vi.mock('@/shared/components/ThemeToggle', () => ({
  ThemeToggle: () => null,
}));

vi.mock('@/config/navigation.config', () => ({
  NAV_ITEMS: [],
}));

vi.mock('@/features/localization', () => ({
  useLocalizationStore: vi.fn(() => ({ language: 'en' })),
  NAVIGATION_TRANSLATIONS: { en: {} },
  INTERFACE_LANGUAGES: [
    { id: 'en', label: 'English', nativeLabel: 'English', available: true, flag: '🇬🇧' },
    { id: 'tr', label: 'Turkish', nativeLabel: 'Türkçe', available: true, flag: '🇹🇷' },
  ],
}));

vi.mock('@/config/product.config', () => ({
  PRODUCT_VERSION: '1.0.0',
}));

describe('Sidebar', () => {
  const renderSidebar = () =>
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );

  it('renders EngVox branding', () => {
    renderSidebar();
    expect(screen.getByText('EngVox')).toBeInTheDocument();
  });

  it('renders user display name', () => {
    renderSidebar();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('renders billing plan name', () => {
    renderSidebar();
    expect(screen.getByText('senior plan')).toBeInTheDocument();
  });

  it('renders sign out button', () => {
    renderSidebar();
    expect(screen.getByText('Sign Out')).toBeInTheDocument();
  });

  it('renders billing & plan button', () => {
    renderSidebar();
    expect(screen.getByText('Billing & Plan')).toBeInTheDocument();
  });

  it('renders navigation region', () => {
    renderSidebar();
    const navs = screen.getAllByRole('navigation', { name: 'Main navigation' });
    expect(navs.length).toBeGreaterThanOrEqual(1);
  });
});
