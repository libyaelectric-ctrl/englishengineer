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
      animate={{ y: [0, -15, 0] }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      whileHover={{ rotate: 20, scale: 1.1 }}
      whileTap={{ scale: 0.85 }}
    />
  );
};
