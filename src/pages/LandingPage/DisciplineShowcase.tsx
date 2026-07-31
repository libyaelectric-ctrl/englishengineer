import {
  ArrowUpRight,
  Bot,
  Building2,
  CheckCircle2,
  Code2,
  Cog,
  Compass,
  Cpu,
  Factory,
  FlaskConical,
  ShieldAlert,
  Zap,
} from 'lucide-react';

import { useState } from 'react';

import { Link } from 'react-router-dom';

import { AnimatedSection } from './AnimatedComponents';

const DISCIPLINES = [
  {
    id: 'architecture',
    title: 'Architecture',
    icon: Compass,
    badge: 'Design, Spatial & BIM',
    description:
      'Master architectural English for spatial design proposals, building code reviews, BIM model coordination, client design presentations, and material specifications.',
    scenarios: [
      'BIM Model Clash Detection & Coordination',
      'Client Schematic Design Review Presentation',
      'Building Regulation & Accessibility Compliance Audit',
    ],
    sampleTerm: 'Spatial Programming & Circulation',
  },
  {
    id: 'chemical',
    title: 'Chemical Engineering',
    icon: FlaskConical,
    badge: 'Process, Refining & Safety',
    description:
      'Communicate fluently regarding process flow diagrams (PFDs), chemical reaction metrics, distillation column operations, HAZOP reviews, and mass balance sheets.',
    scenarios: [
      'HAZOP Study & Risk Assessment Presentation',
      'Piping and Instrumentation Diagram (P&ID) Modifications',
      'Reactor Yield Optimization & Catalyst Defense',
    ],
    sampleTerm: 'Catalytic Cracking Efficiency',
  },
  {
    id: 'civil',
    title: 'Civil Engineering',
    icon: Building2,
    badge: 'Infrastructure & Structures',
    description:
      'Discuss structural calculations, concrete compression tests, foundation piling reports, FIDIC contracts, and earthwork estimations.',
    scenarios: [
      'Method Statement for Deep Foundation & Piling',
      'FIDIC Sub-Clause 13.3 Variation & Extension of Time (EOT)',
      'Concrete Core Slump Test Non-Conformance Resolution',
    ],
    sampleTerm: 'Characteristic Tensile Strength',
  },
  {
    id: 'computer_software',
    title: 'Computer / Software Engineering',
    icon: Code2,
    badge: 'Architecture, Cloud & Code',
    description:
      'Conduct comprehensive Pull Request reviews, system architecture designs, API specifications, and incident post-mortems.',
    scenarios: [
      'System Architecture Refactoring & ADR Defense',
      'REST vs GraphQL API Design & Security Reviews',
      'P0 Outage Mitigation & Incident Post-Mortem Briefing',
    ],
    sampleTerm: 'Idempotent API Response Guarantee',
  },
  {
    id: 'electrical',
    title: 'Electrical Engineering',
    icon: Zap,
    badge: 'Power Systems & Grid',
    description:
      'Explain medium/high voltage distribution systems, switchgear layouts, load flow calculations, LOTO protocols, and generator commissioning.',
    scenarios: [
      'Substation Commissioning & Lockout/Tagout (LOTO) Procedures',
      'Load Flow & Short Circuit Calculations Review',
      'Single Line Diagram (SLD) Discrepancy Resolution',
    ],
    sampleTerm: 'Dielectric Breakdown Voltage',
  },
  {
    id: 'electronics',
    title: 'Electronics Engineering',
    icon: Cpu,
    badge: 'Semiconductors & Embedded',
    description:
      'Present PCB layouts, signal integrity analyses, embedded firmware protocols, sensor calibration metrics, and semiconductor testing.',
    scenarios: [
      'PCB Design Signal Integrity & Impedance Control Reviews',
      'Embedded Firmware API Specification & Sensor Integration',
      'RF Interference & Electromagnetic Compatibility (EMC) Diagnostics',
    ],
    sampleTerm: 'Electromagnetic Interference (EMI) Mitigation',
  },
  {
    id: 'hse',
    title: 'HSE Engineering',
    icon: ShieldAlert,
    badge: 'Safety, Health & Compliance',
    description:
      'Lead toolbox talks, write accident/incident reports, conduct hazard identifications (HAZID), and coordinate safety audits under ISO 45001.',
    scenarios: [
      'Pre-Work Toolbox Talk & Job Safety Analysis (JSA) Review',
      'Root Cause Analysis (RCA) Incident Investigation',
      'Site Safety Compliance Audit & ISO 45001 Assessment',
    ],
    sampleTerm: 'Permit to Work (PTW) Authorization',
  },
  {
    id: 'industrial',
    title: 'Industrial Engineering',
    icon: Factory,
    badge: 'Lean, Operations & Supply Chain',
    description:
      'Optimize manufacturing workflows, explain cycle time distributions, present value stream maps, and coordinate supply chain operations.',
    scenarios: [
      'Six Sigma DMAIC Project Presentation',
      'Value Stream Mapping (VSM) Bottleneck Analysis',
      'Factory Floor Layout Optimization & Ergonomics Defense',
    ],
    sampleTerm: 'Overall Equipment Effectiveness (OEE)',
  },
  {
    id: 'mechanical',
    title: 'Mechanical Engineering',
    icon: Cog,
    badge: 'HVAC, Fluid Dynamics & Machinery',
    description:
      'Detail HVAC sizing calculations, pressure testing protocols, mechanical drafting standards, stress analyses, and pump/compressor curves.',
    scenarios: [
      'HVAC System Balance & Commissioning Report',
      'Hydrostatic Pressure Test Verification Statement',
      'Rotary Equipment Alignment & Vibration Diagnostic Review',
    ],
    sampleTerm: 'Hydrostatic Test Pressure Envelope',
  },
  {
    id: 'mechatronics_robotics',
    title: 'Mechatronics / Robotics Engineering',
    icon: Bot,
    badge: 'Automation, Control & Robotics',
    description:
      'Discuss closed-loop control systems, robotic arm trajectories, servo motor tunings, PLC ladders, and automation safety standards.',
    scenarios: [
      'PLC Ladder Logic Automation Code Review',
      'Robotic Cell Path Trajectory & Kinematics Defenses',
      'Closed-Loop PID Controller Tuning & System Stability Analysis',
    ],
    sampleTerm: 'Proportional-Integral-Derivative (PID) Coefficient',
  },
];

