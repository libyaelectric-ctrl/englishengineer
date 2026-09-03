import React from 'react';

import { useMascotStore } from '../mascot.store';

interface MascotSettingsProps {
  open: boolean;
  minimized: boolean;
  onClose: () => void;
}

const VOLUME_OPTIONS = ['off', 'low', 'high'] as const;

export const MascotSettings: React.FC<MascotSettingsProps> = ({ open, minimized, onClose }) => {
  const {
    soundEnabled,
    setSoundEnabled,
    soundVolume,
    setSoundVolume,
    contrastMode,
    toggleContrastMode,
    toastEnabled,
    setToastEnabled,
  } = useMascotStore();

  if (!open || minimized) return null;

  return (
    <div
      className="engmascot-settings"
      style={{
        position: 'absolute',
        bottom: minimized ? '48px' : '72px',
        right: 0,
        width: '220px',
        padding: '12px',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '12px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        fontSize: '12px',
      }}
    >
      <div className="flex items-center justify-between">
        <span className="font-bold text-foreground">Settings</span>
        <button onClick={onClose} className="engmascot-mini-btn" aria-label="Close settings">
          ✕
        </button>
      </div>

      <label className="flex items-center gap-2 cursor-pointer text-foreground">
        <input
          type="checkbox"
          checked={soundEnabled}
          onChange={(e) => setSoundEnabled(e.target.checked)}
        />
        <span>Sound Effects</span>
      </label>

      <label className="flex items-center gap-2 cursor-pointer text-foreground">
        <input
          type="checkbox"
          checked={toastEnabled}
          onChange={(e) => setToastEnabled(e.target.checked)}
        />
        <span>Toasts</span>
      </label>

      <label className="flex items-center gap-2 cursor-pointer text-foreground">
        <input type="checkbox" checked={contrastMode} onChange={toggleContrastMode} />
        <span>High Contrast</span>
      </label>

      <div>
        <span className="text-muted-copy">Volume: {soundVolume}</span>
        <select
          value={soundVolume}
          onChange={(e) => setSoundVolume(e.target.value as 'off' | 'low' | 'high')}
          className="w-full mt-1 text-xs border border-border-soft rounded bg-background"
        >
          {VOLUME_OPTIONS.map((v) => (
            <option key={v} value={v}>
              {v === 'off' ? 'Mute' : v === 'low' ? 'Low' : 'High'}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
