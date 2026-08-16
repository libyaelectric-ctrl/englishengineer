import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { storage } from '@/shared/storage';

import { YiboMascot } from './YiboMascot';

describe('YiboMascot', () => {
  beforeEach(() => {
    storage.globalRemove('yibo_mascot_hidden');
  });

  it('renders the mascot sprite', () => {
    render(<YiboMascot />);
    expect(screen.getByRole('button', { name: /make it hop/i })).toBeInTheDocument();
  });

  it('hides when the hide control is clicked', () => {
    render(<YiboMascot />);
    fireEvent.click(screen.getByRole('button', { name: /hide yibo mascot/i }));
    expect(storage.globalGet('yibo_mascot_hidden')).toBe(true);
    expect(screen.getByRole('button', { name: /show yibo mascot/i })).toBeInTheDocument();
  });

  it('re-shows when the restore chip is clicked', () => {
    render(<YiboMascot />);
    fireEvent.click(screen.getByRole('button', { name: /hide yibo mascot/i }));
    fireEvent.click(screen.getByRole('button', { name: /show yibo mascot/i }));
    expect(storage.globalGet('yibo_mascot_hidden')).toBe(false);
    expect(screen.getByRole('button', { name: /make it hop/i })).toBeInTheDocument();
  });

  it('starts hidden when previously dismissed', () => {
    storage.globalSet('yibo_mascot_hidden', true);
    render(<YiboMascot />);
    expect(screen.getByRole('button', { name: /show yibo mascot/i })).toBeInTheDocument();
  });

  it('hops when the sprite is clicked', () => {
    render(<YiboMascot />);
    const sprite = screen.getByRole('button', { name: /make it hop/i });
    fireEvent.click(sprite);
    expect(sprite.className).toContain('yibo-hop');
  });
});
