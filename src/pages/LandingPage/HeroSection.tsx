import { Sparkles } from 'lucide-react';
import { FEATURES, STATS } from './constants';

const heroFadeStyle = (visible: boolean, delay: string) => ({
  opacity: visible ? 1 : 0,
  filter: visible ? 'blur(0)' : 'blur(12px)',
  transform: visible ? 'translateY(0)' : 'translateY(18px)',
  transition: `opacity 760ms cubic-bezier(0.16,1,0.3,1) ${delay}, filter 760ms cubic-bezier(0.16,1,0.3,1) ${delay}, transform 760ms cubic-bezier(0.16,1,0.3,1) ${delay}`,
});

const BackgroundLayers = ({ scrollShift }: { scrollShift: number }) => (
  <>
    <div
      className="absolute inset-0 bg-cover bg-center"
      style={{
        backgroundImage: "url('/agentic/org-arc.webp')",
        opacity: 0.35,
        transform: `translate3d(0, ${scrollShift}px, 0) scale(1.04)`,
      }}
    />
    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(248,249,250,0.05)_0%,rgba(248,249,250,0.15)_34%,rgba(248,249,250,0.85)_88%)] dark:bg-[linear-gradient(180deg,rgba(11,14,20,0.05)_0%,rgba(11,14,20,0.15)_34%,rgba(11,14,20,0.85)_88%)]" />
    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-background" />
  </>
);

const VideoPanel = ({ heroVisible }: { heroVisible: boolean }) => (
  <div
    className="rounded-[4px] border border-border-soft bg-surface p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-md transition-all duration-300 backdrop-blur-xl"
    style={{
      opacity: heroVisible ? 1 : 0,
      transform: heroVisible
        ? 'translateY(0) scale(1)'
        : 'translateY(28px) scale(0.98)',
      transition:
        'opacity 900ms cubic-bezier(0.16,1,0.3,1) 420ms, transform 900ms cubic-bezier(0.16,1,0.3,1) 420ms',
    }}
  >
    <div className="overflow-hidden rounded-[4px] border border-border-soft bg-[#111]">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="aspect-[16/10] w-full object-cover"
        poster="/agentic/arc.webp"
      >
        <source src="/agentic-hero.mp4" type="video/mp4" />
      </video>
    </div>
    <div className="grid grid-cols-2 gap-2 pt-3">
      {STATS.map((stat) => (
        <div
          key={stat.label}
          className="rounded-[4px] border border-border-soft bg-background p-2.5"
        >
          <div className="text-xl font-bold tracking-tight text-foreground">
            {stat.value}
          </div>
          <div className="mt-0.5 text-[9px] font-medium uppercase text-foreground/40">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const HeroContent = ({ heroVisible }: { heroVisible: boolean }) => (
  <div className="max-w-4xl space-y-6">
    <div className="flex items-center gap-4" style={heroFadeStyle(heroVisible, '0ms')}>
      <img
        src="/brand/mascot.webp"
        alt="EngVox Mascot"
        className="h-16 w-16 rounded-[4px] border border-border-soft bg-surface object-contain shadow-sm"
      />
      <span
        className="inline-flex items-center gap-1.5 rounded-[4px] border border-border-soft bg-surface px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-copy backdrop-blur"
      >
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        AI English operating system for engineers
      </span>
    </div>
    <h1
      className="max-w-4xl text-2xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-6xl"
      style={heroFadeStyle(heroVisible, '80ms')}
    >
      Engineering English OS for project teams.
    </h1>
    <p
      className="max-w-xl text-xs leading-5 text-muted-copy"
      style={heroFadeStyle(heroVisible, '220ms')}
    >
      EngVox turns writing, speaking, listening and reading into an orchestrated
      practice system for real engineering work.
    </p>

    <div
      className="flex flex-wrap gap-3"
      style={{
        opacity: heroVisible ? 1 : 0,
        transition: 'opacity 820ms ease-out 300ms',
      }}
    >
      <a
        href="/login"
        className="inline-flex min-h-10 items-center justify-center rounded-[4px] bg-primary px-6 text-xs font-bold uppercase tracking-wider text-primary-foreground transition hover:bg-primary-hover"
      >
        Initialize Core
      </a>
      <a
        href="#pricing"
        className="inline-flex min-h-10 items-center justify-center rounded-[4px] border border-border-soft bg-surface px-6 text-xs font-bold uppercase tracking-wider text-foreground/70 backdrop-blur transition hover:bg-surface-hover"
      >
        View Schema
      </a>
    </div>

    <div className="grid grid-cols-2 gap-3 pt-6 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
      {FEATURES.map((feature) => (
        <div
          key={feature.title}
          className="rounded-[4px] border border-border-soft bg-surface py-8 px-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.05)] transition-all duration-300 hover:border-border-hover hover:shadow-md"
        >
          <div className="mb-3 flex h-7 w-7 items-center justify-center rounded-[4px] border border-border-soft bg-background">
            <feature.icon className="h-3.5 w-3.5 text-foreground/60" />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
            {feature.title}
          </h3>
          <p className="mt-2 text-[10px] leading-relaxed text-muted-copy">
            {feature.desc}
          </p>
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
      className="relative flex min-h-[70svh] items-end overflow-hidden bg-background bg-[linear-gradient(to_right,#8080800b_1px,transparent_1px),linear-gradient(to_bottom,#8080800b_1px,transparent_1px)] bg-[size:24px_24px] px-6 pb-12 pt-32 md:px-12 md:pb-16"
    >
      <BackgroundLayers scrollShift={scrollShift} />

      <div className="relative z-10 grid w-full grid-cols-1 items-end gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(380px,0.55fr)]">
        <HeroContent heroVisible={heroVisible} />
        <VideoPanel heroVisible={heroVisible} />
      </div>
    </section>
  );
}
