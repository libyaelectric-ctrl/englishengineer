import { motion } from 'motion/react';
import { ReadingWorkspace } from './ReadingWorkspace';
import { useReadingPage } from './hooks/useReadingPage';

const ReadingPage = () => {
  const pageData = useReadingPage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, easing: [0.16, 1, 0.3, 1] }}
      className="min-h-screen bg-background text-foreground"
    >
      <ReadingWorkspace {...pageData} />
    </motion.div>
  );
};

export default ReadingPage;
