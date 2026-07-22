import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, X, ChevronUp, BookOpen, Bot, Award, Wrench, Volume2, ShieldCheck, Heart } from 'lucide-react';
import './mascot.css';

export interface MascotCompanionProps {
  className?: string;
}

const PAGE_CONTEXT_DATA: Record<
  string,
  {
    title: string;
    hint: string;
    actionLabel: string;
    route: string;
    icon: typeof BookOpen;
    term: string;
  }
> = {
  '/': {
    title: 'EngVox Companion',
    hint: 'Welcome to EngineerOS! I will guide you through mastering site English, technical PRs, and C1 communication.',
    actionLabel: 'Explore Platform',
    route: '/start',
    icon: Sparkles,
    term: 'HVAC & CONTROL SYSTEMS',
  },
  '/login': {
    title: 'Engineers Login',
    hint: 'Welcome back! Sign in to keep your daily study streak active and track your technical ELO progress.',
    actionLabel: 'Need Help?',
    route: '/start',
    icon: ShieldCheck,
    term: 'AUTH & PROTOCOLS',
  },
  '/signup': {
    title: 'Join EngineerOS',
    hint: 'Create your account to unlock 1,200+ technical terms, AI Copilot, and verified CEFR certificates.',
    actionLabel: 'Learn More',
    route: '/pricing',
    icon: ShieldCheck,
    term: 'CAREER ONBOARDING',
  },
  '/vocabulary': {
    title: 'Site Terminology',
    hint: 'Click any card or tap my blueprint to cycle CAD technical terms and add them to your daily review set!',
    actionLabel: 'Start Vocab Practice',
    route: '/vocabulary',
    icon: BookOpen,
    term: 'GROUNDING GRID',
  },
  '/tools': {
    title: 'Quick Work Tools',
    hint: 'Need to write a polite code review comment or site progress reply? Use our pre-built phrases & AI transformer!',
    actionLabel: 'Try Quick AI',
    route: '/tools/quick',
    icon: Wrench,
    term: 'PR REVIEW SPEC',
  },
  '/ai': {
    title: 'AI Copilot Studio',
    hint: 'I am ready to help you write technical specifications, polish emails, or practice job interview scenarios!',
    actionLabel: 'Start AI Prompt',
    route: '/tools/ai',
    icon: Bot,
    term: 'NEURAL SPEC REJECT',
  },
  '/progress': {
    title: 'CEFR & ELO Velocity',
    hint: 'Your technical ELO is dynamically computed from practice sessions. You are on pace for C1 target!',
    actionLabel: 'View Milestones',
    route: '/progress/overview',
    icon: Award,
    term: 'TARGET C1 VELOCITY',
  },
  '/dashboard': {
    title: 'Engineering Cockpit',
    hint: 'Complete your 30-minute daily practice target to maintain your streak and boost workplace readiness.',
    actionLabel: 'Daily Target',
    route: '/curriculum/today',
    icon: Sparkles,
    term: 'SINGLE LINE DIAGRAM',
  },
};

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

