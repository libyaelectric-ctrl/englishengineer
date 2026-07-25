import { ApiError } from './errors.js';
import { logger } from './logger.js';

interface Team {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  memberCount: number;
  plan: 'free' | 'pro' | 'enterprise';
}

interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  email: string;
  displayName: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
  lastActiveAt: string;
}

interface CreateTeamInput {
  name: string;
  ownerId: string;
}

interface UpdateTeamInput {
  name?: string;
  plan?: 'free' | 'pro' | 'enterprise';
}

interface InviteMemberInput {
  teamId: string;
  email: string;
  role: 'admin' | 'member';
  invitedBy: string;
}

// In-memory store (would be database in production)
const teams = new Map<string, Team>();
const members = new Map<string, TeamMember[]>();
const invitations = new Map<string, { email: string; teamId: string; role: string; invitedBy: string; createdAt: string }>();

/**
 * Team management service.
 * Handles team CRUD, member management, and invitations.
 */
export class TeamService {
  /**
   * Creates a new team.
   */
  async createTeam(input: CreateTeamInput): Promise<Team> {
    const team: Team = {
      id: `team_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      name: input.name,
      ownerId: input.ownerId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      memberCount: 1,
      plan: 'free',
    };

    teams.set(team.id, team);

    // Add owner as first member
    const ownerMember: TeamMember = {
      id: `member_${Date.now()}`,
      teamId: team.id,
      userId: input.ownerId,
      email: '',
      displayName: 'Owner',
      role: 'owner',
      joinedAt: team.createdAt,
      lastActiveAt: team.createdAt,
    };

    members.set(team.id, [ownerMember]);

    logger.i('Team created', { teamId: team.id, name: team.name });
    return team;
  }

  /**
   * Gets a team by ID.
   */
  async getTeam(teamId: string): Promise<Team | null> {
    return teams.get(teamId) || null;
  }

  /**
   * Updates a team.
   */
  async updateTeam(
    teamId: string,
    input: UpdateTeamInput,
    userId: string
  ): Promise<Team> {
    const team = teams.get(teamId);
    if (!team) {
      throw new ApiError(404, 'TEAM_NOT_FOUND', 'Team not found.');
    }

    if (team.ownerId !== userId) {
      throw new ApiError(403, 'FORBIDDEN', 'Only team owner can update team.');
    }

    const updated: Team = {
      ...team,
      ...input,
      updatedAt: new Date().toISOString(),
    };

    teams.set(teamId, updated);
    return updated;
  }

  /**
   * Deletes a team.
   */
  async deleteTeam(teamId: string, userId: string): Promise<void> {
    const team = teams.get(teamId);
    if (!team) {
      throw new ApiError(404, 'TEAM_NOT_FOUND', 'Team not found.');
    }

    if (team.ownerId !== userId) {
      throw new ApiError(403, 'FORBIDDEN', 'Only team owner can delete team.');
    }

    teams.delete(teamId);
    members.delete(teamId);
    logger.i('Team deleted', { teamId });
  }

  /**
   * Gets team members.
   */
  async getMembers(teamId: string): Promise<TeamMember[]> {
    return members.get(teamId) || [];
  }

  /**
   * Invites a member to the team.
   */
  async inviteMember(input: InviteMemberInput): Promise<{ invitationId: string }> {
    const team = teams.get(input.teamId);
    if (!team) {
      throw new ApiError(404, 'TEAM_NOT_FOUND', 'Team not found.');
    }

    // Check if user is already a member
    const existingMembers = members.get(input.teamId) || [];
    if (existingMembers.some((m) => m.email === input.email)) {
      throw new ApiError(409, 'ALREADY_MEMBER', 'User is already a team member.');
    }

    const invitationId = `inv_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    invitations.set(invitationId, {
      email: input.email,
      teamId: input.teamId,
      role: input.role,
      invitedBy: input.invitedBy,
      createdAt: new Date().toISOString(),
    });

    logger.i('Invitation sent', { invitationId, email: input.email, teamId: input.teamId });
    return { invitationId };
  }

  /**
   * Accepts a team invitation.
   */
  async acceptInvitation(
    invitationId: string,
    userId: string,
    email: string,
    displayName: string
  ): Promise<TeamMember> {
    const invitation = invitations.get(invitationId);
    if (!invitation) {
      throw new ApiError(404, 'INVITATION_NOT_FOUND', 'Invitation not found.');
    }

    if (invitation.email !== email) {
      throw new ApiError(403, 'FORBIDDEN', 'Invitation is for a different email.');
    }

    const newMember: TeamMember = {
      id: `member_${Date.now()}`,
      teamId: invitation.teamId,
      userId,
      email,
      displayName,
      role: invitation.role as 'admin' | 'member',
      joinedAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
    };

    const teamMembers = members.get(invitation.teamId) || [];
    teamMembers.push(newMember);
    members.set(invitation.teamId, teamMembers);

    // Update team member count
    const team = teams.get(invitation.teamId);
    if (team) {
      team.memberCount = teamMembers.length;
      team.updatedAt = new Date().toISOString();
    }

    invitations.delete(invitationId);
    logger.i('Member joined team', { teamId: invitation.teamId, userId });
    return newMember;
  }

  /**
   * Removes a member from the team.
   */
  async removeMember(
    teamId: string,
    memberId: string,
    requestUserId: string
  ): Promise<void> {
    const team = teams.get(teamId);
    if (!team) {
      throw new ApiError(404, 'TEAM_NOT_FOUND', 'Team not found.');
    }

    const teamMembers = members.get(teamId) || [];
    const memberIndex = teamMembers.findIndex((m) => m.id === memberId);

    if (memberIndex === -1) {
      throw new ApiError(404, 'MEMBER_NOT_FOUND', 'Member not found.');
    }

    const member = teamMembers[memberIndex];

    // Only owner or admin can remove members
    const requestMember = teamMembers.find((m) => m.userId === requestUserId);
    if (!requestMember || (requestMember.role !== 'owner' && requestMember.role !== 'admin')) {
      throw new ApiError(403, 'FORBIDDEN', 'Only owner or admin can remove members.');
    }

    // Cannot remove owner
    if (member.role === 'owner') {
      throw new ApiError(403, 'FORBIDDEN', 'Cannot remove team owner.');
    }

    teamMembers.splice(memberIndex, 1);
    members.set(teamId, teamMembers);

    // Update team member count
    team.memberCount = teamMembers.length;
    team.updatedAt = new Date().toISOString();

    logger.i('Member removed from team', { teamId, memberId });
  }

  /**
   * Gets teams a user belongs to.
   */
  async getUserTeams(userId: string): Promise<Team[]> {
    const userTeams: Team[] = [];

    for (const [teamId, teamMembers] of members.entries()) {
      if (teamMembers.some((m) => m.userId === userId)) {
        const team = teams.get(teamId);
        if (team) {
          userTeams.push(team);
        }
      }
    }

    return userTeams;
  }

  /**
   * Gets team stats.
   */
  async getTeamStats(teamId: string): Promise<{
    memberCount: number;
    activeMembers: number;
    plan: string;
  }> {
    const team = teams.get(teamId);
    if (!team) {
      throw new ApiError(404, 'TEAM_NOT_FOUND', 'Team not found.');
    }

    const teamMembers = members.get(teamId) || [];
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const activeMembers = teamMembers.filter(
      (m) => new Date(m.lastActiveAt).getTime() > oneWeekAgo
    ).length;

    return {
      memberCount: teamMembers.length,
      activeMembers,
      plan: team.plan,
    };
  }
}

// Singleton instance
let instance: TeamService | null = null;

export const getTeamService = (): TeamService => {
  if (!instance) {
    instance = new TeamService();
  }
  return instance;
};
