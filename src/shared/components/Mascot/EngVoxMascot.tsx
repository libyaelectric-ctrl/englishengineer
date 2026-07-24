import React, { useState, useEffect, useRef } from 'react';

export type MascotMood =
  | 'idle'
  | 'happy'
  | 'thinking'
  | 'speaking'
  | 'listening';

export interface EngVoxMascotProps {
  /** Size variant or custom pixel dimension */
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  /** Emotional state / behavior mode */
  mood?: MascotMood;
  /** Whether the mascot's eyes track mouse movement */
  enableMouseTracking?: boolean;
  /** Display a speech bubble with text above/beside mascot */
  showSpeechBubble?: boolean;
  /** Custom speech bubble text */
  speechText?: string;
  /** Click handler */
  onClick?: () => void;
  /** Additional CSS class names */
  className?: string;
  /** Floating idle animation toggle */
  animated?: boolean;
}

const getMascotDimension = (size: EngVoxMascotProps['size'] = 'md'): number => {
  if (typeof size === 'number') return size;
  switch (size) {
    case 'sm':
      return 120;
    case 'md':
      return 220;
    case 'lg':
      return 320;
    case 'xl':
      return 420;
    default:
      return 220;
  }
};

const MascotEqualizer: React.FC<{ waveStep: number }> = ({ waveStep }) => {
  const bars = [
    { x: 4, h: 12 + Math.sin(waveStep * 0.2) * 8 },
    { x: 12, h: 22 + Math.cos(waveStep * 0.25) * 12 },
    { x: 20, h: 16 + Math.sin(waveStep * 0.3) * 10 },
    { x: 28, h: 26 + Math.cos(waveStep * 0.18) * 10 },
    { x: 36, h: 14 + Math.sin(waveStep * 0.35) * 8 },
    { x: 44, h: 20 + Math.cos(waveStep * 0.22) * 10 },
  ];

  return (
    <g id="equalizer" transform="translate(12, 22)">
      {bars.map((bar, idx) => (
        <rect
          key={idx}
          x={bar.x}
          y={30 - bar.h / 2}
          width="4"
          height={Math.max(4, bar.h)}
          rx="2"
          fill="#10B981"
          filter="url(#greenGlow)"
        />
      ))}
    </g>
  );
};

const MascotEyes: React.FC<{
  eyeOffset: { x: number; y: number };
  isBlinking: boolean;
  mood: MascotMood;
}> = ({ eyeOffset, isBlinking, mood }) => {
  return (
    <g
      id="eyesGroup"
      transform={`translate(${eyeOffset.x}, ${eyeOffset.y})`}
      style={{ transition: 'transform 0.1s ease-out' }}
    >
      {isBlinking ? (
        <g
          stroke="#10B981"
          strokeWidth="6"
          strokeLinecap="round"
          filter="url(#greenGlow)"
        >
          <line x1="200" y1="130" x2="230" y2="130" />
          <line x1="270" y1="130" x2="300" y2="130" />
        </g>
      ) : mood === 'happy' ? (
        <g
          fill="none"
          stroke="#10B981"
          strokeWidth="7"
          strokeLinecap="round"
          filter="url(#greenGlow)"
        >
          <path d="M200 135 Q215 115 230 135" />
          <path d="M270 135 Q285 115 300 135" />
        </g>
      ) : (
        <>
          <g>
            <circle
              cx="215"
              cy="130"
              r="18"
              fill="url(#eyeGlow)"
              filter="url(#greenGlow)"
            />
            <circle cx="210" cy="124" r="5" fill="#FFFFFF" />
            <circle cx="221" cy="134" r="2" fill="#FFFFFF" opacity="0.8" />
          </g>
          <g>
            <circle
              cx="285"
              cy="130"
              r="18"
              fill="url(#eyeGlow)"
              filter="url(#greenGlow)"
            />
            <circle cx="280" cy="124" r="5" fill="#FFFFFF" />
            <circle cx="291" cy="134" r="2" fill="#FFFFFF" opacity="0.8" />
          </g>
        </>
      )}
    </g>
  );
};

const MascotMouth: React.FC<{ mood: MascotMood }> = ({ mood }) => {
  if (mood === 'speaking') {
    return <ellipse cx="250" cy="190" rx="10" ry="6" fill="#18181B" />;
  }
  if (mood === 'happy') {
    return (
      <path
        d="M238 186 Q250 196 262 186"
        fill="none"
        stroke="#18181B"
        strokeWidth="4"
        strokeLinecap="round"
      />
    );
  }
  return (
    <path
      d="M240 188 Q250 194 260 188"
      fill="none"
      stroke="#18181B"
      strokeWidth="3.5"
      strokeLinecap="round"
    />
  );
};

