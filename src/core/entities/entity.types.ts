export type EntityId = string;
export type Timestamp = string; // ISO 8601 String representation

export interface BaseEntity {
  readonly id: EntityId;
}

export interface AuditableEntity extends BaseEntity {
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
  readonly createdBy?: string;
  readonly updatedBy?: string;
}

export interface SoftDeletableEntity extends BaseEntity {
  readonly isDeleted: boolean;
  readonly deletedAt?: Timestamp;
  readonly deletedBy?: string;
}
