import { motion } from 'motion/react';
import { HeroPanel } from './HeroPanel';
import { ProgressCockpit } from './ProgressCockpit';
import { SkillRadarChart } from './SkillRadarChart';
import { DailyGoalBar } from './DailyGoalBar';
import { ReviewPriorities } from './ReviewPriorities';

const DashboardPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, easing: [0.16, 1, 0.3, 1] }}
      className="min-h-screen bg-background text-foreground space-y-6"
    >
      {/* Hero Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, easing: [0.25, 1, 0.5, 1] }}
      >
        <HeroPanel
          userName="Engineer"
          greeting="morning"
          summary={{ averageScore: 75, completionPercentage: 45 }}
          competency={{ text: "Intermediate", color: "text-primary" }}
          primaryMission={null}
          focusMeta={{ label: "Grammar", route: "/grammar" }}
          focusSkill={{ cefrBand: "B1" }}
          focusLessonNumber={1}
          onStartLesson={() => {}}
        />
      </motion.div>

      {/* Progress Cockpit */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15, easing: [0.25, 1, 0.5, 1] }}
      >
        <ProgressCockpit />
      </motion.div>

      {/* Skill Radar & Daily Goal */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2, easing: [0.25, 1, 0.5, 1] }}
        >
          <SkillRadarChart />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.25, easing: [0.25, 1, 0.5, 1] }}
        >
          <DailyGoalBar />
        </motion.div>
      </div>

      {/* Review Priorities */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3, easing: [0.25, 1, 0.5, 1] }}
      >
        <ReviewPriorities />
      </motion.div>
    </motion.div>
  );
};

export default DashboardPage;
