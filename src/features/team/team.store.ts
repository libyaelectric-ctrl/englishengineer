import { create } from 'zustand';
import { DEMO_TEAM_WORKSPACE } from './team.data';
import { TeamService } from './team.service';
import type { OrganizationRole, TeamState } from './team.types';

interface TeamActions {
  loadWorkspace: () => Promise<void>;
  inviteMember: (
    email: string,
    role: Exclude<OrganizationRole, 'admin'>
  ) => Promise<void>;
  cancelInvitation: (invitationId: string) => void;
  resendInvitation: (invitationId: string) => void;
}

export const useTeamStore = create<TeamState & TeamActions>((set) => ({
  ...DEMO_TEAM_WORKSPACE,
  isLoading: false,
  error: null,
  loadWorkspace: async () => {
    set({ isLoading: true, error: null });
    try {
      const snapshot = await TeamService.getWorkspace();
      set({ ...snapshot, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error ? error.message : 'Team workspace failed.',
      });
    }
  },
  inviteMember: async (email, role) => {
    const invitation = await TeamService.inviteMember(email, role);
    set((state) => ({ invitations: [...state.invitations, invitation] }));
  },
  cancelInvitation: (invitationId) =>
    set((state) => ({
      invitations: state.invitations.map((item) =>
        item.id === invitationId ? { ...item, status: 'cancelled' } : item
      ),
    })),
  resendInvitation: (invitationId) =>
    set((state) => ({
      invitations: state.invitations.map((item) =>
        item.id === invitationId
          ? {
              ...item,
              createdAt: new Date().toISOString(),
              deliveryStatus: 'not-sent',
            }
          : item
      ),
    })),
}));
