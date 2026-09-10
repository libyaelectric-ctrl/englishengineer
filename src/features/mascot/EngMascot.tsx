import React, { useMemo, useState } from 'react';

import { useLocalizationStore } from '@/features/localization';
import {
  MASCOT_COPY,
  type MascotStateCopy,
} from '@/features/localization/translations/mascot.translations';

import { MascotBubble } from './components/MascotBubble';
import { MascotFigure } from './components/MascotFigure';
import { MascotSettings } from './components/MascotSettings';
import './engmascot.css';
import { useMascotEffects } from './hooks/useMascotEffects';
import { useMascotHandlers } from './hooks/useMascotHandlers';
import { useMascotStore } from './mascot.store';

const pickRandom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const getDisplayMessage = (m: string | null, s: string, c: MascotStateCopy, idleMsg: string) => {
  if (m) return m;
  if (s === 'thinking') return c.thinking;
  if (s === 'sleeping') return c.sleeping;
  if (s === 'empty') return c.empty;
  if (s === 'idle') return idleMsg;
  return null;
};

/** Detect mobile via viewport width (matches Tailwind lg breakpoint at 1024px) */
const useIsMobile = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 1024;
};

export const EngMascot = ({
  inline = false,
  size = 64,
  // eslint-disable-next-line complexity -- large mascot render with settings/state branches
}: { inline?: boolean; size?: number }) => {
  const language = useLocalizationStore((s) => s.language);
  const copy = MASCOT_COPY[language] ?? MASCOT_COPY.en;
  const { state, message, visible, minimized, position, contrastMode, toggleMinimized } =
    useMascotStore();
  const { dragging, onPointerDown, onPointerMove, onPointerUp, handleTap } =
    useMascotHandlers(inline);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const isMobile = useIsMobile();

  useMascotEffects(inline, copy);

  // Pick a stable random idle message per mount / language change
  const idleMessage = useMemo(() => pickRandom(copy.idle), [language]);

  if (!visible) return null;
  const msg = getDisplayMessage(message, state, copy, idleMessage);
  // Mobile: smaller figure (48px) + slightly smaller minimized; Desktop: 64px
  const imgSize = inline ? size : minimized ? 36 : isMobile ? 48 : 64;
  // On mobile, push mascot above the bottom navigation bar (~64px tall)
  const mobileBottom = isMobile ? Math.max(position.bottom, 72) : position.bottom;

  return (
    <div
      className={`${inline ? 'relative inline-flex flex-col items-center' : 'select-none'} ${contrastMode ? 'engmascot-high-contrast' : ''}`}
      style={
        inline
          ? {}
          : { position: 'fixed', right: position.right, bottom: mobileBottom, zIndex: 60 }
      }
    >
      <div className="sr-only" role="status" aria-live="polite">
        {copy.ariaGreeting}: {msg ?? ''}
      </div>
      <MascotBubble message={msg} minimized={minimized} isMobile={isMobile} />
      <MascotSettings
        open={settingsOpen}
        minimized={minimized}
        onClose={() => setSettingsOpen(false)}
      />
      <div className="flex items-end gap-1.5 sm:gap-2">
        {!inline && !minimized && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSettingsOpen(!settingsOpen);
            }}
            className={`engmascot-mini-btn ${isMobile ? 'engmascot-mini-btn--touch' : ''}`}
            aria-label="Settings"
          >
            ⚙️
          </button>
        )}
        <MascotFigure
          state={state}
          imgSize={imgSize}
          inline={inline}
          dragging={dragging}
          ariaGreeting={copy.ariaGreeting}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={() => {}}
          onKeyDown={(e: React.KeyboardEvent) => {
            if (!inline && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              handleTap();
            }
          }}
        />
        {!inline && (
          <button
            type="button"
            onClick={toggleMinimized}
            className={`engmascot-mini-btn ${minimized ? 'engmascot-restore' : ''} ${isMobile ? 'engmascot-mini-btn--touch' : ''}`}
            aria-label={minimized ? 'Show' : 'Minimize'}
          >
            {minimized ? '+' : '—'}
          </button>
        )}
      </div>
    </div>
  );
};

export default EngMascot;
