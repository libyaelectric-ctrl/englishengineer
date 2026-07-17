import { create } from 'zustand';
import { DEMO_TEAM_WORKSPACE } from './team.data';
import { TeamService } from './team.service';
import type { OrganizationRole, TeamState } from './team.types';

export interface BulkInviteResult {
  succeeded: string[];
  failed: { email: string; reason: string }[];
}

interface TeamActions {
  loadWorkspace: () => Promise<void>;
  inviteMember: (
    email: string,
    role: Exclude<OrganizationRole, 'admin'>
  ) => Promise<void>;
  bulkInviteMembers: (
    emails: string[],
    role: Exclude<OrganizationRole, 'admin'>
  ) => Promise<BulkInviteResult>;
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
  bulkInviteMembers: async (emails, role) => {
    const succeeded: string[] = [];
    const failed: { email: string; reason: string }[] = [];

    const results = await Promise.allSettled(
      emails.map((email) => TeamService.inviteMember(email.trim(), role))
    );

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        succeeded.push(emails[index]);
        set((state) => ({
          invitations: [...state.invitations, result.value],
        }));
      } else {
        failed.push({
          email: emails[index],
          reason:
            result.reason instanceof Error
              ? result.reason.message
              : 'Unknown error',
        });
      }
    });

    return { succeeded, failed };
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
