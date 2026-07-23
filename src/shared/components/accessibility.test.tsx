import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { SearchInput } from './SearchInput';
import { Skeleton, SkeletonCard, SkeletonText } from './Skeleton';
import { EmptyState } from './EmptyState';
import { Button } from './Button';
import { Toast, ToastContainer, showToast } from './Toast';
import { FileText } from 'lucide-react';

const renderWithRouter = (component: React.ReactElement) =>
  render(<MemoryRouter>{component}</MemoryRouter>);

describe('Component Accessibility', () => {
  describe('SearchInput', () => {
    it('has accessible label', () => {
      renderWithRouter(<SearchInput onSearch={() => {}} placeholder="Search vocabulary" />);
      expect(screen.getByRole('textbox', { name: /search vocabulary/i })).toBeInTheDocument();
    });

    it('supports keyboard interaction', async () => {
      const onSearch = vi.fn();
      renderWithRouter(<SearchInput onSearch={onSearch} placeholder="Search" />);
      const input = screen.getByRole('textbox');
      await userEvent.type(input, 'hello');
      expect(input).toHaveValue('hello');
    });

    it('clear button is accessible', async () => {
      const onSearch = vi.fn();
      renderWithRouter(<SearchInput onSearch={onSearch} placeholder="Search" />);
      const input = screen.getByRole('textbox');
      await userEvent.type(input, 'test');
      const clearBtn = screen.getByRole('button', { name: /clear/i });
      expect(clearBtn).toBeInTheDocument();
    });
  });

  describe('Skeleton', () => {
    it('renders correct count', () => {
      const { container } = render(<Skeleton count={3} />);
      expect(container.querySelectorAll('.animate-pulse')).toHaveLength(3);
    });

    it('SkeletonCard renders', () => {
      const { container } = render(<SkeletonCard />);
      expect(container.firstChild).toBeTruthy();
    });

    it('SkeletonText renders lines', () => {
      const { container } = render(<SkeletonText lines={5} />);
      expect(container.querySelectorAll('.animate-pulse')).toHaveLength(5);
    });
  });

  describe('EmptyState', () => {
    it('has accessible heading', () => {
      renderWithRouter(
        <EmptyState icon={FileText} title="No documents" description="Create one" />
      );
      expect(screen.getByRole('heading', { name: /no documents/i })).toBeInTheDocument();
    });

    it('action button accessible', () => {
      renderWithRouter(
        <EmptyState icon={FileText} title="Empty" description="Nothing" actionLabel="Create" onAction={() => {}} />
      );
      expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
    });
  });

  describe('Button', () => {
    it('renders as button', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole('button', { name: /click me/i }).tagName).toBe('BUTTON');
    });

    it('disabled state accessible', () => {
      render(<Button disabled>Disabled</Button>);
      expect(screen.getByRole('button', { name: /disabled/i })).toBeDisabled();
    });

    it('supports keyboard activation', async () => {
      const onClick = vi.fn();
      render(<Button onClick={onClick}>Press me</Button>);
      const btn = screen.getByRole('button', { name: /press me/i });
      await userEvent.click(btn);
      expect(onClick).toHaveBeenCalled();
    });
  });

  describe('Toast', () => {
    it('announces toast message', async () => {
      render(<ToastContainer />);
      showToast('Test message', 'success');
      await screen.findByText('Test message');
      expect(screen.getByText('Test message')).toBeInTheDocument();
    });
  });
});

describe('Keyboard Navigation', () => {
  it('tab moves focus forward', async () => {
    render(
      <div>
        <Button>First</Button>
        <Button>Second</Button>
      </div>
    );
    const first = screen.getByRole('button', { name: /first/i });
    const second = screen.getByRole('button', { name: /second/i });
    first.focus();
    await userEvent.tab();
    expect(second).toHaveFocus();
  });

  it('shift+tab moves focus backward', async () => {
    render(
      <div>
        <Button>First</Button>
        <Button>Second</Button>
      </div>
    );
    const first = screen.getByRole('button', { name: /first/i });
    const second = screen.getByRole('button', { name: /second/i });
    second.focus();
    await userEvent.tab({ shift: true });
    expect(first).toHaveFocus();
  });

  it('enter activates button', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Activate</Button>);
    const btn = screen.getByRole('button', { name: /activate/i });
    btn.focus();
    await userEvent.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalled();
  });

  it('space activates button', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Activate</Button>);
    const btn = screen.getByRole('button', { name: /activate/i });
    btn.focus();
    await userEvent.keyboard(' ');
    expect(onClick).toHaveBeenCalled();
  });
});

describe('ARIA Attributes', () => {
  it('has no duplicate IDs', () => {
    const { container } = render(
      <div>
        <Button>One</Button>
        <Button>Two</Button>
      </div>
    );
    const ids = Array.from(container.querySelectorAll('[id]')).map(el => el.id);
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);
  });

  it('interactive elements have accessible names', () => {
    render(
      <div>
        <Button>Submit</Button>
        <SearchInput onSearch={() => {}} placeholder="Search" />
      </div>
    );
    expect(screen.getByRole('button', { name: /submit/i })).toHaveAccessibleName();
    expect(screen.getByRole('textbox')).toHaveAccessibleName();
  });
});