export const EngVoxMascot: React.FC<EngVoxMascotProps> = ({
  size = 'md',
  mood = 'idle',
  enableMouseTracking = true,
  showSpeechBubble = false,
  speechText = 'Hi! Ready to master engineering English?',
  onClick,
  className = '',
  animated = true,
}) => {
  const containerRef = useRef<HTMLButtonElement>(null);
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [waveStep, setWaveStep] = useState(0);

  const dimension = getMascotDimension(size);

  useEffect(() => {
    if (!enableMouseTracking) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const mascotCenterX = rect.left + rect.width / 2;
      const mascotCenterY = rect.top + rect.height * 0.3;

      const deltaX = e.clientX - mascotCenterX;
      const deltaY = e.clientY - mascotCenterY;
      const distance = Math.hypot(deltaX, deltaY);
      const factor = Math.min(distance / 400, 1);

      const angle = Math.atan2(deltaY, deltaX);
      const targetX = Math.cos(angle) * 7 * factor;
      const targetY = Math.sin(angle) * 7 * factor;

      setEyeOffset({ x: targetX, y: targetY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [enableMouseTracking]);

  useEffect(() => {
    const blinkInterval = setInterval(
      () => {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 180);
      },
      3800 + Math.random() * 2000
    );

    return () => clearInterval(blinkInterval);
  }, []);

  useEffect(() => {
    const animInterval = setInterval(() => {
      setWaveStep((prev) => (prev + 1) % 100);
    }, 120);
    return () => clearInterval(animInterval);
  }, []);

  const currentMood = isHovered && mood === 'idle' ? 'happy' : mood;

  return (
    <button
      type="button"
      ref={containerRef}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative inline-flex flex-col items-center justify-center select-none border-0 bg-transparent p-0 outline-none cursor-pointer transition-transform duration-300 ${className}`}
      style={{ width: dimension, height: dimension }}
      aria-label="EngVox Mascot Assistant"
    >
      {(showSpeechBubble || isHovered) && (
        <div className="absolute -top-14 z-20 animate-bounce duration-1000 bg-emerald-950/90 border border-emerald-500/40 text-emerald-100 px-3.5 py-1.5 rounded-2xl shadow-lg backdrop-blur-md text-xs font-medium whitespace-nowrap flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{speechText}</span>
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-emerald-950/90 border-r border-b border-emerald-500/40 rotate-45" />
        </div>
      )}

      <svg
        viewBox="0 0 500 520"
        className={`w-full h-full drop-shadow-2xl overflow-visible ${
          animated ? 'animate-[float_4s_ease-in-out_infinite]' : ''
        }`}
        style={{ transformOrigin: 'bottom center' }}
      >
        <defs>
          <radialGradient id="eyeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="60%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#059669" />
          </radialGradient>

          <linearGradient id="visorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#18181B" />
            <stop offset="100%" stopColor="#09090B" />
          </linearGradient>

          <linearGradient id="helmetGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="70%" stopColor="#F4F4F5" />
            <stop offset="100%" stopColor="#E4E4E7" />
          </linearGradient>

          <linearGradient id="torsoGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#27272A" />
            <stop offset="100%" stopColor="#18181B" />
          </linearGradient>

          <filter id="greenGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <radialGradient id="groundShadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(16, 185, 129, 0.25)" />
            <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
          </radialGradient>
        </defs>

        <ellipse
          cx="250"
          cy="495"
          rx="120"
          ry="16"
          fill="url(#groundShadow)"
          className="transition-all duration-300 opacity-80"
        />

        <g id="legs">
          <path
            d="M190 360 L180 440 L160 460 M180 440 L210 440"
            stroke="#18181B"
            strokeWidth="22"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M190 360 L180 440"
            stroke="#E4E4E7"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M145 460 C145 445 175 440 205 445 L205 470 C175 475 145 475 145 460 Z"
            fill="#F4F4F5"
            stroke="#18181B"
            strokeWidth="5"
          />
          <circle
            cx="180"
            cy="415"
            r="10"
            fill="#10B981"
            filter="url(#greenGlow)"
          />

          <path
            d="M310 360 L320 440 L340 460 M320 440 L290 440"
            stroke="#18181B"
            strokeWidth="22"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M310 360 L320 440"
            stroke="#E4E4E7"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M295 445 C325 440 355 445 355 460 C355 475 325 475 295 470 L295 445 Z"
            fill="#F4F4F5"
            stroke="#18181B"
            strokeWidth="5"
          />
          <circle
            cx="320"
            cy="415"
            r="10"
            fill="#10B981"
            filter="url(#greenGlow)"
          />
        </g>

        <g id="body">
          <rect
            x="230"
            y="215"
            width="40"
            height="25"
            rx="8"
            fill="#18181B"
            stroke="#000"
            strokeWidth="4"
          />
          <line
            x1="230"
            y1="227"
            x2="270"
            y2="227"
            stroke="#10B981"
            strokeWidth="3"
          />

          <path
            d="M170 235 C170 225 330 225 330 235 L345 330 C345 365 310 380 250 380 C190 380 155 365 155 330 Z"
            fill="url(#torsoGrad)"
            stroke="#18181B"
            strokeWidth="7"
          />

          <path
            d="M190 320 C190 300 310 300 310 320 L300 360 C280 372 220 372 200 360 Z"
            fill="#F4F4F5"
            stroke="#18181B"
            strokeWidth="4"
          />

          <path
            d="M175 238 C230 248 270 248 325 238"
            stroke="#10B981"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            filter="url(#greenGlow)"
          />

          <g id="chestLogo" transform="translate(195, 255)">
            <path
              d="M12 5 L22 25 L32 5 M32 5 L42 25"
              stroke="#FFFFFF"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <path
              d="M42 5 L28 32"
              stroke="#10B981"
              strokeWidth="5"
              strokeLinecap="round"
              filter="url(#greenGlow)"
            />
            <text
              x="55"
              y="24"
              fill="#FFFFFF"
              fontSize="22"
              fontWeight="900"
              fontFamily="sans-serif"
              letterSpacing="0.5"
            >
              Eng<tspan fill="#10B981">Vōx</tspan>
            </text>
          </g>
        </g>

        <g id="leftArmGroup" className="transition-transform duration-300">
          <circle
            cx="150"
            cy="245"
            r="16"
            fill="#18181B"
            stroke="#10B981"
            strokeWidth="4"
          />
          <path
            d="M150 245 L105 285"
            stroke="#18181B"
            strokeWidth="20"
            strokeLinecap="round"
          />
          <path
            d="M150 245 L105 285"
            stroke="#F4F4F5"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <path
            d="M105 285 L85 340"
            stroke="#18181B"
            strokeWidth="18"
            strokeLinecap="round"
          />
          <circle cx="85" cy="340" r="12" fill="#18181B" />

          <g id="blueprint" transform="translate(20, 240) rotate(-12)">
            <ellipse
              cx="25"
              cy="80"
              rx="14"
              ry="24"
              fill="#E4E4E7"
              stroke="#18181B"
              strokeWidth="4"
            />
            <ellipse cx="25" cy="80" rx="8" ry="16" fill="#18181B" />
            <rect
              x="25"
              y="56"
              width="130"
              height="150"
              rx="6"
              fill="#F8FAFC"
              stroke="#18181B"
              strokeWidth="5"
            />
            <ellipse
              cx="155"
              cy="80"
              rx="14"
              ry="24"
              fill="#E4E4E7"
              stroke="#18181B"
              strokeWidth="4"
            />

            <rect
              x="38"
              y="70"
              width="104"
              height="120"
              fill="none"
              stroke="#0284C7"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
            <text
              x="42"
              y="85"
              fill="#0369A1"
              fontSize="9"
              fontWeight="bold"
              fontFamily="monospace"
            >
              ENGVOX PLAN
            </text>

            <circle
              cx="65"
              cy="115"
              r="12"
              fill="none"
              stroke="#0284C7"
              strokeWidth="2"
            />
            <circle
              cx="65"
              cy="115"
              r="5"
              fill="none"
              stroke="#0284C7"
              strokeWidth="1.5"
            />
            <path
              d="M77 115 L115 115 M95 115 L95 140 M95 140 L125 140"
              stroke="#0284C7"
              strokeWidth="2"
              fill="none"
            />
            <rect
              x="115"
              y="108"
              width="16"
              height="14"
              fill="none"
              stroke="#0284C7"
              strokeWidth="2"
            />
            <path
              d="M45 160 L130 160 M45 170 L110 170"
              stroke="#94A3B8"
              strokeWidth="2"
            />
          </g>
        </g>

        <g
          id="rightArmGroup"
          className={`transition-transform duration-300 ${
            currentMood === 'speaking' || isHovered
              ? 'animate-[bounce_2s_infinite]'
              : ''
          }`}
        >
          <circle
            cx="350"
            cy="245"
            r="16"
            fill="#18181B"
            stroke="#10B981"
            strokeWidth="4"
          />
          <path
            d="M350 245 L395 280"
            stroke="#18181B"
            strokeWidth="20"
            strokeLinecap="round"
          />
          <path
            d="M350 245 L395 280"
            stroke="#F4F4F5"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <path
            d="M395 280 L405 240"
            stroke="#18181B"
            strokeWidth="18"
            strokeLinecap="round"
          />
          <circle cx="405" cy="235" r="13" fill="#18181B" />

          <g id="audioDevice" transform="translate(370, 150)">
            <rect
              x="0"
              y="0"
              width="70"
              height="110"
              rx="14"
              fill="#18181B"
              stroke="#10B981"
              strokeWidth="3"
            />
            <rect
              x="7"
              y="12"
              width="56"
              height="50"
              rx="6"
              fill="#09090B"
              stroke="#27272A"
              strokeWidth="2"
            />

            <MascotEqualizer waveStep={waveStep} />

            <text
              x="35"
              y="56"
              fill="#A1A1AA"
              fontSize="7"
              fontWeight="bold"
              textAnchor="middle"
              fontFamily="sans-serif"
            >
              EngVōx
            </text>

            <circle
              cx="20"
              cy="74"
              r="6"
              fill="#EF4444"
              className="animate-pulse"
            />
            <circle cx="35" cy="74" r="5" fill="#3B82F6" />
            <circle cx="50" cy="74" r="5" fill="#10B981" />

            <rect x="15" y="88" width="40" height="10" rx="3" fill="#27272A" />
            <line
              x1="20"
              y1="93"
              x2="50"
              y2="93"
              stroke="#A1A1AA"
              strokeWidth="2"
              strokeDasharray="3 2"
            />
          </g>
        </g>

        <g
          id="headGroup"
          style={{
            transform:
              currentMood === 'thinking'
                ? 'rotate(-6deg) translateY(-4px)'
                : 'rotate(0deg)',
            transformOrigin: '250px 180px',
            transition: 'transform 0.4s ease-out',
          }}
        >
          <path
            d="M165 95 L140 45"
            stroke="#18181B"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M165 95 L140 45"
            stroke="#10B981"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle
            cx="138"
            cy="43"
            r="11"
            fill="#10B981"
            filter="url(#greenGlow)"
            className="animate-pulse"
          />
          <circle cx="138" cy="43" r="4" fill="#FFFFFF" />

          <path
            d="M140 130 C140 45 360 45 360 130 C360 200 330 215 250 215 C170 215 140 200 140 130 Z"
            fill="url(#helmetGrad)"
            stroke="#18181B"
            strokeWidth="8"
          />

          <rect
            x="125"
            y="105"
            width="22"
            height="45"
            rx="10"
            fill="#18181B"
            stroke="#10B981"
            strokeWidth="4"
          />
          <circle cx="136" cy="127" r="6" fill="#10B981" />
          <rect
            x="353"
            y="105"
            width="22"
            height="45"
            rx="10"
            fill="#18181B"
            stroke="#10B981"
            strokeWidth="4"
          />
          <circle cx="364" cy="127" r="6" fill="#10B981" />

          <path
            d="M170 125 C170 85 330 85 330 125 C330 170 300 180 250 180 C200 180 170 170 170 125 Z"
            fill="url(#visorGrad)"
            stroke="#18181B"
            strokeWidth="5"
          />

          <path
            d="M185 98 C220 90 280 90 315 98 C290 102 210 102 185 98 Z"
            fill="#FFFFFF"
            opacity="0.25"
          />

          <MascotEyes
            eyeOffset={eyeOffset}
            isBlinking={isBlinking}
            mood={currentMood}
          />

          <path
            d="M200 178 C200 178 250 172 300 178 C290 206 210 206 200 178 Z"
            fill="#FFFFFF"
            stroke="#18181B"
            strokeWidth="4"
          />

          <MascotMouth mood={currentMood} />
        </g>
      </svg>
    </button>
  );
};

export default EngVoxMascot;