export function DisciplineShowcase() {
  const [activeTab, setActiveTab] = useState(DISCIPLINES[0].id);
  const active = DISCIPLINES.find((d) => d.id === activeTab) || DISCIPLINES[0];

  return (
    <section
      id="disciplines"
      className="border-t border-border-soft bg-surface px-6 py-8 md:px-12 md:py-12"
    >
      <div className="mx-auto max-w-7xl">
        {/* Single Row Compact Header */}
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border-soft pb-4">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="inline-flex items-center rounded bg-soft border border-border-soft px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
              Disciplines
            </span>
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
              Built for 10 key engineering fields.
            </h2>
          </div>
          <p className="text-xs text-foreground/80 font-medium max-w-xl leading-tight">
            Click any discipline card below to dynamically update scenarios & workspace preview.
          </p>
        </div>

        {/* 10-Discipline Grid selection list */}
        <AnimatedSection className="mb-6 grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-5">
          {DISCIPLINES.map((d) => {
            const Icon = d.icon;
            const isActive = activeTab === d.id;
            return (
              <button
                key={d.id}
                onClick={() => setActiveTab(d.id)}
                className={`group/btn flex flex-col items-center justify-center rounded-lg p-3 text-center transition-all border cursor-pointer hover:shadow-md hover:scale-[1.02] ${
                  isActive
                    ? 'bg-primary text-primary-foreground border-primary shadow-lg scale-[1.02]'
                    : 'bg-background text-muted-copy hover:text-foreground border-border-soft hover:border-primary/50'
                }`}
              >
                <Icon
                  className={`h-4.5 w-4.5 mb-1.5 transition-colors ${
                    isActive ? 'text-primary-foreground' : 'text-primary'
                  }`}
                />
                <span className="text-xs font-bold leading-tight">{d.title}</span>
                <span className="mt-1 text-[9px] font-medium opacity-0 group-hover/btn:opacity-60 transition-opacity duration-200">
                  {isActive ? 'Active' : 'Click to select'}
                </span>
              </button>
            );
          })}
        </AnimatedSection>

        {/* Interactive Detail Panel - Compact & Dynamic Ambient Aura */}
        <AnimatedSection delay={100} className="relative group">
          {/* Rotating Ambient Light Ring */}
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary via-blue-500 to-indigo-600 blur-xl opacity-50 animate-spin-slow pointer-events-none group-hover:opacity-80 transition-opacity" />

          <div className="relative rounded-xl border border-border-soft bg-background p-5 md:p-6 shadow-2xl transition-all duration-300 light-sweep-container overflow-hidden">
            <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary/10 blur-2xl animate-ambient-glow pointer-events-none" />
            <div className="grid gap-6 lg:grid-cols-12 items-stretch relative z-10">
              {/* Left Column: Title, Description & Scenarios (7 Cols) */}
              <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <h3 className="text-lg sm:text-xl font-extrabold text-foreground leading-none">
                      {active.title}
                    </h3>
                    <span className="inline-flex items-center rounded-full bg-soft border border-border-soft px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">
                      {active.badge}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-medium leading-relaxed text-foreground/85">
                    {active.description}
                  </p>
                </div>

                {/* Included Scenarios Grid */}
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-copy mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                    <span>Project Scenarios Included</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {active.scenarios.map((s) => (
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

              {/* Right Column: Sample Term & Direct Practice CTA (5 Cols) */}
              <div className="lg:col-span-5 flex flex-col justify-between gap-3">
                {/* Sample Term Box */}
                <div className="rounded-lg bg-surface border border-border-soft p-3">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-muted-copy block mb-0.5">
                    Sample Technical Term
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-primary truncate">
                    {active.sampleTerm}
                  </p>
                </div>

                {/* Practice CTA Box */}
                <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 text-center flex-1 flex flex-col justify-between items-center">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <active.icon className="h-3.5 w-3.5" />
                    </div>
                    <h4 className="text-xs font-bold text-foreground">Practice {active.title}</h4>
                  </div>
                  <p className="text-[11px] leading-relaxed text-muted-copy mb-3">
                    Interactive roleplay, professional writing reviews, and vocabulary drills tuned
                    for actual projects.
                  </p>
                  <Link
                    to="/signup"
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-md bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow transition-all hover:bg-primary/95"
                  >
                    <span>Start Practicing</span>
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
