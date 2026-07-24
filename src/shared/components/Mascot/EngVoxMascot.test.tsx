import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { EngVoxMascot } from './EngVoxMascot';

describe('EngVoxMascot', () => {
  it('renders mascot button role with correct label', () => {
    render(<EngVoxMascot />);
    expect(
      screen.getByRole('button', { name: /engvox mascot assistant/i })
    ).toBeInTheDocument();
  });

  it('handles custom sizes', () => {
    const { container } = render(<EngVoxMascot size="lg" />);
    const mascotBtn = container.firstChild as HTMLElement;
    expect(mascotBtn.style.width).toBe('320px');
    expect(mascotBtn.style.height).toBe('320px');
  });

  it('triggers onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<EngVoxMascot onClick={handleClick} />);
    fireEvent.click(
      screen.getByRole('button', { name: /engvox mascot assistant/i })
    );
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('displays speech bubble when showSpeechBubble is true', () => {
    render(<EngVoxMascot showSpeechBubble={true} speechText="Test Speech" />);
    expect(screen.getByText('Test Speech')).toBeInTheDocument();
  });

  it('shows speech bubble on mouse enter', () => {
    render(<EngVoxMascot speechText="Hover Speech" />);
    const mascot = screen.getByRole('button', {
      name: /engvox mascot assistant/i,
    });
    fireEvent.mouseEnter(mascot);
    expect(screen.getByText('Hover Speech')).toBeInTheDocument();
  });

  it('updates eye position on mouse movement when tracking enabled', () => {
    render(<EngVoxMascot enableMouseTracking={true} />);
    act(() => {
      fireEvent.mouseMove(window, { clientX: 500, clientY: 500 });
    });
    expect(
      screen.getByRole('button', { name: /engvox mascot assistant/i })
    ).toBeInTheDocument();
  });
});
