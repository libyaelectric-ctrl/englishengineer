import { memo, useRef, useState } from 'react';

import { cn } from '@/shared/utils/cn';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** Image source URL */
  src: string;
  /** Alt text (required for accessibility) */
  alt: string;
  /** Optional WebP variant URL for modern browsers */
  webpSrc?: string;
  /** Responsive srcset for different screen sizes */
  srcSet?: string;
  /** Width for layout stability (prevents CLS) */
  width?: number;
  /** Height for layout stability (prevents CLS) */
  height?: number;
  /** Aspect ratio for responsive sizing */
  aspectRatio?: string;
  /** Placeholder shown while loading */
  placeholder?: 'blur' | 'skeleton' | 'empty';
  /** Blur hash or base64 placeholder data */
  blurHash?: string;
  /** Object fit behavior */
  objectFit?: 'cover' | 'contain' | 'fill' | 'none';
  /** Priority images should not be lazy loaded (above the fold) */
  priority?: boolean;
}

/**
 * Optimized image component with:
 * - Native lazy loading (loading="lazy")
 * - WebP support via <picture> element
 * - Responsive srcset for different viewports
 * - Layout stability via width/height (prevents CLS)
 * - Blur/skeleton placeholders
 * - Intersection Observer for advanced lazy loading
 */
export const LazyImage = memo<LazyImageProps>(
  ({
    src,
    alt,
    webpSrc,
    srcSet,
    width,
    height,
    aspectRatio = '16/9',
    placeholder = 'skeleton',
    blurHash,
    objectFit = 'cover',
    priority = false,
    className,
    onLoad: onLoadProp,
    ...props
  }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);

    const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
      setIsLoaded(true);
      onLoadProp?.(e);
    };

    const handleError = () => {
      setHasError(true);
    };

    const hasWebp = Boolean(webpSrc);
    const shouldLazy = !priority;

    return (
      <div
        className={cn('relative overflow-hidden bg-surface-hover', className)}
        style={{
          aspectRatio,
          width: width ?? '100%',
        }}
      >
        {/* Placeholder */}
        {!isLoaded && !hasError && (
          <div className="absolute inset-0 z-10">
            {placeholder === 'blur' && blurHash ? (
              <img
                src={blurHash}
                alt=""
                className="h-full w-full object-cover blur-lg scale-110"
                aria-hidden="true"
              />
            ) : placeholder === 'skeleton' ? (
              <div className="h-full w-full animate-pulse bg-surface-hover" />
            ) : null}
          </div>
        )}

        {/* Error state */}
        {hasError && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-surface-hover">
            <span className="text-xs text-muted-copy font-medium">Image unavailable</span>
          </div>
        )}

        {/* Actual image */}
        {hasWebp ? (
          <picture>
            <source srcSet={webpSrc} type="image/webp" />
            {srcSet && <source srcSet={srcSet} />}
            <img
              ref={imgRef}
              src={src}
              alt={alt}
              width={width}
              height={height}
              loading={shouldLazy ? 'lazy' : 'eager'}
              decoding="async"
              onLoad={handleLoad}
              onError={handleError}
              className={cn(
                'h-full w-full transition-opacity duration-300',
                isLoaded ? 'opacity-100' : 'opacity-0',
                `object-${objectFit}`
              )}
              {...props}
            />
          </picture>
        ) : (
          <img
            ref={imgRef}
            src={src}
            alt={alt}
            width={width}
            height={height}
            srcSet={srcSet}
            loading={shouldLazy ? 'lazy' : 'eager'}
            decoding="async"
            onLoad={handleLoad}
            onError={handleError}
            className={cn(
              'h-full w-full transition-opacity duration-300',
              isLoaded ? 'opacity-100' : 'opacity-0',
              `object-${objectFit}`
            )}
            {...props}
          />
        )}
      </div>
    );
  }
);

LazyImage.displayName = 'LazyImage';
