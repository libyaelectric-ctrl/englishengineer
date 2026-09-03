import React from 'react';

interface MascotBubbleProps {
  message: string | null;
  minimized: boolean;
}

export const MascotBubble: React.FC<MascotBubbleProps> = ({ message, minimized }) => {
  if (minimized || !message) return null;

  return (
    <div
      className="engmascot-bubble"
      role="status"
      aria-live="polite"
      style={{
        position: 'absolute',
        bottom: minimized ? '48px' : '72px',
        right: 0,
        maxWidth: '200px',
        padding: '8px 12px',
        borderRadius: '12px',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        fontSize: '12px',
        lineHeight: 1.4,
        color: 'var(--color-foreground)',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}
    >
      {message}
    </div>
  );
};
