import { useEffect, useRef, useState } from 'react';

/**
 * Lazy loads an image when it enters the viewport.
 * @param src - Image source URL
 * @param options - IntersectionObserver options
 * @returns Object with ref, image src, and loading state
 */
export function useLazyImage(src: string, options?: IntersectionObserverInit) {
  const ref = useRef<HTMLImageElement>(null);
  const [imageSrc, setImageSrc] = useState<string | undefined>(undefined);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setImageSrc(src);
          observer.unobserve(element);
        }
      },
      { rootMargin: '100px', ...options }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [src, options]);

  useEffect(() => {
    if (!imageSrc) return;

    const img = new Image();
    img.onload = () => setIsLoaded(true);
    img.src = imageSrc;
  }, [imageSrc]);

  return { ref, imageSrc, isLoaded };
}
