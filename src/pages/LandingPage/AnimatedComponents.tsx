import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

export function useScrollReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -56px 0px' }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}

export function AnimatedSection({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 720ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 720ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

export function AnimatedCard({
  children,
  className = '',
  delay = 0,
  dark = false,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  dark?: boolean;
}) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();
  const cardRef = useRef<HTMLDivElement | null>(null);

  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      ref.current = node;
      cardRef.current = node;
    },
    [ref]
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const element = cardRef.current;
      if (!element) return;
      const rect = element.getBoundingClientRect();
      element.style.setProperty(
        '--mouse-x',
        `${((event.clientX - rect.left) / rect.width) * 100}%`
      );
      element.style.setProperty(
        '--mouse-y',
        `${((event.clientY - rect.top) / rect.height) * 100}%`
      );
    },
    []
  );

  return (
    <div
      ref={setRefs}
      onMouseMove={handleMouseMove}
      className={`group relative overflow-hidden rounded-[4px] transition-colors duration-300 ${className}`}
      style={{
        background: dark ? '#111111' : 'rgba(255,255,255,0.6)',
        border: dark ? '1px solid #111111' : '1px solid #d9d9e3',
        color: dark ? '#ffffff' : '#111111',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 720ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 720ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, background-color 250ms ease, border-color 250ms ease`,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: dark
            ? 'radial-gradient(440px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,255,255,0.10), transparent 62%)'
            : 'radial-gradient(440px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(17,17,17,0.045), transparent 62%)',
        }}
      />
      {children}
    </div>
  );
}

export function SectionIntro({
  eyebrow,
  title,
  desc,
  align = 'left',
}: {
  eyebrow: string;
  title: ReactNode;
  desc?: string;
  align?: 'left' | 'center';
}) {
  return (
    <AnimatedSection
      className={
        align === 'center'
          ? 'mx-auto mb-12 max-w-3xl text-center'
          : 'mb-12 max-w-3xl'
      }
    >
      <span className="inline-flex rounded-[4px] border border-[#d9d9e3] bg-white px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-copy dark:border-[#2a2d35] dark:bg-[#1C1F26]">
        {eyebrow}
      </span>
      <h2 className="mt-5 text-3xl font-bold tracking-tight text-[#111] md:text-5xl dark:text-[#E2E4E7]">
        {title}
      </h2>
      {desc ? (
        <p className="mt-4 max-w-xl text-sm leading-6 text-muted-copy dark:text-[#949BA4]">
          {desc}
        </p>
      ) : null}
    </AnimatedSection>
  );
}
