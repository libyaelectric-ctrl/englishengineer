import { Layers } from 'lucide-react';
import { SectionCard } from '@/shared/components/SectionCard';
import { ProgressBar } from '@/shared/components/ProgressBar';

interface DraftQualityIndicatorsProps {
  getReadabilityScore: () => number;
  technicalDensity: number;
}

export const DraftQualityIndicators = ({ getReadabilityScore, technicalDensity }: DraftQualityIndicatorsProps) => (
  <SectionCard title="Draft Quality Indicators" subtitle="Active textual metrics" icon={Layers}>
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="flex justify-between text-xs font-mono text-muted-copy font-bold">
          <span>CLARITY SCORE</span>
          <span>{getReadabilityScore()}%</span>
        </div>
        <ProgressBar value={getReadabilityScore()} color="primary" />
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-xs font-mono text-muted-copy font-bold">
          <span>TECHNICAL DENSITY</span>
          <span>{technicalDensity}%</span>
        </div>
        <ProgressBar value={technicalDensity} color="cyan" />
      </div>
    </div>
  </SectionCard>
);
