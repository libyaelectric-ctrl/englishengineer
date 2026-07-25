import React, { useState, useEffect } from 'react';

interface OfflineIndicatorProps {
  /** Custom class name */
  className?: string;
}

/**
 * Offline indicator component.
 * Shows a banner when the user is offline.
 */
export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  className = '',
}) => {
  const [isOnline, setIsOnline] = useState(true);
  const [isReconnecting, setIsReconnecting] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsReconnecting(true);
      // Brief delay before showing online status
      setTimeout(() => {
        setIsOnline(true);
        setIsReconnecting(false);
      }, 1000);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial state
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !isReconnecting) {
    return null;
  }

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 ${className}`}
      role="status"
      aria-live="polite"
    >
      <div
        className={`
          px-4 py-2 text-center text-sm font-medium
          ${
            isReconnecting
              ? 'bg-yellow-500 text-yellow-900'
              : 'bg-gray-800 text-white'
          }
        `}
      >
        {isReconnecting ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Reconnecting...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-4.242 2.829a6.978 6.978 0 01-1.416-3.143m11.277 5.036a8.966 8.966 0 01-5.664-2.698m-6.436 2.698a6.978 6.978 0 01-1.416-3.143M12 2a10 10 0 00-10 10 10 10 0 0010 10 10 10 0 0010-10"
              />
            </svg>
            You're offline. Some features may be unavailable.
          </span>
        )}
      </div>
    </div>
  );
};
