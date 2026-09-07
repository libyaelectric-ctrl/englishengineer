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
