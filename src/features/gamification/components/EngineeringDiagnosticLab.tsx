import React, { useState } from 'react';
import { CheckCircle2, ShieldAlert, ArrowRight } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';

export interface EmergencyScenario {
  id: string;
  title: string;
  discipline: string;
  incidentReport: string;
  questionPrompt: string;
  options: Array<{ text: string; isCorrect: boolean; explanation: string }>;
}

const EMERGENCY_SCENARIOS: EmergencyScenario[] = [
  {
    id: 'scen_1',
    title: '⚠️ Geoteknik Acil Durum: Derin Kazı Çatlağı',
    discipline: 'civil',
    incidentReport: 'Site Log: Heavy rainfall induced lateral soil movement near retaining wall grid #4. Crack width exceeds 12mm with ongoing displacement.',
    questionPrompt: 'Bu acil durumda uygulanması gereken öncelikli teknik mühendislik müdahalesi nedir?',
    options: [
      { text: 'Install tieback soil nails and initiate immediate dewatering pumps.', isCorrect: true, explanation: 'Doğru! Zemin çivisi (soil nails) ve su tahliyesi (dewatering) kaymayı anında durdurur.' },
      { text: 'Increase dead load on top of the embankment.', isCorrect: false, explanation: 'Yanlış! Üst yükü artırmak kaymayı hızlandırır ve göçmeye yol açar.' },
      { text: 'Apply decorative plaster over the 12mm crack.', isCorrect: false, explanation: 'Yanlış! Yapısal felakete davetiye çıkarır.' },
    ],
  },
  {
    id: 'scen_2',
    title: '🔥 Trafo Merkezi Aşırı Isınma Alarmı',
    discipline: 'electrical',
    incidentReport: 'Substation Alert: Step-down transformer coil temperature reached 98°C during peak load. Dielectric oil pressure is rising rapidly.',
    questionPrompt: 'Sistemi patlamadan korumak için hangi teknik prosedür izlenmelidir?',
    options: [
      { text: 'Activate forced oil air cooling (FOA) and shed non-critical grid loads.', isCorrect: true, explanation: 'Doğru! Zorlamalı soğutma (FOA) ve yük atma (load shedding) trafoyu korur.' },
      { text: 'Increase secondary busbar voltage output.', isCorrect: false, explanation: 'Yanlış! Akımı artırıp trafoyu yakar.' },
      { text: 'Bypass the primary circuit breaker entirely.', isCorrect: false, explanation: 'Yanlış! Yangın riskini tavan yaptırır.' },
    ],
  },
  {
    id: 'scen_3',
    title: '💻 Production Microservice Memory Leak',
    discipline: 'software',
    incidentReport: 'DevOps Incident: High latency detected in payment gateway service. Garbage collection pauses exceed 4.2 seconds under 15,000 req/sec.',
    questionPrompt: 'Hangi mimari aksiyon bellek sızıntısını ve çökmeyi engeller?',
    options: [
      { text: 'Profile heap dumps, fix unclosed database connection pools, and scale horizontally.', isCorrect: true, explanation: 'Doğru! Heap profilleme ve havuz kapama bellek sızıntısını kalıcı çözer.' },
      { text: 'Hardcode an infinite retry loop in frontend API calls.', isCorrect: false, explanation: 'Yanlış! Sunucuyu tamamen çökertir (Cascading failure).' },
      { text: 'Disable error logging in production environment.', isCorrect: false, explanation: 'Yanlış! Hataları gizlemek sorunu çözmez.' },
    ],
  },
];

export const EngineeringDiagnosticLab: React.FC = () => {
  const { addXp, addGems } = useGameStore();

  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const scenario = EMERGENCY_SCENARIOS[scenarioIndex % EMERGENCY_SCENARIOS.length];

  const handleSubmit = () => {
    if (selectedOption === null) return;
    setIsSubmitted(true);

    const option = scenario.options[selectedOption];
    if (option.isCorrect) {
      addXp(50);
      addGems(20);
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    setIsSubmitted(false);
    setScenarioIndex((prev) => prev + 1);
  };

  return (
    <div className="bg-[var(--surface)] border-2 border-rose-500/30 rounded-3xl p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--color-border-soft)] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500">
            <ShieldAlert className="h-7 w-7 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-black text-[var(--foreground)]">Mühendislik Teşhis & Simülasyon Laboratuvarı 🔬</h2>
            <p className="text-xs text-[var(--color-muted-copy)]">Gerçek şantiye ve sistem vaka krizlerini İngilizce teknik kararlarla çözün!</p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-500/10 text-rose-500 uppercase tracking-wider">
          ACİL VAKA V1
        </span>
      </div>

      {/* Incident Box */}
      <div className="p-5 rounded-2xl bg-slate-900 text-slate-100 border border-slate-700 space-y-3 font-mono text-xs shadow-inner">
        <div className="flex items-center justify-between text-rose-400 font-bold border-b border-slate-800 pb-2">
          <span>{scenario.title}</span>
          <span>DISCIPLINE: {scenario.discipline.toUpperCase()}</span>
        </div>
        <p className="text-slate-300 leading-relaxed font-sans text-sm">{scenario.incidentReport}</p>
      </div>

      {/* Prompt */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-base text-[var(--foreground)]">{scenario.questionPrompt}</h3>

        <div className="space-y-2.5">
          {scenario.options.map((opt, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrect = isSubmitted && opt.isCorrect;
            const isWrong = isSubmitted && isSelected && !opt.isCorrect;

            let styles = 'bg-[var(--background)] border-[var(--color-border-soft)] text-[var(--foreground)] hover:border-rose-500/40';

            if (isSelected && !isSubmitted) {
              styles = 'bg-rose-500/10 border-rose-500 text-rose-600 dark:text-rose-300 font-bold shadow-md';
            }
            if (isCorrect) {
              styles = 'bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-300 font-bold shadow-md';
            }
            if (isWrong) {
              styles = 'bg-rose-500/20 border-rose-500 text-rose-600 dark:text-rose-300 font-bold shadow-md';
            }

            return (
              <button
                key={idx}
                disabled={isSubmitted}
                onClick={() => setSelectedOption(idx)}
                className={`w-full p-4 rounded-2xl border-2 text-left text-sm transition-all flex items-center justify-between gap-3 ${styles}`}
              >
                <span>{opt.text}</span>
                {isCorrect && <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between border-t border-[var(--color-border-soft)] pt-4">
        {isSubmitted && selectedOption !== null && (
          <p className={`text-xs font-bold ${scenario.options[selectedOption].isCorrect ? 'text-emerald-500' : 'text-rose-500'}`}>
            {scenario.options[selectedOption].explanation}
          </p>
        )}

        {!isSubmitted ? (
          <button
            onClick={handleSubmit}
            disabled={selectedOption === null}
            className="ml-auto px-6 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black text-sm shadow-md disabled:opacity-40 transition-transform active:scale-95"
          >
            MÜDAHALEYİ ONAYLA
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="ml-auto px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm shadow-md flex items-center gap-1.5 transition-transform active:scale-95"
          >
            <span>SONRAKİ VAKA</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};
