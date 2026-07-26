import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GrammarHeader } from './GrammarHeader';
import { GrammarLessonMap } from './GrammarLessonMap';
import { GrammarLessonContent } from './GrammarLessonContent';
import { GrammarNextStep } from './GrammarNextStep';
import { GrammarReviewQueue } from './GrammarReviewQueue';
import { useGrammarPage } from './hooks/useGrammarPage';

const GrammarPage = () => {
  const {
    level,
    setLevel,
    query,
    setQuery,
    lessons,
    levelCounts,
    selectedLesson,
    setSelectedLesson,
    grammarLearned,
    grammarStruggling,
    onOpenQuiz,
    onOpenStrugglingQuiz,
  } = useGrammarPage();

  const [showReview, setShowReview] = useState(false);

  const filteredLessons = useMemo(() => {
    if (!query) return lessons;
    const q = query.toLowerCase();
    return lessons.filter(
      (l) =>
        l.topic.toLowerCase().includes(q) ||
        l.explanation?.toLowerCase().includes(q)
    );
  }, [lessons, query]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, easing: [0.16, 1, 0.3, 1] }}
      className="min-h-screen bg-background text-foreground"
    >
      <GrammarHeader
        level={level}
        levelCounts={levelCounts}
        query={query}
        setQuery={setQuery}
        grammarLearned={grammarLearned}
        grammarStruggling={grammarStruggling}
        onOpenQuiz={onOpenQuiz}
        onOpenStrugglingQuiz={onOpenStrugglingQuiz}
      />

      <div className="space-y-6">
        {/* Next Step */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1, easing: [0.25, 1, 0.5, 1] }}
        >
          <GrammarNextStep />
        </motion.div>

        {/* Review Queue Toggle */}
        {grammarStruggling > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.15 }}
          >
            <button
              onClick={() => setShowReview(!showReview)}
              className="w-full rounded-[4px] border border-rose-400/30 bg-rose-500/5 p-3 text-left text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
            >
              {showReview ? '▼' : '▶'} Review Queue ({grammarStruggling} struggling
              rules)
            </button>
            <AnimatePresence>
              {showReview && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, easing: [0.25, 1, 0.5, 1] }}
                  className="overflow-hidden"
                >
                  <GrammarReviewQueue />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Lesson Map */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2, easing: [0.25, 1, 0.5, 1] }}
        >
          <GrammarLessonMap
            lessons={filteredLessons}
            selectedLesson={selectedLesson}
            setSelectedLesson={setSelectedLesson}
          />
        </motion.div>

        {/* Lesson Content */}
        <AnimatePresence mode="wait">
          {selectedLesson && (
            <motion.div
              key={selectedLesson.id}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.35, easing: [0.25, 1, 0.5, 1] }}
            >
              <GrammarLessonContent lesson={selectedLesson} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default GrammarPage;
