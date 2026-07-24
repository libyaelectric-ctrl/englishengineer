import { Lock } from 'lucide-react';

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
    <div className="max-w-md w-full rounded-[4px] border-2 border-[#0047bb] bg-surface p-8 text-center space-y-4">
      <Lock className="mx-auto h-10 w-10 text-[#0047bb]" />
      <h2 className="text-lg font-bold text-foreground">{skillName} Locked</h2>
      <p className="text-xs text-muted-copy leading-relaxed">
        Complete {readingThreshold} readings and {writingThreshold} writings to
        unlock {skillName}.
      </p>
      <div className="space-y-2 text-[10px]">
        <ProgressBar
          label="Reading"
          done={readingDone}
          total={readingThreshold}
        />
        <ProgressBar
          label="Writing"
          done={writingDone}
          total={writingThreshold}
        />
      </div>
    </div>
  </div>
);

const ProgressBar = ({
  label,
  done,
  total,
}: {
  label: string;
  done: number;
  total: number;
}) => (
  <>
    <div className="flex justify-between text-muted-copy">
      <span>{label}</span>
      <span className="font-bold text-foreground">
        {done}/{total}
      </span>
    </div>
    <div className="h-1.5 rounded-full bg-border-soft overflow-hidden">
      <div
        className="h-full bg-[#0047bb]"
        style={{ width: `${Math.min((done / total) * 100, 100)}%` }}
      />
    </div>
  </>
);
