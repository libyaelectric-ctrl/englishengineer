'use client';

import { type ReactNode } from 'react';
import { motion } from 'motion/react';
import { staggerContainer, staggerItem, staggerChildren, staggerItemFast } from './variants';

interface MotionStaggerProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'fast' | 'container';
  delay?: number;
  staggerDelay?: number;
}

export function MotionStagger({
  children,
  className,
  variant = 'default',
  delay = 0,
  staggerDelay = 0.08,
}: MotionStaggerProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: staggerDelay, delayChildren: delay },
    },
  };

  const itemVariants = variant === 'fast'
    ? staggerItemFast
    : staggerItem;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className={className}>
      {typeof children === 'function'
        ? children({ containerVariants, itemVariants })
        : Array.isArray(children)
          ? children.map((child, index) => (
              <motion.div key={index} variants={itemVariants} custom={index}>
                {child}
              </motion.div>
            ))
          : <motion.div variants={itemVariants}>{children}</motion.div>}
    </motion.div>
  );
}

export function StaggerItem({ children, className, variant = 'default', custom = 0 }: {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'fast';
  custom?: number;
}) {
  const itemVariants = variant === 'fast' ? staggerItemFast : staggerItem;

  return (
    <motion.div variants={itemVariants} custom={custom} className={className}>
      {children}
    </motion.div>
  );
}

export function MotionList({ children, className, staggerDelay = 0.06, delayChildren = 0.08 }: {
  children: ReactNode | ReactNode[];
  className?: string;
  staggerDelay?: number;
  delayChildren?: number;
}) {
  return (
    <motion.ul
      variants={staggerChildren}
      initial="hidden"
      animate="visible"
      custom={{ staggerDelay, delayChildren }}
      className={className}
    >
      {Array.isArray(children) ? children.map((child, i) => (
        <motion.li key={i} variants={listItem} custom={i}>{child}</motion.li>
      )) : children}
    </motion.ul>
  );
}