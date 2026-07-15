import { Sparkles } from 'lucide-react';
import { FEATURES, STATS } from './constants';

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
      className="relative flex min-h-[50svh] items-end overflow-hidden px-6 pb-6 pt-20 md:px-12 md:pb-8"
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/agentic/org-arc.png')",
          opacity: 0.34,
          transform: `translate3d(0, ${scrollShift}px, 0) scale(1.04)`,
        }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(246,244,238,0.18)_0%,rgba(246,244,238,0.36)_34%,rgba(246,244,238,0.96)_88%)]" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,rgba(246,244,238,0)_0%,#f6f4ee_80%)]" />

      <div className="relative z-10 grid w-full grid-cols-1 items-end gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(340px,0.55fr)]">
        <div className="max-w-4xl">
          <span
            className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white/55 px-2.5 py-0.5 text-[10px] font-medium text-muted-copy backdrop-blur"
            style={{
              opacity: heroVisible ? 1 : 0,
              filter: heroVisible ? 'blur(0)' : 'blur(12px)',
              transform: heroVisible ? 'translateY(0)' : 'translateY(18px)',
              transition:
                'opacity 760ms cubic-bezier(0.16,1,0.3,1), filter 760ms cubic-bezier(0.16,1,0.3,1), transform 760ms cubic-bezier(0.16,1,0.3,1)',
            }}
          >
            <Sparkles className="h-3.5 w-3.5 text-[#5b6f11]" />
            AI English operating system for engineers
          </span>
          <h1
            className="mt-4 max-w-4xl text-xl font-light leading-[1.05] text-[#111] sm:text-2xl md:text-3xl lg:text-4xl"
            style={{
              opacity: heroVisible ? 1 : 0,
              filter: heroVisible ? 'blur(0)' : 'blur(24px)',
              transform: heroVisible ? 'translateY(0)' : 'translateY(36px)',
              transition:
                'opacity 1000ms cubic-bezier(0.16,1,0.3,1) 80ms, filter 1000ms cubic-bezier(0.16,1,0.3,1) 80ms, transform 1000ms cubic-bezier(0.16,1,0.3,1) 80ms',
            }}
          >
            Engineering English OS for project teams.
          </h1>
          <p
            className="mt-2 max-w-xl text-xs leading-5 text-muted-copy"
            style={{
              opacity: heroVisible ? 1 : 0,
              filter: heroVisible ? 'blur(0)' : 'blur(16px)',
              transform: heroVisible ? 'translateY(0)' : 'translateY(24px)',
              transition:
                'opacity 820ms cubic-bezier(0.16,1,0.3,1) 220ms, filter 820ms cubic-bezier(0.16,1,0.3,1) 220ms, transform 820ms cubic-bezier(0.16,1,0.3,1) 220ms',
            }}
          >
            EngVox turns writing, speaking, listening and reading into an
            orchestrated practice system for real engineering work.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="rounded-lg border border-black/[0.06] bg-white/68 p-3 backdrop-blur"
              >
                <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-md border border-black/10 bg-white">
                  <feature.icon className="h-3.5 w-3.5 text-black/60" />
                </div>
                <h3 className="text-xs font-medium text-[#111]">
                  {feature.title}
                </h3>
                <p className="mt-1 text-[10px] leading-3.5 text-muted-copy">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div
          className="rounded-2xl border border-black/10 bg-white/62 p-4 shadow-[0_24px_80px_rgba(17,17,17,0.13)] backdrop-blur-xl"
          style={{
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible
              ? 'translateY(0) scale(1)'
              : 'translateY(28px) scale(0.98)',
            transition:
              'opacity 900ms cubic-bezier(0.16,1,0.3,1) 420ms, transform 900ms cubic-bezier(0.16,1,0.3,1) 420ms',
          }}
        >
          <div className="overflow-hidden rounded-xl border border-black/[0.06] bg-[#111]">
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
                className="rounded-xl border border-black/[0.06] bg-white/68 p-2.5"
              >
                <div className="text-xl font-light text-[#111]">
                  {stat.value}
                </div>
                <div className="mt-0.5 text-[9px] font-medium uppercase text-black/40">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
