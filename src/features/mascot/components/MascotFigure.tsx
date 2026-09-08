import React, { forwardRef } from 'react';

import { cn } from '@/shared/utils/cn';

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

const STATE_EMOJIS: Record<string, string> = {
  idle: '🦸',
  thinking: '🤔',
  celebrate: '🎉',
  levelUp: '⬆️',
  streak: '🔥',
  sleeping: '😴',
  concerned: '😟',
  streakDanger: '⚠️',
  empty: '😐',
  farewell: '👋',
  point: '👉',
};

const STATE_CSS: Record<string, string> = {
  idle: 'engmascot-idle',
  celebrate: 'engmascot-celebrate',
  concerned: 'engmascot-concerned',
  thinking: 'engmascot-thinking',
  point: 'engmascot-point',
  sleeping: 'engmascot-sleeping',
  levelUp: 'engmascot-celebrate',
  streak: 'engmascot-celebrate',
  streakDanger: 'engmascot-concerned',
  empty: 'engmascot-idle',
  farewell: 'engmascot-celebrate',
};

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
    const emoji = STATE_EMOJIS[state] ?? '🦸';
    const stateClass = STATE_CSS[state] ?? 'engmascot-idle';

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
        className={cn('engmascot-figure', stateClass, dragging && 'engmascot-dragging')}
        style={{
          width: imgSize,
          height: imgSize,
          fontSize: imgSize * 0.8,
          lineHeight: 1,
          cursor: inline ? 'default' : dragging ? 'grabbing' : 'grab',
          userSelect: 'none',
        }}
      >
        <span className="relative z-10 flex items-center justify-center w-full h-full">
          {emoji}
        </span>
        <span className="engmascot-blink" />
        <div className="engmascot-fx" />
      </div>
    );
  }
);

MascotFigure.displayName = 'MascotFigure';
