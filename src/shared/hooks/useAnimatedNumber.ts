import { useEffect, useState } from 'react';

/**
 * Animates a number from its current value to the target value
 * using requestAnimationFrame with easeOutQuart easing.
 */
export const useAnimatedNumber = (value: number, duration: number = 1.5) => {
  const [displayValue, setDisplayValue] = useState(0);
  useEffect(() => {
    let startTime: number;
    let rafId: number;
    const startValue = displayValue;
    const distance = value - startValue;
    const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const timeElapsed = (currentTime - startTime) / (duration * 1000);
      const progress = Math.min(timeElapsed, 1);
      setDisplayValue(Math.floor(startValue + distance * easeOutQuart(progress)));
      if (progress < 1) rafId = requestAnimationFrame(animate);
      else setDisplayValue(value);
    };
    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [value, duration]); // eslint-disable-line react-hooks/exhaustive-deps -- startValue is intentionally captured per run
  return displayValue;
};
