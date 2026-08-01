import { useCallback, useEffect } from 'react';

interface UseKeyboardNavigationOptions {
  /** Key to trigger action (e.g., 'Enter', ' ') */
  key: string;
  /** Callback when key is pressed */
  onKeyPress: () => void;
  /** Whether the hook is enabled */
  enabled?: boolean;
  /** Elements to listen on (default: document) */
  target?: React.RefObject<HTMLElement>;
}

/**
 * Hook for keyboard navigation support.
 * Adds keyboard event listeners for accessibility.
 *
 * @example
 * useKeyboardNavigation({
 *   key: 'Enter',
 *   onKeyPress: () => handleSubmit(),
 * });
 */
export const useKeyboardNavigation = ({
  key,
  onKeyPress,
  enabled = true,
  target,
}: UseKeyboardNavigationOptions) => {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;
      if (e.key === key) {
        e.preventDefault();
        onKeyPress();
      }
    },
    [key, onKeyPress, enabled]
  );

  useEffect(() => {
    const element = target?.current || document;
    element.addEventListener('keydown', handleKeyDown as EventListener);
    return () => {
      element.removeEventListener('keydown', handleKeyDown as EventListener);
    };
  }, [handleKeyDown, target]);
};

interface UseArrowNavigationOptions {
  /** Container ref with navigable items */
  containerRef: React.RefObject<HTMLElement>;
  /** Selector for navigable items */
  itemSelector: string;
  /** Callback when item is selected (Enter/Space) */
  onSelect?: (index: number) => void;
  /** Whether vertical navigation (default: true) */
  vertical?: boolean;
}

/**
 * Hook for arrow key navigation in lists/menus.
 * Handles Up/Down or Left/Right arrow keys.
 */
export const useArrowNavigation = ({
  containerRef,
  itemSelector,
  onSelect,
  vertical = true,
}: UseArrowNavigationOptions) => {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const items = container.querySelectorAll(itemSelector);
      if (items.length === 0) return;

      const currentIndex = Array.from(items).indexOf(document.activeElement as Element);

      let nextIndex = currentIndex;

      if (vertical) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          nextIndex = (currentIndex + 1) % items.length;
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          nextIndex = (currentIndex - 1 + items.length) % items.length;
        }
      } else {
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          nextIndex = (currentIndex + 1) % items.length;
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          nextIndex = (currentIndex - 1 + items.length) % items.length;
        }
      }

      if (e.key === 'Home') {
        e.preventDefault();
        nextIndex = 0;
      } else if (e.key === 'End') {
        e.preventDefault();
        nextIndex = items.length - 1;
      }

      if (nextIndex !== currentIndex) {
        (items[nextIndex] as HTMLElement).focus();
      }

      if ((e.key === 'Enter' || e.key === ' ') && currentIndex >= 0) {
        e.preventDefault();
        onSelect?.(currentIndex);
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [containerRef, itemSelector, onSelect, vertical]);
};