export const EngVoxMascotCompanion: React.FC<MascotCompanionProps> = ({ className = '' }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [termIdx, setTermIdx] = useState(0);
  const [isHappy, setIsHappy] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const mascotRef = useRef<HTMLDivElement>(null);

  // Mouse tracking for 3D tilt effect towards cursor
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!mascotRef.current) return;
      const rect = mascotRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Relative offset normalized from -1 to 1
      const relX = (e.clientX - centerX) / (window.innerWidth / 2);
      const relY = (e.clientY - centerY) / (window.innerHeight / 2);

      // Clamp tilt values (-15 to 15 deg)
      const tiltX = Math.max(-14, Math.min(14, relX * 16));
      const tiltY = Math.max(-10, Math.min(10, relY * -12));

      setMousePos({ x: tiltX, y: tiltY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Cycle blueprint engineering terms
  useEffect(() => {
    const timer = setInterval(() => {
      setTermIdx((prev) => (prev + 1) % DYNAMIC_TERMS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Listen for custom app events (e.g. quiz passed)
  useEffect(() => {
    const handleSuccess = () => {
      setIsHappy(true);
      setTimeout(() => setIsHappy(false), 3000);
    };
    window.addEventListener('engvox_success', handleSuccess);
    return () => window.removeEventListener('engvox_success', handleSuccess);
  }, []);

  if (isDismissed) return null;

  const pathname = location.pathname;
  const currentCtxData =
    Object.entries(PAGE_CONTEXT_DATA).find(([path]) =>
      path === '/' ? pathname === '/' : pathname.startsWith(path)
    )?.[1] || PAGE_CONTEXT_DATA['/dashboard'];

  const handleMascotTap = () => {
    setIsHappy(true);
    setTermIdx((prev) => (prev + 1) % DYNAMIC_TERMS.length);
    setIsOpen(!isOpen);
    setTimeout(() => setIsHappy(false), 2000);
  };

  return (
    <div
      ref={mascotRef}
      className={`fixed bottom-4 right-4 z-50 flex flex-col items-end select-none font-sans ${className}`}
    >
      {/* Speech Bubble / Pet Companion Callout */}
      {(isOpen || isHovered || isHappy) && (
        <div className="mb-3 w-80 rounded-2xl border border-[#0047bb]/30 bg-surface/95 p-4 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom duration-300">
          <div className="flex items-center justify-between border-b border-border-soft/80 pb-2">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0047bb]/10 text-xs text-[#0047bb]">
                <currentCtxData.icon className="h-3.5 w-3.5" />
              </span>
              <h4 className="text-xs font-bold text-foreground tracking-tight">
                {currentCtxData.title}
              </h4>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              className="rounded-lg p-1 text-muted-copy hover:bg-surface-hover hover:text-foreground cursor-pointer transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <p className="mt-2 text-xs leading-relaxed text-muted-copy font-medium">
            {isHappy
              ? '🎉 Great job, Engineer! Keep pushing your technical boundary.'
              : currentCtxData.hint}
          </p>

          {/* Dynamic Blueprint CAD Term Banner */}
          <div className="mt-3 rounded-lg border border-[#0047bb]/25 bg-[#0047bb]/5 p-2.5 text-center shadow-inner">
            <p className="font-mono text-[9px] font-bold uppercase tracking-wider text-[#0047bb]">
              📐 Live Blueprint Spec
            </p>
            <p className="mt-0.5 text-xs font-black text-foreground">
              {DYNAMIC_TERMS[termIdx]}
            </p>
          </div>

          <div className="mt-3 flex items-center justify-between pt-2 border-t border-border-soft/60">
            <button
              onClick={() => setIsDismissed(true)}
              className="text-[10px] font-bold uppercase tracking-wider text-muted-copy hover:text-foreground cursor-pointer"
            >
              Dismiss
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                navigate(currentCtxData.route);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#0047bb] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-[#003896] cursor-pointer transition-all"
            >
              {currentCtxData.actionLabel}
            </button>
          </div>
        </div>
      )}

      {/* Main Authentic EngVox Mascot 3D Pet Body */}
      <div
        onClick={handleMascotTap}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative flex items-center gap-2 rounded-full border border-[#0047bb]/30 bg-surface/90 p-2 shadow-2xl backdrop-blur-xl hover:border-[#0047bb] hover:shadow-[#0047bb]/20 cursor-pointer transition-all duration-300"
        style={{
          perspective: '800px',
        }}
      >
        {/* Authentic Mascot HQ Image Container with 3D Tilt */}
        <div
          className="relative h-14 w-14 overflow-hidden rounded-full border border-[#0047bb]/25 bg-[#0047bb]/5 shadow-inner transition-transform duration-150 ease-out"
          style={{
            transform: `perspective(600px) rotateX(${mousePos.y}deg) rotateY(${mousePos.x}deg) scale(${
              isHovered ? 1.08 : 1
            })`,
          }}
        >
          <img
            src="/brand/mascot-hq.webp"
            alt="EngVox Engineer Robot Mascot"
            className="h-full w-full object-cover scale-110 -translate-y-1 transition-transform duration-300"
          />

          {/* Glowing Antenna & Eye Overlays */}
          <div className="absolute top-1 left-2 h-2 w-2 rounded-full bg-emerald-400 opacity-80 blur-[2px] animate-pulse" />
          <div className="absolute top-4 left-4 h-2 w-2 rounded-full bg-emerald-400 opacity-90 blur-[3px]" />
          <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-emerald-400 opacity-90 blur-[3px]" />
        </div>

        {/* Mascot Pet Status Label */}
        <div className="hidden sm:flex flex-col pr-2">
          <div className="flex items-center gap-1 text-xs font-extrabold text-foreground">
            <span>EngVox</span>
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <span className="text-[10px] font-bold text-muted-copy uppercase tracking-wider">
            {isHappy ? '🎉 Joy' : isHovered ? '🐾 Active' : '🤖 Pet AI'}
          </span>
        </div>

        {/* Toggle Expand Arrow */}
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0047bb]/10 text-[#0047bb]">
          <ChevronUp
            className={`h-4 w-4 transition-transform duration-300 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      </div>
    </div>
  );
};

export default EngVoxMascotCompanion;
