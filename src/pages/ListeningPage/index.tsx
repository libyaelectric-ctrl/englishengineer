import { motion } from 'motion/react';
import { ListenerView } from './components/ListenerView';

const ListeningPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, easing: [0.16, 1, 0.3, 1] }}
      className="min-h-screen bg-background text-foreground"
    >
      <ListenerView
        title="Listening Practice"
        transcript=""
      />
    </motion.div>
  );
};

export default ListeningPage;
