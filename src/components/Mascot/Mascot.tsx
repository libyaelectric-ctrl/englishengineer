import { motion } from 'framer-motion';

interface MascotProps {
  size?: number;
  className?: string;
}

export const Mascot = ({ size = 80, className = '' }: MascotProps) => {
  return (
    <motion.img
      src="/brand/mascot.webp"
      alt="EngVox Mascot"
      className={`cursor-pointer drop-shadow-lg ${className}`}
      style={{ width: size, height: size }}
      animate={{
        y: [0, -12, -4, -14, -2, 0],
        x: [0, 3, -2, 4, -1, 0],
        rotate: [0, 2, -1, 3, -2, 0],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      whileHover={{ scale: 1.15, rotate: 15 }}
      whileTap={{ scale: 0.9 }}
    />
  );
};
