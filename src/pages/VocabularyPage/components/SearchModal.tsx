import { Search, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

import { useEffect, useRef } from 'react';

import { useLocalizationStore } from '@/features/localization';
import type { VocabularyTerm } from '@/features/vocabulary';
import { repairVocabularyText } from '@/features/vocabulary';
import { useTermMeaningResolver } from '@/features/vocabulary/services/translation/vocabulary-translation.hook';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string) => Promise<void>;
  searchInput: string;
  onSearchInputChange: (input: string) => void;
  searchResults?: VocabularyTerm[];
  hasSearched?: boolean;
  onSelectResult?: (term: VocabularyTerm) => void;
}

export function SearchModal({
  isOpen,
  onClose,
  onSearch,
  searchInput,
  onSearchInputChange,
  searchResults,
  hasSearched,
  onSelectResult,
}: SearchModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const language = useLocalizationStore((s) => s.language);
  const resolveMeaning = useTermMeaningResolver(language);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, [isOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    void onSearch(searchInput.trim());
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-lg rounded-[var(--radius-card)] border border-border-soft bg-surface p-5 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-border-soft pb-3">
            <h3 className="text-sm font-bold text-foreground">Search Vocabulary</h3>
            <button
              type="button"
              onClick={onClose}
              className="text-muted-copy hover:text-foreground cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSearch} className="mt-4">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={searchInput}
                onChange={(e) => onSearchInputChange(e.target.value)}
                placeholder="Type a word in English or your language..."
                className="w-full rounded-md border border-border-soft bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                autoFocus
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded bg-primary px-2.5 py-1 text-xs font-bold text-white cursor-pointer"
              >
                <Search className="h-3.5 w-3.5" />
              </button>
            </div>
          </form>

          {hasSearched && (
            <div className="mt-4 max-h-60 overflow-y-auto">
              {searchResults && searchResults.length > 0 ? (
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-muted-copy uppercase tracking-wider mb-2">
                    {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
                  </p>
                  {searchResults.map((term) => (
                    <button
                      key={term.id}
                      type="button"
                      onClick={() => {
                        onSelectResult?.(term);
                        onClose();
                      }}
                      className="w-full flex items-center justify-between rounded-[4px] px-3 py-2 text-left hover:bg-surface-hover transition-colors cursor-pointer"
                    >
                      <div>
                        <span className="text-sm font-semibold text-foreground">{term.term}</span>
                        <span className="ml-2 text-xs text-muted-copy">
                          {repairVocabularyText(resolveMeaning(term.term, term))}
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-copy">{term.cefrLevel}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-xs text-muted-copy text-center">
                  No results found for &quot;{searchInput}&quot;
                </p>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
