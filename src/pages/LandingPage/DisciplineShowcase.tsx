import { motion } from 'motion/react';
import { CircuitBoard, DraftingCompass, Factory, FlaskConical, HardHat, ShieldCheck, Sparkles, Wrench, Zap } from 'lucide-react';

import { ENGINEERING_DISCIPLINES, DISCIPLINE_META, type EngineeringDiscipline } from '@/shared/constants/engineering-disciplines';
import { getDisciplineIcon } from '@/shared/icons/registry';

const accent: Record<EngineeringDiscipline, string> = {
  architecture: 'from-amber-300 to-orange-500',
  chemical: 'from-emerald-300 to-teal-500',
  civil: 'from-yellow-300 to-orange-500',
  electrical: 'from-cyan-300 to-blue-500',
  electronics: 'from-indigo-300 to-violet-500',
  hse: 'from-green-300 to-emerald-500',
  industrial: 'from-slate-300 to-slate-500',
  mechanical: 'from-zinc-300 to-cyan-500',
  mechatronics: 'from-fuchsia-300 to-purple-500',
  software: 'from-sky-300 to-indigo-500',
};

const scenario: Record<EngineeringDiscipline, string> = {
  architecture: 'BIM, şantiye, sunum',
  chemical: 'Proses, rafineri, güvenlik',
  civil: 'Altyapı, saha, rapor',
  electrical: 'Şebeke, güç, test',
  electronics: 'Devre, gömülü, ölçüm',
  hse: 'Risk, denetim, uygunluk',
  industrial: 'Üretim, kalite, verim',
  mechanical: 'Bakım, tasarım, HVAC',
  mechatronics: 'Robotik, kontrol, otomasyon',
  software: 'Kod, sistem, toplantı',
};

const backgroundIcons = [DraftingCompass, FlaskConical, HardHat, Zap, CircuitBoard, ShieldCheck, Factory, Wrench];

export function DisciplineShowcase({ translate }: { translate: (key: string) => string }) {
  return (
    <div className="relative w-full max-w-6xl">
      <div className="pointer-events-none absolute -inset-10 overflow-hidden rounded-[3rem] opacity-80">
        {backgroundIcons.map((Icon, index) => (
          <motion.div
            key={index}
            className="absolute text-cyan-700/10 dark:text-cyan-100/10"
            style={{ left: `${8 + (index % 4) * 27}%`, top: `${6 + Math.floor(index / 4) * 54}%` }}
            animate={{ y: [0, -12, 0], rotate: [0, 4, 0] }}
            transition={{ duration: 5 + index, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Icon className="h-16 w-16" />
          </motion.div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {ENGINEERING_DISCIPLINES.map((id, index) => {
          const DisciplineIcon = getDisciplineIcon(id);
          const meta = DISCIPLINE_META[id];
          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 18, rotateX: -12 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ delay: index * 0.035, duration: 0.42 }}
              className="group relative"
            >
              <div className={`absolute -inset-0.5 rounded-[1.6rem] bg-gradient-to-br ${accent[id]} opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-45`} />
              <div className="relative min-h-[7.2rem] overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white/90 p-3.5 text-left shadow-sm backdrop-blur-2xl transition-all duration-300 group-hover:-translate-y-1 group-hover:border-cyan-300 group-hover:shadow-xl dark:border-white/12 dark:bg-white/[0.075]">
                <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${accent[id]} opacity-18 blur-2xl transition-opacity group-hover:opacity-35`} />
                <div className="relative flex h-full flex-col justify-between gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className={`grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br ${accent[id]} text-slate-950 shadow-lg`}>
                      <DisciplineIcon className="h-5 w-5" />
                    </div>
                    <Sparkles className="h-4 w-4 text-cyan-700/55 opacity-0 transition-opacity group-hover:opacity-100 dark:text-cyan-100/60" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black leading-tight text-slate-950 dark:text-white">{translate(meta.labelKey)}</h3>
                    <p className="mt-1 text-[11px] font-bold leading-4 text-slate-600 dark:text-slate-300">{scenario[id]}</p>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                      <div className={`h-full w-4/5 rounded-full bg-gradient-to-r ${accent[id]}`} />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default DisciplineShowcase;
