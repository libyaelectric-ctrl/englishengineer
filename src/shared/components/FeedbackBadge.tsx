import { CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface FeedbackBadgeProps {
  correct: boolean;
}

export function FeedbackBadge({ correct }: FeedbackBadgeProps) {
  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.5, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 15 }}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${
        correct
          ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/20'
          : 'bg-rose-500/15 text-rose-600 border border-rose-500/20'
      }`}
    >
      {correct ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
      <span>{correct ? 'Doğru' : 'Yanlış'}</span>
    </motion.div>
  );
}
