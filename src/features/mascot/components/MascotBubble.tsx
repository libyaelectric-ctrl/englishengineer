interface MascotBubbleProps {
  message: string | null;
  minimized: boolean;
  isMobile?: boolean;
}

export const MascotBubble = ({ message, minimized, isMobile }: MascotBubbleProps) => {
  if (minimized || !message) return null;

  // On mobile, make the bubble narrower and position it further up to avoid bottom nav
  const bottomOffset = isMobile ? '80px' : '72px';
  const maxWidth = isMobile ? '170px' : '200px';
  const fontSize = isMobile ? '11px' : '12.5px';

  return (
    <div
      className="engmascot-bubble"
      role="status"
      aria-live="polite"
      style={{
        position: 'absolute',
        bottom: bottomOffset,
        right: 0,
        maxWidth,
        padding: isMobile ? '6px 10px' : '8px 12px',
        borderRadius: '12px',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        fontSize,
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
