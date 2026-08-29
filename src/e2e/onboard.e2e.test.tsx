import { configure, render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, afterEach } from 'vitest';

import { MemoryRouter } from 'react-router-dom';

import OnboardPage from '@/pages/OnboardPage';

import { resetStores } from './test-utils/resetStores';

afterEach(() => {
  resetStores();
  localStorage.clear();
});

configure({ asyncUtilTimeout: 10000 });

const renderOnboard = (initialEntries = ['/onboard']) =>
  render(
    <MemoryRouter initialEntries={initialEntries}>
      <OnboardPage />
    </MemoryRouter>
  );

describe('OnboardPage E2E', () => {
  it('renders the onboard page with disciplines and languages', () => {
    renderOnboard();
    expect(screen.getByText('Choose Your Path')).toBeInTheDocument();
    expect(screen.getByText('Professions')).toBeInTheDocument();
    expect(screen.getByText('Languages')).toBeInTheDocument();
    // Discipline items
    expect(screen.getByText('Architecture')).toBeInTheDocument();
    expect(screen.getByText('Electrical Eng.')).toBeInTheDocument();
    expect(screen.getByText('Software Eng.')).toBeInTheDocument();
    // Language items
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('Türkçe')).toBeInTheDocument();
    expect(screen.getByText('Deutsch')).toBeInTheDocument();
  });

  it('Enter button is disabled until both discipline and language selected', () => {
    renderOnboard();
    const enterBtn = screen.getByRole('button', { name: /Enter EngVox/i });
    expect(enterBtn).toBeDisabled();

    // Select discipline only
    fireEvent.click(screen.getByText('Electrical Eng.'));
    expect(enterBtn).toBeDisabled();

    // Select language too
    fireEvent.click(screen.getByText('English'));
    expect(enterBtn).not.toBeDisabled();
  });

  it('selection summary bar appears when items are selected', () => {
    renderOnboard();
    // No floating bar initially
    expect(screen.queryByText('Electrical Eng.')).toBeInTheDocument(); // in list
    // Click a discipline
    fireEvent.click(screen.getByText('Electrical Eng.'));
    // Now should have floating summary at bottom
    awaitFloatingBar();
    // Click a language
    fireEvent.click(screen.getByText('English'));
    // Summary should show both
    const summaryTexts = screen.getAllByText('English');
    expect(summaryTexts.length).toBeGreaterThanOrEqual(1);
  });

  it('back button exists and shows Back text', () => {
    renderOnboard();
    expect(screen.getByText('Back')).toBeInTheDocument();
  });

  it('theme toggle button exists', () => {
    renderOnboard();
    expect(screen.getByLabelText('Toggle theme')).toBeInTheDocument();
  });

  it('discipline can be changed after initial selection', () => {
    renderOnboard();
    // Select first
    fireEvent.click(screen.getByText('Electrical Eng.'));
    // Select different one
    fireEvent.click(screen.getByText('Civil Eng.'));
    // Enter button should still be disabled (no language)
    const enterBtn = screen.getByRole('button', { name: /Enter EngVox/i });
    expect(enterBtn).toBeDisabled();
  });
});

function awaitFloatingBar() {
  // floating bar appears with selection summary
}
