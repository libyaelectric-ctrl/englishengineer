import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Volume2,
  Bot,
  X,
  Zap,
} from 'lucide-react';
import { useWorkToolsStore } from '@/features/work-tools';
import { playNaturalTTS } from '@/shared/utils/sound';

interface EngineeringTermSpec {
  id: string;
  term: string;
  code: string;
  turkishMeaning: string;
  definition: string;
  sampleSentence: string;
  domain: string;
}

const RICH_ENGINEERING_TERMS: EngineeringTermSpec[] = [
  {
    id: 'grounding-grid',
    term: 'GROUNDING GRID',
    code: 'DRG-EE-042',
    turkishMeaning: 'Topraklama Ağı / Izgarası',
    definition: 'A network of interconnected bare conductors buried in earth to provide safe dissipation of fault currents.',
    sampleSentence: 'The substation grounding grid resistance measured below 0.5 ohms during testing.',
    domain: 'Electrical Power',
  },
  {
    id: 'single-line-diagram',
    term: 'SINGLE LINE DIAGRAM',
    code: 'SLD-PWR-101',
    turkishMeaning: 'Tek Hat Şeması',
    definition: 'A simplified notation for representing a three-phase power system using single line symbols.',
    sampleSentence: 'Verify the transformer protection relays against the updated Single Line Diagram.',
    domain: 'Electrical',
  },
  {
    id: 'plc-ladder-logic',
    term: 'PLC LADDER LOGIC',
    code: 'CTRL-PLC-88',
    turkishMeaning: 'PLC Merdiven Mantığı Programı',
    definition: 'A graphical programming language used to develop software for programmable logic controllers.',
    sampleSentence: 'The automation engineer refactored the ladder logic to reduce cycle time.',
    domain: 'Automation',
  },
  {
    id: 'finite-element-analysis',
    term: 'FINITE ELEMENT ANALYSIS',
    code: 'FEA-STR-309',
    turkishMeaning: 'Sonlu Elemanlar Analizi (FEA)',
    definition: 'A computerized method for predicting how a product reacts to real-world forces and heat.',
    sampleSentence: 'FEA stress simulation confirmed structural safety under maximum wind loading.',
    domain: 'Structural',
  },
  {
    id: 'turbine-pitch-control',
    term: 'TURBINE PITCH CONTROL',
    code: 'MEC-WIND-07',
    turkishMeaning: 'Rüzgar Türbini Kanat Açı Kontrolü',
    definition: 'Mechanism to rotate wind turbine blades to optimize power generation and limit excessive aerodynamic forces.',
    sampleSentence: 'The pitch control system feathered the blades during high gale warnings.',
    domain: 'Mechanical',
  },
  {
    id: 'substation-busbar',
    term: 'SUBSTATION BUSBAR',
    code: 'HV-SUB-500',
    turkishMeaning: 'Trafo Merkezi Bara Sistemi',
    definition: 'A thick strip of copper or aluminum that conducts electricity within a switchboard or substation.',
    sampleSentence: 'Infrared thermography revealed hot spots along the main 138kV busbar connections.',
    domain: 'High Voltage',
  },
  {
    id: 'bms-hvac-controller',
    term: 'BMS HVAC CONTROLLER',
    code: 'MEP-HVAC-12',
    turkishMeaning: 'Bina Yönetim Sistemli İklimlendirme Kontrolörü',
    definition: 'Centralized control system for heating, ventilation, and air-conditioning units across facilities.',
    sampleSentence: 'The BMS controller automatically modulated damper actuators to meet airflow setpoints.',
    domain: 'MEP',
  },
];

