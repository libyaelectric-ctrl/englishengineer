import { useMemo, type FC } from 'react';
import { Link } from 'react-router-dom';
import { Clock, ChevronRight, Users } from 'lucide-react';
import { SectionCard } from '@/shared/components/SectionCard';
import { ProgressBar } from '@/shared/components/ProgressBar';
import { StatusBadge } from '@/shared/components/StatusBadge';
import type { TeamMember, TeamProgressSummary } from '../team.types';
import type { OrganizationRole } from '../team.types';

interface TeamMemberListProps {
  members: TeamMember[];
  summaries: TeamProgressSummary[];
}

const roleLabel: Record<OrganizationRole, string> = {
  admin: 'Admin',
  manager: 'Manager',
  learner: 'Learner',
};

const roleTone: Record<OrganizationRole, 'info' | 'success' | 'neutral'> = {
  admin: 'info',
  manager: 'success',
  learner: 'neutral',
};

function formatLastActive(lastActiveAt: string | null): string {
  if (!lastActiveAt) return 'Never';
  const date = new Date(lastActiveAt);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(name: string): string {
  const colors = [
    'bg-primary/20 text-primary',
    'bg-success/20 text-success',
    'bg-warning/20 text-warning',
    'bg-error/20 text-error',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export const TeamMemberList: FC<TeamMemberListProps> = ({
  members,
  summaries,
}) => {
  const memberRows = useMemo(
    () =>
      members.map((member) => {
        const summary = summaries.find((s) => s.memberId === member.id);
        return { member, summary };
      }),
    [members, summaries]
  );

  return (
    <SectionCard
      title="Team Members"
      subtitle={`${members.length} member${members.length !== 1 ? 's' : ''} in workspace`}
      icon={Users}
    >
      <div className="space-y-2">
        {memberRows.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-copy">
            No team members yet.
          </p>
        ) : (
          memberRows.map(({ member, summary }) => (
            <Link
              key={member.id}
              to={`/team/members/${member.id}`}
              className="group flex items-center gap-4 rounded-lg border border-border-soft p-4 transition-colors hover:border-primary/30 hover:bg-primary/5"
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${getAvatarColor(member.displayName)}`}
              >
                {getInitials(member.displayName)}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium text-foreground">
                    {member.displayName}
                  </span>
                  <StatusBadge label={roleLabel[member.role]} tone={roleTone[member.role]} />
                </div>
                <p className="mt-0.5 text-xs text-muted-copy">
                  {member.discipline}
                </p>
              </div>

              <div className="hidden w-40 sm:block">
                {summary ? (
                  <ProgressBar
                    value={summary.overallProgress}
                    color={
                      summary.overallProgress >= 70
                        ? 'success'
                        : summary.overallProgress >= 40
                          ? 'primary'
                          : 'warning'
                    }
                    showValue
                  />
                ) : (
                  <p className="text-xs text-muted-copy">No data</p>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-copy">
                <Clock className="h-3 w-3" />
                {formatLastActive(member.lastActiveAt)}
              </div>

              <ChevronRight className="h-4 w-4 text-muted-copy opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          ))
        )}
      </div>
    </SectionCard>
  );
};
