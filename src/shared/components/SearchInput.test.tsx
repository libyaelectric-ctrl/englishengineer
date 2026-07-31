import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SearchInput } from './SearchInput';

describe('SearchInput', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('renders with placeholder', () => {
    render(<SearchInput onSearch={vi.fn()} placeholder="Search lessons..." />);
    expect(screen.getByPlaceholderText('Search lessons...')).toBeTruthy();
  });

  it('calls onSearch after debounce', () => {
    const onSearch = vi.fn();
    render(<SearchInput onSearch={onSearch} debounceMs={300} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'grammar' } });

    expect(onSearch).not.toHaveBeenCalled();

    vi.advanceTimersByTime(300);
    expect(onSearch).toHaveBeenCalledWith('grammar');
  });

  it('shows clear button when input has value', () => {
    render(<SearchInput onSearch={vi.fn()} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test' } });

    expect(screen.getByLabelText('Clear search')).toBeTruthy();
  });

  it('clears input and calls onSearch with empty string', () => {
    const onSearch = vi.fn();
    render(<SearchInput onSearch={onSearch} />);
    const input = screen.getByRole('textbox');

    fireEvent.change(input, { target: { value: 'test' } });
    vi.advanceTimersByTime(300);

    const clearBtn = screen.getByLabelText('Clear search');
    fireEvent.click(clearBtn);

    expect(onSearch).toHaveBeenCalledWith('');
  });
});
