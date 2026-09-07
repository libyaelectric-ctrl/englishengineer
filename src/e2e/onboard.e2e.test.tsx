import { configure, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { MemoryRouter, useLocation } from 'react-router-dom';

import OnboardPage from '@/pages/OnboardPage';

import { resetStores } from './test-utils/resetStores';

// OnboardPage renders real translated copy — use the actual localization
// module (with real English UI strings) instead of the key-returning global
// test mock so the assertions below check real user-visible text.
vi.mock('@/features/localization', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/localization')>();
  return actual;
});

afterEach(() => {
  resetStores();
  localStorage.clear();
});

configure({ asyncUtilTimeout: 10000 });

const renderOnboard = (initialEntries = ['/onboard']) =>
  render(
    <MemoryRouter initialEntries={initialEntries}>
      <OnboardPage />
      <LocationProbe />
    </MemoryRouter>
  );

const finishButton = () => screen.getByRole('button', { name: /Finish/i });

const LocationProbe = () => {
  const { search } = useLocation();
  return <div data-testid="location-search">{search}</div>;
};

describe('OnboardPage E2E', () => {
  it('renders the onboard page with disciplines and languages', () => {
    renderOnboard();
    expect(screen.getByText('Set up your learning path')).toBeInTheDocument();
    expect(screen.getByText('Select your discipline')).toBeInTheDocument();
    expect(screen.getByText('Select your language')).toBeInTheDocument();
    // Discipline + language options render as radio groups
    expect(screen.getByRole('radio', { name: /^architecture/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /English/i })).toBeInTheDocument();
  });

  it('keeps Finish enabled and guides the user until both selections are made', () => {
    renderOnboard();
    const enterBtn = finishButton();
    expect(enterBtn).not.toBeDisabled();

    // Incomplete submit surfaces guidance instead of submitting silently
    fireEvent.click(enterBtn);
    expect(screen.getByRole('alert')).toHaveTextContent(/select your discipline and language/i);

    // Selecting only a discipline keeps the guidance visible
    fireEvent.click(screen.getByRole('radio', { name: /^architecture/i }));
    fireEvent.click(enterBtn);
    expect(screen.getByRole('alert')).toBeInTheDocument();

    // Selecting the language resolves the guidance
    fireEvent.click(screen.getByRole('radio', { name: /English/i }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(enterBtn).not.toBeDisabled();
  });

  it('marks selections as checked', () => {
    renderOnboard();
    fireEvent.click(screen.getByRole('radio', { name: /^architecture/i }));
    fireEvent.click(screen.getByRole('radio', { name: /English/i }));
    expect(screen.getByRole('radio', { name: /^architecture/i })).toBeChecked();
    expect(screen.getByRole('radio', { name: /English/i })).toBeChecked();
  });

  it('back link exists and shows Back text', () => {
    renderOnboard();
    expect(screen.getByRole('link', { name: /Back/i })).toBeInTheDocument();
  });

  it('theme toggle button exists', () => {
    renderOnboard();
    expect(screen.getByLabelText('Toggle theme')).toBeInTheDocument();
  });

  it('discipline can be changed after initial selection', () => {
    renderOnboard();
    fireEvent.click(screen.getByRole('radio', { name: /^architecture/i }));
    fireEvent.click(screen.getByRole('radio', { name: /software/i }));
    expect(screen.getByRole('radio', { name: /software/i })).toBeChecked();
    expect(screen.getByRole('radio', { name: /^architecture/i })).not.toBeChecked();
    expect(finishButton()).not.toBeDisabled();
  });

  it('selections are restored from and synced to the URL', () => {
    renderOnboard(['/onboard?discipline=architecture&lang=en']);
    expect(screen.getByRole('radio', { name: /^architecture/i })).toBeChecked();
    expect(screen.getByRole('radio', { name: /English/i })).toBeChecked();
    expect(finishButton()).not.toBeDisabled();

    // Changing a selection keeps the other param and updates the URL
    fireEvent.click(screen.getByRole('radio', { name: /software/i }));
    expect(screen.getByTestId('location-search')).toHaveTextContent('discipline=software');
    expect(screen.getByTestId('location-search')).toHaveTextContent('lang=en');
  });
});
