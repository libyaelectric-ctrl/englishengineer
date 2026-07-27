import { useEffect, useState } from 'react';
import { Button } from '@/shared/components/Button';
import { Sparkles, ArrowRight, Shield, Zap, Globe } from 'lucide-react';

interface HeroSectionProps {
  scrollShift: number;
}

const HeroSection = ({ scrollShift }: HeroSectionProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleStartFree = () => {
    window.location.href = '/auth/register';
  };

  const handleDemo = () => {
    window.location.href = '/demo';
  };

  return (
    <section
      className="relative z-10 flex min-h-[90vh] flex-col items-center justify-center px-4 pt-24 pb-16"
      style={{ transform: `translateY(${scrollShift}px)` }}
    >
      <div className={`mb-8 flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <Sparkles className="h-4 w-4 text-blue-400" />
        <span className="text-sm font-medium text-white/80">v4.0.1 — Now with AI Copilot</span>
      </div>

      <h1 className={`max-w-4xl text-center text-5xl font-bold leading-tight tracking-tight sm:text-6xl md:text-7xl transition-all duration-1000 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
          The Engineering English
        </span>
        <br />
        <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Operating System
        </span>
      </h1>

      <p className={`mt-6 max-w-2xl text-center text-lg text-white/60 sm:text-xl transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        AI-powered oral defense coaching, FIDIC contract writing, technical presentations, 
        and 5,000+ domain-specific terms — all offline-first.
      </p>

      <div className={`mt-10 flex flex-col gap-4 sm:flex-row transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <Button
          size="default"
          className="group bg-blue-500 text-white hover:bg-blue-600 px-8 py-6 text-lg font-semibold shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40"
          onClick={handleStartFree}
        >
          Start Free
          <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
        </Button>
        <Button
          size="default"
          variant="outline"
          className="border-white/20 bg-white/5 text-white hover:bg-white/10 px-8 py-6 text-lg backdrop-blur-sm"
          onClick={handleDemo}
        >
          See Demo
        </Button>
      </div>

      <div className={`mt-20 grid grid-cols-2 gap-8 sm:grid-cols-4 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 text-blue-400">
            <Shield className="h-5 w-5" />
            <span className="text-2xl font-bold">745+</span>
          </div>
          <span className="mt-1 text-sm text-white/40">Passed Quality Gates</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 text-indigo-400">
            <Globe className="h-5 w-5" />
            <span className="text-2xl font-bold">CEFR A1-C2</span>
          </div>
          <span className="mt-1 text-sm text-white/40">Global Standard</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 text-purple-400">
            <Zap className="h-5 w-5" />
            <span className="text-2xl font-bold">5,000+</span>
          </div>
          <span className="mt-1 text-sm text-white/40">Domain Terms</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 text-emerald-400">
            <Sparkles className="h-5 w-5" />
            <span className="text-2xl font-bold">12</span>
          </div>
          <span className="mt-1 text-sm text-white/40">AI Coaching Modes</span>
          </div>
      </div>

      <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs text-white/30">Scroll to explore</span>
          <div className="h-8 w-5 rounded-full border border-white/20 p-1">
            <div className="h-2 w-full rounded-full bg-white/40 animate-bounce" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;