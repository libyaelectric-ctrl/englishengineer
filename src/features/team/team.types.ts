import type { SkillName } from '@/features/profile/profile.types';

export type OrganizationRole = 'admin' | 'manager' | 'learner';
export type InvitationStatus = 'pending' | 'cancelled' | 'accepted';

export interface Organization {
  id: string;
  name: string;
  createdBy: string;
  createdAt: string;
}

export interface TeamMember {
  id: string;
  organizationId: string;
  displayName: string;
  email: string;
  role: OrganizationRole;
  discipline: string;
  lastActiveAt: string | null;
}

export interface TeamProgressSummary {
  memberId: string;
  cefrEstimate: string;
  overallProgress: number;
  completedTasks: number;
  skillScores: Record<SkillName, number>;
  mistakeCategories: string[];
  recommendedTasks: string[];
}

export interface TeamInvitation {
  id: string;
  organizationId: string;
  email: string;
  role: Exclude<OrganizationRole, 'admin'>;
  status: InvitationStatus;
  createdAt: string;
  deliveryStatus: 'not-sent' | 'backend-confirmed';
}

export interface TeamWorkspaceSnapshot {
  organization: Organization;
  members: TeamMember[];
  summaries: TeamProgressSummary[];
  invitations: TeamInvitation[];
  source: 'demo' | 'backend';
}

export interface TeamState extends TeamWorkspaceSnapshot {
  isLoading: boolean;
  error: string | null;
}
