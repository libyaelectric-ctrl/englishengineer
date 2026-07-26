/**
 * EngineerOS Motion System
 * Consistent, performant animations across all pages
 */

import type { Variants, Transition } from 'motion/react';

// ═══════════════════════════════════════════════════════════════
// EASING — Exponential deceleration for natural feel
// ═══════════════════════════════════════════════════════════════

export const easing = {
  outQuart: [0.25, 1, 0.5, 1] as const,
  outQuint: [0.22, 1, 0.36, 1] as const,
  outExpo: [0.16, 1, 0.3, 1] as const,
  inOutQuart: [0.76, 0, 0.24, 1] as const,
} as const;

// ═══════════════════════════════════════════════════════════════
// TRANSITIONS — Reusable timing configs
// ═══════════════════════════════════════════════════════════════

export const transitions = {
  fast: { duration: 0.2, easing: easing.outQuart },
  normal: { duration: 0.35, easing: easing.outQuart },
  slow: { duration: 0.5, easing: easing.outQuint },
  page: { duration: 0.45, easing: easing.outExpo },
  spring: { type: 'spring' as const, stiffness: 300, damping: 30 },
  springGentle: { type: 'spring' as const, stiffness: 200, damping: 25 },
} satisfies Record<string, Transition>;

// ═══════════════════════════════════════════════════════════════
// FADE VARIANTS
// ═══════════════════════════════════════════════════════════════

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: transitions.normal },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: transitions.normal },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -16 },
  visible: { opacity: 1, y: 0, transition: transitions.normal },
};

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -24 },
  visible: { opacity: 1, x: 0, transition: transitions.normal },
};

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: { opacity: 1, x: 0, transition: transitions.normal },
};

// ═══════════════════════════════════════════════════════════════
// SCALE VARIANTS
// ═══════════════════════════════════════════════════════════════

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: transitions.normal },
};

export const scaleInBounce: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: { opacity: 1, scale: 1, transition: transitions.spring },
};

// ═══════════════════════════════════════════════════════════════
// STAGGER CONTAINERS
// ═══════════════════════════════════════════════════════════════

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

export const staggerContainerSlow: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.15,
    },
  },
};

export const staggerGrid: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.05,
    },
  },
};

// ═══════════════════════════════════════════════════════════════
// STAGGER ITEMS (used inside stagger containers)
// ═══════════════════════════════════════════════════════════════

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: transitions.normal },
};

export const staggerItemScale: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: transitions.normal },
};

export const staggerItemLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: transitions.normal },
};

// ═══════════════════════════════════════════════════════════════
// PAGE TRANSITION
// ═══════════════════════════════════════════════════════════════

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: transitions.page },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2, easing: easing.outQuart } },
};

// ═══════════════════════════════════════════════════════════════
// HOVER / TAP INTERACTIONS
// ═══════════════════════════════════════════════════════════════

export const hoverLift = {
  whileHover: { y: -3, transition: transitions.fast },
  whileTap: { scale: 0.98, transition: transitions.fast },
};

export const hoverScale = {
  whileHover: { scale: 1.03, transition: transitions.fast },
  whileTap: { scale: 0.97, transition: transitions.fast },
};

export const hoverGlow = {
  whileHover: {
    boxShadow: '0 8px 32px rgba(0, 102, 255, 0.15)',
    transition: transitions.fast,
  },
};

// ═══════════════════════════════════════════════════════════════
// COUNTER / NUMBER ANIMATIONS
// ═══════════════════════════════════════════════════════════════

export const counterVariants: Variants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { ...transitions.spring, delay: 0.2 },
  },
};

// ═══════════════════════════════════════════════════════════════
// SLIDE PANELS (sidebars, drawers)
// ═══════════════════════════════════════════════════════════════

export const slideInLeft: Variants = {
  hidden: { x: '-100%', opacity: 0 },
  visible: { x: 0, opacity: 1, transition: transitions.page },
  exit: { x: '-100%', opacity: 0, transition: { duration: 0.25 } },
};

export const slideInRight: Variants = {
  hidden: { x: '100%', opacity: 0 },
  visible: { x: 0, opacity: 1, transition: transitions.page },
  exit: { x: '100%', opacity: 0, transition: { duration: 0.25 } },
};

// ═══════════════════════════════════════════════════════════════
// PROGRESS BAR ANIMATION
// ═══════════════════════════════════════════════════════════════

export const progressBar: Variants = {
  hidden: { scaleX: 0 },
  visible: (value: number) => ({
    scaleX: value / 100,
    transition: { duration: 0.8, easing: easing.outQuint, delay: 0.3 },
  }),
};

// ═══════════════════════════════════════════════════════════════
// UTILITY: Motion wrapper props for common patterns
// ═══════════════════════════════════════════════════════════════

export const pageProps = {
  initial: 'initial',
  animate: 'animate',
  exit: 'exit',
  variants: pageTransition,
};

export const staggerProps = {
  initial: 'hidden',
  animate: 'visible',
  variants: staggerContainer,
};

export const staggerSlowProps = {
  initial: 'hidden',
  animate: 'visible',
  variants: staggerContainerSlow,
};
