import { ArrowRight, CheckCircle2, Globe, Shield, Sparkles, Volume2, Zap } from 'lucide-react';

import { useEffect, useState } from 'react';

interface HeroSectionProps {
  scrollShift: number;
}

const SAMPLE_PRESETS = [
  {
    raw: 'We must check concrete pouring schedule today due to rain.',
    refined:
      'We require immediate verification of the concrete placement schedule pursuant to ASTM C94 tolerances.',
    term: 'Concrete Placement Schedule (ASTM C94)',
    level: 'C1 Advanced',
  },
  {
    raw: 'Please pay extra money because bad weather delay work.',
    refined:
      'Pursuant to FIDIC Clause 8.4 [Extension of Time], we hereby notify the Engineer of critical path delays due to adverse climatic conditions.',
    term: 'FIDIC Cl. 8.4 Extension of Time (EOT)',
    level: 'C2 Executive',
  },
  {
    raw: 'HVAC fan motor has noise, need replace parts.',
    refined:
      'Vibration diagnostics indicate bearing wear on the primary HVAC supply fan motor; replacement under ISO 10816 standards is recommended.',
    term: 'Vibration Diagnostic Review (ISO 10816)',
    level: 'C1 Precision',
  },
];

export const HeroSection = ({ scrollShift }: HeroSectionProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [demoInput, setDemoInput] = useState(SAMPLE_PRESETS[0].raw);
  const [activePresetIndex, setActivePresetIndex] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<(typeof SAMPLE_PRESETS)[0] | null>(
    SAMPLE_PRESETS[0]
  );

  useEffect(() => {
    const t = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const handleRunAnalysis = (presetObj?: (typeof SAMPLE_PRESETS)[0]) => {
    const target = presetObj || SAMPLE_PRESETS[activePresetIndex];
    setIsAnalyzing(true);
    setTimeout(() => {
      setAnalysisResult(target);
      setIsAnalyzing(false);
    }, 400);
  };

  return (
    <section
      className="relative z-10 max-w-7xl mx-auto flex flex-col items-center justify-center px-4 sm:px-6 pt-20 sm:pt-24 pb-10"
      style={{ transform: `translateY(${scrollShift}px)` }}
    >
      <div
        className={`w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        {/* Ambient Left Background Light Glow Orb */}
        <div className="absolute -top-10 -left-10 h-80 w-80 rounded-full bg-gradient-to-tr from-primary/30 via-blue-500/20 to-indigo-500/30 blur-3xl opacity-60 animate-ambient-glow pointer-events-none" />

        {/* Left Column: Live Pulse Badge, Title, Description & Interactive Sandbox (Item 1 & Item 3) */}
        <div className="lg:col-span-6 space-y-4 text-left relative z-10">
          {/* ITEM 3: Gerçek Zamanlı Canlı Aktivite Rozeti */}
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>1,420+ Engineers practicing site English right now</span>
          </div>

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

          {/* ITEM 1: İnteraktif "Try AI Coach" Canlı Mini Demo Box */}
          <div className="rounded-xl border border-primary/25 bg-surface/90 backdrop-blur-md p-3.5 shadow-lg space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1 font-mono">
                <Sparkles className="h-3 w-3 text-primary animate-pulse" /> Try AI Coach Demo
              </span>
              <span className="text-[9px] font-medium text-muted-copy">
                Click preset to simulate
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_PRESETS.map((p, idx) => (
                <button
                  key={p.term}
                  type="button"
                  onClick={() => {
                    setActivePresetIndex(idx);
                    setDemoInput(p.raw);
                    handleRunAnalysis(p);
                  }}
                  className={`rounded px-2 py-1 text-[10px] font-bold transition-all cursor-pointer border ${
                    activePresetIndex === idx
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'bg-background border-border-soft text-muted-copy hover:text-foreground hover:border-primary/40'
                  }`}
                >
                  Preset {idx + 1}
                </button>
              ))}
            </div>

            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={demoInput}
                onChange={(e) => setDemoInput(e.target.value)}
                className="flex-1 rounded border border-border-soft bg-background px-3 py-1.5 text-xs text-foreground font-medium focus:border-primary focus:outline-none shadow-inner"
                placeholder="Type a technical site sentence..."
              />
              <button
                type="button"
                onClick={() => handleRunAnalysis()}
                disabled={isAnalyzing}
                className="inline-flex items-center gap-1 rounded bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition shadow-sm cursor-pointer shrink-0"
              >
                <span>{isAnalyzing ? 'Analyzing...' : 'Test AI'}</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            {/* Analysis Result Box */}
            {analysisResult && (
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-2.5 space-y-1 animate-fadeIn">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Refined Technical English
                  </span>
                  <span className="font-bold text-primary uppercase font-mono bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded">
                    {analysisResult.level}
                  </span>
                </div>
                <p className="text-xs font-semibold text-foreground leading-snug">
                  "{analysisResult.refined}"
                </p>
                <div className="text-[9px] font-bold text-muted-copy flex items-center gap-1 pt-0.5">
                  <span className="text-primary font-mono">Recognized Term:</span>
                  <span>{analysisResult.term}</span>
                </div>
              </div>
            )}
          </div>

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

        {/* Right Column: AI Coach Interactive Card & ITEM 7: Audio Waveform Visualizer */}
        <div className="lg:col-span-6 w-full relative group">
          {/* Rotating Ambient Light Ring */}
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary via-blue-500 to-indigo-600 blur-xl opacity-60 animate-spin-slow pointer-events-none group-hover:opacity-90 transition-opacity" />

          <div className="relative rounded-xl bg-gradient-to-br from-primary via-[#1a5fd4] to-[#3366cc] p-1 shadow-2xl">
            <div className="relative overflow-hidden rounded-lg bg-primary p-4 sm:p-5 light-sweep-container">
              <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 animate-ambient-glow" />
              <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-white/10 animate-ambient-glow" />
              <div className="relative z-10 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2 items-center">
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

                {/* ITEM 7: Hero Waveform Audio Visualizer */}
                <div className="rounded-lg bg-black/25 p-2.5 border border-white/15 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-white">
                    <Volume2 className="h-4 w-4 text-emerald-400 animate-pulse shrink-0" />
                    <span className="text-[10px] font-bold uppercase tracking-wider font-mono">
                      Live Voice Waveform Processor
                    </span>
                  </div>
                  {/* Waveform Bar Animation */}
                  <div className="flex items-end gap-1 h-5 shrink-0">
                    {[40, 70, 30, 90, 60, 100, 50, 80, 45, 95, 65, 35].map((h, i) => (
                      <div
                        key={i}
                        className="w-1 bg-gradient-to-t from-emerald-400 to-cyan-300 rounded-full animate-pulse"
                        style={{
                          height: `${h}%`,
                          animationDelay: `${i * 80}ms`,
                          animationDuration: '1.2s',
                        }}
                      />
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
