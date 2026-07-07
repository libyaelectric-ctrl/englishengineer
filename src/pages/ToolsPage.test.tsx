import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import ToolsPage from './ToolsPage';

describe('ToolsPage', () => {
  beforeEach(() => localStorage.clear());

  const renderWithRoute = (entry: string) => {
    render(
      <MemoryRouter initialEntries={[entry]}>
        <Routes>
          <Route path="/tools/:section" element={<ToolsPage />} />
          <Route path="/tools" element={<ToolsPage />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('renders heading and work tools by default', () => {
    renderWithRoute('/tools/work');
    expect(screen.getByRole('heading', { name: 'Tools' })).toBeInTheDocument();
    expect(screen.getByText(/WORK TOOLS/)).toBeInTheDocument();
  });

  it('shows QUICK TOOLS badge for quick route', () => {
    renderWithRoute('/tools/quick');
    expect(screen.getByRole('heading', { name: 'Tools' })).toBeInTheDocument();
    expect(screen.getByText(/QUICK TOOLS/)).toBeInTheDocument();
  });

  it('shows AI COPILOT badge for ai route', () => {
    renderWithRoute('/tools/ai');
    expect(screen.getByRole('heading', { name: 'Tools' })).toBeInTheDocument();
    expect(screen.getByText(/AI COPILOT/)).toBeInTheDocument();
  });
});
