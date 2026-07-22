import React, { useState, useEffect } from 'react';
import './mascot.css';

export type MascotMode = 'idle' | 'thinking' | 'success' | 'hint';
export type PageContext =
  | 'vocabulary'
  | 'ai'
  | 'progress'
  | 'tools'
  | 'grammar'
  | 'dashboard'
  | 'general';

export interface EngVoxMascotProps {
  mode?: MascotMode;
  pageContext?: PageContext;
  customTerm?: string;
  speechBubbleText?: string;
  showSpeechBubble?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  customWidth?: number;
  customHeight?: number;
  className?: string;
  onBlueprintClick?: (term: string) => void;
  onDeviceClick?: () => void;
  onMascotClick?: () => void;
}

const DEFAULT_ENGINEERING_TERMS = [
  { term: 'GROUNDING GRID', code: 'DRG-EE-042', icon: '⚡' },
  { term: 'SINGLE LINE DIAGRAM', code: 'SLD-PWR-101', icon: '📐' },
  { term: 'PLC LADDER LOGIC', code: 'CTRL-PLC-88', icon: '💻' },
  { term: 'FINITE ELEMENT ANALYSIS', code: 'FEA-STR-309', icon: '🏗️' },
  { term: 'TURBINE PITCH CONTROL', code: 'MEC-WIND-07', icon: '🌪️' },
  { term: 'SCAFFOLDING LOAD CAP', code: 'CIV-SAF-204', icon: '🦺' },
  { term: 'SUBSTATION BUSBAR', code: 'HV-SUB-500', icon: '🔌' },
  { term: 'BMS HVAC CONTROLLER', code: 'MEP-HVAC-12', icon: '❄️' },
];

