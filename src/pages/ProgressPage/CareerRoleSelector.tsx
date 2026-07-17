import { CAREER_ROLES } from '@/features/learning-intelligence';
import { Card } from '@/shared/components/Card';

export const CareerRoleSelector = ({
  careerRole,
  onRoleChange,
}: {
  careerRole: string;
  onRoleChange: (role: string) => void;
}) => (
  <Card hoverEffect={false} className="p-5">
    <label
      className="block text-[10px] font-bold uppercase tracking-wider text-foreground"
      htmlFor="career-role"
    >
      Career goal
    </label>
    <p className="mt-1 text-xs text-muted-copy font-medium">
      Your role changes task order, not scoring or learning history.
    </p>
    <select
      id="career-role"
      value={careerRole}
      onChange={(event) => onRoleChange(event.target.value)}
      className="mt-4 min-h-10 w-full rounded-[4px] border border-[#d9d9e3] bg-white px-3 text-xs text-foreground outline-none focus:border-[#0047bb] focus:ring-2 focus:ring-[#0047bb]/20 md:max-w-md cursor-pointer font-bold uppercase tracking-wider shadow-sm"
    >
      {CAREER_ROLES.map((role) => (
        <option key={role}>{role}</option>
      ))}
    </select>
  </Card>
);
