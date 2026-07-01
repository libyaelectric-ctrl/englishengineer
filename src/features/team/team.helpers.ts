import type { TeamMember, TeamProgressSummary } from './team.types';

export const getTeamOverview = (
  members: TeamMember[],
  summaries: TeamProgressSummary[],
  now = new Date()
) => {
  const inactiveCutoff = now.getTime() - 7 * 24 * 60 * 60 * 1000;
  const inactiveMembers = members.filter(
    (member) =>
      !member.lastActiveAt ||
      new Date(member.lastActiveAt).getTime() < inactiveCutoff
  );
  return {
    activeLearners: members.length - inactiveMembers.length,
    inactiveLearners: inactiveMembers.length,
    averageProgress:
      summaries.length === 0
        ? 0
        : Math.round(
            summaries.reduce((sum, item) => sum + item.overallProgress, 0) /
              summaries.length
          ),
    completedTasks: summaries.reduce(
      (sum, item) => sum + item.completedTasks,
      0
    ),
  };
};

export const getMemberSummary = (
  memberId: string,
  summaries: TeamProgressSummary[]
): TeamProgressSummary | null =>
  summaries.find((summary) => summary.memberId === memberId) ?? null;
