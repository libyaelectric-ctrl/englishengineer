import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

import type { ReactNode } from 'react';

interface AnimateOnLoadProps {
  /** The content to animate in */
  children: ReactNode;
  /** Whether the content is still loading */
  isLoading: boolean;
  /** Optional skeleton placeholder shown while loading */
  skeleton?: ReactNode;
  /** Animation duration in seconds */
  duration?: number;
}

/**
 * Wraps content with a smooth fade-in + slide-up animation
 * when transitioning from loading to loaded state.
 *
 * Usage:
 *   <AnimateOnLoad isLoading={loading} skeleton={<SkeletonPage />}>
 *     <MyContentLoaded />
 *   </AnimateOnLoad>
 */
export const AnimateOnLoad = ({
  children,
  isLoading,
  skeleton,
  duration = 0.4,
}: AnimateOnLoadProps) => {
  const prefersReduced = useReducedMotion();

  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        skeleton ? (
          <motion.div
            key="skeleton"
            initial={prefersReduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={prefersReduced ? undefined : { opacity: 0 }}
            transition={{ duration: prefersReduced ? 0 : 0.2 }}
          >
            {skeleton}
          </motion.div>
        ) : null
      ) : (
        <motion.div
          key="content"
          initial={prefersReduced ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={prefersReduced ? undefined : { opacity: 0 }}
          transition={{
            duration: prefersReduced ? 0 : duration,
            ease: [0.25, 0.1, 0.25, 1],
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
