import React, { forwardRef } from 'react';

interface MascotFigureProps {
  state: string;
  imgSize: number;
  inline?: boolean;
  dragging: boolean;
  ariaGreeting: string;
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: () => void;
  onPointerCancel: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

export const MascotFigure = forwardRef<HTMLDivElement, MascotFigureProps>(
  (
    {
      state,
      imgSize,
      inline,
      dragging,
      ariaGreeting,
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      onKeyDown,
    },
    ref
  ) => {
    const stateEmojis: Record<string, string> = {
      idle: '🦸',
      thinking: '🤔',
      celebrate: '🎉',
      levelUp: '⬆️',
      streak: '🔥',
      sleeping: '😴',
      concerned: '😟',
      streakDanger: '⚠️',
      empty: '😐',
    };

    const emoji = stateEmojis[state] ?? '🦸';

    return (
      <div
        ref={ref}
        role="img"
        aria-label={`${ariaGreeting} - ${state}`}
        tabIndex={inline ? 0 : -1}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onKeyDown={onKeyDown}
        style={{
          width: imgSize,
          height: imgSize,
          fontSize: imgSize * 0.8,
          lineHeight: 1,
          cursor: inline ? 'default' : dragging ? 'grabbing' : 'grab',
          userSelect: 'none',
          transition: 'transform 0.15s ease, filter 0.15s ease',
          filter: dragging ? 'drop-shadow(0 8px 16px rgba(0,0,0,0.2))' : 'none',
        }}
      >
        {emoji}
      </div>
    );
  }
);

MascotFigure.displayName = 'MascotFigure';
