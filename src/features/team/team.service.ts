import { IdService } from '@/core/ids';
import { getSupabaseClient, isSupabaseConfigured } from '@/features/auth';
import { DEMO_TEAM_WORKSPACE } from './team.data';
import type {
  OrganizationRole,
  TeamInvitation,
  TeamWorkspaceSnapshot,
  TeamMember,
  TeamProgressSummary,
} from './team.types';

/**
 * TeamProvider Interface & Implementations
 *
 * Manages B2B team workspace data queries and employee invitations.
 * Includes:
 * 1. DemoTeamProvider - Mock provider returning static data in offline or local mode.
 * 2. SupabaseTeamProvider - Production provider querying live B2B schema (organization, members, summaries).
 */
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

class SupabaseTeamProvider implements TeamProvider {
  async getWorkspace(): Promise<TeamWorkspaceSnapshot> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase client not configured.');

    // 1. Get active user's organization membership
    const { data: membership, error: memError } = await supabase
      .from('organization_members')
      .select(
        'organization_id, role, organizations(name, created_by, created_at)'
      )
      .limit(1)
      .maybeSingle();

    if (memError) {
      throw new Error(`Failed to fetch team membership: ${memError.message}`);
    }

    if (!membership) {
      // If user does not belong to any team, return a simulated empty workspace
      // associated with their own user or fall back gracefully
      return {
        source: 'backend',
        organization: {
          id: 'no-org',
          name: 'Personal Sandbox (No Team)',
          createdBy: 'system',
          createdAt: new Date().toISOString(),
        },
        members: [],
        summaries: [],
        invitations: [],
      };
    }

    const orgId = membership.organization_id;
    const orgRecord = (
      membership as {
        organizations?: {
          name: string;
          created_by: string;
          created_at: string;
        }[];
      }
    )?.organizations?.[0];

    // 2. Fetch organization members
    const { data: members, error: membersError } = await supabase
      .from('organization_members')
      .select(
        'user_id, role, joined_at, profiles(display_name, email, discipline, updated_at)'
      )
      .eq('organization_id', orgId);

    if (membersError) {
      throw new Error(`Failed to fetch team members: ${membersError.message}`);
    }

    // 3. Fetch organization invitations
    const { data: invites, error: invitesError } = await supabase
      .from('organization_invitations')
      .select('id, email, role, status, created_at')
      .eq('organization_id', orgId);

    if (invitesError) {
      throw new Error(
        `Failed to fetch team invitations: ${invitesError.message}`
      );
    }

    // 4. Fetch team progress summaries
    const { data: summaries, error: summariesError } = await supabase
      .from('team_progress_summaries')
      .select(
        'user_id, cefr_estimate, overall_progress, completed_tasks, skill_summary, mistake_categories, recommended_tasks'
      )
      .eq('organization_id', orgId);

    if (summariesError) {
      throw new Error(
        `Failed to fetch team progress summaries: ${summariesError.message}`
      );
    }

    const mappedMembers: TeamMember[] = (members || []).map(
      (m: {
        user_id: string;
        role: string;
        joined_at: string | null;
        profiles?: {
          display_name?: string;
          email?: string;
          discipline?: string;
          updated_at?: string;
        }[];
      }) => {
        const profile = m.profiles?.[0];
        return {
          id: m.user_id,
          organizationId: orgId,
          displayName: profile?.display_name || 'Team Member',
          email: profile?.email || '',
          role: m.role as OrganizationRole,
          discipline: profile?.discipline || 'Engineering',
          lastActiveAt: profile?.updated_at || m.joined_at || null,
        };
      }
    );

    const mappedSummaries: TeamProgressSummary[] = (summaries || []).map(
      (s: {
        user_id: string;
        cefr_estimate?: string;
        overall_progress?: number;
        completed_tasks?: number;
        skill_summary?: Record<string, number>;
        mistake_categories?: string[];
        recommended_tasks?: string[];
      }) => {
        const skills = s.skill_summary || {};
        return {
          memberId: s.user_id,
          cefrEstimate: s.cefr_estimate || 'Not enough data',
          overallProgress: Number(s.overall_progress ?? 0),
          completedTasks: Number(s.completed_tasks ?? 0),
          skillScores: {
            reading: Number(skills.reading ?? 0),
            writing: Number(skills.writing ?? 0),
            listening: Number(skills.listening ?? 0),
            speaking: Number(skills.speaking ?? 0),
            vocabulary: Number(skills.vocabulary ?? 0),
            grammar: Number(skills.grammar ?? 0),
          },
          mistakeCategories: Array.isArray(s.mistake_categories)
            ? s.mistake_categories
            : [],
          recommendedTasks: Array.isArray(s.recommended_tasks)
            ? s.recommended_tasks
            : [],
        };
      }
    );

    const mappedInvitations: TeamInvitation[] = (invites || []).map(
      (inv: {
        id: string;
        email: string;
        role: string;
        status: string;
        created_at: string;
      }) => ({
        id: inv.id,
        organizationId: orgId,
        email: inv.email,
        role: inv.role as Exclude<OrganizationRole, 'admin'>,
        status: inv.status as 'pending' | 'accepted' | 'cancelled',
        createdAt: inv.created_at,
        deliveryStatus: 'backend-confirmed',
      })
    );

    return {
      source: 'backend',
      organization: {
        id: orgId,
        name: orgRecord?.name || 'Unnamed Team',
        createdBy: orgRecord?.created_by || '',
        createdAt: orgRecord?.created_at || new Date().toISOString(),
      },
      members: mappedMembers,
      summaries: mappedSummaries,
      invitations: mappedInvitations,
    };
  }

  async inviteMember(
    email: string,
    role: Exclude<OrganizationRole, 'admin'>
  ): Promise<TeamInvitation> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase client not configured.');

    // 1. Get organization ID of current user
    const { data: membership, error: memError } = await supabase
      .from('organization_members')
      .select('organization_id')
      .limit(1)
      .maybeSingle();

    if (memError || !membership) {
      throw new Error(
        'You do not belong to an organization and cannot invite members.'
      );
    }

    const orgId = membership.organization_id;

    // 2. Insert new invitation row
    const userSession = (await supabase.auth.getUser()).data.user;
    if (!userSession) throw new Error('Not authenticated.');

    const { data: invite, error: inviteError } = await supabase
      .from('organization_invitations')
      .insert({
        organization_id: orgId,
        email,
        role,
        status: 'pending',
        invited_by: userSession.id,
      })
      .select('id, email, role, status, created_at')
      .single();

    if (inviteError) {
      throw new Error(`Failed to create invitation: ${inviteError.message}`);
    }

    return {
      id: invite.id,
      organizationId: orgId,
      email: invite.email,
      role: invite.role as Exclude<OrganizationRole, 'admin'>,
      status: invite.status as 'pending' | 'accepted' | 'cancelled',
      createdAt: invite.created_at,
      deliveryStatus: 'backend-confirmed',
    };
  }
}

const demoProvider = new DemoTeamProvider();
const supabaseProvider = new SupabaseTeamProvider();

export const TeamService = {
  getWorkspace: (): Promise<TeamWorkspaceSnapshot> => {
    if (isSupabaseConfigured()) {
      return supabaseProvider.getWorkspace();
    }
    return demoProvider.getWorkspace();
  },

  inviteMember: (
    email: string,
    role: Exclude<OrganizationRole, 'admin'>
  ): Promise<TeamInvitation> => {
    if (isSupabaseConfigured()) {
      return supabaseProvider.inviteMember(email, role);
    }
    return demoProvider.inviteMember(email, role);
  },
};
