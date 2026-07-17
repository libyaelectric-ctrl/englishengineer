import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import { useLearningStore } from '@/core/learning';
import { useAuthStore } from '@/features/auth';
import {
  GamificationService,
  useGamificationStore,
} from '@/features/gamification';
import { canAccessFeature, useBillingStore } from '@/features/billing';
import { AssessmentService } from '@/features/assessment';
import { buildLevelProfile } from '@/features/level-system';
import {
  buildSevenDayReport,
  getPersonalizedTasks,
  useLearningIntelligenceStore,
} from '@/features/learning-intelligence';
import { SectionCard } from '@/shared/components/SectionCard';
import { Button } from '@/shared/components/Button';

import { DailyClaimBanner } from './DailyClaimBanner';
import { GamificationMetrics } from './GamificationMetrics';
import { GamificationContent } from './GamificationContent';
import { CareerRoleSelector } from './CareerRoleSelector';
import { TaskGrid } from './TaskGrid';
import { MistakeLog } from './MistakeLog';
import { ProgressReport } from './ProgressReport';
import { AssessmentExplanation } from './AssessmentExplanation';

export const ProgressNextStepsTab = () => {
  const navigate = useNavigate();
  const learning = useLearningStore();
  const subscription = useBillingStore((state) => state.subscription);
  const persistedGamification = useGamificationStore();
  const claimDailyLoginReward = useGamificationStore(
    (state) => state.claimDailyLoginReward
  );
  const gamification = GamificationService.getSummary(
    learning,
    persistedGamification
  );
  const unlockedAchievements = learning.achievements.filter(
    (achievement) => achievement.unlocked
  ).length;
  const fullGamificationEntitlement = canAccessFeature(
    subscription,
    'fullGamification'
  );

  const intelligence = useLearningIntelligenceStore();
  const currentUser = useAuthStore((state) => state.currentUser);
  const assessment = AssessmentService.getProfile(learning);
  const levelProfile = buildLevelProfile(learning, currentUser?.id);
  const weakArea = assessment.weakestDimensions[0]?.label ?? 'Writing';
  const tasks = useMemo(
    () =>
      getPersonalizedTasks(
        intelligence.careerRole,
        levelProfile.overallLevel,
        weakArea,
        intelligence.mistakeLog,
        intelligence.completedTaskDates
      ),
    [
      intelligence.careerRole,
      intelligence.completedTaskDates,
      intelligence.mistakeLog,
      levelProfile.overallLevel,
      weakArea,
    ]
  );
  const report = useMemo(
    () =>
      buildSevenDayReport(
        learning,
        assessment,
        intelligence.completedTaskDates,
        intelligence.mistakeLog,
        intelligence.careerRole,
        levelProfile.overallLevel
      ),
    [
      assessment,
      intelligence.completedTaskDates,
      intelligence.mistakeLog,
      intelligence.careerRole,
      levelProfile.overallLevel,
      learning,
    ]
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <DailyClaimBanner onClaim={claimDailyLoginReward} />

      <GamificationMetrics
        gamification={gamification}
        unlockedAchievements={unlockedAchievements}
        totalAchievements={learning.achievements.length}
      />

      {!fullGamificationEntitlement.allowed && (
        <SectionCard
          title="Full Gamification Locked"
          subtitle="Upgrade to unlock mission chains, full rewards, bonuses, and long-term challenge progression."
          icon={Trophy}
        >
          <div className="rounded-[4px] border border-warning/20 bg-warning/5 p-5 shadow-sm">
            <p className="text-sm text-warning font-bold uppercase tracking-wider">
              {fullGamificationEntitlement.reason}
            </p>
            <Button
              onClick={() => navigate('/profile')}
              className="mt-4 h-10 bg-[#0047bb] hover:bg-[#0047bb]/90 border border-[#0047bb] text-white font-bold uppercase tracking-wider text-[10px] rounded-[4px] px-4 cursor-pointer shadow-sm"
            >
              Upgrade to Pro
            </Button>
          </div>
        </SectionCard>
      )}

      {fullGamificationEntitlement.allowed && (
        <GamificationContent learningState={learning} />
      )}

      <div className="border-t border-border-soft pt-8">
        <h2 className="text-xl font-bold text-foreground mb-1">
          Learning Intelligence
        </h2>
        <p className="text-xs text-muted-copy mb-6">
          Role-based daily practice, repeated-mistake tracking and
          evidence-based weekly guidance.
        </p>
      </div>

      <CareerRoleSelector
        careerRole={intelligence.careerRole}
        onRoleChange={(role) =>
          intelligence.setCareerRole(role as typeof intelligence.careerRole)
        }
      />

      <TaskGrid
        tasks={tasks}
        completedTaskDates={intelligence.completedTaskDates}
        toggleTask={intelligence.toggleTask}
        careerRole={intelligence.careerRole}
      />

      <div className="grid gap-5 xl:grid-cols-2">
        <MistakeLog
          mistakeLog={intelligence.mistakeLog}
          addMistake={intelligence.addMistake}
          removeMistake={intelligence.removeMistake}
        />

        <ProgressReport
          report={report}
          markReportGenerated={intelligence.markReportGenerated}
        />
      </div>

      <AssessmentExplanation assessment={assessment} />
    </div>
  );
};
