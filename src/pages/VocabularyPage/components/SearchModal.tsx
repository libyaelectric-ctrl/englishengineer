import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X } from 'lucide-react';
import type { VocabularyTerm } from '@/features/vocabulary';

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

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void onSearch(searchInput);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-20 px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-lg rounded-[8px] border border-border-soft bg-surface shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border-soft px-4 py-3">
              <h3 className="text-sm font-bold text-foreground">Search Vocabulary</h3>
              <button
                type="button"
                onClick={onClose}
                className="flex h-7 w-7 items-center justify-center rounded-[4px] text-muted-copy hover:text-foreground hover:bg-surface-hover cursor-pointer"
                aria-label="Close search"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Search input */}
            <form onSubmit={handleSubmit} className="p-4">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-copy" />
                <input
                  ref={inputRef}
                  value={searchInput}
                  onChange={(e) => onSearchInputChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      void onSearch(searchInput);
                    }
                  }}
                  className="w-full rounded-[4px] border border-border-soft bg-background pl-10 pr-4 py-3 text-sm text-foreground outline-none focus:border-[#0047bb]"
                  placeholder="Type a word to search..."
                  aria-label="Search vocabulary"
                />
              </div>
            </form>

            {/* Results */}
            {hasSearched && (
              <div className="border-t border-border-soft px-4 pb-4">
                {searchResults && searchResults.length > 0 ? (
                  <div className="mt-3 space-y-1 max-h-80 overflow-y-auto">
                    <p className="text-[10px] text-muted-copy mb-2">
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
                          <span className="ml-2 text-xs text-muted-copy">{term.turkishMeaning}</span>
                        </div>
                        <span className="text-[10px] text-muted-copy">{term.cefrLevel}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-xs text-muted-copy text-center">
                    No results found for "{searchInput}"
                  </p>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
