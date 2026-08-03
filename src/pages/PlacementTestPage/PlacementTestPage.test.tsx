import { render } from '@testing-library/react';
import { describe, it, vi } from 'vitest';

import { MemoryRouter } from 'react-router-dom';

import PlacementPage from '../PlacementPage';

vi.mock('@/features/auth', async (importOriginal) => ({
  ...(await importOriginal()),
  useAuthStore: vi.fn(() => ({
    currentUser: { id: 'user-1' },
  })),
}));

vi.mock('@/features/placement', async (importOriginal) => ({
  ...(await importOriginal()),
  usePlacementStore: vi.fn(() => ({
    currentIndex: 0,
    answers: {},
    result: null,
    answer: vi.fn(),
    next: vi.fn(),
    previous: vi.fn(),
    submit: vi.fn(),
    reset: vi.fn(),
  })),
}));

vi.mock('@/shared/components/Button', () => ({
  Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock('@/shared/components/ProgressBar', () => ({
  ProgressBar: () => null,
}));

describe('PlacementTestPage', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter initialEntries={['/placement']}>
        <PlacementPage />
      </MemoryRouter>
    );
  });
});
