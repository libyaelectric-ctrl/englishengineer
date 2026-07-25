import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useInfiniteScroll, useScrollInfiniteScroll } from './useInfiniteScroll';

describe('useInfiniteScroll', () => {
  it('returns a lastElementRef callback', () => {
    const { result } = renderHook(() =>
      useInfiniteScroll({
        onLoadMore: vi.fn(),
        hasMore: true,
        loading: false,
      })
    );
    expect(typeof result.current.lastElementRef).toBe('function');
  });

  it('does not call onLoadMore when loading', () => {
    const onLoadMore = vi.fn();
    renderHook(() =>
      useInfiniteScroll({
        onLoadMore,
        hasMore: true,
        loading: true,
      })
    );
    expect(onLoadMore).not.toHaveBeenCalled();
  });

  it('does not call onLoadMore when hasMore is false', () => {
    const onLoadMore = vi.fn();
    renderHook(() =>
      useInfiniteScroll({
        onLoadMore,
        hasMore: false,
        loading: false,
      })
    );
    expect(onLoadMore).not.toHaveBeenCalled();
  });

  it('cleans up observer on unmount', () => {
    const { unmount } = renderHook(() =>
      useInfiniteScroll({
        onLoadMore: vi.fn(),
        hasMore: true,
        loading: false,
      })
    );
    expect(() => unmount()).not.toThrow();
  });
});

describe('useScrollInfiniteScroll', () => {
  it('registers scroll listener', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    renderHook(() =>
      useScrollInfiniteScroll({
        onLoadMore: vi.fn(),
        hasMore: true,
        loading: false,
      })
    );
    expect(addSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
    addSpy.mockRestore();
  });

  it('removes scroll listener on unmount', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() =>
      useScrollInfiniteScroll({
        onLoadMore: vi.fn(),
        hasMore: true,
        loading: false,
      })
    );
    unmount();
    expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
    removeSpy.mockRestore();
  });
});