export const SidebarMascotBar: React.FC = () => {
  const navigate = useNavigate();
  const { sendToQuickAI } = useWorkToolsStore();

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [termIdx, setTermIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>('');
  const [speechRate, setSpeechRate] = useState<number>(0.92);

  const containerRef = useRef<HTMLDivElement>(null);
  const currentTerm = RICH_ENGINEERING_TERMS[termIdx];

  // Load available natural voices
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    const updateVoices = () => {
      const voices = window.speechSynthesis.getVoices().filter((v) => v.lang.startsWith('en'));
      setAvailableVoices(voices);
      if (voices.length > 0 && !selectedVoiceName) {
        // Pick best natural voice by default
        const best = voices.find((v) => v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Online')) || voices[0];
        if (best) setSelectedVoiceName(best.name);
      }
    };
    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
  }, [selectedVoiceName]);

  // 3D Cursor tilt sensitivity
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const relX = (e.clientX - centerX) / (window.innerWidth / 2);
      const relY = (e.clientY - centerY) / (window.innerHeight / 2);

      const tiltX = Math.max(-12, Math.min(12, relX * 14));
      const tiltY = Math.max(-8, Math.min(8, relY * -10));

      setMousePos({ x: tiltX, y: tiltY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Cycle blueprint terms
  useEffect(() => {
    const timer = setInterval(() => {
      if (!showModal) {
        setTermIdx((prev) => (prev + 1) % RICH_ENGINEERING_TERMS.length);
      }
    }, 6000);
    return () => clearInterval(timer);
  }, [showModal]);

  const handleSpeak = (text: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsPlayingAudio(true);
    playNaturalTTS(text, {
      voiceName: selectedVoiceName,
      rate: speechRate,
      onStart: () => setIsPlayingAudio(true),
      onEnd: () => setIsPlayingAudio(false),
      onError: () => setIsPlayingAudio(false),
    });
  };

  const handleSendToAI = (e: React.MouseEvent) => {
    e.stopPropagation();
    sendToQuickAI({
      sourceId: currentTerm.id,
      sourceKind: 'engineering-template',
      title: currentTerm.term,
      text: `${currentTerm.term} (${currentTerm.turkishMeaning}): ${currentTerm.definition}\nExample: ${currentTerm.sampleSentence}`,
    });
    setShowModal(false);
    navigate('/tools/quick');
  };

  const handleNextTerm = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTermIdx((prev) => (prev + 1) % RICH_ENGINEERING_TERMS.length);
  };

  return (
    <div className="relative font-sans select-none">
      {/* Main Left Sidebar Mascot Bar */}
      <div
        ref={containerRef}
        onClick={() => setShowModal(true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="mx-3 my-2.5 rounded-xl border border-[#0047bb]/25 bg-surface/80 p-3 shadow-sm hover:border-[#0047bb]/50 hover:shadow-md transition-all cursor-pointer"
      >
        <div className="flex items-center gap-3">
          {/* Authentic 3D Mascot Image with 3D Mouse Tilt */}
          <div
            className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-[#0047bb]/30 bg-[#0047bb]/5 shadow-inner transition-transform duration-150 ease-out"
            style={{
              transform: `perspective(500px) rotateX(${mousePos.y}deg) rotateY(${mousePos.x}deg) scale(${
                isHovered ? 1.06 : 1
              })`,
            }}
          >
            <img
              src="/brand/mascot-hq.webp"
              alt="EngVox Mascot"
              className="h-full w-full object-cover scale-110 -translate-y-0.5"
            />
            <div className="absolute top-1 left-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400 opacity-80 blur-[1px] animate-pulse" />
            <div className="absolute top-3 left-3 h-1.5 w-1.5 rounded-full bg-emerald-400 opacity-90 blur-[2px]" />
          </div>

          {/* Mascot Info & Dynamic Term */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[9px] font-extrabold uppercase tracking-wider text-[#0047bb] bg-[#0047bb]/10 px-1.5 py-0.5 rounded flex items-center gap-1">
                <Sparkles className="h-2.5 w-2.5 text-[#0047bb]" /> {currentTerm.code}
              </span>
              <span className="text-[9px] font-bold text-muted-copy">
                {currentTerm.domain}
              </span>
            </div>

            <h4 className="mt-1 font-mono text-xs font-black text-foreground truncate tracking-tight">
              {currentTerm.term}
            </h4>

            <p className="text-[10px] font-bold text-muted-copy truncate">
              {currentTerm.turkishMeaning}
            </p>
          </div>
        </div>

        {/* High-Utility Direct Action Footer */}
        <div className="mt-2.5 pt-2 border-t border-border-soft/60 flex items-center justify-between text-[10px] font-bold">
          <button
            type="button"
            onClick={(e) => handleSpeak(currentTerm.term, e)}
            className={`inline-flex items-center gap-1 text-muted-copy hover:text-[#0047bb] transition-colors ${
              isPlayingAudio ? 'text-[#0047bb] font-black animate-pulse' : ''
            }`}
          >
            <Volume2 className="h-3 w-3" /> Listen
          </button>

          <button
            type="button"
            onClick={handleSendToAI}
            className="inline-flex items-center gap-1 text-[#0047bb] hover:text-[#003896] transition-colors"
          >
            <Bot className="h-3 w-3" /> Quick AI
          </button>

          <button
            type="button"
            onClick={handleNextTerm}
            className="text-muted-copy hover:text-foreground transition-colors"
          >
            Next ↻
          </button>
        </div>
      </div>

      {/* Interactive Micro CAD Blueprint Inspector Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/20 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-[#0047bb]/30 bg-surface/95 p-6 shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-200 font-sans"
          >
            <div className="flex items-start justify-between border-b border-border-soft pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0047bb]/10 text-[#0047bb]">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#0047bb]">
                    [{currentTerm.code}] // {currentTerm.domain}
                  </span>
                  <h3 className="text-base font-black text-foreground">
                    {currentTerm.term}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1 text-muted-copy hover:bg-surface-hover hover:text-foreground cursor-pointer transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="my-4 space-y-3">
              <div className="rounded-lg border border-[#0047bb]/25 bg-[#0047bb]/5 p-3">
                <p className="text-[10px] font-bold text-[#0047bb] uppercase tracking-wider">
                  Türkçe Anlamı
                </p>
                <p className="mt-0.5 text-sm font-bold text-foreground">
                  {currentTerm.turkishMeaning}
                </p>
              </div>

              <div className="rounded-lg border border border-[#0047bb]/20 bg-surface p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold text-[#0047bb] uppercase tracking-wider">
                    Audio Engine & Voice Options
                  </p>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-muted-copy">
                    Speed:
                    {[0.8, 0.95, 1.1].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setSpeechRate(r)}
                        className={`px-1.5 py-0.5 rounded text-[9px] cursor-pointer transition-colors ${
                          speechRate === r
                            ? 'bg-[#0047bb] text-white font-black'
                            : 'bg-surface-hover hover:bg-border-soft text-foreground'
                        }`}
                      >
                        {r}x
                      </button>
                    ))}
                  </div>
                </div>

                {availableVoices.length > 0 ? (
                  <select
                    value={selectedVoiceName}
                    onChange={(e) => setSelectedVoiceName(e.target.value)}
                    className="w-full rounded-md border border-border-soft bg-surface px-2.5 py-1.5 text-xs text-foreground font-medium focus:border-[#0047bb] focus:outline-none"
                  >
                    {availableVoices.map((v) => (
                      <option key={v.name} value={v.name}>
                        {v.name} ({v.lang})
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-[10px] text-muted-copy italic">
                    Using system English Speech Engine
                  </p>
                )}
              </div>

              <div className="rounded-lg border border-border-soft bg-surface-hover p-3 space-y-1">
                <p className="text-[10px] font-bold text-muted-copy uppercase tracking-wider">
                  Site Report Sample Usage
                </p>
                <p className="text-xs text-foreground font-medium italic leading-relaxed">
                  "{currentTerm.sampleSentence}"
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border-soft pt-4">
              <button
                type="button"
                onClick={() => handleSpeak(currentTerm.sampleSentence)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border-soft bg-surface px-3 py-2 text-xs font-bold text-foreground hover:bg-surface-hover cursor-pointer shadow-sm"
              >
                <Volume2 className="h-4 w-4 text-[#0047bb]" /> Listen Audio
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSendToAI}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#0047bb] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#003896] cursor-pointer shadow-sm transition-all"
                >
                  <Bot className="h-4 w-4" /> Send to Quick AI
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SidebarMascotBar;
