import { useCallback, useEffect, useMemo, useState } from 'react';

import { useTheme } from '@/features/theme/ThemeProvider';

interface HeroSceneProps {
  className?: string;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const HeroScene = ({ className = '' }: HeroSceneProps) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [pointer, setPointer] = useState({ x: 0, y: 0 });

  const nodes = useMemo(() => {
    const rand = mulberry32(20260908);
    return Array.from({ length: 34 }, (_, index) => ({
      id: index,
      x: 8 + rand() * 84,
      y: 10 + rand() * 78,
      size: 2 + rand() * 4,
      delay: rand() * 4,
      duration: 7 + rand() * 8,
      opacity: 0.18 + rand() * 0.34,
    }));
  }, []);

  const beams = useMemo(() => {
    const rand = mulberry32(42024);
    return Array.from({ length: 12 }, (_, index) => ({
      id: index,
      left: rand() * 100,
      delay: rand() * 8,
      duration: 9 + rand() * 9,
      height: 24 + rand() * 42,
    }));
  }, []);

  const onMouseMove = useCallback((event: MouseEvent) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const x = (event.clientX / window.innerWidth - 0.5) * 22;
    const y = (event.clientY / window.innerHeight - 0.5) * 16;
    setPointer({ x, y });
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, [onMouseMove]);

  const gridColor = isDark ? 'rgba(103,232,249,0.12)' : 'rgba(14,116,144,0.11)';
  const nodeColor = isDark ? '#A5F3FC' : '#0891B2';

  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <div className={isDark ? 'absolute inset-0 bg-[#040611]' : 'absolute inset-0 bg-slate-50'} />
      <div className="absolute inset-0 opacity-35" style={{ backgroundImage: `linear-gradient(${gridColor} 1px, transparent 1px), linear-gradient(90deg, ${gridColor} 1px, transparent 1px)`, backgroundSize: '72px 72px' }} />

      <div className="absolute left-1/2 top-1/2 h-[min(76vw,700px)] w-[min(76vw,700px)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-500/10 dark:border-cyan-200/10" style={{ transform: `translate(calc(-50% + ${pointer.x * 0.4}px), calc(-50% + ${pointer.y * 0.4}px))` }}>
        <div className="absolute inset-8 rounded-full border border-fuchsia-500/10 dark:border-fuchsia-200/10" />
        <div className="absolute inset-20 rounded-full border border-cyan-500/10 dark:border-cyan-200/10" />
        <div className="absolute inset-32 rounded-full border border-amber-500/10 dark:border-amber-100/10" />
      </div>

      <div className="absolute left-1/2 top-[54%] h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-[42%] border border-cyan-500/20 bg-cyan-500/5 shadow-[0_0_90px_rgba(6,182,212,0.13)] backdrop-blur-sm dark:border-cyan-200/25 dark:bg-cyan-200/5 dark:shadow-[0_0_120px_rgba(103,232,249,0.18)]" style={{ transform: `translate(calc(-50% + ${pointer.x}px), calc(-50% + ${pointer.y}px)) rotate(45deg)` }}>
        <div className="absolute inset-10 rounded-[38%] border border-fuchsia-500/15 dark:border-fuchsia-200/20" />
        <div className="absolute inset-20 rounded-[34%] border border-slate-900/10 dark:border-white/15" />
        <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white/90 shadow-[0_0_70px_rgba(6,182,212,0.32)] dark:shadow-[0_0_80px_rgba(255,255,255,0.55)]" />
      </div>

      {nodes.map((node) => (
        <span key={node.id} className="absolute rounded-full" style={{ left: `${node.x}%`, top: `${node.y}%`, width: node.size, height: node.size, opacity: node.opacity, backgroundColor: nodeColor, boxShadow: `0 0 22px ${isDark ? 'rgba(103,232,249,0.7)' : 'rgba(6,182,212,0.45)'}`, animation: `landingNodeFloat ${node.duration}s ease-in-out ${node.delay}s infinite alternate` }} />
      ))}

      {beams.map((beam) => (
        <span key={beam.id} className="absolute bottom-0 w-px bg-gradient-to-t from-cyan-500/0 via-cyan-500/30 to-transparent dark:from-cyan-200/0 dark:via-cyan-200/35" style={{ left: `${beam.left}%`, height: `${beam.height}%`, animation: `landingBeam ${beam.duration}s ease-in-out ${beam.delay}s infinite` }} />
      ))}

      <div className="absolute -left-32 top-1/4 h-80 w-80 rounded-full bg-cyan-400/12 blur-3xl dark:bg-cyan-400/18" />
      <div className="absolute -right-32 top-10 h-[26rem] w-[26rem] rounded-full bg-fuchsia-500/12 blur-3xl dark:bg-fuchsia-500/18" />
      <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-amber-300/10 blur-3xl" />

      <style>{`
        @keyframes landingNodeFloat { 0% { transform: translate3d(-10px, 12px, 0) scale(0.82); } 100% { transform: translate3d(18px, -20px, 0) scale(1.2); } }
        @keyframes landingBeam { 0%, 100% { opacity: 0.12; transform: translateY(18px) scaleY(0.7); } 50% { opacity: 0.72; transform: translateY(-18px) scaleY(1.08); } }
        @media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
      `}</style>
    </div>
  );
};

export default HeroScene;
