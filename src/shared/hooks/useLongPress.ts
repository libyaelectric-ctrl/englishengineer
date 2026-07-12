import { useCallback, useRef } from 'react';

interface UseLongPressOptions {
  delay?: number;
  onLongPress: () => void;
  onPress?: () => void;
}

export const useLongPress = ({
  delay = 500,
  onLongPress,
  onPress,
}: UseLongPressOptions) => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPress = useRef(false);

  const start = useCallback(() => {
    isLongPress.current = false;
    timerRef.current = setTimeout(() => {
      isLongPress.current = true;
      onLongPress();
    }, delay);
  }, [delay, onLongPress]);

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (!isLongPress.current && onPress) {
      onPress();
    }
  }, [onPress]);

  return {
    onMouseDown: start,
    onMouseUp: stop,
    onMouseLeave: stop,
    onTouchStart: start,
    onTouchEnd: stop,
  };
};
