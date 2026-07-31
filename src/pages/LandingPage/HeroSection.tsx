import { Globe, Shield, Zap } from 'lucide-react';

import { useEffect, useState } from 'react';

interface HeroSectionProps {
  scrollShift: number;
}

const HeroSection = ({ scrollShift }: HeroSectionProps) => {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <section
      className="relative z-10 max-w-6xl mx-auto flex flex-col items-center justify-center px-4 pt-20 sm:pt-24 pb-8"
      style={{ transform: `translateY(${scrollShift}px)` }}
    >
      <div
        className={`w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        {/* Ambient Left Background Light Glow Orb */}
        <div className="absolute -top-10 -left-10 h-72 w-72 rounded-full bg-gradient-to-tr from-primary/30 via-blue-500/20 to-indigo-500/30 blur-3xl opacity-60 animate-ambient-glow pointer-events-none" />

        {/* Left Column: Title, Description & Trust Badges */}
        <div className="lg:col-span-6 space-y-3.5 text-left relative z-10">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold leading-tight tracking-tight">
            <span className="text-foreground">The Engineering English </span>
            <span className="animated-gradient-title block sm:inline lg:block">
              Operating System
            </span>
          </h1>

          <p className="text-xs sm:text-sm font-medium text-foreground/85 leading-normal">
            AI-powered oral defense coaching, FIDIC contract writing, technical presentations, and
            5,000+ domain-specific terms — all offline-first.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-foreground/80 pt-0.5">
            <span className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-primary" /> SOC-2 Ready
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-primary" /> Offline First
            </span>
            <span className="flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-primary" /> CEFR Aligned
            </span>
          </div>
        </div>

        {/* Right Column: AI Coach Interactive Card */}
        <div className="lg:col-span-6 w-full relative group">
          {/* Rotating Ambient Light Ring */}
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary via-blue-500 to-indigo-600 blur-xl opacity-60 animate-spin-slow pointer-events-none group-hover:opacity-90 transition-opacity" />

          <div className="relative rounded-xl bg-gradient-to-br from-primary via-[#1a5fd4] to-[#3366cc] p-1 shadow-2xl">
            <div className="relative overflow-hidden rounded-lg bg-primary p-4 sm:p-5 light-sweep-container">
              <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 animate-ambient-glow" />
              <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-white/10 animate-ambient-glow" />
              <div className="relative z-10 grid gap-4 sm:grid-cols-2 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 rounded bg-white/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white mb-2">
                    AI Coach
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                    CEFR Assessment &<br />
                    Personalized Path
                  </h3>
                  <p className="mt-1.5 text-xs text-white/80 leading-relaxed">
                    Adaptive learning engine that maps your skill gaps and builds a custom
                    curriculum based on your discipline and project role.
                  </p>
                </div>
                <div className="flex justify-center">
                  <div className="grid grid-cols-2 gap-2 w-full">
                    {[
                      { l: 'Writing', v: 'C1' },
                      { l: 'Speaking', v: 'B2' },
                      { l: 'Listening', v: 'B2+' },
                      { l: 'Reading', v: 'C1' },
                    ].map((i) => (
                      <div
                        key={i.l}
                        className="rounded bg-white/10 p-2 text-center border border-white/10"
                      >
                        <div className="text-[10px] text-white/70 font-medium uppercase tracking-wider">
                          {i.l}
                        </div>
                        <div className="text-base font-bold text-white mt-0.5">{i.v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default HeroSection;
