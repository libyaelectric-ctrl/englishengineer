import { type Variants } from 'motion/react';
import { durations, easings } from './tokens';

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: durations.fast, ease: easings['ease-out'] },
  },
};

export const fadeOut: Variants = {
  visible: { opacity: 1 },
  hidden: {
    opacity: 0,
    transition: { duration: durations.fast, ease: easings['ease-in-out'] },
  },
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: durations.base, ease: easings['ease-out-expo'] },
  },
};

export const fadeDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: durations.base, ease: easings['ease-out-expo'] },
  },
};

export const fadeLeft: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: durations.base, ease: easings['ease-out-expo'] },
  },
};

export const fadeRight: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: durations.base, ease: easings['ease-out-expo'] },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: durations.fast, ease: easings['spring-soft'] },
  },
};

export const scaleOut: Variants = {
  visible: { opacity: 1, scale: 1 },
  hidden: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: durations.fast, ease: easings['spring-snappy'] },
  },
};

export const slideUp: Variants = {
  hidden: { opacity: 0, y: '100%' },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: durations.base, ease: easings['ease-out-expo'] },
  },
};

export const slideDown: Variants = {
  hidden: { opacity: 0, y: '-100%' },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: durations.base, ease: easings['ease-out-expo'] },
  },
};

export const slideLeft: Variants = {
  hidden: { opacity: 0, x: '100%' },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: durations.base, ease: easings['ease-out-expo'] },
  },
};

export const slideRight: Variants = {
  hidden: { opacity: 0, x: '-100%' },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: durations.base, ease: easings['ease-out-expo'] },
  },
};

export const pageEnter: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
  },
};

export const pageExit: Variants = {
  visible: { opacity: 1, y: 0 },
  hidden: {
    opacity: 0,
    y: -6,
    transition: { duration: 0.16, ease: [0.4, 0, 0.2, 1] },
  },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
};

export const listItem: Variants = {
  hidden: { opacity: 0, x: -12 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
  },
};

export const cardHover: Variants = {
  rest: { y: 0, scale: 1, boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' },
  hover: {
    y: -4,
    scale: 1.01,
    boxShadow: '0 12px 24px -10px rgb(0 0 0 / 0.3)',
    transition: { duration: durations.fast, ease: easings['spring-soft'] },
  },
  tap: {
    scale: 0.98,
    transition: { duration: durations.instant, ease: easings['spring-snappy'] },
  },
};

export const buttonHover: Variants = {
  rest: { scale: 1 },
  hover: { scale: 1.02, transition: { duration: durations.fast, ease: easings['spring-soft'] } },
  tap: { scale: 0.97, transition: { duration: durations.instant, ease: easings['spring-snappy'] } },
};

export const iconHover: Variants = {
  rest: { scale: 1, rotate: 0 },
  hover: { scale: 1.1, rotate: 3, transition: { duration: durations.fast, ease: easings['spring-soft'] } },
  tap: { scale: 0.9, transition: { duration: durations.instant, ease: easings['spring-snappy'] } },
};

export const chipHover: Variants = {
  rest: { scale: 1 },
  hover: { scale: 1.04, transition: { duration: durations.fast, ease: easings['spring-soft'] } },
  tap: { scale: 0.95, transition: { duration: durations.instant, ease: easings['spring-snappy'] } },
};

export const toastEnter: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: durations.base, ease: easings['spring-soft'] },
  },
};

export const toastExit: Variants = {
  visible: { opacity: 1, y: 0 },
  hidden: {
    opacity: 0,
    y: -20,
    scale: 0.95,
    transition: { duration: durations.fast, ease: easings['spring-snappy'] },
  },
};

export const modalBackdrop: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: durations.fast } },
  exit: { opacity: 0, transition: { duration: durations.fast } },
};

export const modalContent: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: durations.base, ease: easings['spring-soft'] },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: { duration: durations.fast, ease: easings['spring-snappy'] },
  },
};

export const accordionOpen: Variants = {
  closed: { height: 0, opacity: 0 },
  open: {
    height: 'auto',
    opacity: 1,
    transition: { duration: durations.base, ease: easings['ease-in-out'] },
  },
};

export const accordionItem: Variants = {
  closed: { opacity: 0, y: -8 },
  open: {
    opacity: 1,
    y: 0,
    transition: { duration: durations.fast, ease: easings['ease-out'] },
  },
};

export const tabIndicator: Variants = {
  initial: { x: 0, width: 0 },
  animate: (custom: number) => ({
    x: custom * 80,
    width: 60,
    transition: { duration: durations.base, ease: easings['spring-soft'] },
  }),
};

export const countUp: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const shimmer: Variants = {
  hidden: { backgroundPosition: '200% 0' },
  visible: {
    backgroundPosition: '-200% 0',
    transition: { duration: 1.5, ease: 'linear', repeat: Infinity },
  },
};

export const glowPulse: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 3,
      ease: 'easeInOut',
      repeat: Infinity,
      repeatType: 'mirror',
    },
  },
};

export const activeCapsule: Variants = {
  initial: { x: 0, width: 0, opacity: 0 },
  animate: { opacity: 1, transition: { duration: durations.base, ease: easings['spring-soft'] } },
};

export const staggerChildren: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
};

export const staggerItemFast: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
};