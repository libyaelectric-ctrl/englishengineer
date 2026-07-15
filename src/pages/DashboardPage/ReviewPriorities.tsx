import { Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SectionCard } from '@/shared/components/SectionCard';
import { StatusBadge } from '@/shared/components/StatusBadge';

interface ReviewItem {
  id: string;
  label: string;
}

interface ReviewPrioritiesProps {
  reviewPriorities: ReviewItem[];
}

export const ReviewPriorities = ({ reviewPriorities }: ReviewPrioritiesProps) => {
  const navigate = useNavigate();

  return (
    <SectionCard
      title="Needs attention"
      subtitle="The clearest places to improve next"
      icon={Target}
    >
      <div
        data-testid="dashboard-review-summary"
        className="grid gap-3 md:grid-cols-3"
      >
        {reviewPriorities.length === 0 && (
          <p className="text-sm text-muted-copy col-span-3 text-center py-6">
            No weak areas detected. Keep practicing!
          </p>
        )}
        {reviewPriorities.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => navigate('/curriculum#review')}
            className="rounded-card border border-border-soft bg-surface p-4 text-left transition-all hover:border-border-hover hover:bg-surface-hover/20"
          >
            <StatusBadge
              label={index === 0 ? 'Start here' : `Priority ${index + 1}`}
              tone={index === 0 ? 'warning' : 'neutral'}
            />
            <p className="mt-3 text-xs font-bold text-foreground">
              {item.label}
            </p>
          </button>
        ))}
      </div>
    </SectionCard>
  );
};
