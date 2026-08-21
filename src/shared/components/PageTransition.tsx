import { type Variants, motion } from 'motion/react';

import { type ReactNode } from 'react';

import { usePrefersReducedMotion } from '@/shared/hooks/usePrefersReducedMotion';

const pageVariants: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

const pageTransition = {
  type: 'tween' as const,
  ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
  duration: 0.3,
};

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
  /** Additional animation delay in seconds */
  delay?: number;
}

/**
 * Drop-in page entrance animation wrapper.
 * Respects prefers-reduced-motion.
 */
export const PageTransition = ({ children, className, delay = 0 }: PageTransitionProps) => {
  const prefersReduced = usePrefersReducedMotion();

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ ...pageTransition, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * Fade-in on scroll into view.
 * Respects prefers-reduced-motion.
 */
interface FadeInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

const fadeInVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export const FadeIn = ({ children, className, delay = 0 }: FadeInProps) => {
  const prefersReduced = usePrefersReducedMotion();

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={fadeInVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration: 0.35,
        ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
        delay,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
