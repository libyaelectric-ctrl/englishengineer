import { motion } from 'motion/react';
import { MissionListTab } from './components/MissionListTab';
import { WorkspaceTab } from './components/WorkspaceTab';
import { useWritingPage } from './hooks/useWritingPage';

const WritingPage = () => {
  const {
    activeTab,
    ...pageData
  } = useWritingPage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, easing: [0.16, 1, 0.3, 1] }}
      className="min-h-screen bg-background text-foreground"
    >
      {activeTab === 'missions' ? (
        <MissionListTab {...pageData} />
      ) : (
        <WorkspaceTab {...pageData} />
      )}
    </motion.div>
  );
};

export default WritingPage;
