import { IdService } from '@/core/ids';
import { getSupabaseClient, isSupabaseConfigured } from '@/features/auth';
import { AppError } from '@/core/errors/app-error';
import { ErrorCode } from '@/core/errors/error-codes';
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

function mapTeamMember(
  m: {
    user_id: string;
    role: string;
    joined_at: string | null;
    profiles?: {
      display_name?: string;
      email?: string;
      discipline?: string;
      updated_at?: string;
    }[];
  },
  orgId: string
): TeamMember {
  const profile = m.profiles?.[0];
  const fallback = (val: string | undefined, def: string) => val || def;
  const fallbackNull = (
    ...vals: (string | null | undefined)[]
  ): string | null => vals.find((v) => v != null && v !== '') as string | null;
  return {
    id: m.user_id,
    organizationId: orgId,
    displayName: fallback(profile?.display_name, 'Team Member'),
    email: fallback(profile?.email, ''),
    role: m.role as OrganizationRole,
    discipline: fallback(profile?.discipline, 'Engineering'),
    lastActiveAt: fallbackNull(profile?.updated_at, m.joined_at),
  };
}

function mapTeamSummary(s: {
  user_id: string;
  cefr_estimate?: string;
  overall_progress?: number;
  completed_tasks?: number;
  skill_summary?: Record<string, number>;
  mistake_categories?: string[];
  recommended_tasks?: string[];
}): TeamProgressSummary {
  const skills = s.skill_summary || {};
  const safeNum = (v: unknown) => Number(v ?? 0);
  const safeArr = (v: unknown): string[] => (Array.isArray(v) ? v : []);
  return {
    memberId: s.user_id,
    cefrEstimate: s.cefr_estimate || 'Not enough data',
    overallProgress: safeNum(s.overall_progress),
    completedTasks: safeNum(s.completed_tasks),
    skillScores: {
      reading: safeNum(skills.reading),
      writing: safeNum(skills.writing),
      listening: safeNum(skills.listening),
      speaking: safeNum(skills.speaking),
      vocabulary: safeNum(skills.vocabulary),
      grammar: safeNum(skills.grammar),
    },
    mistakeCategories: safeArr(s.mistake_categories),
    recommendedTasks: safeArr(s.recommended_tasks),
  };
}

function mapTeamInvitation(
  inv: {
    id: string;
    email: string;
    role: string;
    status: string;
    created_at: string;
  },
  orgId: string
): TeamInvitation {
  return {
    id: inv.id,
    organizationId: orgId,
    email: inv.email,
    role: inv.role as Exclude<OrganizationRole, 'admin'>,
    status: inv.status as 'pending' | 'accepted' | 'cancelled',
    createdAt: inv.created_at,
    deliveryStatus: 'backend-confirmed',
  };
}

const EMPTY_WORKSPACE: TeamWorkspaceSnapshot = {
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

class SupabaseTeamProvider implements TeamProvider {
  async getWorkspace(): Promise<TeamWorkspaceSnapshot> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new AppError({ code: ErrorCode.AUTH, message: 'Supabase client not configured.' });

    const orgId = await this.fetchOrgId(supabase);
    if (!orgId) {
      return {
        ...EMPTY_WORKSPACE,
        organization: {
          ...EMPTY_WORKSPACE.organization,
          createdAt: new Date().toISOString(),
        },
      };
    }

    const [membersResult, invitesResult, summariesResult] = await Promise.all([
      supabase
        .from('organization_members')
        .select(
          'user_id, role, joined_at, profiles(display_name, email, discipline, updated_at)'
        )
        .eq('organization_id', orgId),
      supabase
        .from('organization_invitations')
        .select('id, email, role, status, created_at')
        .eq('organization_id', orgId),
      supabase
        .from('team_progress_summaries')
        .select(
          'user_id, cefr_estimate, overall_progress, completed_tasks, skill_summary, mistake_categories, recommended_tasks'
        )
        .eq('organization_id', orgId),
    ]);

    this.throwIfError(membersResult.error, 'team members');
    this.throwIfError(invitesResult.error, 'team invitations');
    this.throwIfError(summariesResult.error, 'team progress summaries');

    return {
      source: 'backend',
      organization: {
        id: orgId,
        name: 'Unnamed Team',
        createdBy: '',
        createdAt: new Date().toISOString(),
      },
      members: (membersResult.data || []).map((m) => mapTeamMember(m, orgId)),
      summaries: (summariesResult.data || []).map(mapTeamSummary),
      invitations: (invitesResult.data || []).map((inv) =>
        mapTeamInvitation(inv, orgId)
      ),
    };
  }

  private throwIfError(
    error: { message: string } | null,
    entity: string
  ): void {
    if (error) throw new AppError({ code: ErrorCode.NETWORK, message: `Failed to fetch ${entity}: ${error.message}` });
  }

  private async fetchOrgId(
    supabase: ReturnType<typeof getSupabaseClient> & {}
  ): Promise<string | null> {
    const { data: membership, error: memError } = await supabase
      .from('organization_members')
      .select('organization_id')
      .limit(1)
      .maybeSingle();

    if (memError) {
      throw new AppError({ code: ErrorCode.NETWORK, message: `Failed to fetch team membership: ${memError.message}` });
    }

    return membership
      ? (membership as { organization_id: string }).organization_id
      : null;
  }

  async inviteMember(
    email: string,
    role: Exclude<OrganizationRole, 'admin'>
  ): Promise<TeamInvitation> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new AppError({ code: ErrorCode.AUTH, message: 'Supabase client not configured.' });

    const { data: membership, error: memError } = await supabase
      .from('organization_members')
      .select('organization_id')
      .limit(1)
      .maybeSingle();

    if (memError || !membership) {
      throw new AppError({
        code: ErrorCode.AUTH,
        message: 'You do not belong to an organization and cannot invite members.',
      });
    }

    const orgId = membership.organization_id;

    const userSession = (await supabase.auth.getUser()).data.user;
    if (!userSession) throw new AppError({ code: ErrorCode.AUTH, message: 'Not authenticated.' });

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
      throw new AppError({ code: ErrorCode.NETWORK, message: `Failed to create invitation: ${inviteError.message}` });
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
