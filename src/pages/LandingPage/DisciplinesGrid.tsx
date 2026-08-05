import React, { useState } from 'react';
import { Lock, ArrowUpRight, Check, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { useLocalizationStore } from '@/features/localization';
import { getLandingTranslations } from './landing-i18n';

interface BranchInfo {
  id: string;
  name: string;
  emoji: string;
  termCount: string;
  sampleTerms: string[];
  description: string;
  color: string;
}

const BRANCHES: BranchInfo[] = [
  {
    id: 'civil',
    name: 'Civil Engineering',
    emoji: '🏗️',
    termCount: '1,840+',
    sampleTerms: ['Reinforcement Cage', 'Formwork Stripping', 'Load Bearing Slab'],
    description: 'Site management, reinforced concrete, FIDIC contracts, and structural design.',
    color: 'amber',
  },
  {
    id: 'electrical',
    name: 'Electrical Engineering',
    emoji: '⚡',
    termCount: '1,620+',
    sampleTerms: ['High Voltage Switchgear', 'Busbar Trunking', 'Short-Circuit Capacity'],
    description: 'Substation engineering, power distribution, transformers, and automation.',
    color: 'yellow',
  },
  {
    id: 'electronics',
    name: 'Electronics Engineering',
    emoji: '🔌',
    termCount: '1,510+',
    sampleTerms: ['Signal Conditioning', 'Impedance Matching', 'PCB Layout Routing'],
    description: 'Embedded systems, microcontrollers, PCB design, and signal processing.',
    color: 'cyan',
  },
  {
    id: 'mechanical',
    name: 'Mechanical Engineering',
    emoji: '⚙️',
    termCount: '1,950+',
    sampleTerms: ['HVAC Ducting', 'Thermodynamic Cycle', 'Hydraulic Actuator'],
    description: 'Thermodynamics, fluid mechanics, HVAC, CAD modeling, and manufacturing.',
    color: 'blue',
  },
  {
    id: 'mechatronics',
    name: 'Mechatronics',
    emoji: '🤖',
    termCount: '1,420+',
    sampleTerms: ['PID Controller Tuning', 'Servo Motor Drive', 'PLCs & Kinematics'],
    description: 'Robotics, sensor fusion, industrial automation, and electromechanical drives.',
    color: 'violet',
  },
  {
    id: 'software',
    name: 'Software Engineering',
    emoji: '💻',
    termCount: '2,100+',
    sampleTerms: ['Asynchronous Pipeline', 'Microservices Mesh', 'CI/CD Deployment'],
    description: 'System architecture, cloud infrastructure, API security, and code reviews.',
    color: 'emerald',
  },
  {
    id: 'architecture',
    name: 'Architecture',
    emoji: '🏛️',
    termCount: '1,380+',
    sampleTerms: ['BIM Execution Plan', 'Facade Cladding', 'Spatial Circulation'],
    description: 'BIM, facade engineering, interior architecture, and conceptual design.',
    color: 'rose',
  },
  {
    id: 'chemical',
    name: 'Chemical Engineering',
    emoji: '⚗️',
    termCount: '1,290+',
    sampleTerms: ['Distillation Column', 'Catalytic Cracking', 'Mass Transfer'],
    description: 'Process engineering, reactor design, petrochemicals, and separation.',
    color: 'lime',
  },
  {
    id: 'industrial',
    name: 'Industrial Engineering',
    emoji: '🏭',
    termCount: '1,470+',
    sampleTerms: ['Supply Chain Bottleneck', 'Lean Six Sigma', 'OEE Optimization'],
    description: 'Supply chain, lean manufacturing, operations research, and quality.',
    color: 'orange',
  },
  {
    id: 'hse',
    name: 'HSE & Safety',
    emoji: '🦺',
    termCount: '1,150+',
    sampleTerms: ['HAZOP Analysis', 'Permit to Work', 'LOTO Safety Procedure'],
    description: 'Site safety, OSHA/ISO compliance, risk assessment, and environmental.',
    color: 'yellow',
  },
];

const colorMap: Record<string, string> = {
  amber: 'hover:border-amber-400/60 hover:shadow-amber-500/10',
  yellow: 'hover:border-yellow-400/60 hover:shadow-yellow-500/10',
  cyan: 'hover:border-cyan-400/60 hover:shadow-cyan-500/10',
  blue: 'hover:border-blue-400/60 hover:shadow-blue-500/10',
  violet: 'hover:border-violet-400/60 hover:shadow-violet-500/10',
  emerald: 'hover:border-emerald-400/60 hover:shadow-emerald-500/10',
  rose: 'hover:border-rose-400/60 hover:shadow-rose-500/10',
  lime: 'hover:border-lime-400/60 hover:shadow-lime-500/10',
  orange: 'hover:border-orange-400/60 hover:shadow-orange-500/10',
};

export const DisciplinesGrid: React.FC = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const language = useLocalizationStore((s) => s.language);
  const t = getLandingTranslations(language);

  return (
    <section
      id="disciplines"
      className="py-24 bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-colors duration-500 relative overflow-hidden"
    >
      {/* subtle accent */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.025] bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:32px_32px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-3">
            {t.disciplinesHeaderBadge}
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
            {t.disciplinesTitle}
          </h2>
          <p className="mt-4 text-slate-600 dark:text-slate-400 text-base sm:text-lg leading-relaxed">
            {t.disciplinesSub}
          </p>
        </motion.div>

        {/* 10 Card Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {BRANCHES.map((b, i) => {
            const isSelected = selected === b.id;
            return (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                whileHover={{ y: -5, scale: 1.02 }}
                onClick={() => setSelected(isSelected ? null : b.id)}
                className={`group relative cursor-pointer rounded-2xl p-4 bg-slate-50 dark:bg-slate-950/70 border transition-all duration-300 shadow-sm hover:shadow-lg ${
                  isSelected
                    ? 'border-blue-500 ring-2 ring-blue-500/30 shadow-blue-500/10'
                    : `border-slate-200 dark:border-slate-800 ${colorMap[b.color] ?? ''}`
                }`}
              >
                {/* emoji */}
                <span className="text-3xl block mb-3">{b.emoji}</span>

                {/* name */}
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                  {b.name}
                </h3>

                {/* term count */}
                <p className="mt-1 text-[10px] font-mono text-slate-500 dark:text-slate-500">
                  {b.termCount} terms
                </p>

                {/* expanded detail */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <p className="mt-3 text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-200 dark:border-slate-800 pt-3">
                        {b.description}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {b.sampleTerms.map((term) => (
                          <span key={term} className="text-[9px] px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/20 font-medium">
                            {term}
                          </span>
                        ))}
                      </div>
                      <Link
                        to={`/onboarding?branch=${b.id}`}
                        className="mt-3 w-full flex items-center justify-center gap-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold transition-colors"
                      >
                        <Lock className="w-3 h-3" />
                        <span>{t.btnSelectBranch}</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* expand hint */}
                {!isSelected && (
                  <ChevronRight className="absolute bottom-3 right-3 w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Bottom formula banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border border-blue-100 dark:border-blue-900/60"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center shrink-0">
              <Check className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">{t.disciplinesFormulaTitle}</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                {t.disciplinesFormulaDesc}
              </p>
            </div>
          </div>
          <Link
            to="/onboarding"
            className="shrink-0 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-md transition-all"
          >
            {t.ctaSelectBranch}
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
