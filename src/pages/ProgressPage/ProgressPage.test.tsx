import { render } from '@testing-library/react';
import { describe, it, vi } from 'vitest';

import { MemoryRouter } from 'react-router-dom';

import ProgressPage from './index';

vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: vi.fn(),
  useParams: vi.fn(() => ({ section: 'overview' })),
}));

vi.mock('./ProgressOverviewTab', () => ({
  ProgressOverviewTab: () => <div data-testid="overview-tab">Overview</div>,
}));

vi.mock('./ProgressNextStepsTab', () => ({
  ProgressNextStepsTab: () => <div data-testid="next-steps-tab">Next Steps</div>,
}));

describe('ProgressPage', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter initialEntries={['/progress']}>
        <ProgressPage />
      </MemoryRouter>
    );
  });
});
