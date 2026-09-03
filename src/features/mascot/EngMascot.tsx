import React, { useState } from 'react';

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

const getDisplayMessage = (m: string | null, s: string, c: MascotStateCopy) =>
  m ??
  (s === 'thinking' ? c.thinking : s === 'sleeping' ? c.sleeping : s === 'empty' ? c.empty : null);

export const EngMascot: React.FC<{ inline?: boolean; size?: number }> = ({
  inline = false,
  size = 64,
  // eslint-disable-next-line complexity -- large mascot render with settings/state branches
}) => {
  const language = useLocalizationStore((s) => s.language);
  const copy = MASCOT_COPY[language] ?? MASCOT_COPY.en;
  const { state, message, visible, minimized, position, contrastMode, toggleMinimized } =
    useMascotStore();
  const { dragging, onPointerDown, onPointerMove, onPointerUp, handleTap } =
    useMascotHandlers(inline);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useMascotEffects(inline, copy);

  if (!visible) return null;
  const msg = getDisplayMessage(message, state, copy);
  const imgSize = inline ? size : minimized ? 40 : 64;

  return (
    <div
      className={`${inline ? 'relative inline-flex flex-col items-center' : 'select-none'} ${contrastMode ? 'engmascot-high-contrast' : ''}`}
      style={
        inline
          ? {}
          : { position: 'fixed', right: position.right, bottom: position.bottom, zIndex: 60 }
      }
    >
      <div className="sr-only" role="status" aria-live="polite">
        {copy.ariaGreeting}: {msg ?? ''}
      </div>
      <MascotBubble message={msg} minimized={minimized} />
      <MascotSettings
        open={settingsOpen}
        minimized={minimized}
        onClose={() => setSettingsOpen(false)}
      />
      <div className="flex items-end gap-2">
        {!inline && !minimized && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSettingsOpen(!settingsOpen);
            }}
            className="engmascot-mini-btn"
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
            className={`engmascot-mini-btn ${minimized ? 'engmascot-restore' : ''}`}
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
