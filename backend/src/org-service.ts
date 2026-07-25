import { ApiError } from './errors.js';
import { logger } from './logger.js';

interface Organization {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  plan: 'free' | 'pro' | 'enterprise';
  settings: OrgSettings;
}

interface OrgSettings {
  allowMemberInvites: boolean;
  defaultMemberRole: 'admin' | 'member';
  requireApproval: boolean;
}

interface OrgMember {
  id: string;
  orgId: string;
  userId: string;
  email: string;
  displayName: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
}

interface CreateOrgInput {
  name: string;
  ownerId: string;
}

interface UpdateOrgInput {
  name?: string;
  settings?: Partial<OrgSettings>;
}

// In-memory store
const organizations = new Map<string, Organization>();
const orgMembers = new Map<string, OrgMember[]>();

/**
 * Organization management service.
 * Handles org CRUD and member management.
 */
export class OrgService {
  /**
   * Creates a new organization.
   */
  async createOrg(input: CreateOrgInput): Promise<Organization> {
    const slug = input.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const org: Organization = {
      id: `org_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      name: input.name,
      slug,
      ownerId: input.ownerId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      plan: 'free',
      settings: {
        allowMemberInvites: true,
        defaultMemberRole: 'member',
        requireApproval: false,
      },
    };

    organizations.set(org.id, org);

    // Add owner as first member
    const ownerMember: OrgMember = {
      id: `org_member_${Date.now()}`,
      orgId: org.id,
      userId: input.ownerId,
      email: '',
      displayName: 'Owner',
      role: 'owner',
      joinedAt: org.createdAt,
    };

    orgMembers.set(org.id, [ownerMember]);

    logger.i('Organization created', { orgId: org.id, name: org.name });
    return org;
  }

  /**
   * Gets an organization by ID.
   */
  async getOrg(orgId: string): Promise<Organization | null> {
    return organizations.get(orgId) || null;
  }

  /**
   * Gets an organization by slug.
   */
  async getOrgBySlug(slug: string): Promise<Organization | null> {
    for (const org of organizations.values()) {
      if (org.slug === slug) {
        return org;
      }
    }
    return null;
  }

  /**
   * Updates an organization.
   */
  async updateOrg(
    orgId: string,
    input: UpdateOrgInput,
    userId: string
  ): Promise<Organization> {
    const org = organizations.get(orgId);
    if (!org) {
      throw new ApiError(404, 'ORG_NOT_FOUND', 'Organization not found.');
    }

    if (org.ownerId !== userId) {
      throw new ApiError(403, 'FORBIDDEN', 'Only org owner can update.');
    }

    const updated: Organization = {
      ...org,
      ...input,
      settings: { ...org.settings, ...input.settings },
      updatedAt: new Date().toISOString(),
    };

    organizations.set(orgId, updated);
    return updated;
  }

  /**
   * Deletes an organization.
   */
  async deleteOrg(orgId: string, userId: string): Promise<void> {
    const org = organizations.get(orgId);
    if (!org) {
      throw new ApiError(404, 'ORG_NOT_FOUND', 'Organization not found.');
    }

    if (org.ownerId !== userId) {
      throw new ApiError(403, 'FORBIDDEN', 'Only org owner can delete.');
    }

    organizations.delete(orgId);
    orgMembers.delete(orgId);
    logger.i('Organization deleted', { orgId });
  }

  /**
   * Gets organization members.
   */
  async getMembers(orgId: string): Promise<OrgMember[]> {
    return orgMembers.get(orgId) || [];
  }

  /**
   * Adds a member to the organization.
   */
  async addMember(
    orgId: string,
    userId: string,
    email: string,
    displayName: string,
    role: 'admin' | 'member' = 'member'
  ): Promise<OrgMember> {
    const org = organizations.get(orgId);
    if (!org) {
      throw new ApiError(404, 'ORG_NOT_FOUND', 'Organization not found.');
    }

    const existingMembers = orgMembers.get(orgId) || [];
    if (existingMembers.some((m) => m.userId === userId)) {
      throw new ApiError(409, 'ALREADY_MEMBER', 'User is already a member.');
    }

    const newMember: OrgMember = {
      id: `org_member_${Date.now()}`,
      orgId,
      userId,
      email,
      displayName,
      role,
      joinedAt: new Date().toISOString(),
    };

    existingMembers.push(newMember);
    orgMembers.set(orgId, existingMembers);

    logger.i('Member added to org', { orgId, userId, role });
    return newMember;
  }

  /**
   * Removes a member from the organization.
   */
  async removeMember(orgId: string, memberId: string, requestUserId: string): Promise<void> {
    const org = organizations.get(orgId);
    if (!org) {
      throw new ApiError(404, 'ORG_NOT_FOUND', 'Organization not found.');
    }

    const members = orgMembers.get(orgId) || [];
    const memberIndex = members.findIndex((m) => m.id === memberId);

    if (memberIndex === -1) {
      throw new ApiError(404, 'MEMBER_NOT_FOUND', 'Member not found.');
    }

    const member = members[memberIndex];
    const requestMember = members.find((m) => m.userId === requestUserId);

    if (!requestMember || (requestMember.role !== 'owner' && requestMember.role !== 'admin')) {
      throw new ApiError(403, 'FORBIDDEN', 'Only owner or admin can remove members.');
    }

    if (member.role === 'owner') {
      throw new ApiError(403, 'FORBIDDEN', 'Cannot remove org owner.');
    }

    members.splice(memberIndex, 1);
    orgMembers.set(orgId, members);

    logger.i('Member removed from org', { orgId, memberId });
  }

  /**
   * Gets organizations a user belongs to.
   */
  async getUserOrgs(userId: string): Promise<Organization[]> {
    const userOrgs: Organization[] = [];

    for (const [orgId, members] of orgMembers.entries()) {
      if (members.some((m) => m.userId === userId)) {
        const org = organizations.get(orgId);
        if (org) {
          userOrgs.push(org);
        }
      }
    }

    return userOrgs;
  }

  /**
   * Checks if a user is an org member.
   */
  async isMember(orgId: string, userId: string): Promise<boolean> {
    const members = orgMembers.get(orgId) || [];
    return members.some((m) => m.userId === userId);
  }

  /**
   * Gets user's role in an organization.
   */
  async getUserRole(orgId: string, userId: string): Promise<string | null> {
    const members = orgMembers.get(orgId) || [];
    const member = members.find((m) => m.userId === userId);
    return member?.role || null;
  }
}

// Singleton instance
let instance: OrgService | null = null;

export const getOrgService = (): OrgService => {
  if (!instance) {
    instance = new OrgService();
  }
  return instance;
};
