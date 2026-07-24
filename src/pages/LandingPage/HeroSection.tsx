import { Sparkles, Shield, Award, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { STATS } from './constants';
import { LandingDemoConsole } from './LandingDemoConsole';

const heroFadeStyle = (visible: boolean, delay: string) => ({
  opacity: visible ? 1 : 0,
  filter: visible ? 'blur(0)' : 'blur(12px)',
  transform: visible ? 'translateY(0)' : 'translateY(18px)',
  transition: `opacity 760ms cubic-bezier(0.16,1,0.3,1) ${delay}, filter 760ms cubic-bezier(0.16,1,0.3,1) ${delay}, transform 760ms cubic-bezier(0.16,1,0.3,1) ${delay}`,
});

const BackgroundLayers = ({ scrollShift }: { scrollShift: number }) => (
  <>
    {/* Ambient Glowing Orbs */}
    <div
      className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[550px] w-[850px] rounded-full bg-gradient-to-tr from-primary/30 via-blue-500/20 to-cyan-400/25 blur-3xl opacity-70 transition-transform duration-75 ease-out"
      style={{
        transform: `translate3d(0, ${scrollShift * 0.5}px, 0)`,
      }}
    />

    {/* Subtle Technical Grid Overlay */}
    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#8080800d_1px,transparent_1px),linear-gradient(to_bottom,#8080800d_1px,transparent_1px)] bg-[size:24px_24px]" />

    {/* Gradient Mask Overlays for Text Contrast */}
    <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/50 to-background" />
  </>
);

const HeroContent = ({ heroVisible }: { heroVisible: boolean }) => (
  <div className="max-w-4xl space-y-5">
    <div style={heroFadeStyle(heroVisible, '0ms')}>
      <span className="inline-flex items-center gap-2 rounded-full border border-border-soft bg-surface/90 backdrop-blur-xl px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-primary shadow-sm">
        <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
        Engineering English OS for Engineers
      </span>
    </div>

    <h1
      className="max-w-4xl text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-5xl lg:text-6xl leading-[1.1]"
      style={heroFadeStyle(heroVisible, '80ms')}
    >
      Master Engineering English for{' '}
      <span className="bg-gradient-to-r from-primary via-blue-400 to-cyan-400 bg-clip-text text-transparent">
        Global Infrastructure & Tech Teams.
      </span>
    </h1>

    <p
      className="max-w-2xl text-xs sm:text-sm leading-relaxed text-muted-copy font-medium"
      style={heroFadeStyle(heroVisible, '220ms')}
    >
      AI-powered oral defense coaching, FIDIC contract writing, technical
      presentation practice, and 5,000+ domain-specific terms for MEP, Civil,
      QA/QC, and Software Engineers.
    </p>

    <div
      className="flex flex-wrap items-center gap-3 pt-1"
      style={{
        opacity: heroVisible ? 1 : 0,
        transition: 'opacity 820ms ease-out 300ms',
      }}
    >
      <Link
        to="/login"
        className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-7 text-xs font-bold uppercase tracking-wider text-primary-foreground transition hover:bg-primary-hover shadow-lg shadow-primary/25 cursor-pointer"
      >
        Start Free Training
      </Link>
      <a
        href="#disciplines"
        className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border-soft bg-surface/90 backdrop-blur px-7 text-xs font-bold uppercase tracking-wider text-foreground transition hover:bg-surface-hover hover:border-border-hover cursor-pointer"
      >
        Explore Engineering Tracks
      </a>
    </div>

    {/* Trust Badges */}
    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-copy font-semibold pt-2">
      <span className="flex items-center gap-1.5">
        <CheckCircle2 className="h-4 w-4 text-success" />
        No credit card required
      </span>
      <span className="flex items-center gap-1.5">
        <Shield className="h-4 w-4 text-primary" />
        CEFR A1-C2 Calibrated
      </span>
      <span className="flex items-center gap-1.5">
        <Award className="h-4 w-4 text-warning" />
        745+ Passed Quality Gates
      </span>
    </div>

    {/* Compact Metric Bar */}
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
      {STATS.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl border border-border-soft bg-surface/80 backdrop-blur-md p-2.5 transition-colors hover:border-border-hover"
        >
          <div className="text-lg font-extrabold tracking-tight text-foreground">
            {stat.value}
          </div>
          <div className="mt-0.5 text-[10px] font-bold uppercase text-muted-copy">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export function HeroSection({
  heroVisible,
  scrollShift,
}: {
  heroVisible: boolean;
  scrollShift: number;
}) {
  return (
    <section
      id="main-content"
      className="relative flex min-h-[75svh] items-center overflow-hidden bg-transparent px-6 pb-12 pt-28 md:px-12 md:pb-16"
    >
      <BackgroundLayers scrollShift={scrollShift} />

      <div className="relative z-10 grid w-full grid-cols-1 items-center gap-10 lg:grid-cols-[1fr_480px] xl:grid-cols-[1fr_520px]">
        <HeroContent heroVisible={heroVisible} />

        {/* Interactive Live Console */}
        <div
          style={{
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible
              ? 'translateY(0) scale(1)'
              : 'translateY(28px) scale(0.98)',
            transition:
              'opacity 900ms cubic-bezier(0.16,1,0.3,1) 350ms, transform 900ms cubic-bezier(0.16,1,0.3,1) 350ms',
          }}
        >
          <LandingDemoConsole />
        </div>
      </div>
    </section>
  );
}
