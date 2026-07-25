import React from 'react';

interface SkipToContentProps {
  /** Target content ID */
  targetId?: string;
}

/**
 * Skip to content link for keyboard users.
 * Hidden until focused via keyboard navigation.
 * Allows keyboard users to skip repetitive navigation.
 */
export const SkipToContent: React.FC<SkipToContentProps> = ({
  targetId = 'main-content',
}) => {
  return (
    <a
      href={`#${targetId}`}
      className="
        sr-only focus:not-sr-only
        focus:fixed focus:top-4 focus:left-4 focus:z-[100]
        focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2
        focus:rounded-md focus:shadow-lg focus:outline-none
        focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
      "
    >
      Skip to main content
    </a>
  );
};
