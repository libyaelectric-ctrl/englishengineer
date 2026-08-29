import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useTheme } from '@/features/theme/ThemeProvider';

interface HeroSceneProps {
  className?: string;
}

/* ── deterministic PRNG (same as original) ── */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ── colour tokens per theme ── */
const DAY = {
  sky: '#d4ddf0',
  ground: '#c8d4e8',
  gridStroke: '#a3b5e6',
  buildingBody: '#8a95af',
  buildingEdge: '#6a7a9a',
  windowLit: ['#3d6ecf', '#6a5fce', '#c98d45', '#5b6478'],
  windowDark: '#b3c0d6',
  crane: '#8a95af',
  craneHighlight: '#99a8c4',
  holo1: '#3fd4ff',
  holo2: '#9b7bff',
  holo3: '#59ffc8',
  pillar: '#59d6ff',
  pillarBlob: '#cdf0ff',
  spark: '#3d6ecf',
  ring1: '#3fd4ff',
  ring2: '#8d7bff',
  beacon: '#ff3b3b',
  hook: '#ffb45e',
  smoke: 'rgba(160,175,210,0.5)',
} as const;

const NIGHT = {
  sky: '#060c1e',
  ground: '#0a1026',
  gridStroke: '#1b2a66',
  buildingBody: '#0a1026',
  buildingEdge: '#1d2850',
  windowLit: ['#8fe8ff', '#aab6ff', '#ffd591', '#ffffff'],
  windowDark: '#0c1330',
  crane: '#10172f',
  craneHighlight: '#1a2350',
  holo1: '#3fd4ff',
  holo2: '#9b7bff',
  holo3: '#59ffc8',
  pillar: '#59d6ff',
  pillarBlob: '#cdf0ff',
  spark: '#7fb4ff',
  ring1: '#3fd4ff',
  ring2: '#8d7bff',
  beacon: '#ff3b3b',
  hook: '#ffb45e',
  smoke: 'rgba(60,75,120,0.45)',
} as const;

type Theme = {
  sky: string;
  ground: string;
  gridStroke: string;
  buildingBody: string;
  buildingEdge: string;
  windowLit: readonly string[];
  windowDark: string;
  crane: string;
  craneHighlight: string;
  holo1: string;
  holo2: string;
  holo3: string;
  pillar: string;
  pillarBlob: string;
  spark: string;
  ring1: string;
  ring2: string;
  beacon: string;
  hook: string;
  smoke: string;
};

/* ── building definitions ── */
interface BldgDef {
  x: number;
  w: number;
  h: number;
  depth: number; // 0=far → 3=near
  hasAntenna: boolean;
  hasChimney: boolean;
  windowSeed: number;
}

function makeBuildings(): BldgDef[] {
  const rows = [
    { depth: 0, yBase: 0, wMin: 28, wMax: 38, hMin: 90, hMax: 160, spacing: 42, count: 12 },
    { depth: 1, yBase: 20, wMin: 34, wMax: 48, hMin: 70, hMax: 120, spacing: 52, count: 10 },
    { depth: 2, yBase: 40, wMin: 40, wMax: 56, hMin: 80, hMax: 150, spacing: 60, count: 9 },
    { depth: 3, yBase: 55, wMin: 48, wMax: 68, hMin: 90, hMax: 180, spacing: 72, count: 8 },
  ];
  const defs: BldgDef[] = [];
  let seed = 0;
  for (const row of rows) {
    const r = mulberry32(seed * 7919 + 17);
    const startX = -(row.count * row.spacing) / 2;
    for (let i = 0; i < row.count; i++) {
      const w = row.wMin + r() * (row.wMax - row.wMin);
      const h = row.hMin + r() * (row.hMax - row.hMin);
      defs.push({
        x: startX + i * row.spacing + (r() - 0.5) * 14,
        w,
        h,
        depth: row.depth,
        hasAntenna: row.depth >= 2 || r() > 0.82,
        hasChimney: row.depth >= 1 && r() > 0.55 && r() < 0.82,
        windowSeed: seed + i,
      });
      seed++;
    }
  }
  return defs;
}

