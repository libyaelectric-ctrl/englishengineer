import { useState, useEffect, useRef, RefObject } from 'react';

interface UseIntersectionObserverOptions {
  threshold?: number;
  root?: Element | null;
  rootMargin?: string;
  freezeOnceVisible?: boolean;
}

export const useIntersectionObserver = <T extends Element>(
  options: UseIntersectionObserverOptions = {}
): [RefObject<T | null>, boolean] => {
  const { threshold = 0, root = null, rootMargin = '0%', freezeOnceVisible = false } = options;
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (freezeOnceVisible && isVisible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold, root, rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, root, rootMargin, freezeOnceVisible, isVisible]);

  return [ref as RefObject<T>, isVisible];
};

// Single element version
export const useInView = (options: UseIntersectionObserverOptions = {}) => {
  const [ref, inView] = useIntersectionObserver<HTMLDivElement>(options);
  return { ref, inView };
};
