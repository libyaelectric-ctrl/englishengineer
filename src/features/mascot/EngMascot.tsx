import React, { useMemo, useState } from 'react';

import { useLocalizationStore } from '@/features/localization';
import { MASCOT_COPY } from '@/features/localization/translations/mascot.translations';

import { MascotBubble } from './components/MascotBubble';
import { MascotFigure } from './components/MascotFigure';
import { MascotSettings } from './components/MascotSettings';
import './engmascot.css';
import { useMascotEffects } from './hooks/useMascotEffects';
import { useMascotHandlers } from './hooks/useMascotHandlers';
import { useMascotStore } from './mascot.store';

import { getDisplayMessage, pickRandom } from './engmascot.utils';

const useIsMobile = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 1024;
};

/** Settings gear + minimize button row — extracted to keep parent complexity ≤ 16 */
const MascotControls = ({
  inline,
  minimized,
  isMobile,
  onToggleSettings,
  onToggleMinimized,
}: {
  inline: boolean;
  minimized: boolean;
  isMobile: boolean;
  settingsOpen: boolean;
  onToggleSettings: (e: React.MouseEvent) => void;
  onToggleMinimized: () => void;
}) => {
  if (inline) return null;
  return (
    <>
      {!minimized && (
        <button
          type="button"
          onClick={onToggleSettings}
          className={`engmascot-mini-btn ${isMobile ? 'engmascot-mini-btn--touch' : ''}`}
          aria-label="Settings"
        >
          ⚙️
        </button>
      )}
      <button
        type="button"
        onClick={onToggleMinimized}
        className={`engmascot-mini-btn ${minimized ? 'engmascot-restore' : ''} ${isMobile ? 'engmascot-mini-btn--touch' : ''}`}
        aria-label={minimized ? 'Show' : 'Minimize'}
      >
        {minimized ? '+' : '—'}
      </button>
    </>
  );
};

export const EngMascot = ({ inline = false, size = 64 }: { inline?: boolean; size?: number }) => {
  const language = useLocalizationStore((s) => s.language);
  const copy = MASCOT_COPY[language] ?? MASCOT_COPY.en;
  const { state, message, visible, minimized, position, contrastMode, toggleMinimized } =
    useMascotStore();
  const { dragging, onPointerDown, onPointerMove, onPointerUp, handleTap } =
    useMascotHandlers(inline);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const isMobile = useIsMobile();

  useMascotEffects(inline, copy);

  const idleMessage = useMemo(() => pickRandom(copy.idle), [copy.idle]);

  if (!visible) return null;

  const msg = getDisplayMessage(message, state, copy, idleMessage);
  const imgSize = inline ? size : minimized ? 36 : isMobile ? 48 : 64;
  const mobileBottom = isMobile ? Math.max(position.bottom, 72) : position.bottom;

  const handleFigureKeyDown = (e: React.KeyboardEvent) => {
    if (!inline && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      handleTap();
    }
  };

  const handleSettingsToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSettingsOpen((prev) => !prev);
  };

  return (
    <div
      className={`${inline ? 'relative inline-flex flex-col items-center' : 'select-none'} ${contrastMode ? 'engmascot-high-contrast' : ''}`}
      style={
        inline ? {} : { position: 'fixed', right: position.right, bottom: mobileBottom, zIndex: 60 }
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
        <MascotControls
          inline={inline}
          minimized={minimized}
          isMobile={isMobile}
          settingsOpen={settingsOpen}
          onToggleSettings={handleSettingsToggle}
          onToggleMinimized={toggleMinimized}
        />
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
          onKeyDown={handleFigureKeyDown}
        />
      </div>
    </div>
  );
};

export default EngMascot;