/* ── window grid as <pattern> (deterministic) ── */
function WindowGrid({ seed, cols, rows, cw, ch, theme }: {
  seed: number; cols: number; rows: number; cw: number; ch: number; theme: Theme;
}) {
  const rects = useMemo(() => {
    const rand = mulberry32(seed);
    const out: Array<{ cx: number; cy: number; fill: string; opacity: number }> = [];
    const cellW = cw / cols;
    const cellH = ch / rows;
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const lit = rand() > 0.48;
        out.push({
          cx: c * cellW + cellW * 0.2,
          cy: r * cellH + cellH * 0.2,
          fill: lit
            ? theme.windowLit[Math.floor(rand() * theme.windowLit.length)]
            : theme.windowDark,
          opacity: lit ? 0.3 + rand() * 0.6 : 0.85,
        });
      }
    }
    return out;
  }, [seed, cols, rows, cw, ch, theme]);

  const cellW = cw / cols;
  const cellH = ch / rows;

  return (
    <>
      {rects.map((r, i) => (
        <rect
          key={i}
          x={r.cx}
          y={r.cy}
          width={cellW * 0.6}
          height={cellH * 0.6}
          rx={1}
          fill={r.fill}
          opacity={r.opacity}
        />
      ))}
    </>
  );
}

/**
 * Pure CSS/SVG skyline: buildings, cranes, holograms, energy pillars,
 * sparks, pulse rings — no WebGL dependency.
 */
