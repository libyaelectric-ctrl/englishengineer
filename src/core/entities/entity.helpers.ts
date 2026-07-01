import {
  BaseEntity,
  AuditableEntity,
  SoftDeletableEntity,
  Timestamp,
} from './entity.types';

export function isAuditable(entity: BaseEntity): entity is AuditableEntity {
  const candidate = entity as Partial<AuditableEntity>;
  return (
    typeof candidate.createdAt === 'string' &&
    typeof candidate.updatedAt === 'string'
  );
}

export function isSoftDeletable(
  entity: BaseEntity
): entity is SoftDeletableEntity {
  const candidate = entity as Partial<SoftDeletableEntity>;
  return typeof candidate.isDeleted === 'boolean';
}

export function createAuditProps(createdBy?: string): {
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy?: string;
  updatedBy?: string;
} {
  const now = new Date().toISOString();
  return {
    createdAt: now,
    updatedAt: now,
    createdBy,
    updatedBy: createdBy,
  };
}

export function updateAuditProps(updatedBy?: string): {
  updatedAt: Timestamp;
  updatedBy?: string;
} {
  return {
    updatedAt: new Date().toISOString(),
    updatedBy,
  };
}

export function createSoftDeleteProps(deletedBy?: string): {
  isDeleted: true;
  deletedAt: Timestamp;
  deletedBy?: string;
} {
  return {
    isDeleted: true,
    deletedAt: new Date().toISOString(),
    deletedBy,
  };
}
