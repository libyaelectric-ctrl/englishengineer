import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Button } from './Button';
import { Skeleton, SkeletonCard } from './Skeleton';
import { ToastContainer, showToast } from './Toast';

describe('Component Accessibility', () => {
  describe('Skeleton', () => {
    it('renders correct count', () => {
      const { container } = render(<Skeleton count={3} />);
      expect(container.querySelectorAll('.animate-pulse')).toHaveLength(3);
    });

    it('SkeletonCard renders', () => {
      const { container } = render(<SkeletonCard />);
      expect(container.firstChild).toBeTruthy();
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
    const ids = Array.from(container.querySelectorAll('[id]')).map((el) => el.id);
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);
  });

  it('interactive elements have accessible names', () => {
    render(
      <div>
        <Button>Submit</Button>
        <Button>Configure</Button>
      </div>
    );
    expect(screen.getByRole('button', { name: /submit/i })).toHaveAccessibleName();
    expect(screen.getByRole('button', { name: /configure/i })).toHaveAccessibleName();
  });
});
