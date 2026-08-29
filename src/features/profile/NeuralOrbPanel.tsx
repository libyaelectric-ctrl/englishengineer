import { useCallback, useMemo, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { useLearningStore } from '@/core/learning';

import { ThemeToggle } from '@/shared/components/ThemeToggle';
import type { EngineeringDiscipline } from '@/shared/constants/engineering-disciplines';

import { useAuthStore } from '@/features/auth';
import { INTERFACE_LANGUAGES, useLocalizationStore } from '@/features/localization';
import type { SupportedInterfaceLanguage } from '@/features/localization/localization.types';
import { LearningProfileRepository } from '@/features/profile/profile.repository';

/* ------------------------------------------------------------------ */
/* Discipline / Language data                                          */
/* ------------------------------------------------------------------ */
const DISCIPLINES_DATA = [
  { code: 'AR', full: 'Architecture', id: 'architecture' as EngineeringDiscipline },
  { code: 'CH', full: 'Chemical Eng.', id: 'chemical' as EngineeringDiscipline },
  { code: 'CI', full: 'Civil Eng.', id: 'civil' as EngineeringDiscipline },
  { code: 'EL', full: 'Electrical Eng.', id: 'electrical' as EngineeringDiscipline },
  { code: 'EC', full: 'Electronics Eng.', id: 'electronics' as EngineeringDiscipline },
  { code: 'SO', full: 'Software Eng.', id: 'software' as EngineeringDiscipline },
  { code: 'ME', full: 'Mechatronics', id: 'mechatronics' as EngineeringDiscipline },
  { code: 'MC', full: 'Mechanical Eng.', id: 'mechanical' as EngineeringDiscipline },
  { code: 'IN', full: 'Industrial Eng.', id: 'industrial' as EngineeringDiscipline },
  { code: 'HS', full: 'HSE Eng.', id: 'hse' as EngineeringDiscipline },
];

const LANGUAGES_DATA = INTERFACE_LANGUAGES.filter((l) => l.available).map((l) => ({
  code: l.id.toUpperCase(),
  full: l.nativeLabel,
  sub: l.label,
  id: l.id as SupportedInterfaceLanguage,
}));

/* ------------------------------------------------------------------ */
/* Orbit geometry helpers                                              */
/* ------------------------------------------------------------------ */
type OrbPos = { x: number; y: number };

/** Places `count` points evenly across an angular arc, alternating radius
 *  in `tiers` steps so labels on a dense arc (e.g. 15 languages) don't
 *  collide. Coordinates are percentages of the panel (0-100), matching an
 *  SVG viewBox of the same size so orbs and connector lines stay in sync. */
function arcPositions(
  count: number,
  angleStart: number,
  angleEnd: number,
  tiers: number[]
): OrbPos[] {
  const step = count > 1 ? (angleEnd - angleStart) / (count - 1) : 0;
  return Array.from({ length: count }, (_, i) => {
    const angle = ((angleStart + i * step) * Math.PI) / 180;
    const radius = tiers[i % tiers.length];
    return {
      x: 50 + radius * Math.cos(angle),
      y: 50 - radius * Math.sin(angle) * 0.66,
    };
  });
}

const DISCIPLINE_POS = arcPositions(DISCIPLINES_DATA.length, 100, 260, [40, 28]);
const LANGUAGE_POS = arcPositions(LANGUAGES_DATA.length, -78, 78, [28, 38, 46]);

/* ------------------------------------------------------------------ */
/* NeuralOrbPanel                                                      */
/* ------------------------------------------------------------------ */
export const NeuralOrbPanel = ({ onComplete }: { onComplete?: () => void } = {}) => {
  const navigate = useNavigate();
  const currentLanguage = useLocalizationStore((s) => s.language);
  const setLanguage = useLocalizationStore((s) => s.setLanguage);
  const translate = useLocalizationStore((s) => s.translate);
  const currentUser = useAuthStore((s) => s.currentUser);

  const [selectedDiscipline, setSelectedDiscipline] = useState<EngineeringDiscipline | null>(null);
  const [selectedLanguage, setSelectedLanguage] =
    useState<SupportedInterfaceLanguage>(currentLanguage);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{ text: string; tone: 'ok' | 'error' | 'info' }>({
    text: translate('orbit.systemReady'),
    tone: 'info',
  });

  const pushStatus = useCallback((text: string, tone: 'ok' | 'error' | 'info' = 'info') => {
    setStatus({ text, tone });
  }, []);

  /* ---- ENTER: commit selection and unlock the app ---- */
  const handleEnter = useCallback(async () => {
    if (!selectedDiscipline) {
      pushStatus(translate('orbit.errorDiscipline'), 'error');
      return;
    }
    if (!selectedLanguage) {
      pushStatus(translate('orbit.errorLanguage'), 'error');
      return;
    }
    if (!currentUser) {
      pushStatus(translate('orbit.errorDiscipline'), 'error');
      return;
    }
    setIsSaving(true);
    pushStatus(translate('orbit.granted'), 'ok');
    try {
      setLanguage(selectedLanguage);
      LearningProfileRepository.updatePreferences(currentUser.id, {
        discipline: selectedDiscipline,
        professionalTrack: selectedDiscipline as never,
        onboardingCompleted: true,
        interfaceLanguage: selectedLanguage,
      });
      useAuthStore.setState({
        currentUser: {
          ...useAuthStore.getState().currentUser!,
          engineeringDiscipline: selectedDiscipline,
        },
      });
      useLearningStore.getState().resetAll();
      onComplete?.();
    } finally {
      setIsSaving(false);
    }
  }, [
    selectedDiscipline,
    selectedLanguage,
    currentUser,
    setLanguage,
    onComplete,
    pushStatus,
    translate,
  ]);

  /* ---- BACK: return to the public landing page ---- */
  const handleBack = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const handleDisciplineSelect = useCallback(
    (d: (typeof DISCIPLINES_DATA)[number]) => {
      setSelectedDiscipline(d.id);
      pushStatus(`${translate('orbit.disciplineTag')} [${d.code}] — ${d.full}`, 'ok');
    },
    [pushStatus, translate]
  );

  const handleLanguageSelect = useCallback(
    (l: (typeof LANGUAGES_DATA)[number]) => {
      setSelectedLanguage(l.id);
      pushStatus(`${translate('orbit.languageTag')} [${l.code}] — ${l.full}`, 'ok');
    },
    [pushStatus, translate]
  );

  const canEnter = !!selectedDiscipline && !!selectedLanguage && !isSaving;

  const lines = useMemo(
    () => [
      ...DISCIPLINE_POS.map((p, i) => ({
        ...p,
        active: selectedDiscipline === DISCIPLINES_DATA[i].id,
        color: '#38bdf8',
      })),
      ...LANGUAGE_POS.map((p, i) => ({
        ...p,
        active: selectedLanguage === LANGUAGES_DATA[i].id,
        color: '#c084fc',
      })),
    ],
    [selectedDiscipline, selectedLanguage]
  );

  return (
    <div className="orbit-panel">
      {/* ---- Top bar ---- */}
      <header className="orbit-topbar">
        <button type="button" className="orbit-brand" onClick={handleBack} aria-label="EngVox">
          <img src="/brand/logo.svg" alt="EngVox" className="orbit-brand-logo" />
        </button>
        <p className="orbit-tagline hidden sm:block">{translate('orbit.tagline')}</p>
        <ThemeToggle />
      </header>

      {/* ---- Orbit canvas ---- */}
      <div className="orbit-stage-wrap">
        <div className="orbit-stage">
          <svg
            className="orbit-lines"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {lines.map((l, i) => (
              <line
                key={i}
                x1={50}
                y1={50}
                x2={l.x}
                y2={l.y}
                stroke={l.active ? l.color : 'rgba(148,163,184,0.25)'}
                strokeWidth={l.active ? 0.5 : 0.18}
                style={l.active ? { filter: `drop-shadow(0 0 2px ${l.color})` } : undefined}
              />
            ))}
          </svg>

          {/* Hub */}
          <div className="orbit-hub">
            <div className="orbit-hub-ring" />
            <div className="orbit-hub-core">
              <span>EV</span>
            </div>
            <p className="orbit-hub-caption">{translate('orbit.selectPrompt')}</p>
          </div>

          {/* Discipline orbs (left) */}
          {DISCIPLINES_DATA.map((d, i) => {
            const pos = DISCIPLINE_POS[i];
            const active = selectedDiscipline === d.id;
            return (
              <button
                key={d.code}
                type="button"
                role="button"
                aria-label={d.full}
                aria-pressed={active}
                className={`orbit-node orbit-node--discipline${active ? ' is-active' : ''}`}
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                onClick={() => handleDisciplineSelect(d)}
              >
                <span className="orbit-node-dot">{d.code}</span>
                <span className="orbit-node-label">{d.full}</span>
              </button>
            );
          })}

          {/* Language orbs (right) */}
          {LANGUAGES_DATA.map((l, i) => {
            const pos = LANGUAGE_POS[i];
            const active = selectedLanguage === l.id;
            return (
              <button
                key={l.code}
                type="button"
                role="button"
                aria-label={`${l.full} (${l.sub})`}
                aria-pressed={active}
                className={`orbit-node orbit-node--language${active ? ' is-active' : ''}`}
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                onClick={() => handleLanguageSelect(l)}
              >
                <span className="orbit-node-dot">{l.code}</span>
                <span className="orbit-node-label">{l.full}</span>
              </button>
            );
          })}

          <div className="orbit-legend orbit-legend--left">
            <span className="orbit-legend-dot" style={{ background: '#38bdf8' }} />
            {translate('orbit.disciplines')}
          </div>
          <div className="orbit-legend orbit-legend--right">
            {translate('orbit.languages')}
            <span className="orbit-legend-dot" style={{ background: '#c084fc' }} />
          </div>
        </div>
      </div>

      {/* ---- Bottom console + actions ---- */}
      <footer className="orbit-footer">
        <div className={`orbit-console orbit-console--${status.tone}`}>
          <span>{status.text}</span>
        </div>
        <div className="orbit-actions">
          <button type="button" className="orbit-btn orbit-btn--back" onClick={handleBack}>
            ◄ BACK
          </button>
          <button
            type="button"
            className="orbit-btn orbit-btn--enter"
            onClick={handleEnter}
            disabled={!canEnter}
          >
            ENTER ►
          </button>
        </div>
      </footer>

      <style>{`
        .orbit-panel {
          display: flex;
          flex-direction: column;
          width: 100vw;
          height: 100vh;
          background: radial-gradient(circle at 50% 42%, #1e1b4b 0%, #020617 72%);
          overflow: hidden;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: #f8fafc;
        }

        /* Top bar */
        .orbit-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 10px 18px;
          border-bottom: 1px solid rgba(148, 163, 184, 0.12);
          flex: 0 0 auto;
        }
        .orbit-brand {
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 2px;
        }
        .orbit-brand-logo { height: 26px; width: auto; display: block; }
        .orbit-tagline {
          font-family: monospace;
          font-size: 0.68rem;
          letter-spacing: 1px;
          color: #64748b;
          text-transform: uppercase;
          flex: 1;
          text-align: center;
        }

        /* Orbit stage */
        .orbit-stage-wrap {
          flex: 1 1 auto;
          min-height: 0;
          overflow: auto;
        }
        .orbit-stage {
          position: relative;
          height: 100%;
          min-height: 460px;
          min-width: 100%;
        }
        @media (max-width: 640px) {
          .orbit-stage { min-width: 640px; }
        }
        .orbit-lines { position: absolute; inset: 0; width: 100%; height: 100%; }

        .orbit-hub {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          z-index: 2;
        }
        .orbit-hub-core {
          width: clamp(74px, 8vw, 110px);
          height: clamp(74px, 8vw, 110px);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          box-shadow: 0 0 40px rgba(118, 75, 162, 0.55), 0 0 0 1px rgba(255,255,255,0.08) inset;
          font-weight: 800;
          font-size: clamp(1.1rem, 2vw, 1.6rem);
          letter-spacing: 1px;
          color: #fff;
        }
        .orbit-hub-ring {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          width: clamp(120px, 13vw, 180px);
          height: clamp(120px, 13vw, 180px);
          border-radius: 50%;
          border: 1px dashed rgba(148, 163, 184, 0.35);
          animation: orbit-spin 40s linear infinite;
        }
        .orbit-hub-caption {
          font-family: monospace;
          font-size: 0.62rem;
          color: #94a3b8;
          text-align: center;
          max-width: 160px;
          margin-top: 78px;
        }
        @keyframes orbit-spin { to { transform: translate(-50%, -50%) rotate(360deg); } }

        .orbit-node {
          position: absolute;
          transform: translate(-50%, -50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          width: clamp(78px, 8vw, 108px);
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0;
          z-index: 1;
        }
        .orbit-node-dot {
          width: clamp(34px, 3.4vw, 46px);
          height: clamp(34px, 3.4vw, 46px);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: monospace;
          font-weight: 700;
          font-size: 0.68rem;
          background: rgba(15, 23, 42, 0.85);
          border: 1.5px solid rgba(148, 163, 184, 0.4);
          color: #cbd5e1;
          transition: all 0.18s ease;
        }
        .orbit-node-label {
          font-size: 0.62rem;
          line-height: 1.15;
          text-align: center;
          color: #94a3b8;
          transition: color 0.18s ease;
        }
        .orbit-node:hover .orbit-node-dot { transform: scale(1.08); }
        .orbit-node--discipline .orbit-node-dot:hover,
        .orbit-node--discipline.is-active .orbit-node-dot {
          border-color: #38bdf8;
          color: #38bdf8;
          box-shadow: 0 0 14px rgba(56, 189, 248, 0.6);
          background: rgba(56, 189, 248, 0.15);
        }
        .orbit-node--language .orbit-node-dot:hover,
        .orbit-node--language.is-active .orbit-node-dot {
          border-color: #c084fc;
          color: #c084fc;
          box-shadow: 0 0 14px rgba(192, 132, 252, 0.6);
          background: rgba(192, 132, 252, 0.15);
        }
        .orbit-node--discipline.is-active .orbit-node-label { color: #38bdf8; font-weight: 700; }
        .orbit-node--language.is-active .orbit-node-label { color: #c084fc; font-weight: 700; }

        .orbit-legend {
          position: absolute;
          top: 14px;
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: monospace;
          font-size: 0.68rem;
          letter-spacing: 1.2px;
          text-transform: uppercase;
          color: #64748b;
        }
        .orbit-legend--left { left: 18px; }
        .orbit-legend--right { right: 18px; }
        .orbit-legend-dot { width: 7px; height: 7px; border-radius: 50%; display: inline-block; }

        /* Footer */
        .orbit-footer {
          flex: 0 0 auto;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 16px 12px;
          border-top: 1px solid rgba(148, 163, 184, 0.12);
        }
        .orbit-console {
          flex: 1;
          background: #000;
          border: 1px solid #1e293b;
          border-radius: 4px;
          padding: 6px 10px;
          font-family: monospace;
          font-size: 0.68rem;
          min-height: 30px;
          display: flex;
          align-items: center;
          color: #22c55e;
        }
        .orbit-console--error { color: #f43f5e; }
        .orbit-console--ok { color: #22c55e; }
        .orbit-console--info { color: #94a3b8; }
        .orbit-actions { display: flex; gap: 8px; }
        .orbit-btn {
          padding: 7px 16px;
          font-family: monospace;
          font-size: 0.72rem;
          font-weight: bold;
          letter-spacing: 1px;
          border: 1px solid;
          background: transparent;
          cursor: pointer;
          border-radius: 4px;
          transition: all 0.2s ease;
        }
        .orbit-btn--back { color: #f43f5e; border-color: #f43f5e; }
        .orbit-btn--back:hover { background: rgba(244, 63, 94, 0.15); box-shadow: 0 0 8px rgba(244, 63, 94, 0.4); }
        .orbit-btn--enter { color: #38bdf8; border-color: #38bdf8; }
        .orbit-btn--enter:hover:not(:disabled) { background: rgba(56, 189, 248, 0.15); box-shadow: 0 0 8px rgba(56, 189, 248, 0.4); }
        .orbit-btn--enter:disabled { opacity: 0.4; cursor: not-allowed; }
      `}</style>
    </div>
  );
};

export default NeuralOrbPanel;
