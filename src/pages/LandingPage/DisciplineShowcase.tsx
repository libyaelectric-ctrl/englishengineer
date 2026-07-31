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

import { AnimatedSection, SectionIntro } from './AnimatedComponents';

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
      className="border-t border-border-soft bg-surface px-6 py-12 md:px-12 md:py-20"
    >
      <div className="mx-auto max-w-7xl">
        <SectionIntro
          eyebrow="Disciplines"
          title={<>Built for 10 key engineering fields.</>}
          desc="Click on any engineering discipline card below to dynamically update the scenarios, technical vocabulary, and workspace preview."
          align="center"
        />

        {/* 10-Discipline Grid selection list */}
        <AnimatedSection className="mb-12 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {DISCIPLINES.map((d) => {
            const Icon = d.icon;
            const isActive = activeTab === d.id;
            return (
              <button
                key={d.id}
                onClick={() => setActiveTab(d.id)}
                className={`group/btn flex flex-col items-center justify-center rounded-lg p-5 text-center transition-all border cursor-pointer hover:shadow-md hover:scale-[1.02] ${
                  isActive
                    ? 'bg-primary text-primary-foreground border-primary shadow-lg scale-105'
                    : 'bg-background text-muted-copy border-border-soft hover:border-primary/50 hover:text-foreground'
                }`}
              >
                <Icon
                  className={`h-6 w-6 mb-3 transition-colors ${
                    isActive ? 'text-primary-foreground' : 'text-primary'
                  }`}
                />
                <span className="text-xs font-bold leading-tight">{d.title}</span>
                <span className="mt-2 text-[9px] font-medium opacity-0 group-hover/btn:opacity-60 transition-opacity duration-200">
                  {isActive ? 'Active' : 'Click to select'}
                </span>
              </button>
            );
          })}
        </AnimatedSection>

        {/* Interactive Detail Panel */}
        <AnimatedSection delay={100}>
          <div className="rounded-xl border border-border-soft bg-background p-6 md:p-10 shadow-xl transition-all duration-300">
            <div className="grid gap-8 md:grid-cols-2">
              <div className="flex flex-col justify-between">
                <div>
                  <span className="inline-block rounded bg-soft border border-border-soft px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary mb-4">
                    {active.badge}
                  </span>
                  <h3 className="text-2xl font-bold text-foreground">{active.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-copy">
                    {active.description}
                  </p>

                  <h4 className="mt-6 text-xs font-bold uppercase tracking-wider text-muted-copy mb-3">
                    Project Scenarios Included
                  </h4>
                  <ul className="space-y-3">
                    {active.scenarios.map((s) => (
                      <li key={s} className="flex items-start gap-3">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span className="text-sm text-foreground">{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 rounded-lg bg-surface border border-border-soft p-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-copy">
                    Sample Technical Term
                  </span>
                  <p className="mt-1 text-sm font-semibold text-primary">{active.sampleTerm}</p>
                </div>
              </div>

              <div className="flex items-center justify-center">
                <div className="w-full max-w-sm rounded-xl bg-surface border border-border-soft p-8 text-center shadow-sm">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-soft mb-4">
                    <active.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h4 className="text-base font-bold text-foreground mb-2">
                    Practice {active.title}
                  </h4>
                  <p className="text-xs leading-relaxed text-muted-copy">
                    Interactive roleplay, professional writing reviews, and vocabulary drills tuned
                    for actual projects.
                  </p>
                  <Link
                    to="/signup"
                    className="mt-6 inline-flex items-center justify-center gap-2 rounded bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground shadow transition-all hover:bg-primary/95"
                  >
                    Start Practicing <ArrowUpRight className="h-4 w-4" />
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