export const HeroScene = ({ className = '' }: HeroSceneProps) => {
  const { theme: themeName } = useTheme();
  const day = themeName === 'light';
  const colors = (day ? DAY : NIGHT) as Theme;

  const svgRef = useRef<SVGSVGElement>(null);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  const onMouseMove = useCallback((e: MouseEvent) => {
    const nx = (e.clientX / window.innerWidth) * 2 - 1;
    const ny = (e.clientY / window.innerHeight) * 2 - 1;
    setParallax({ x: nx * 12, y: ny * 6 });
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, [onMouseMove]);

  const buildings = useMemo(() => makeBuildings(), []);

  /* ── viewbox dimensions ── */
  const W = 1200;
  const H = 700;
  const groundY = 560;

  return (
    <div
      aria-hidden="true"
      data-hero-scene
      className={`pointer-events-none absolute inset-0 overflow-hidden opacity-60 ${className}`}
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMax slice"
        className="absolute inset-0 h-full w-full"
        style={{
          transform: `translate(${parallax.x}px, ${parallax.y}px)`,
          transition: 'transform 0.15s ease-out',
        }}
      >
        <defs>
          {/* Grid pattern */}
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke={colors.gridStroke}
              strokeWidth="0.5"
              opacity={day ? 0.35 : 0.2}
            />
          </pattern>

          {/* Pulse ring gradients */}
          <radialGradient id="pulse1">
            <stop offset="0%" stopColor={colors.ring1} stopOpacity="0" />
            <stop offset="100%" stopColor={colors.ring1} stopOpacity="0.35" />
          </radialGradient>
          <radialGradient id="pulse2">
            <stop offset="0%" stopColor={colors.ring2} stopOpacity="0" />
            <stop offset="100%" stopColor={colors.ring2} stopOpacity="0.3" />
          </radialGradient>

          {/* Spark glow filter */}
          <filter id="sparkGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Hologram glow */}
          <filter id="holoGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ── Sky gradient ── */}
        <rect width={W} height={H} fill={colors.sky} />

        {/* ── Ground grid ── */}
        <rect x="0" y={groundY} width={W} height={H - groundY} fill={colors.ground} />
        <rect x="0" y={groundY} width={W} height={H - groundY} fill="url(#grid)" />

        {/* ── Buildings (far → near for depth) ── */}
        {buildings
          .sort((a, b) => a.depth - b.depth)
          .map((bldg, i) => {
            const opacity = 0.5 + bldg.depth * 0.15;
            const edgeW = 2;
            const cols = Math.max(2, Math.floor(bldg.w / 8));
            const rows = Math.max(3, Math.floor(bldg.h / 12));
            return (
              <g key={i} opacity={opacity} className="hero-building">
                {/* Main body */}
                <rect
                  x={W / 2 + bldg.x - bldg.w / 2}
                  y={groundY - bldg.h}
                  width={bldg.w}
                  height={bldg.h}
                  fill={colors.buildingBody}
                  stroke={colors.buildingEdge}
                  strokeWidth={edgeW}
                  rx={1}
                  className="hero-building-rise"
                  style={{ animationDelay: `${i * 0.08}s` }}
                />
                {/* Window grid */}
                <g
                  clipPath={`url(#bldg-clip-${i})`}
                  className="hero-building-rise"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <defs>
                    <clipPath id={`bldg-clip-${i}`}>
                      <rect
                        x={W / 2 + bldg.x - bldg.w / 2}
                        y={groundY - bldg.h}
                        width={bldg.w}
                        height={bldg.h}
                      />
                    </clipPath>
                  </defs>
                  <WindowGrid
                    seed={bldg.windowSeed}
                    cols={cols}
                    rows={rows}
                    cw={bldg.w}
                    ch={bldg.h}
                    theme={colors}
                  />
                </g>
                {/* Antenna */}
                {bldg.hasAntenna && (
                  <g className="hero-building-rise" style={{ animationDelay: `${i * 0.08}s` }}>
                    <line
                      x1={W / 2 + bldg.x}
                      y1={groundY - bldg.h}
                      x2={W / 2 + bldg.x}
                      y2={groundY - bldg.h - 18}
                      stroke={colors.buildingEdge}
                      strokeWidth={1.5}
                    />
                    <circle
                      cx={W / 2 + bldg.x}
                      cy={groundY - bldg.h - 18}
                      r={3}
                      fill={colors.beacon}
                      className="hero-beacon"
                    />
                  </g>
                )}
                {/* Chimney */}
                {bldg.hasChimney && (
                  <g className="hero-building-rise" style={{ animationDelay: `${i * 0.08}s` }}>
                    <rect
                      x={W / 2 + bldg.x + bldg.w * 0.2}
                      y={groundY - bldg.h - 14}
                      width={6}
                      height={14}
                      fill={colors.buildingBody}
                      stroke={colors.buildingEdge}
                      strokeWidth={1}
                      rx={1}
                    />
                    {/* Smoke particles */}
                    {[0, 1, 2, 3, 4].map((s) => (
                      <circle
                        key={s}
                        cx={W / 2 + bldg.x + bldg.w * 0.2 + 3}
                        cy={groundY - bldg.h - 16}
                        r={2 + s * 0.6}
                        fill={colors.smoke}
                        className="hero-smoke"
                        style={{ animationDelay: `${s * 0.7 + i * 0.2}s` }}
                      />
                    ))}
                  </g>
                )}
              </g>
            );
          })}

        {/* ── Tower cranes ── */}
        {[
          { x: W / 2 - 180, flip: false },
          { x: W / 2 + 180, flip: true },
        ].map((crane, ci) => (
          <g key={`crane-${ci}`} className="hero-crane" style={{ animationDelay: `${ci * 1.5}s` }}>
            {/* Tower */}
            <rect
              x={crane.x - 5}
              y={groundY - 55}
              width={10}
              height={55}
              fill={colors.crane}
              stroke={colors.craneHighlight}
              strokeWidth={0.8}
            />
            {/* Mid brace */}
            <line
              x1={crane.x - 18}
              y1={groundY - 30}
              x2={crane.x + 18}
              y2={groundY - 30}
              stroke={colors.crane}
              strokeWidth={1.5}
            />
            {/* Jib (rotates) */}
            <g
              className="hero-crane-jib"
              style={{ transformOrigin: `${crane.x}px ${groundY - 55}px`, animationDelay: `${ci * 1.5}s` }}
            >
              {/* Jib arm */}
              <line
                x1={crane.x}
                y1={groundY - 55}
                x2={crane.x + (crane.flip ? -80 : 80)}
                y2={groundY - 56}
                stroke={colors.crane}
                strokeWidth={2}
              />
              {/* Counter-weight */}
              <rect
                x={crane.x + (crane.flip ? 8 : -16)}
                y={groundY - 58}
                width={8}
                height={6}
                fill={colors.craneHighlight}
                rx={1}
              />
              {/* Cable + hook */}
              <line
                x1={crane.x + (crane.flip ? -60 : 60)}
                y1={groundY - 55}
                x2={crane.x + (crane.flip ? -60 : 60)}
                y2={groundY - 28}
                stroke={colors.craneHighlight}
                strokeWidth={0.8}
                className="hero-cable"
              />
              <rect
                x={crane.x + (crane.flip ? -64 : 56)}
                y={groundY - 30}
                width={8}
                height={8}
                fill={colors.hook}
                rx={2}
                className="hero-hook"
              />
            </g>
          </g>
        ))}

        {/* ── Energy pillars ── */}
        {[
          { x: W / 2 - 130, h: 120, delay: 0 },
          { x: W / 2 + 130, h: 100, delay: 0.8 },
          { x: W / 2 + 5, h: 110, delay: 1.6 },
        ].map((p, pi) => (
          <g key={`pillar-${pi}`}>
            {/* Outer glow */}
            <rect
              x={p.x - 2}
              y={groundY - p.h}
              width={4}
              height={p.h}
              fill={colors.pillar}
              opacity={0.18}
              rx={2}
            />
            {/* Top/bottom caps */}
            <ellipse cx={p.x} cy={groundY - p.h + 2} rx={5} ry={1.5} fill={colors.pillar} opacity={0.7} />
            <ellipse cx={p.x} cy={groundY - 2} rx={5} ry={1.5} fill={colors.pillar} opacity={0.7} />
            {/* Moving blob */}
            <rect
              x={p.x - 4}
              y={groundY - p.h * 0.5}
              width={8}
              height={6}
              fill={colors.pillarBlob}
              rx={2}
              opacity={0.9}
              className="hero-pillar-blob"
              style={{ animationDelay: `${p.delay}s`, '--pillar-h': `${p.h - 20}px` } as React.CSSProperties}
            />
          </g>
        ))}

        {/* ── Wireframe holograms ── */}
        {/* Icosahedron */}
        <g
          className="hero-holo hero-holo-1"
          filter="url(#holoGlow)"
          style={{ transformOrigin: `${W / 2 + 100}px ${groundY - 180}px` }}
        >
          <polygon
            points={`${W / 2 + 100},${groundY - 210} ${W / 2 + 120},${groundY - 195} ${W / 2 + 115},${groundY - 170} ${W / 2 + 85},${groundY - 170} ${W / 2 + 80},${groundY - 195}`}
            fill="none"
            stroke={colors.holo1}
            strokeWidth={1.2}
            opacity={0.45}
          />
          <line x1={W / 2 + 100} y1={groundY - 210} x2={W / 2 + 115} y2={groundY - 170} stroke={colors.holo1} strokeWidth={0.6} opacity={0.3} />
          <line x1={W / 2 + 100} y1={groundY - 210} x2={W / 2 + 85} y2={groundY - 170} stroke={colors.holo1} strokeWidth={0.6} opacity={0.3} />
          <line x1={W / 2 + 120} y1={groundY - 195} x2={W / 2 + 85} y2={groundY - 170} stroke={colors.holo1} strokeWidth={0.6} opacity={0.3} />
          <line x1={W / 2 + 80} y1={groundY - 195} x2={W / 2 + 115} y2={groundY - 170} stroke={colors.holo1} strokeWidth={0.6} opacity={0.3} />
        </g>

        {/* Octahedron */}
        <g
          className="hero-holo hero-holo-2"
          filter="url(#holoGlow)"
          style={{ transformOrigin: `${W / 2 - 120}px ${groundY - 200}px` }}
        >
          <polygon
            points={`${W / 2 - 120},${groundY - 225} ${W / 2 - 100},${groundY - 200} ${W / 2 - 120},${groundY - 175} ${W / 2 - 140},${groundY - 200}`}
            fill="none"
            stroke={colors.holo2}
            strokeWidth={1.2}
            opacity={0.45}
          />
          <line x1={W / 2 - 120} y1={groundY - 225} x2={W / 2 - 120} y2={groundY - 175} stroke={colors.holo2} strokeWidth={0.6} opacity={0.3} />
          <line x1={W / 2 - 100} y1={groundY - 200} x2={W / 2 - 140} y2={groundY - 200} stroke={colors.holo2} strokeWidth={0.6} opacity={0.3} />
        </g>

        {/* Torus knot approximation (small) */}
        <g
          className="hero-holo hero-holo-3"
          filter="url(#holoGlow)"
          style={{ transformOrigin: `${W / 2}px ${groundY - 250}px` }}
        >
          <circle
            cx={W / 2}
            cy={groundY - 250}
            r={14}
            fill="none"
            stroke={colors.holo3}
            strokeWidth={1}
            opacity={0.4}
          />
          <circle
            cx={W / 2}
            cy={groundY - 250}
            r={8}
            fill="none"
            stroke={colors.holo3}
            strokeWidth={0.8}
            opacity={0.3}
            strokeDasharray="3 4"
          />
        </g>

        {/* ── Rising sparks ── */}
        <g filter="url(#sparkGlow)">
          {useMemo(() => {
            const rand = mulberry32(99);
            return Array.from({ length: 40 }, () => ({
              cx: rand() * W,
              cy: 100 + rand() * (groundY - 120),
              r: 1 + rand() * 1.5,
              delay: rand() * 5,
              dur: 3 + rand() * 4,
            }));
          }, []).map((s, i) => (
            <circle
              key={`spark-${i}`}
              cx={s.cx}
              cy={s.cy}
              r={s.r}
              fill={colors.spark}
              opacity={0.6}
              className="hero-spark"
              style={{ animationDelay: `${s.delay}s`, animationDuration: `${s.dur}s` }}
            />
          ))}
        </g>

        {/* ── Pulse rings ── */}
        <circle
          cx={W / 2}
          cy={groundY - 10}
          r={30}
          fill="none"
          stroke={colors.ring1}
          strokeWidth={1.5}
          className="hero-pulse hero-pulse-1"
        />
        <circle
          cx={W / 2}
          cy={groundY - 10}
          r={20}
          fill="none"
          stroke={colors.ring2}
          strokeWidth={1}
          className="hero-pulse hero-pulse-2"
        />
      </svg>

      {/* ── CSS animations (no JS loop needed) ── */}
      <style>{`
        /* Building rise-in */
        @keyframes heroRise {
          0% { transform: translateY(40px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .hero-building-rise {
          animation: heroRise 0.8s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        /* Beacon blink */
        @keyframes heroBeacon {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        .hero-beacon {
          animation: heroBeacon 2s ease-in-out infinite;
        }

        /* Smoke rise */
        @keyframes heroSmoke {
          0% { transform: translateY(0) scale(1); opacity: 0.5; }
          100% { transform: translateY(-30px) scale(2.5); opacity: 0; }
        }
        .hero-smoke {
          animation: heroSmoke 3s ease-out infinite;
        }

        /* Crane jib rotate */
        @keyframes heroJib {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .hero-crane-jib {
          animation: heroJib 12s linear infinite;
        }

        /* Cable swing */
        @keyframes heroCable {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .hero-cable {
          animation: heroCable 2.5s ease-in-out infinite;
        }

        /* Hook bounce */
        @keyframes heroHook {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        .hero-hook {
          animation: heroHook 2.5s ease-in-out infinite;
        }

        /* Energy pillar blob movement */
        @keyframes heroBlob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(calc(var(--pillar-h, 80px) * -1)); }
        }
        .hero-pillar-blob {
          animation: heroBlob 3s ease-in-out infinite;
        }

        /* Hologram float */
        @keyframes heroHolo1 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-8px) rotate(3deg); }
          75% { transform: translateY(5px) rotate(-2deg); }
        }
        @keyframes heroHolo2 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          33% { transform: translateY(-12px) rotate(-4deg); }
          66% { transform: translateY(6px) rotate(2deg); }
        }
        @keyframes heroHolo3 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-6px) rotate(5deg); }
        }
        .hero-holo-1 { animation: heroHolo1 6s ease-in-out infinite; }
        .hero-holo-2 { animation: heroHolo2 7s ease-in-out infinite; }
        .hero-holo-3 { animation: heroHolo3 5s ease-in-out infinite; }

        /* Spark float upward */
        @keyframes heroSpark {
          0% { transform: translateY(0); opacity: 0.6; }
          50% { opacity: 0.8; }
          100% { transform: translateY(-60px); opacity: 0; }
        }
        .hero-spark {
          animation: heroSpark 4s ease-in infinite;
        }

        /* Pulse rings expand */
        @keyframes heroPulse1 {
          0% { r: 10; opacity: 0.5; }
          100% { r: 180; opacity: 0; }
        }
        @keyframes heroPulse2 {
          0% { r: 8; opacity: 0.4; }
          100% { r: 150; opacity: 0; }
        }
        .hero-pulse-1 {
          animation: heroPulse1 4s ease-out infinite;
        }
        .hero-pulse-2 {
          animation: heroPulse2 4s ease-out infinite;
          animation-delay: 1.2s;
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .hero-building-rise,
          .hero-beacon,
          .hero-smoke,
          .hero-crane-jib,
          .hero-cable,
          .hero-hook,
          .hero-pillar-blob,
          .hero-holo-1,
          .hero-holo-2,
          .hero-holo-3,
          .hero-spark,
          .hero-pulse-1,
          .hero-pulse-2 {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default HeroScene;
