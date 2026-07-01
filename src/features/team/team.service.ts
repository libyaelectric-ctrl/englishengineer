import { IdService } from '@/core/ids';
import { DEMO_TEAM_WORKSPACE } from './team.data';
import type {
  OrganizationRole,
  TeamInvitation,
  TeamWorkspaceSnapshot,
} from './team.types';

export interface TeamProvider {
  getWorkspace(): Promise<TeamWorkspaceSnapshot>;
  inviteMember(
    email: string,
    role: Exclude<OrganizationRole, 'admin'>
  ): Promise<TeamInvitation>;
}

class DemoTeamProvider implements TeamProvider {
  async getWorkspace(): Promise<TeamWorkspaceSnapshot> {
    return structuredClone(DEMO_TEAM_WORKSPACE);
  }

  async inviteMember(
    email: string,
    role: Exclude<OrganizationRole, 'admin'>
  ): Promise<TeamInvitation> {
    return {
      id: IdService.createId('team_invite'),
      organizationId: DEMO_TEAM_WORKSPACE.organization.id,
      email,
      role,
      status: 'pending',
      createdAt: new Date().toISOString(),
      deliveryStatus: 'not-sent',
    };
  }
}

const provider: TeamProvider = new DemoTeamProvider();

export const TeamService = {
  getWorkspace: (): Promise<TeamWorkspaceSnapshot> => provider.getWorkspace(),
  inviteMember: (
    email: string,
    role: Exclude<OrganizationRole, 'admin'>
  ): Promise<TeamInvitation> => provider.inviteMember(email, role),
};
