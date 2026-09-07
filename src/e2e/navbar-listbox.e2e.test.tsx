import { configure, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { MemoryRouter } from 'react-router-dom';

import { Navbar } from '@/pages/LandingPage/Navbar';

import { resetStores } from './test-utils/resetStores';

// The language selector renders real translated copy — use the actual
// localization module instead of the key-returning global test mock so the
// assertions check real user-visible labels.
vi.mock('@/features/localization', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/localization')>();
  return actual;
});

afterEach(() => {
  resetStores();
  localStorage.clear();
  document.documentElement.lang = 'en';
  document.documentElement.dir = 'ltr';
});

configure({ asyncUtilTimeout: 10000 });

const renderNavbar = () =>
  render(
    <MemoryRouter initialEntries={['/']}>
      <Navbar />
    </MemoryRouter>
  );

const trigger = () => screen.getByRole('button', { name: 'Select language' });
const listbox = () => screen.getByRole('listbox', { name: 'Select language' });
const option = (name: string) => screen.getByRole('option', { name: new RegExp(name) });

describe('Navbar language listbox (WAI-ARIA)', () => {
  it('opens as a listbox with the current language active', () => {
    renderNavbar();
    const btn = trigger();

    expect(btn).toHaveAttribute('aria-haspopup', 'listbox');
    expect(btn).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(btn);

    const box = listbox();
    expect(btn).toHaveAttribute('aria-expanded', 'true');
    expect(btn).toHaveAttribute('aria-controls', 'navbar-language-listbox');
    expect(box).toHaveAttribute('role', 'listbox');
    // Current language (en) is the initially active option
    expect(box).toHaveAttribute('aria-activedescendant', 'navbar-language-option-en');
    expect(box).toHaveFocus();
    expect(option('English')).toHaveAttribute('aria-selected', 'true');
  });

  it('moves the active option with ArrowDown/ArrowUp/Home/End', () => {
    renderNavbar();
    fireEvent.click(trigger());
    const box = listbox();

    // Sorted by English label: ar, zh, nl, en, fr, de, id, it, ja, pl, pt,
    // ru, es, tr, vi → ArrowDown from en lands on fr
    fireEvent.keyDown(box, { key: 'ArrowDown' });
    expect(box).toHaveAttribute('aria-activedescendant', 'navbar-language-option-fr');

    // ArrowUp from fr wraps back to en
    fireEvent.keyDown(box, { key: 'ArrowUp' });
    expect(box).toHaveAttribute('aria-activedescendant', 'navbar-language-option-en');

    // Home → first (ar), End → last (vi)
    fireEvent.keyDown(box, { key: 'Home' });
    expect(box).toHaveAttribute('aria-activedescendant', 'navbar-language-option-ar');
    fireEvent.keyDown(box, { key: 'End' });
    expect(box).toHaveAttribute('aria-activedescendant', 'navbar-language-option-vi');
  });

  it('selects the active option with Enter and moves focus back to the trigger', () => {
    renderNavbar();
    fireEvent.click(trigger());
    const box = listbox();

    fireEvent.keyDown(box, { key: 'ArrowDown' }); // en → fr
    fireEvent.keyDown(box, { key: 'Enter' });

    // Listbox closes, focus returns to the trigger, language is fr
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(trigger()).toHaveFocus();
    expect(trigger()).toHaveTextContent('🇫🇷');
    expect(document.documentElement.lang).toBe('fr');
  });

  it('supports type-ahead: pressing a letter jumps to the matching option', () => {
    renderNavbar();
    fireEvent.click(trigger());
    const box = listbox();

    fireEvent.keyDown(box, { key: 'G' });
    expect(box).toHaveAttribute('aria-activedescendant', 'navbar-language-option-de');
  });

  it('closes with Escape and restores focus to the trigger', () => {
    renderNavbar();
    fireEvent.click(trigger());
    const box = listbox();

    fireEvent.keyDown(box, { key: 'ArrowDown' });
    fireEvent.keyDown(box, { key: 'Escape' });

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(trigger()).toHaveFocus();
  });

  it('selects via mouse click', () => {
    renderNavbar();
    fireEvent.click(trigger());

    fireEvent.click(option('Français'));

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(trigger()).toHaveTextContent('🇫🇷');
  });
});
