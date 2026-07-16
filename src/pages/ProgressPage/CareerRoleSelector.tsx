import { CAREER_ROLES } from '@/features/learning-intelligence';
import { Card } from '@/shared/components/Card';

export const CareerRoleSelector = ({
  careerRole,
  onRoleChange,
}: {
  careerRole: string;
  onRoleChange: (role: string) => void;
}) => (
  <Card hoverEffect={false}>
    <label
      className="block text-sm font-medium text-foreground"
      htmlFor="career-role"
    >
      Career goal
    </label>
    <p className="mt-1 text-sm text-muted-copy">
      Your role changes task order, not scoring or learning history.
    </p>
    <select
      id="career-role"
      value={careerRole}
      onChange={(event) => onRoleChange(event.target.value)}
      className="mt-4 min-h-11 w-full rounded-lg border border-border-soft bg-surface px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 md:max-w-md"
    >
      {CAREER_ROLES.map((role) => (
        <option key={role}>{role}</option>
      ))}
    </select>
  </Card>
);
