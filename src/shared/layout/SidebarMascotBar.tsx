import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Sparkles, Bot, BookOpen, Wrench, Award } from 'lucide-react';

const DYNAMIC_TERMS = [
  'GROUNDING GRID // EE-042',
  'SINGLE LINE DIAGRAM // SLD-101',
  'PLC LADDER LOGIC // CTRL-88',
  'FINITE ELEMENT ANALYSIS // FEA-309',
  'TURBINE PITCH CONTROL // WIND-07',
  'SCAFFOLDING LOAD CAP // SAF-204',
  'SUBSTATION BUSBAR // HV-500',
  'BMS CONTROLLER // HVAC-12',
];

const PAGE_CONTEXT_HINTS: Record<
  string,
  { title: string; hint: string; route: string; icon: typeof BookOpen }
> = {
  '/vocabulary': {
    title: 'Site Terminology',
    hint: 'Click CAD spec to cycle terms',
    route: '/vocabulary',
    icon: BookOpen,
  },
  '/tools': {
    title: 'Quick Work Tools',
    hint: 'Polite PRs & site replies',
    route: '/tools/quick',
    icon: Wrench,
  },
  '/ai': {
    title: 'AI Copilot Studio',
    hint: 'AI tech report transformer',
    route: '/tools/ai',
    icon: Bot,
  },
  '/progress': {
    title: 'ELO Velocity Tracker',
    hint: 'On pace for C1 Target',
    route: '/progress/overview',
    icon: Award,
  },
  '/dashboard': {
    title: 'EngVox AI Assistant',
    hint: 'Daily target: 30 mins',
    route: '/curriculum/today',
    icon: Sparkles,
  },
};

export const SidebarMascotBar: React.FC = () => {
  const location = useLocation();

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [termIdx, setTermIdx] = useState(0);
  const [isHappy, setIsHappy] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // 3D Cursor tilt sensitivity
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const relX = (e.clientX - centerX) / (window.innerWidth / 2);
      const relY = (e.clientY - centerY) / (window.innerHeight / 2);

      const tiltX = Math.max(-12, Math.min(12, relX * 14));
      const tiltY = Math.max(-8, Math.min(8, relY * -10));

      setMousePos({ x: tiltX, y: tiltY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Cycle blueprint terms
  useEffect(() => {
    const timer = setInterval(() => {
      setTermIdx((prev) => (prev + 1) % DYNAMIC_TERMS.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  const pathname = location.pathname;
  const currentCtx =
    Object.entries(PAGE_CONTEXT_HINTS).find(([path]) => pathname.startsWith(path))?.[1] ||
    PAGE_CONTEXT_HINTS['/dashboard'];

  const handleTap = () => {
    setIsHappy(true);
    setTermIdx((prev) => (prev + 1) % DYNAMIC_TERMS.length);
    setTimeout(() => setIsHappy(false), 2000);
  };

  return (
    <div
      ref={containerRef}
      onClick={handleTap}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="mx-3 my-2.5 rounded-xl border border-[#0047bb]/25 bg-surface/80 p-3 shadow-sm hover:border-[#0047bb]/50 hover:shadow-md transition-all cursor-pointer select-none font-sans"
    >
      <div className="flex items-center gap-3">
        {/* Authentic 3D Mascot Image with 3D Mouse Tilt */}
        <div
          className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-[#0047bb]/30 bg-[#0047bb]/5 shadow-inner transition-transform duration-150 ease-out"
          style={{
            transform: `perspective(500px) rotateX(${mousePos.y}deg) rotateY(${mousePos.x}deg) scale(${
              isHovered ? 1.06 : 1
            })`,
          }}
        >
          <img
            src="/brand/mascot-hq.webp"
            alt="EngVox Mascot"
            className="h-full w-full object-cover scale-110 -translate-y-0.5"
          />
          {/* Neon Glow Effects */}
          <div className="absolute top-1 left-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400 opacity-80 blur-[1px] animate-pulse" />
          <div className="absolute top-3 left-3 h-1.5 w-1.5 rounded-full bg-emerald-400 opacity-90 blur-[2px]" />
          <div className="absolute top-3 right-3 h-1.5 w-1.5 rounded-full bg-emerald-400 opacity-90 blur-[2px]" />
        </div>

        {/* Mascot Info & Dynamic Term */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-foreground truncate flex items-center gap-1">
              EngVox Mascot <Sparkles className="h-3 w-3 text-[#0047bb] animate-pulse" />
            </span>
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#0047bb] bg-[#0047bb]/10 px-1.5 py-0.5 rounded">
              {isHappy ? '🎉 JOY' : 'AI BOT'}
            </span>
          </div>

          <p className="text-[10px] font-medium text-muted-copy truncate mt-0.5">
            {currentCtx.hint}
          </p>

          <div className="mt-1.5 rounded-md border border-[#0047bb]/20 bg-[#0047bb]/5 px-2 py-0.5 text-center">
            <p className="text-[9px] font-mono font-extrabold text-[#0047bb] truncate">
              {DYNAMIC_TERMS[termIdx]}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarMascotBar;
