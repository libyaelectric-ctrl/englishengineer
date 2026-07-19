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
        backgroundImage: "url('/agentic/org-arc.png')",
        opacity: 0.2,
        transform: `translate3d(0, ${scrollShift}px, 0) scale(1.04)`,
      }}
    />
    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(248,249,250,0.1)_0%,rgba(248,249,250,0.2)_34%,rgba(248,249,250,0.9)_88%)] dark:bg-[linear-gradient(180deg,rgba(11,14,20,0.1)_0%,rgba(11,14,20,0.2)_34%,rgba(11,14,20,0.9)_88%)]" />
    <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,rgba(248,249,250,0)_0%,#F8F9FA_80%)] dark:bg-[linear-gradient(180deg,rgba(11,14,20,0)_0%,#0B0E14_80%)]" />
  </>
);

const VideoPanel = ({ heroVisible }: { heroVisible: boolean }) => (
  <div
    className="rounded-[4px] border border-[#E9ECEF] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-md transition-all duration-300 backdrop-blur-xl dark:border-[#2a2d35] dark:bg-[#1C1F26]/60 dark:shadow-none"
    style={{
      opacity: heroVisible ? 1 : 0,
      transform: heroVisible
        ? 'translateY(0) scale(1)'
        : 'translateY(28px) scale(0.98)',
      transition:
        'opacity 900ms cubic-bezier(0.16,1,0.3,1) 420ms, transform 900ms cubic-bezier(0.16,1,0.3,1) 420ms',
    }}
  >
    <div className="overflow-hidden rounded-[4px] border border-[#E9ECEF] bg-[#111] dark:border-[#2a2d35]">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="aspect-[16/10] w-full object-cover"
        poster="/agentic/arc.png"
      >
        <source src="/agentic-hero.mp4" type="video/mp4" />
      </video>
    </div>
    <div className="grid grid-cols-2 gap-2 pt-3">
      {STATS.map((stat) => (
        <div
          key={stat.label}
          className="rounded-[4px] border border-[#E9ECEF] bg-[#F8F9FA] p-2.5 dark:border-[#2a2d35] dark:bg-[#1C1F26]/68"
        >
          <div className="text-xl font-bold tracking-tight text-[#1c1d22] dark:text-[#E2E4E7]">
            {stat.value}
          </div>
          <div className="mt-0.5 text-[9px] font-medium uppercase text-[#1c1d22]/40 dark:text-[#949BA4]">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const HeroContent = ({ heroVisible }: { heroVisible: boolean }) => (
  <div className="max-w-4xl space-y-6">
    <span
      className="inline-flex items-center gap-1.5 rounded-[4px] border border-[#E9ECEF] bg-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#5b5d72] backdrop-blur dark:border-[#2a2d35] dark:bg-[#1C1F26]/55"
      style={heroFadeStyle(heroVisible, '0ms')}
    >
      <Sparkles className="h-3.5 w-3.5 text-[#0047bb] dark:text-[#3b82f6]" />
      AI English operating system for engineers
    </span>
    <h1
      className="max-w-4xl text-2xl font-bold tracking-tight text-[#1c1d22] sm:text-4xl md:text-5xl lg:text-6xl dark:text-[#E2E4E7]"
      style={heroFadeStyle(heroVisible, '80ms')}
    >
      Engineering English OS for project teams.
    </h1>
    <p
      className="max-w-xl text-xs leading-5 text-[#5b5d72]"
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
        className="inline-flex min-h-10 items-center justify-center rounded-[4px] bg-[#0047bb] px-6 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#0047bb]/90 dark:bg-[#3b82f6] dark:hover:bg-[#3b82f6]/90"
      >
        Initialize Core
      </a>
      <a
        href="#pricing"
        className="inline-flex min-h-10 items-center justify-center rounded-[4px] border border-[#E9ECEF] bg-white px-6 text-xs font-bold uppercase tracking-wider text-[#1c1d22]/70 backdrop-blur transition hover:bg-[#F1F3F5] dark:border-[#2a2d35] dark:bg-[#1C1F26]/60 dark:text-[#949BA4] dark:hover:bg-[#252830]"
      >
        View Schema
      </a>
    </div>

    <div className="grid grid-cols-2 gap-3 pt-6 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
      {FEATURES.map((feature) => (
        <div
          key={feature.title}
          className="rounded-[4px] border border-[#E9ECEF] bg-white py-8 px-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.05)] transition-all duration-300 hover:border-[#DEE2E6] hover:shadow-md dark:border-[#2a2d35] dark:bg-[#1C1F26]/60 dark:hover:border-[#3a3d45] dark:shadow-none"
        >
          <div className="mb-3 flex h-7 w-7 items-center justify-center rounded-[4px] border border-[#E9ECEF] bg-[#F8F9FA] dark:border-[#2a2d35] dark:bg-[#0B0E14]">
            <feature.icon className="h-3.5 w-3.5 text-[#1c1d22]/60 dark:text-[#949BA4]" />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#1c1d22] dark:text-[#E2E4E7]">
            {feature.title}
          </h3>
          <p className="mt-2 text-[10px] leading-relaxed text-[#5b5d72] dark:text-[#949BA4]">
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
      className="relative flex min-h-[70svh] items-end overflow-hidden bg-[#F8F9FA] bg-[linear-gradient(to_right,#8080800b_1px,transparent_1px),linear-gradient(to_bottom,#8080800b_1px,transparent_1px)] bg-[size:24px_24px] px-6 pb-12 pt-32 md:px-12 md:pb-16 dark:bg-[#0B0E14]"
    >
      <BackgroundLayers scrollShift={scrollShift} />

      <div className="relative z-10 grid w-full grid-cols-1 items-end gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(380px,0.55fr)]">
        <HeroContent heroVisible={heroVisible} />
        <VideoPanel heroVisible={heroVisible} />
      </div>
    </section>
  );
}
