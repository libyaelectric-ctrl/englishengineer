import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ThemeProvider, useTheme } from './ThemeProvider';

/**
 * Controllable `matchMedia` stub for the `(prefers-color-scheme: dark)` query,
 * so a test can flip the OS preference and observe the provider react to it.
 */
const stubSystemTheme = (initialDark: boolean) => {
  let matches = initialDark;
  const listeners = new Set<() => void>();
  const mediaQuery = {
    get matches() {
      return matches;
    },
    media: '(prefers-color-scheme: dark)',
    onchange: null,
    addEventListener: (_type: string, listener: () => void) => {
      listeners.add(listener);
    },
    removeEventListener: (_type: string, listener: () => void) => {
      listeners.delete(listener);
    },
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  } as unknown as MediaQueryList;

  vi.stubGlobal('matchMedia', () => mediaQuery);

  return {
    setSystemDark(next: boolean) {
      matches = next;
      for (const listener of listeners) listener();
    },
    listenerCount: () => listeners.size,
  };
};

const Probe = () => {
  const { mode, theme, isAuto, toggleTheme, setMode, resetToAuto } = useTheme();
  return (
    <div>
      <span data-testid="state">{`${mode}:${theme}:${String(isAuto)}`}</span>
      <button type="button" onClick={toggleTheme}>
        toggle
      </button>
      <button type="button" onClick={() => setMode('light')}>
        set-light
      </button>
      <button type="button" onClick={resetToAuto}>
        reset
      </button>
    </div>
  );
};

const renderProbe = () =>
  render(
    <ThemeProvider>
      <Probe />
    </ThemeProvider>
  );

const readState = () => screen.getByTestId('state').textContent;
const root = () => document.documentElement;

beforeEach(() => {
  root().removeAttribute('data-theme');
  root().removeAttribute('data-theme-mode');
  root().classList.remove('dark');
  root().style.colorScheme = '';
});

describe('ThemeProvider', () => {
  it('follows the system preference in auto mode', () => {
    stubSystemTheme(true);
    renderProbe();

    expect(readState()).toBe('auto:dark:true');
    expect(root().getAttribute('data-theme')).toBe('dark');
    expect(root().getAttribute('data-theme-mode')).toBe('auto');
    expect(root().classList.contains('dark')).toBe(true);
    expect(root().style.colorScheme).toBe('dark');
  });

  it('re-resolves when the system preference changes at runtime', () => {
    const system = stubSystemTheme(false);
    renderProbe();
    expect(readState()).toBe('auto:light:true');

    act(() => system.setSystemDark(true));

    expect(readState()).toBe('auto:dark:true');
    expect(root().getAttribute('data-theme')).toBe('dark');
  });

  it('does not derive the theme from the time of day', () => {
    const getHours = vi.spyOn(Date.prototype, 'getHours').mockReturnValue(23);
    stubSystemTheme(false);
    renderProbe();

    expect(readState()).toBe('auto:light:true');
    getHours.mockRestore();
  });

  it('lets a stored override win over the system preference', () => {
    localStorage.setItem('engvox-theme-mode', 'light');
    stubSystemTheme(true);
    renderProbe();

    expect(readState()).toBe('light:light:false');
    expect(root().getAttribute('data-theme-mode')).toBe('light');
  });

  it('ignores system preference changes while an override is stored', () => {
    localStorage.setItem('engvox-theme-mode', 'light');
    const system = stubSystemTheme(false);
    renderProbe();

    act(() => system.setSystemDark(true));

    expect(readState()).toBe('light:light:false');
    expect(root().getAttribute('data-theme')).toBe('light');
  });

  it('migrates the legacy theme key as a manual override', () => {
    localStorage.setItem('engvox-theme', 'dark');
    stubSystemTheme(false);
    renderProbe();

    expect(readState()).toBe('dark:dark:false');
  });

  it('persists a manual toggle and can return to system mode', () => {
    stubSystemTheme(false);
    renderProbe();

    act(() => screen.getByRole('button', { name: 'toggle' }).click());
    expect(readState()).toBe('dark:dark:false');
    expect(localStorage.getItem('engvox-theme-mode')).toBe('dark');

    act(() => screen.getByRole('button', { name: 'reset' }).click());
    expect(readState()).toBe('auto:light:true');
    expect(localStorage.getItem('engvox-theme-mode')).toBe('auto');
    expect(localStorage.getItem('engvox-theme')).toBeNull();
  });

  it('unsubscribes from the media query on unmount', () => {
    const system = stubSystemTheme(true);
    const { unmount } = renderProbe();

    unmount();

    expect(system.listenerCount()).toBe(0);
  });
});
