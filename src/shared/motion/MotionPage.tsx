'use client';

import { AnimatePresence, motion } from 'motion/react';

import { type ReactNode } from 'react';

import { pageEnter } from './variants';

interface MotionPageProps {
  children: ReactNode;
  className?: string;
}

export function MotionPage({ children, className }: MotionPageProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={typeof window !== 'undefined' ? window.location.pathname : 'initial'}
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={pageEnter}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export function MotionPageWithTransition({ children, className }: MotionPageProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={typeof window !== 'undefined' ? window.location.pathname : 'initial'}
        variants={{
          hidden: { opacity: 0, y: 10 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } },
          exit: { opacity: 0, y: -6, transition: { duration: 0.16, ease: [0.4, 0, 0.2, 1] } },
        }}
        initial="hidden"
        animate="visible"
        exit="exit"
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
