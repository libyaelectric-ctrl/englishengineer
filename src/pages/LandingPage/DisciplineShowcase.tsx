import {
  ArrowUpRight,
  Bot,
  Building2,
  CheckCircle2,
  Code2,
  Compass,
  Cpu,
  Factory,
  FlaskConical,
  HardHat,
  ShieldCheck,
  Volume2,
  Wrench,
  Zap,
} from 'lucide-react';

import { useState } from 'react';

import { Link } from 'react-router-dom';

import {
  DISCIPLINE_META,
  ENGINEERING_DISCIPLINES,
} from '@/shared/constants/engineering-disciplines';
import type { EngineeringDiscipline } from '@/shared/constants/engineering-disciplines';

import { useLocalizationStore } from '@/features/localization';
import type { TranslationKey } from '@/features/localization/localization.types';

import { AnimatedSection } from './AnimatedComponents';

const DISCIPLINE_ICONS: Record<EngineeringDiscipline, React.ElementType> = {
  architecture: Building2,
  chemical: FlaskConical,
  civil: HardHat,
  software: Code2,
  electrical: Zap,
  electronics: Cpu,
  hse: ShieldCheck,
  industrial: Factory,
  mechanical: Wrench,
  mechatronics: Bot,
};

const DISCIPLINE_SCENARIOS: Record<EngineeringDiscipline, string[]> = {
  architecture: [
    'BIM Model Clash Detection & Coordination',
    'Client Schematic Design Review Presentation',
    'Building Regulation & Accessibility Compliance Audit',
  ],
  chemical: [
    'HAZOP Study & Risk Assessment Presentation',
    'Piping and Instrumentation Diagram (P&ID) Modifications',
    'Reactor Yield Optimization & Catalyst Defense',
  ],
  civil: [
    'Method Statement for Deep Foundation & Piling',
    'FIDIC Sub-Clause 13.3 Variation & Extension of Time',
    'Concrete Core Slump Test Non-Conformance Resolution',
  ],
  software: [
    'System Architecture Refactoring & ADR Defense',
    'REST vs GraphQL API Design & Security Reviews',
    'P0 Outage Mitigation & Incident Post-Mortem Briefing',
  ],
  electrical: [
    'Substation Commissioning & Lockout/Tagout (LOTO) Procedures',
    'Load Flow & Short Circuit Calculations Review',
    'Single Line Diagram (SLD) Discrepancy Resolution',
  ],
  electronics: [
    'PCB Design Signal Integrity & Impedance Control Reviews',
    'Embedded Firmware API Specification & Sensor Integration',
    'RF Interference & Electromagnetic Compatibility (EMC) Diagnostics',
  ],
  hse: [
    'Pre-Work Toolbox Talk & Job Safety Analysis (JSA) Review',
    'Root Cause Analysis (RCA) Incident Investigation',
    'Site Safety Compliance Audit & ISO 45001 Assessment',
  ],
  industrial: [
    'Six Sigma DMAIC Project Presentation',
    'Value Stream Mapping (VSM) Bottleneck Analysis',
    'Factory Floor Layout Optimization & Ergonomics Defense',
  ],
  mechanical: [
    'HVAC System Balance & Commissioning Report',
    'Hydrostatic Pressure Test Verification Statement',
    'Rotary Equipment Alignment & Vibration Diagnostic Review',
  ],
  mechatronics: [
    'PLC Ladder Logic Automation Code Review',
    'Robotic Cell Path Trajectory & Kinematics Defenses',
    'Closed-Loop PID Controller Tuning & System Stability Analysis',
  ],
};

const DISCIPLINE_SAMPLE_TERMS: Record<EngineeringDiscipline, string> = {
  architecture: 'Spatial Programming & Circulation',
  chemical: 'Catalytic Cracking Efficiency',
  civil: 'Characteristic Tensile Strength',
  software: 'Idempotent API Response Guarantee',
  electrical: 'Dielectric Breakdown Voltage',
  electronics: 'Electromagnetic Interference (EMI) Mitigation',
  hse: 'Permit to Work (PTW) Authorization',
  industrial: 'Overall Equipment Effectiveness (OEE)',
  mechanical: 'Hydrostatic Test Pressure Envelope',
  mechatronics: 'Proportional-Integral-Derivative (PID) Coefficient',
};

