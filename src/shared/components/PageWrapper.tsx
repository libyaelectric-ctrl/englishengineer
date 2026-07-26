/**
 * PageWrapper — Consistent page entrance animation
 * Wraps page content with fade-in + slide-up transition
 */

import { type FC, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { pageTransition, staggerContainer } from '@/shared/utils/motion';

interface PageWrapperProps {
  children: ReactNode;
  className?: string;
  /** Disable animation (useful for modals or conditional renders) */
  noAnimation?: boolean;
}

export const PageWrapper: FC<PageWrapperProps> = ({
  children,
  className = '',
  noAnimation = false,
}) => {
  if (noAnimation) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * StaggerSection — Container that staggers its children's entrance
 */
interface StaggerSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export const StaggerSection: FC<StaggerSectionProps> = ({
  children,
  className = '',
  delay = 0,
}) => (
  <motion.div
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: '-40px' }}
    variants={{
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.06,
          delayChildren: delay,
        },
      },
    }}
    className={className}
  >
    {children}
  </motion.div>
);

/**
 * StaggerItem — Individual item inside a StaggerSection
 */
interface StaggerItemProps {
  children: ReactNode;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale';
}

export const StaggerItem: FC<StaggerItemProps> = ({
  children,
  className = '',
  direction = 'up',
}) => {
  const directionMap = {
    up: { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } },
    down: { hidden: { opacity: 0, y: -16 }, visible: { opacity: 1, y: 0 } },
    left: { hidden: { opacity: 0, x: -24 }, visible: { opacity: 1, x: 0 } },
    right: { hidden: { opacity: 0, x: 24 }, visible: { opacity: 1, x: 0 } },
    scale: { hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } },
  };

  return (
    <motion.div
      variants={directionMap[direction]}
      transition={{ duration: 0.35, easing: [0.25, 1, 0.5, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
