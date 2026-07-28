import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';

export function useScrollReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const observer = new IntersectionObserver(([entry]) => { if (entry?.isIntersecting) { setIsVisible(true); observer.unobserve(el); } }, { threshold: 0.12, rootMargin: '0px 0px -56px 0px' });
    observer.observe(el); return () => observer.disconnect();
  }, []);
  return { ref, isVisible };
}

export function AnimatedSection({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();
  return <div ref={ref} className={className} style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(28px)', transition: `opacity 720ms cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 720ms cubic-bezier(0.16,1,0.3,1) ${delay}ms` }}>{children}</div>;
}

export function AnimatedCard({ children, className = '', delay = 0, dark = false }: { children: ReactNode; className?: string; delay?: number; dark?: boolean }) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();
  const cardRef = useRef<HTMLDivElement | null>(null);
  const setRefs = useCallback((node: HTMLDivElement | null) => { ref.current = node; cardRef.current = node; }, [ref]);
  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current; if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--mouse-x', `${((event.clientX - rect.left) / rect.width) * 100}%`);
    el.style.setProperty('--mouse-y', `${((event.clientY - rect.top) / rect.height) * 100}%`);
  }, []);
  const cardStyle: React.CSSProperties = {
    background: dark ? 'var(--color-primary)' : 'var(--color-surface)',
    border: '1px solid var(--color-border-soft)', color: dark ? '#fff' : 'var(--color-foreground)',
    opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(28px)',
    transition: `opacity 720ms cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 720ms cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
  };
  return (
    <div ref={setRefs} onMouseMove={handleMouseMove} className={`group relative overflow-hidden ${className}`} style={cardStyle}>
      <div className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: dark ? 'radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(255,255,255,0.12), transparent 40%)' : 'radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(0,71,187,0.08), transparent 40%)' }} />
      {children}
    </div>
  );
}

export function SectionIntro({ eyebrow, title, desc, align = 'left' }: { eyebrow: string; title: ReactNode; desc?: string; align?: 'left' | 'center' }) {
  return (
    <div className={`mb-10 ${align === 'center' ? 'text-center' : ''}`}>
      <span className="inline-block rounded bg-soft border border-border-soft px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary mb-4">{eyebrow}</span>
      <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{title}</h2>
      {desc && <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-copy">{desc}</p>}
    </div>
  );
}