export function DisciplineShowcase() {
  const translate = useLocalizationStore((s) => s.translate);
  const [activeTab, setActiveTab] = useState<EngineeringDiscipline>(ENGINEERING_DISCIPLINES[0]);
  const disciplineKeys = Object.keys(DISCIPLINE_META) as EngineeringDiscipline[];
  const meta = DISCIPLINE_META[activeTab];
  const Icon = DISCIPLINE_ICONS[activeTab] || Building2;

  return (
    <section
      id="disciplines"
      className="border-t border-border-soft bg-surface px-6 py-8 md:px-12 md:py-12"
    >
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border-soft pb-4">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="inline-flex items-center rounded bg-soft border border-border-soft px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
              {translate('landing.heroTag')}
            </span>
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
              {translate('landing.heroTitle')}
            </h2>
          </div>
          <p className="text-xs text-foreground/80 font-medium max-w-xl leading-tight">
            {translate('landing.heroSubtitle')}
          </p>
        </div>

        {/* 10-Discipline Grid with Word Counts */}
        <AnimatedSection className="mb-6 grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-5">
          {disciplineKeys.map((id) => {
            const d = DISCIPLINE_META[id];
            const DisciplineIcon = DISCIPLINE_ICONS[id] || Compass;
            const isActive = activeTab === id;
            const wordCount = d.wordCount ?? 0;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`group/btn flex flex-col items-center justify-center rounded-lg p-3 text-center transition-all border cursor-pointer hover:shadow-md hover:scale-[1.02] ${
                  isActive
                    ? 'bg-primary text-primary-foreground border-primary shadow-lg scale-[1.02]'
                    : 'bg-background text-muted-copy hover:text-foreground border-border-soft hover:border-primary/50'
                }`}
              >
                <DisciplineIcon
                  className={`h-4.5 w-4.5 mb-1.5 transition-colors ${
                    isActive ? 'text-primary-foreground' : 'text-primary'
                  }`}
                />
                <span className="text-xs font-bold leading-tight">
                  {translate(`discipline.${id}` as TranslationKey)}
                </span>
                <span
                  className={`mt-1 text-[9px] font-mono font-bold ${isActive ? 'text-primary-foreground/80' : 'text-primary/70'}`}
                >
                  {wordCount.toLocaleString()} words
                </span>
              </button>
            );
          })}
        </AnimatedSection>

        {/* Interactive Detail Panel */}
        <AnimatedSection delay={100} className="relative group">
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary via-blue-500 to-indigo-600 blur-xl opacity-50 animate-spin-slow pointer-events-none group-hover:opacity-80 transition-opacity" />

          <div className="relative rounded-xl border border-border-soft bg-background p-5 md:p-6 shadow-2xl transition-all duration-300 light-sweep-container overflow-hidden">
            <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary/10 blur-2xl animate-ambient-glow pointer-events-none" />
            <div className="grid gap-6 lg:grid-cols-12 items-stretch relative z-10">
              {/* Left Column */}
              <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <h3 className="text-lg sm:text-xl font-extrabold text-foreground leading-none">
                      {translate(`discipline.${activeTab}`)}
                    </h3>
                    <span className="inline-flex items-center rounded-full bg-soft border border-border-soft px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">
                      {meta?.wordCount?.toLocaleString() ?? '—'} words
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-medium leading-relaxed text-foreground/85">
                    {translate(`discipline.${activeTab}.desc`)}
                  </p>
                </div>

                {/* Scenarios */}
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-copy mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                    <span>Project Scenarios Included</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {DISCIPLINE_SCENARIOS[activeTab].map((s) => (
                      <div
                        key={s}
                        className="flex items-center gap-2 rounded-md bg-surface/80 border border-border-soft p-2 text-xs font-medium text-foreground"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                        <span className="truncate">{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="lg:col-span-5 flex flex-col justify-between gap-3">
                {/* Sample Term */}
                <div className="rounded-lg bg-surface border border-border-soft p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-muted-copy">
                      Sample Technical Term
                    </span>
                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 font-mono">
                      AUDIO READY
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-primary truncate">
                    {DISCIPLINE_SAMPLE_TERMS[activeTab]}
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      const synth = window.speechSynthesis;
                      if (synth) {
                        synth.cancel();
                        const u = new SpeechSynthesisUtterance(
                          `${translate(`discipline.${activeTab}`)}. Sample term: ${DISCIPLINE_SAMPLE_TERMS[activeTab]}. ${DISCIPLINE_SCENARIOS[activeTab][0]}`
                        );
                        u.rate = 0.95;
                        synth.speak(u);
                      }
                    }}
                    className="w-full flex items-center justify-between gap-2 rounded bg-primary/10 border border-primary/25 px-2.5 py-1.5 text-xs font-bold text-primary hover:bg-primary/20 transition cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <Volume2 className="h-3.5 w-3.5 text-primary animate-pulse" />
                      <span>Listen 10s Technical Voice Sample</span>
                    </span>
                    <span className="flex items-center gap-0.5 h-3">
                      <span className="w-0.5 h-2 bg-primary rounded-full animate-pulse" />
                      <span
                        className="w-0.5 h-3 bg-primary rounded-full animate-pulse"
                        style={{ animationDelay: '150ms' }}
                      />
                      <span
                        className="w-0.5 h-1.5 bg-primary rounded-full animate-pulse"
                        style={{ animationDelay: '300ms' }}
                      />
                    </span>
                  </button>
                </div>

                {/* Practice CTA */}
                <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 text-center flex-1 flex flex-col justify-between items-center">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <h4 className="text-xs font-bold text-foreground">
                      Practice {translate(`discipline.${activeTab}`)}
                    </h4>
                  </div>
                  <p className="text-[11px] leading-relaxed text-muted-copy mb-3">
                    Interactive roleplay, professional writing reviews, and vocabulary drills tuned
                    for actual projects.
                  </p>
                  <Link
                    to="/signup"
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-md bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow transition-all hover:bg-primary/95"
                  >
                    <span>{translate('landing.startFree')}</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}

export default DisciplineShowcase;
