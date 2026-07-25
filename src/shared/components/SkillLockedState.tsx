import { Lock } from 'lucide-react';
import { LockProgressBar } from './LockProgressBar';

interface SkillLockedStateProps {
  skillName: string;
  readingDone: number;
  writingDone: number;
  readingThreshold: number;
  writingThreshold: number;
}

export const SkillLockedState = ({
  skillName,
  readingDone,
  writingDone,
  readingThreshold,
  writingThreshold,
}: SkillLockedStateProps) => (
  <div className="min-h-screen bg-background flex items-center justify-center p-6">
    <div className="max-w-md w-full rounded-[4px] border-2 border-primary bg-surface p-8 text-center space-y-4">
      <Lock className="mx-auto h-10 w-10 text-primary" />
      <h2 className="text-lg font-bold text-foreground">{skillName} Locked</h2>
      <p className="text-xs text-muted-copy leading-relaxed">
        Complete {readingThreshold} readings and {writingThreshold} writings to
        unlock {skillName}.
      </p>
      <div className="space-y-2 text-[10px]">
        <LockProgressBar
          label="Reading"
          done={readingDone}
          total={readingThreshold}
        />
        <LockProgressBar
          label="Writing"
          done={writingDone}
          total={writingThreshold}
        />
      </div>
    </div>
  </div>
);
