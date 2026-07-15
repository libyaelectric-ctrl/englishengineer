import { useState, useCallback } from 'react';

interface UndoRedoState<T> {
  past: T[];
  present: T;
  future: T[];
}

export function useUndoRedo<T>(initialState: T, maxHistory = 10) {
  const [state, setState] = useState<UndoRedoState<T>>({
    past: [],
    present: initialState,
    future: [],
  });

  const set = useCallback(
    (newState: T | ((prev: T) => T)) => {
      setState((current) => {
        const resolved = typeof newState === 'function'
          ? (newState as (prev: T) => T)(current.present)
          : newState;

        const past = [...current.past, current.present].slice(-maxHistory);
        return { past, present: resolved, future: [] };
      });
    },
    [maxHistory]
  );

  const undo = useCallback(() => {
    setState((current) => {
      if (current.past.length === 0) return current;
      const previous = current.past[current.past.length - 1];
      const past = current.past.slice(0, -1);
      return { past, present: previous, future: [current.present, ...current.future] };
    });
  }, []);

  const redo = useCallback(() => {
    setState((current) => {
      if (current.future.length === 0) return current;
      const next = current.future[0];
      const future = current.future.slice(1);
      return { past: [...current.past, current.present], present: next, future };
    });
  }, []);

  const canUndo = state.past.length > 0;
  const canRedo = state.future.length > 0;

  return { state: state.present, set, undo, redo, canUndo, canRedo };
}
