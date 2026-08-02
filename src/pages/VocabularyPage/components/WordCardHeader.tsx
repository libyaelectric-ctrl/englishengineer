import { Star, Volume2 } from 'lucide-react';

import { useEffect, useState } from 'react';

import { logger } from '@/shared/logger';

import {
  PronunciationService,
  type VocabularyMenuProgress,
  type VocabularyTerm,
  repairVocabularyText,
} from '@/features/vocabulary';

interface WordCardHeaderProps {
  term: VocabularyTerm;
  showAnswer: boolean;
  status: string;
  progress?: VocabularyMenuProgress;
}

export const WordCardHeader = ({ term, showAnswer, status }: WordCardHeaderProps) => {
  const [isStarred, setIsStarred] = useState(false);
  const phonetic = PronunciationService.getPhonetic(term.term) || `/${term.term.toLowerCase()}/`;

  useEffect(() => {
    try {
      const stored = localStorage.getItem('EngVox_favorite_vocab');
      if (stored) {
        const list: string[] = JSON.parse(stored);
        setIsStarred(list.includes(term.id));
      }
    } catch (e) {
      logger.w('[WordCardHeader] Failed to read favorite vocab from localStorage', e);
    }
  }, [term.id]);

  const toggleStar = () => {
    try {
      const stored = localStorage.getItem('EngVox_favorite_vocab');
      let list: string[] = stored ? JSON.parse(stored) : [];
      if (list.includes(term.id)) {
        list = list.filter((id) => id !== term.id);
        setIsStarred(false);
      } else {
        list.push(term.id);
        setIsStarred(true);
      }
      localStorage.setItem('EngVox_favorite_vocab', JSON.stringify(list));
    } catch (e) {
      logger.w('[WordCardHeader] Failed to write favorite vocab to localStorage', e);
    }
  };

  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <div className="flex items-center gap-2">
          <h3 className="text-xl font-bold text-foreground">{repairVocabularyText(term.term)}</h3>
          <button
            type="button"
            onClick={toggleStar}
            className="text-muted-copy hover:text-amber-400 transition-colors cursor-pointer"
            title={isStarred ? 'Remove from favorites' : 'Bookmark to favorites'}
          >
            <Star className={`h-4 w-4 ${isStarred ? 'fill-amber-400 text-amber-400' : ''}`} />
          </button>
        </div>
        <p className="text-[11px] font-mono text-muted-copy font-semibold">{phonetic}</p>
        {showAnswer && (
          <p className="mt-1 font-bold text-primary">{repairVocabularyText(term.turkishMeaning)}</p>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-end gap-1.5">
        <span className="rounded-[4px] border border-primary/25 bg-primary/5 px-2 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wider">
          LVL-<span>{term.cefrLevel}</span>
        </span>
        {status !== 'new' && (
          <span className="rounded-[4px] border border-border-soft bg-surface-hover px-2 py-0.5 text-[10px] font-bold text-muted-copy uppercase tracking-wider">
            {status}
          </span>
        )}
        <div className="flex items-center rounded border border-border-soft bg-surface p-0.5">
          <button
            type="button"
            onClick={() => PronunciationService.speak(term.term)}
            className="flex h-6 px-1.5 items-center gap-1 text-[10px] font-bold text-muted-copy transition-colors hover:text-foreground cursor-pointer"
            title="Listen US Accent"
          >
            <Volume2 className="h-3 w-3 text-primary" />
            <span>US</span>
          </button>
        </div>
      </div>
    </div>
  );
};
