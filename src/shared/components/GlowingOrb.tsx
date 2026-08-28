import { useEffect, useRef } from 'react';

interface GlowingOrbProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_MAP = {
  sm: 'w-48 h-48 md:w-64 md:h-64',
  md: 'w-80 h-80 md:w-[500px] md:h-[500px]',
  lg: 'w-96 h-96 md:w-[600px] md:h-[600px]',
};

/**
 * Decorative WebGL orb. The three.js scene lives in GlowingOrbScene and is
 * loaded on demand, so pages using the orb (Landing, Pricing) no longer pull
 * the three.js runtime into their initial chunks.
 */
export const GlowingOrb = ({ className = '', size = 'md' }: GlowingOrbProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // WebGL probe - early exit for test/jsdom/no-WebGL environments
    try {
      const probe = document.createElement('canvas');
      const gl =
        probe.getContext('webgl2') ??
        probe.getContext('webgl') ??
        (probe.getContext('experimental-webgl') as WebGLRenderingContext | null);
      if (!gl) return;
      gl.getExtension?.('WEBGL_lose_context')?.loseContext?.();
    } catch {
      return;
    }

    let dispose: (() => void) | null = null;
    let cancelled = false;

    void import('./GlowingOrbScene')
      .then(({ mountGlowingOrbScene }) => {
        if (cancelled) return;
        dispose = mountGlowingOrbScene(container) ?? null;
      })
      .catch(() => {
        // Scene failed to load; the container keeps its CSS fallback styling.
      });

    return () => {
      cancelled = true;
      dispose?.();
      dispose = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`${SIZE_MAP[size]} relative rounded-full orb-container bg-slate-900/30 backdrop-blur-sm border border-white/5 ${className}`}
    />
  );
};

export default GlowingOrb;
