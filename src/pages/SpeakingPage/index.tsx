import { motion } from 'motion/react';
import { MissionSelector } from './components/MissionSelector';
import { VoicePracticePanel } from './components/VoicePracticePanel';
import { useSpeakingPage } from './hooks/useSpeakingPage';

const SpeakingPage = () => {
  const {
    activeTab,
    ...pageData
  } = useSpeakingPage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, easing: [0.16, 1, 0.3, 1] }}
      className="min-h-screen bg-background text-foreground"
    >
      {activeTab === 'missions' ? (
        <MissionSelector {...pageData} />
      ) : (
        <VoicePracticePanel {...pageData} />
      )}
    </motion.div>
  );
};

export default SpeakingPage;
