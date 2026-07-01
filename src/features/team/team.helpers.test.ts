import { describe, expect, it } from 'vitest';
import { DEMO_TEAM_WORKSPACE } from './team.data';
import { getMemberSummary, getTeamOverview } from './team.helpers';

describe('team helpers', () => {
  it('derives team summaries without exposing raw learning attempts', () => {
    const result = getTeamOverview(
      DEMO_TEAM_WORKSPACE.members,
      DEMO_TEAM_WORKSPACE.summaries,
      new Date('2026-06-30T12:00:00.000Z')
    );
    expect(result).toMatchObject({ averageProgress: 54, completedTasks: 73 });
  });

  it('returns only the requested member summary', () => {
    expect(
      getMemberSummary('demo-member-2', DEMO_TEAM_WORKSPACE.summaries)?.memberId
    ).toBe('demo-member-2');
  });
});
