import { Card } from '@/shared/components/Card';

type Assessment = {
  confidenceExplanation: string;
  strongestDimensions: Array<{ label: string }>;
  weakestDimensions: Array<{ label: string }>;
  recommendedNextMissions: string[];
  certificateDisclaimer: string;
};

export const AssessmentExplanation = ({
  assessment,
}: {
  assessment: Assessment;
}) => (
  <Card className="space-y-4 p-5 shadow-sm" hoverEffect={false}>
    <h2 className="text-xl font-bold text-foreground">
      Assessment explanation
    </h2>
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <div className="rounded-[4px] border border-[#d9d9e3] bg-white p-4 shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-copy">
          Why this score
        </p>
        <p className="mt-2 text-sm font-medium text-foreground">
          {assessment.confidenceExplanation}
        </p>
      </div>
      <div className="rounded-[4px] border border-[#d9d9e3] bg-white p-4 shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-copy">
          What improved
        </p>
        <p className="mt-2 text-sm font-medium text-foreground">
          {assessment.strongestDimensions[0]?.label ??
            'Not enough assessment data yet.'}
        </p>
      </div>
      <div className="rounded-[4px] border border-[#d9d9e3] bg-white p-4 shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-copy">
          What is weak
        </p>
        <p className="mt-2 text-sm font-medium text-foreground">
          {assessment.weakestDimensions[0]?.label ??
            'Not enough assessment data yet.'}
        </p>
      </div>
      <div className="rounded-[4px] border border-[#d9d9e3] bg-white p-4 shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-copy">
          What to do next
        </p>
        <p className="mt-2 text-sm font-medium text-foreground">
          {assessment.recommendedNextMissions[0] ??
            'Complete one assessed mission in each core skill.'}
        </p>
      </div>
    </div>
    <p className="text-xs text-muted-copy font-medium">
      {assessment.certificateDisclaimer}
    </p>
  </Card>
);