export const EngVoxMascot: React.FC<EngVoxMascotProps> = ({
  mode = 'idle',
  pageContext = 'general',
  customTerm,
  speechBubbleText,
  showSpeechBubble = false,
  size = 'md',
  customWidth,
  customHeight,
  className = '',
  onBlueprintClick,
  onDeviceClick,
  onMascotClick,
}) => {
  const [termIndex, setTermIndex] = useState(0);
  const [internalMode, setInternalMode] = useState<MascotMode>(mode);

  useEffect(() => {
    setInternalMode(mode);
  }, [mode]);

  // Auto rotate engineering blueprint term every 7s if not custom
  useEffect(() => {
    if (customTerm) return;
    const timer = setInterval(() => {
      setTermIndex((prev) => (prev + 1) % DEFAULT_ENGINEERING_TERMS.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [customTerm]);

  const activeTermObj = customTerm
    ? { term: customTerm.toUpperCase(), code: 'SPEC-LIVE', icon: '📘' }
    : DEFAULT_ENGINEERING_TERMS[termIndex];

  const handleNextBlueprint = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextIdx = (termIndex + 1) % DEFAULT_ENGINEERING_TERMS.length;
    setTermIndex(nextIdx);
    if (onBlueprintClick) {
      onBlueprintClick(DEFAULT_ENGINEERING_TERMS[nextIdx].term);
    }
  };

  const handleDeviceTap = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInternalMode('success');
    setTimeout(() => setInternalMode(mode), 2500);
    if (onDeviceClick) onDeviceClick();
  };

  // Dimensions based on size preset
  const dimensions = {
    sm: { width: 140, height: 140 },
    md: { width: 240, height: 240 },
    lg: { width: 340, height: 340 },
    xl: { width: 440, height: 440 },
    custom: { width: customWidth || 280, height: customHeight || 280 },
  }[size];

  // Mode animation class
  const modeClass =
    internalMode === 'thinking'
      ? 'mascot-thinking'
      : internalMode === 'success'
        ? 'mascot-success'
        : 'mascot-idle';

  return (
    <div
      className={`relative inline-flex flex-col items-center select-none ${className}`}
      onClick={onMascotClick}
    >
      {/* Speech Bubble / Hint Mode Bubble */}
      {(showSpeechBubble || speechBubbleText || internalMode === 'hint') && (
        <div className="absolute -top-14 left-1/2 -translate-x-1/2 z-20 max-w-xs rounded-2xl border border-[#0047bb]/30 bg-surface/95 px-4 py-2.5 shadow-lg backdrop-blur-md animate-in fade-in zoom-in duration-200">
          <div className="flex items-start gap-2 text-xs font-semibold text-foreground">
            <span className="text-base leading-none">💡</span>
            <p className="leading-snug">
              {speechBubbleText ||
                (pageContext === 'vocabulary'
                  ? 'Blueprint loaded! Click the paper to switch engineering terms.'
                  : pageContext === 'ai'
                    ? 'AI Copilot ready. Ask me to refine your technical reports!'
                    : pageContext === 'progress'
                      ? 'Great consistency! Your technical ELO is rising fast.'
                      : 'Hello Engineer! Ready to master technical English?')}
            </p>
          </div>
          {/* Arrow */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-0 w-0 border-x-8 border-x-transparent border-t-8 border-t-[#0047bb]/30" />
        </div>
      )}

      <svg
        width={dimensions.width}
        height={dimensions.height}
        viewBox="0 0 500 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`mascot-container ${modeClass} cursor-pointer transition-transform duration-300`}
      >
        <defs>
          {/* Neon Glow Filters */}
          <filter id="glow-green" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Shading Gradients */}
          <linearGradient id="helmetGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#E2E4E7" />
          </linearGradient>

          <linearGradient id="visorGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>

          <linearGradient id="chestGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>

          <linearGradient id="blueprintGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#F1F5F9" />
          </linearGradient>
        </defs>

        {/* ==================== 1. LEGS & FEET ==================== */}
        <g id="mascot-legs">
          {/* Left Leg */}
          <path d="M195 350 L180 430 L225 440 L220 350 Z" fill="#1E293B" stroke="#0F172A" strokeWidth="4" />
          {/* Left Knee Joint Ring */}
          <circle cx="195" cy="385" r="14" fill="#22C55E" stroke="#15803D" strokeWidth="3" />
          <circle cx="195" cy="385" r="6" fill="#1E293B" />
          {/* Left Foot / Boot */}
          <path d="M165 435 C165 420, 230 420, 235 435 C238 448, 160 448, 165 435 Z" fill="url(#helmetGrad)" className="mascot-white-surface" stroke="#1E293B" strokeWidth="4" />
          <path d="M165 445 L235 445 L230 452 L168 452 Z" fill="#1E293B" />

          {/* Right Leg */}
          <path d="M305 350 L320 430 L275 440 L280 350 Z" fill="#1E293B" stroke="#0F172A" strokeWidth="4" />
          {/* Right Knee Joint Ring */}
          <circle cx="305" cy="385" r="14" fill="#22C55E" stroke="#15803D" strokeWidth="3" />
          <circle cx="305" cy="385" r="6" fill="#1E293B" />
          {/* Right Foot / Boot */}
          <path d="M335 435 C335 420, 270 420, 265 435 C262 448, 340 448, 335 435 Z" fill="url(#helmetGrad)" className="mascot-white-surface" stroke="#1E293B" strokeWidth="4" />
          <path d="M335 445 L265 445 L270 452 L332 452 Z" fill="#1E293B" />
        </g>

        {/* ==================== 2. TORSO / BODY ==================== */}
        <g id="mascot-torso">
          {/* Green Collar Ring */}
          <ellipse cx="250" cy="205" rx="55" ry="14" fill="#22C55E" stroke="#15803D" strokeWidth="3" />

          {/* Main Chest Armor Plate */}
          <path
            d="M185 210 C185 200, 315 200, 315 210 L325 330 C325 350, 175 350, 175 330 Z"
            fill="url(#chestGrad)"
            stroke="#1E293B"
            strokeWidth="5"
          />

          {/* White Shoulder Caps */}
          <path d="M165 215 C160 195, 190 195, 195 215 Z" fill="url(#helmetGrad)" className="mascot-white-surface" stroke="#1E293B" strokeWidth="3" />
          <path d="M335 215 C340 195, 310 195, 305 215 Z" fill="url(#helmetGrad)" className="mascot-white-surface" stroke="#1E293B" strokeWidth="3" />

          {/* Green Accent Side Rib Stripes */}
          <path d="M183 250 L186 310" stroke="#22C55E" strokeWidth="5" strokeLinecap="round" />
          <path d="M317 250 L314 310" stroke="#22C55E" strokeWidth="5" strokeLinecap="round" />

          {/* White Waist Hip Frame */}
          <path d="M190 330 C190 360, 310 360, 310 330 Z" fill="url(#helmetGrad)" className="mascot-white-surface" stroke="#1E293B" strokeWidth="4" />
          <circle cx="250" cy="345" r="10" fill="#22C55E" stroke="#15803D" strokeWidth="2" />

          {/* EV ENGVOX LOGO ON CHEST */}
          <g id="mascot-logo" className="mascot-glow">
            {/* EV Monogram */}
            <path
              d="M210 240 L226 240 M210 240 L210 270 M210 255 L224 255 M210 270 L226 270"
              stroke="#FFFFFF"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
            <path
              d="M233 240 L245 270 L257 240"
              stroke="#FFFFFF"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Green Pulse Dot on V */}
            <circle cx="257" cy="235" r="4.5" fill="#22C55E" filter="url(#glow-green)" />
            {/* EngVox Text */}
            <text
              x="250"
              y="298"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="20"
              fontWeight="900"
              fontFamily="system-ui, sans-serif"
              letterSpacing="1"
            >
              EngV<tspan fill="#22C55E">ö</tspan>x
            </text>
          </g>
        </g>

        {/* ==================== 3. HEAD & ANTENNA ==================== */}
        <g id="mascot-head-group">
          {/* Antenna Rod & Sphere */}
          <g id="mascot-antenna" className="mascot-antenna-sway">
            <path d="M175 110 L145 60" stroke="#1E293B" strokeWidth="7" strokeLinecap="round" />
            <circle cx="145" cy="60" r="14" fill="#22C55E" filter="url(#glow-green)" stroke="#15803D" strokeWidth="3" />
            {/* Antenna Inner Core */}
            <circle cx="142" cy="57" r="5" fill="#DCFCE7" />
          </g>

          {/* Main Helmet Shell */}
          <rect
            x="160"
            y="70"
            width="180"
            height="130"
            rx="65"
            fill="url(#helmetGrad)"
            className="mascot-white-surface"
            stroke="#1E293B"
            strokeWidth="6"
          />

          {/* Side Ear Pads */}
          <circle cx="160" cy="135" r="22" fill="#1E293B" stroke="#0F172A" strokeWidth="4" />
          <circle cx="160" cy="135" r="14" fill="#22C55E" stroke="#15803D" strokeWidth="2.5" />
          <circle cx="340" cy="135" r="22" fill="#1E293B" stroke="#0F172A" strokeWidth="4" />
          <circle cx="340" cy="135" r="14" fill="#22C55E" stroke="#15803D" strokeWidth="2.5" />

          {/* Visor Black Glass Faceplate */}
          <rect
            x="190"
            y="95"
            width="120"
            height="75"
            rx="32"
            fill="url(#visorGrad)"
            stroke="#0F172A"
            strokeWidth="3.5"
          />

          {/* ==================== EYES (INTERACTIVE & ANIMATED) ==================== */}
          <g id="mascot-eyes" className="mascot-eye-blink mascot-glow">
            {/* Left Eye */}
            <ellipse
              cx="225"
              cy="128"
              rx={internalMode === 'thinking' ? 12 : 14}
              ry={internalMode === 'thinking' ? 9 : 15}
              fill="#22C55E"
              filter="url(#glow-green)"
            />
            {/* Left Pupil Glare */}
            <circle cx="221" cy="122" r="5" fill="#FFFFFF" opacity="0.9" />
            <circle cx="227" cy="132" r="2" fill="#FFFFFF" opacity="0.7" />

            {/* Right Eye */}
            <ellipse
              cx="275"
              cy="128"
              rx={internalMode === 'thinking' ? 12 : 14}
              ry={internalMode === 'thinking' ? 9 : 15}
              fill="#22C55E"
              filter="url(#glow-green)"
            />
            {/* Right Pupil Glare */}
            <circle cx="271" cy="122" r="5" fill="#FFFFFF" opacity="0.9" />
            <circle cx="277" cy="132" r="2" fill="#FFFFFF" opacity="0.7" />

            {/* Success Star Sparkles */}
            {internalMode === 'success' && (
              <>
                <polygon points="225,115 227,121 233,123 227,125 225,131 223,125 217,123 223,121" fill="#DCFCE7" />
                <polygon points="275,115 277,121 283,123 277,125 275,131 273,125 267,123 273,121" fill="#DCFCE7" />
              </>
            )}
          </g>

          {/* Friendly Curved Mouth */}
          <path
            d={
              internalMode === 'success'
                ? 'M230 152 Q250 168 270 152 Z'
                : 'M234 153 Q250 162 266 153'
            }
            stroke="#FFFFFF"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill={internalMode === 'success' ? '#22C55E' : 'none'}
          />
        </g>

        {/* ==================== 4. LEFT ARM & INTERACTIVE BLUEPRINT ==================== */}
        <g id="mascot-left-arm-blueprint" onClick={handleNextBlueprint}>
          {/* Left Bicep / Arm */}
          <path d="M175 220 C140 230, 110 260, 95 300" stroke="#1E293B" strokeWidth="16" strokeLinecap="round" />
          <circle cx="130" cy="260" r="10" fill="#22C55E" stroke="#15803D" strokeWidth="2.5" />

          {/* Unrolled Blueprint Paper (Interactive) */}
          <g transform="translate(15, 170) rotate(-6)">
            {/* Paper Shadow & Main Sheet */}
            <rect x="0" y="0" width="180" height="230" rx="6" fill="#0047BB" opacity="0.1" transform="translate(4,4)" />
            <rect
              x="0"
              y="0"
              width="180"
              height="230"
              rx="6"
              fill="url(#blueprintGrad)"
              stroke="#0047BB"
              strokeWidth="4"
              className="cursor-pointer hover:stroke-[#003896] transition-colors"
            />

            {/* Blueprint Header */}
            <rect x="10" y="10" width="160" height="26" rx="4" fill="#0047BB" />
            <text x="90" y="27" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="800" fontFamily="monospace">
              ENGVOX BLUEPRINT
            </text>

            {/* CAD Technical Drawing Vectors */}
            <g stroke="#0047BB" strokeWidth="1.5" fill="none" opacity="0.85">
              {/* Gear / Circuit CAD Diagram */}
              <circle cx="50" cy="80" r="22" strokeDasharray="3 3" />
              <circle cx="50" cy="80" r="14" />
              <circle cx="50" cy="80" r="5" fill="#0047BB" />
              <path d="M50 54 L50 106 M24 80 L76 80" strokeDasharray="2 2" />

              {/* Substation / Structural Grid Diagram */}
              <rect x="95" y="60" width="70" height="40" rx="2" />
              <path d="M95 60 L165 100 M165 60 L95 100" />
              <path d="M130 60 L130 100 M95 80 L165 80" />

              {/* P&ID Flow Lines */}
              <path d="M20 125 L160 125 M50 125 L50 140 L120 140" strokeWidth="2" />
              <circle cx="50" cy="140" r="4" fill="#0047BB" />
              <circle cx="120" cy="140" r="4" fill="#0047BB" />
            </g>

            {/* Dynamic Engineering Term Box */}
            <rect x="10" y="152" width="160" height="65" rx="5" fill="#0047BB" opacity="0.08" stroke="#0047BB" strokeWidth="1.5" />
            <text x="90" y="167" textAnchor="middle" fill="#0047BB" fontSize="9" fontWeight="800" fontFamily="monospace">
              [{activeTermObj.code}]
            </text>
            <text x="90" y="185" textAnchor="middle" fill="#0F172A" fontSize="10" fontWeight="900" fontFamily="sans-serif">
              {activeTermObj.icon} {activeTermObj.term}
            </text>
            <text x="90" y="204" textAnchor="middle" fill="#64748B" fontSize="8" fontWeight="700" fontFamily="sans-serif">
              Tap to cycle terms ↻
            </text>

            {/* Rolled Paper Top & Bottom Edge Cylinders */}
            <ellipse cx="90" cy="0" rx="90" ry="8" fill="#E2E4E7" stroke="#0047BB" strokeWidth="3" />
            <ellipse cx="90" cy="230" rx="90" ry="8" fill="#E2E4E7" stroke="#0047BB" strokeWidth="3" />
          </g>

          {/* Left Glove Hand holding Blueprint */}
          <circle cx="150" cy="285" r="16" fill="#1E293B" stroke="#0F172A" strokeWidth="3" />
          <circle cx="150" cy="285" r="8" fill="#22C55E" />
        </g>

        {/* ==================== 5. RIGHT ARM & HANDHELD DEVICE ==================== */}
        <g
          id="mascot-right-arm-device"
          onClick={handleDeviceTap}
          className={internalMode === 'success' ? 'transition-transform duration-300' : ''}
          style={{
            transformOrigin: '325px 220px',
            transform: internalMode === 'success' ? 'rotate(-22deg) translateY(-15px)' : 'rotate(0deg)',
          }}
        >
          {/* Right Bicep / Forearm */}
          <path d="M325 220 C360 230, 390 260, 405 295" stroke="#1E293B" strokeWidth="16" strokeLinecap="round" />
          <circle cx="370" cy="255" r="10" fill="#22C55E" stroke="#15803D" strokeWidth="2.5" />

          {/* Right Glove Hand */}
          <circle cx="395" cy="290" r="16" fill="#1E293B" stroke="#0F172A" strokeWidth="3" />

          {/* Sleek Handheld Control Device */}
          <g transform="translate(370, 200) rotate(8)">
            {/* Device Body Outer Shell */}
            <rect x="0" y="0" width="75" height="120" rx="14" fill="#1E293B" stroke="#0F172A" strokeWidth="4" />

            {/* Green Side Grip Accents */}
            <rect x="-3" y="25" width="4" height="40" rx="2" fill="#22C55E" />
            <rect x="74" y="25" width="4" height="40" rx="2" fill="#22C55E" />

            {/* OLED Screen Frame */}
            <rect x="8" y="10" width="59" height="65" rx="8" fill="#0F172A" stroke="#334155" strokeWidth="2" />

            {/* Screen Header LED & Status Text */}
            <circle cx="16" cy="18" r="3" fill="#EF4444" />
            <circle cx="26" cy="18" r="3" fill="#22C55E" className="animate-ping" />
            <text x="60" y="20" textAnchor="end" fill="#22C55E" fontSize="7" fontWeight="800" fontFamily="monospace">
              REC ●
            </text>

            {/* Live Audio Equalizer Waveform Bars */}
            <g fill="#22C55E" className="mascot-glow">
              <rect x="14" y="42" width="4" height="12" rx="2" className="animate-pulse" />
              <rect x="22" y="32" width="4" height="22" rx="2" />
              <rect x="30" y="28" width="4" height="28" rx="2" className="animate-pulse" />
              <rect x="38" y="36" width="4" height="18" rx="2" />
              <rect x="46" y="40" width="4" height="14" rx="2" className="animate-pulse" />
              <rect x="54" y="46" width="4" height="8" rx="2" />
            </g>

            {/* Device Screen Brand Text */}
            <text x="37.5" y="66" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="900" fontFamily="sans-serif">
              {internalMode === 'success' ? 'SUCCESS! 🎉' : 'EngVox AI'}
            </text>

            {/* Control Pad Buttons */}
            <circle cx="22" cy="93" r="7" fill="#EF4444" stroke="#991B1B" strokeWidth="1.5" />
            <circle cx="53" cy="93" r="7" fill="#22C55E" stroke="#15803D" strokeWidth="1.5" />
            <rect x="33" y="104" width="9" height="5" rx="2.5" fill="#64748B" />
          </g>
        </g>
      </svg>
    </div>
  );
};

export default EngVoxMascot;
