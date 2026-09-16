import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { configure, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MemoryRouter } from 'react-router-dom';

import { useLearningStore } from '@/core/learning';

import { useAuthStore } from '@/features/auth';

import ProgressPage from '@/pages/ProgressPage';

/**
 * Regression guard for the ProgressPage "Maximum update depth exceeded" fault.
 *
 * ProgressPage used to read the learning store through an object-building
 * selector. Zustand v5 subscribes with `useSyncExternalStore`, whose snapshot
 * must be referentially stable: a selector that returns a fresh object on every
 * call looks like a changed snapshot on every check, so React re-renders until
 * it throws and the error boundary takes over.
 *
 * `@/core/learning` is deliberately NOT mocked here. The neighbouring
 * navigation suite replaces `useLearningStore` with a stub that calls
 * `selector(state)` once, which never exercises the subscription — that is why
 * the fault survived a green suite. Only the real store can catch this class of
 * bug, so this file renders the page against it.
 */

configure({ asyncUtilTimeout: 10000 });

const renderProgressPage = async () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const view = render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/progress']}>
        <ProgressPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
  // useLearningCockpit loads its data through react-query. Waiting for that
  // cache to settle keeps those state updates inside act(), instead of leaking
  // an "update was not wrapped in act" warning into the suite.
  await waitFor(() => {
    expect(client.getQueryCache().findAll().length).toBeGreaterThan(0);
  });
  await waitFor(() => {
    expect(client.isFetching()).toBe(0);
  });
  return view;
};

/** Value rendered in a QuickStats card, located by its label. */
const statValue = (label: string): string | null | undefined => {
  const card = screen.getByText(label).closest('div')?.parentElement;
  return card?.querySelector('p')?.textContent;
};

beforeEach(() => {
  // Reset before rendering, never after: a store write while the page is still
  // mounted lands outside act() and React reports it as an unwrapped update.
  useLearningStore.getState().resetAll();
  useAuthStore.setState({
    currentUser: {
      id: 'progress-e2e-user',
      displayName: 'Progress E2E',
      email: 'progress-e2e@example.com',
      role: 'engineer',
      engineeringDiscipline: 'electrical',
      targetLevel: 'C1',
      location: 'Remote',
      avatarInitials: 'PE',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    isAuthenticated: true,
    isLoading: false,
  });
});

describe('ProgressPage E2E: renders against the real learning store', () => {
  it('shows the summed pool size instead of looping forever', async () => {
    // A non-empty store makes an unstable snapshot observable: the pre-fix
    // selector handed React a new object on every check regardless of content.
    useLearningStore.setState({
      vocabularyPool: ['v1', 'v2', 'v3'],
      grammarPool: ['g1'],
      speakingPool: ['s1', 's2'],
    });

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    await renderProgressPage();

    // Reaching this assertion at all is the regression guard: the fault threw
    // out of render and replaced the page with the error boundary fallback.
    await waitFor(() => {
      expect(statValue('Knowledge Pool')).toBe('6');
    });

    const complaints = errorSpy.mock.calls
      .map((call) => call.map(String).join(' '))
      .filter((message) => /Maximum update depth|too many re-renders/i.test(message));
    expect(complaints).toEqual([]);
    errorSpy.mockRestore();
  });

  it('counts the pools when the optional speaking pool is absent', async () => {
    useLearningStore.setState({
      vocabularyPool: ['v1', 'v2'],
      grammarPool: ['g1'],
      speakingPool: undefined,
    });

    await renderProgressPage();

    await waitFor(() => {
      expect(statValue('Knowledge Pool')).toBe('3');
    });
  });

  it('renders an empty store as zero rather than failing', async () => {
    await renderProgressPage();

    await waitFor(() => {
      expect(statValue('Knowledge Pool')).toBe('0');
    });
  });
});
