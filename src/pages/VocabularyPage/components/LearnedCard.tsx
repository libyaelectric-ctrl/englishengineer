import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  repairVocabularyText,
  PronunciationService,
  type VocabularyTerm,
} from '@/features/vocabulary';
import { Volume2 } from 'lucide-react';

interface LearnedCardProps {
  term: VocabularyTerm;
  index: number;
}

export function LearnedCard({ term, index }: LearnedCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative"
    >
      <AnimatePresence mode="wait">
        {isHovered ? (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="rounded-[4px] border border-[#0047bb]/25 bg-surface p-4 shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-muted-copy">
                  #{index + 1}
                </span>
                <h4 className="text-lg font-bold text-foreground">
                  {repairVocabularyText(term.term)}
                </h4>
                <p className="text-[10px] text-muted-copy">
                  {term.turkishMeaning}
                </p>
              </div>
              <button
                type="button"
                onClick={() => PronunciationService.speak(term.turkishMeaning)}
                className="flex h-8 w-8 items-center justify-center rounded-[4px] border border-border-soft bg-surface text-muted-copy hover:bg-surface-hover hover:text-foreground cursor-pointer"
                aria-label={`Listen to ${term.term}`}
              >
                <Volume2 className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="compact"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 rounded-[4px] border border-[#0047bb]/15 bg-surface/60 px-3 py-2 hover:border-[#0047bb]/40 hover:bg-surface transition-all cursor-pointer"
          >
            <span className="text-[10px] font-bold text-muted-copy min-w-[24px]">
              #{index + 1}
            </span>
            <span className="text-sm font-semibold text-foreground truncate flex-1">
              {repairVocabularyText(term.term)}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                PronunciationService.speak(term.turkishMeaning);
              }}
              className="flex h-6 w-6 items-center justify-center rounded text-muted-copy hover:text-foreground transition-colors cursor-pointer"
              aria-label={`Listen to ${term.term}`}
            >
              <Volume2 className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
