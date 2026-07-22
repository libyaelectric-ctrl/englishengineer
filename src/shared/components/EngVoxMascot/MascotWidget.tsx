import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, X, ChevronUp, BookOpen, Bot, Award, Wrench } from 'lucide-react';
import { EngVoxMascot, type PageContext } from './EngVoxMascot';

const PAGE_HINTS: Record<
  string,
  { title: string; hint: string; ctaText: string; route: string; icon: typeof BookOpen }
> = {
  '/vocabulary': {
    title: 'Site Terminology Master',
    hint: 'Tap the mascot blueprint to cycle CAD technical terms, or click any term card to add it to your daily review!',
    ctaText: 'Practice Vocab Quiz',
    route: '/vocabulary',
    icon: BookOpen,
  },
  '/tools': {
    title: 'Quick Engineering Phrases',
    hint: 'Need to write a polite PR review or site progress update? Use our pre-built work tools and Quick AI transformation!',
    ctaText: 'Try Quick AI',
    route: '/tools?tab=quick',
    icon: Wrench,
  },
  '/ai': {
    title: 'AI Engineering Copilot',
    hint: 'I am ready to rewrite site reports, analyze RFC specifications, or practice interview roleplays with you!',
    ctaText: 'Start AI Prompt',
    route: '/ai',
    icon: Bot,
  },
  '/progress': {
    title: 'CEFR Career Velocity',
    hint: 'Your technical ELO and readiness score update automatically with every completed mission. Keep up the streak!',
    ctaText: 'View ELO Rank',
    route: '/progress',
    icon: Award,
  },
  '/dashboard': {
    title: 'Welcome Back, Engineer!',
    hint: 'Maintain your daily 30-minute study target to reach C1 Senior Tech Lead proficiency in ~3.8 weeks.',
    ctaText: 'Start Today Target',
    route: '/curriculum',
    icon: Sparkles,
  },
};

export const MascotWidget = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  // Determine current page context
  const pathname = location.pathname;
  const hintInfo =
    Object.entries(PAGE_HINTS).find(([path]) => pathname.startsWith(path))?.[1] ||
    PAGE_HINTS['/dashboard'];

  const pageContext: PageContext = pathname.includes('vocab')
    ? 'vocabulary'
    : pathname.includes('ai')
      ? 'ai'
      : pathname.includes('progress')
        ? 'progress'
        : pathname.includes('tools')
          ? 'tools'
          : pathname.includes('grammar')
            ? 'grammar'
            : 'dashboard';

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end select-none font-sans">
      {/* Expanded Hint Speech Card */}
      {isOpen && (
        <div className="mb-3 w-80 rounded-2xl border border-[#0047bb]/30 bg-surface/95 p-4 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom duration-300">
          <div className="flex items-center justify-between border-b border-border-soft/80 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0047bb]/10 text-xs text-[#0047bb]">
                <hintInfo.icon className="h-3.5 w-3.5" />
              </span>
              <h4 className="text-xs font-bold text-foreground tracking-tight">
                {hintInfo.title}
              </h4>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1 text-muted-copy hover:bg-surface-hover hover:text-foreground cursor-pointer transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Interactive Mascot inside Widget */}
          <div className="my-3 flex justify-center">
            <EngVoxMascot
              size="sm"
              mode="thinking"
              pageContext={pageContext}
              onBlueprintClick={() => {
                navigate(hintInfo.route);
              }}
            />
          </div>

          <p className="text-xs leading-relaxed text-muted-copy font-medium">
            {hintInfo.hint}
          </p>

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
                navigate(hintInfo.route);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#0047bb] px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-[#003896] cursor-pointer transition-all"
            >
              {hintInfo.ctaText}
            </button>
          </div>
        </div>
      )}

      {/* Floating Mascot Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-2 rounded-full border border-[#0047bb]/30 bg-surface/90 p-2 shadow-xl backdrop-blur-md hover:border-[#0047bb] hover:scale-105 cursor-pointer transition-all duration-300"
        title="EngVox AI Mascot Assistant"
      >
        <div className="relative h-10 w-10 overflow-hidden rounded-full bg-[#0047bb]/10">
          <EngVoxMascot
            size="custom"
            customWidth={70}
            customHeight={70}
            mode={isOpen ? 'thinking' : 'idle'}
            pageContext={pageContext}
            className="-mt-3 -ml-3"
          />
        </div>
        <span className="pr-2 text-xs font-bold text-foreground hidden sm:inline-flex items-center gap-1">
          EngVox <Sparkles className="h-3 w-3 text-[#0047bb] animate-pulse" />
        </span>
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0047bb]/10 text-[#0047bb]">
          <ChevronUp className={`h-3.5 w-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </span>
      </button>
    </div>
  );
};

export default MascotWidget;
