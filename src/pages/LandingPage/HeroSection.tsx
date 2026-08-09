import { ArrowRight, CheckCircle2, Sparkles, Volume2 } from 'lucide-react';

import { useEffect, useState } from 'react';

import { useLocalizationStore } from '@/features/localization';

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
  const translate = useLocalizationStore((s) => s.translate);
  const language = useLocalizationStore((s) => s.language);
  const isTr = language === 'tr';

  const HERO_STATS = [
    { value: '10', labelEn: 'Disciplines', labelTr: 'Disiplin' },
    { value: 'A2–C1', labelEn: 'CEFR Levels', labelTr: 'CEFR Seviyesi' },
    { value: '15', labelEn: 'Languages', labelTr: 'Arayüz Dili' },
  ];

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
      {/* Ambient Background Light Glow Orbs */}
      <div className="absolute -top-10 -left-10 h-80 w-80 rounded-full bg-gradient-to-tr from-primary/30 via-blue-500/20 to-indigo-500/30 blur-3xl opacity-60 animate-ambient-glow pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 h-80 w-80 rounded-full bg-gradient-to-br from-indigo-500/25 via-blue-600/20 to-primary/30 blur-3xl opacity-60 animate-ambient-glow pointer-events-none" />

      <div
        className={`w-full flex flex-col items-center transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        {/* 2 Equal Columns: Left (Try AI Coach Sandbox) & Right (AI Coach Visual Processor) */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch relative z-10">
          {/* Left Column: ITEM 1 Interactive "Try AI Coach" Canlı Mini Demo Box */}
          <div className="w-full h-full flex flex-col justify-between rounded-[var(--radius-card)] border border-primary/25 bg-surface/90 backdrop-blur-md p-5 shadow-2xl relative light-sweep-container overflow-hidden">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-primary flex items-center gap-1.5 font-mono">
                  <Sparkles className="h-4 w-4 text-primary animate-pulse" />{' '}
                  {translate('landing.demoTitle')}
                </span>
                <span className="text-[10px] font-semibold text-muted-copy">
                  {translate('landing.demoClickPreset')}
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
                    className={`rounded-[var(--radius-card)] px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer border ${
                      activePresetIndex === idx
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                        : 'bg-background border-border-soft text-muted-copy hover:text-foreground hover:border-primary/40'
                    }`}
                  >
                    {
                      [
                        translate('landing.demoPreset1'),
                        translate('landing.demoPreset2'),
                        translate('landing.demoPreset3'),
                      ][idx]
                    }
                  </button>
                ))}
              </div>

              <div className="flex gap-2 items-center">
                <label htmlFor="hero-demo-input" className="sr-only">
                  {translate('landing.demoInputLabel')}
                </label>
                <input
                  id="hero-demo-input"
                  type="text"
                  value={demoInput}
                  onChange={(e) => setDemoInput(e.target.value)}
                  className="flex-1 rounded-[var(--radius-card)] border border-border-soft bg-background px-3 py-2 text-xs text-foreground font-medium focus:border-primary focus:outline-none shadow-inner"
                  placeholder={translate('landing.demoInputPlaceholder')}
                />
                <button
                  type="button"
                  onClick={() => handleRunAnalysis()}
                  disabled={isAnalyzing}
                  className="inline-flex items-center gap-1.5 rounded-[var(--radius-card)] bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition shadow-md cursor-pointer shrink-0"
                >
                  <span>
                    {isAnalyzing
                      ? translate('landing.demoAnalyzing')
                      : translate('landing.demoTestButton')}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Analysis Result Box */}
              {analysisResult && (
                <div className="rounded-[var(--radius-card)] border border-emerald-500/35 bg-emerald-500/10 p-3 space-y-1.5 animate-fadeIn">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />{' '}
                      {translate('landing.demoRefinedTitle')}
                    </span>
                    <span className="font-bold text-primary uppercase font-mono bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">
                      {analysisResult.level}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-foreground leading-relaxed">
                    "{analysisResult.refined}"
                  </p>
                  <div className="text-[10px] font-bold text-muted-copy flex items-center gap-1 pt-0.5">
                    <span className="text-primary font-mono">
                      {translate('landing.demoRecognizedTerm')}
                    </span>
                    <span>{analysisResult.term}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: AI Coach Interactive Card & ITEM 7: Audio Waveform Visualizer */}
          <div className="w-full h-full relative group">
            {/* Rotating Ambient Light Ring */}
            <div className="absolute -inset-1 rounded-[var(--radius-card)] bg-gradient-to-r from-primary via-blue-500 to-indigo-600 blur-xl opacity-60 animate-spin-slow pointer-events-none group-hover:opacity-90 transition-opacity" />

            <div className="relative rounded-[var(--radius-card)] bg-gradient-to-br from-primary via-[#1a5fd4] to-[#3366cc] p-1 shadow-2xl h-full flex flex-col justify-between">
              <div className="relative overflow-hidden rounded-[var(--radius-card)] bg-primary p-5 sm:p-6 light-sweep-container h-full flex flex-col justify-between">
                <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 animate-ambient-glow" />
                <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-white/10 animate-ambient-glow" />
                <div className="relative z-10 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="grid gap-4 sm:grid-cols-2 items-center">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded bg-white/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white mb-2 font-mono">
                        {translate('landing.aiCoachEngine')}
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                        {translate('landing.cefrAssessment')}
                      </h3>
                      <p className="mt-1.5 text-xs text-white/80 leading-relaxed">
                        {translate('landing.aiCoachDesc')}
                      </p>
                    </div>
                    <div className="flex justify-center">
                      <div className="grid grid-cols-2 gap-2 w-full">
                        {(
                          [
                            { l: 'landing.skillWriting', v: 'C1' },
                            { l: 'landing.skillSpeaking', v: 'B2' },
                            { l: 'landing.skillListening', v: 'B2+' },
                            { l: 'landing.skillReading', v: 'C1' },
                          ] as const
                        ).map((i) => (
                          <div
                            key={i.l}
                            className="rounded-[var(--radius-card)] bg-white/10 p-2.5 text-center border border-white/10"
                          >
                            <div className="text-[10px] text-white/70 font-medium uppercase tracking-wider">
                              {translate(i.l)}
                            </div>
                            <div className="text-base font-bold text-white mt-0.5">{i.v}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Trust stats (moved from bottom strip) */}
                  <div className="grid grid-cols-3 gap-2">
                    {HERO_STATS.map((s) => (
                      <div
                        key={s.labelEn}
                        className="rounded-[var(--radius-card)] bg-white/10 border border-white/15 px-2 py-1.5 text-center"
                      >
                        <div className="text-sm font-extrabold text-white leading-none">
                          {s.value}
                        </div>
                        <div className="text-[9px] text-white/70 font-medium uppercase tracking-wider mt-0.5 leading-tight">
                          {isTr ? s.labelTr : s.labelEn}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* ITEM 7: Hero Waveform Audio Visualizer */}
                  <div className="rounded-[var(--radius-card)] bg-black/25 p-3 border border-white/15 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-white">
                      <Volume2 className="h-4 w-4 text-emerald-400 animate-pulse shrink-0" />
                      <span className="text-[10px] font-bold uppercase tracking-wider font-mono">
                        {translate('landing.liveVoiceTitle')}
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
      </div>
    </section>
  );
};
export default HeroSection;
