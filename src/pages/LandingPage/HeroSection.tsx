import { useEffect, useState } from 'react';
import { Button } from '@/shared/components/Button';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Play, Terminal, Shield, Zap, Globe } from 'lucide-react';

interface HeroSectionProps { scrollShift: number; }

const HeroSection = ({ scrollShift }: HeroSectionProps) => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setIsVisible(true), 100); return () => clearTimeout(t); }, []);

  return (
    <section className="relative z-10 flex min-h-[90vh] flex-col items-center justify-center px-4 pt-24 pb-16" style={{ transform: `translateY(${scrollShift}px)` }}>
      <div className={`mb-8 flex items-center gap-2 rounded bg-surface border border-border-soft px-4 py-2 shadow-sm transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <Terminal className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold text-foreground">v2.1 — Precision Engineering OS</span>
      </div>
      <h1 className={`max-w-4xl text-center text-5xl font-bold leading-tight tracking-tight sm:text-6xl md:text-7xl transition-all duration-1000 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <span className="text-foreground">The Engineering English</span><br />
        <span className="text-primary">Operating System</span>
      </h1>
      <p className={`mt-6 max-w-2xl text-center text-lg text-muted-copy sm:text-xl transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        AI-powered oral defense coaching, FIDIC contract writing, technical presentations, and 5,000+ domain-specific terms — all offline-first.
      </p>
      <div className={`mt-10 flex flex-col gap-4 sm:flex-row transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <Button size="lg" className="group bg-primary text-primary-foreground hover:bg-primary-hover px-8 py-6 text-lg font-semibold shadow-sm transition-all rounded" onClick={() => navigate('/auth/register')}>
          Start Free <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
        </Button>
        <Button size="lg" variant="outline" className="border-border-soft bg-surface text-foreground hover:bg-surface-hover px-8 py-6 text-lg rounded" onClick={() => navigate('/demo')}>
          <Play className="mr-2 h-5 w-5 text-primary" /> Watch Demo
        </Button>
      </div>
      <div className={`mt-12 flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-muted-copy transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-primary" /> SOC-2 Ready</span>
        <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-primary" /> Offline First</span>
        <span className="flex items-center gap-1.5"><Globe className="h-3.5 w-3.5 text-primary" /> CEFR Aligned</span>
      </div>
      <div className={`mt-16 w-full max-w-5xl transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
        <div className="relative rounded bg-gradient-to-br from-primary via-[#1a5fd4] to-[#3366cc] p-1 shadow-lg">
          <div className="relative overflow-hidden rounded bg-primary p-8 sm:p-12">
            <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/5" />
            <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-white/5" />
            <div className="relative z-10 grid gap-8 sm:grid-cols-2 items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white mb-6">AI Coach</div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white leading-tight">CEFR Assessment &<br />Personalized Path</h3>
                <p className="mt-4 text-sm text-white/80 leading-relaxed max-w-md">Adaptive learning engine that maps your skill gaps and builds a custom curriculum based on your discipline and project role.</p>
              </div>
              <div className="flex justify-center">
                <div className="grid grid-cols-2 gap-3">
                  {[{l:'Writing',v:'C1'},{l:'Speaking',v:'B2'},{l:'Listening',v:'B2+'},{l:'Reading',v:'C1'}].map(i => (
                    <div key={i.l} className="rounded bg-white/10 p-4 text-center border border-white/10">
                      <div className="text-xs text-white/70 font-medium uppercase tracking-wider">{i.l}</div>
                      <div className="text-xl font-bold text-white mt-1">{i.v}</div>
                    </div>
                  ))}
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
