import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { PublicLayout } from './PublicLayout';

vi.mock('@/store/app.store', () => ({
  useAppStore: vi.fn(() => ({
    theme: 'dark',
    setTheme: vi.fn(),
  })),
}));

describe('PublicLayout', () => {
  const renderLayout = (path = '/business') =>
    render(
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/business" element={<div>Child Page</div>} />
            <Route path="/" element={<div>Landing Page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

  it('renders children via Outlet', () => {
    renderLayout('/business');
    expect(screen.getByText('Child Page')).toBeInTheDocument();
  });

  it('renders EngVox branding when nav is visible', () => {
    renderLayout('/business');
    expect(screen.getByText('EngVox')).toBeInTheDocument();
  });

  it('renders public navigation links when nav is visible', () => {
    renderLayout('/business');
    expect(screen.getByRole('navigation', { name: 'Public navigation' })).toBeInTheDocument();
  });

  it('renders login and start buttons when nav is visible', () => {
    renderLayout('/business');
    expect(screen.getByText('Log in')).toBeInTheDocument();
    expect(screen.getByText('Start free')).toBeInTheDocument();
  });

  it('hides nav on landing page', () => {
    renderLayout('/');
    expect(screen.queryByLabelText('Public navigation')).not.toBeInTheDocument();
  });

  it('hides nav on pricing page', () => {
    render(
      <MemoryRouter initialEntries={['/pricing']}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/pricing" element={<div>Pricing</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );
    expect(screen.queryByLabelText('Public navigation')).not.toBeInTheDocument();
  });
});