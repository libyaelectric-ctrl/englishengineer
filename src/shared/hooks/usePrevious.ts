import { useEffect, useRef } from 'react';

export const usePrevious = <T>(value: T): T | undefined => {
  const ref = useRef<T | undefined>(undefined);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
};

// Compare hook
export const useChanged = <T>(
  value: T
): { current: T; previous: T | undefined; changed: boolean } => {
  const previous = usePrevious(value);
  return {
    current: value,
    previous,
    changed: previous !== value,
  };
};
