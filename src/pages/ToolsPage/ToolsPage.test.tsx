import { render } from '@testing-library/react';
import { describe, it, vi } from 'vitest';

import { MemoryRouter } from 'react-router-dom';

import ToolsPage from '../ToolsPage';

vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal()),
  useParams: vi.fn(() => ({ section: 'work' })),
}));

vi.mock('./WorkToolsPage', () => ({
  __esModule: true,
  default: ({ embedded }: { embedded?: boolean }) => (
    <div data-testid="work-tools">Work Tools {embedded && '(embedded)'}</div>
  ),
}));

vi.mock('./QuickToolsPage', () => ({
  __esModule: true,
  default: ({ embedded }: { embedded?: boolean }) => (
    <div data-testid="quick-tools">Quick Tools {embedded && '(embedded)'}</div>
  ),
}));

vi.mock('./AIPage', () => ({
  __esModule: true,
  default: ({ embedded }: { embedded?: boolean }) => (
    <div data-testid="ai-page">AI Page {embedded && '(embedded)'}</div>
  ),
}));

vi.mock('@/shared/components/PageHeader', () => ({
  PageHeader: () => null,
}));

describe('ToolsPage', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter initialEntries={['/tools']}>
        <ToolsPage />
      </MemoryRouter>
    );
  });
});
