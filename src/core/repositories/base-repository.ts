import { BaseEntity, EntityId } from '../entities/entity.types';
import { IRepository } from './repository.types';
import { Result, ok, fail } from '../result';
import { AppError, ErrorCode, createStorageError } from '../errors';

export abstract class BaseRepository<
  TEntity extends BaseEntity,
> implements IRepository<TEntity> {
  protected abstract readonly entityName: string;

  // In-memory backing store for local-first execution
  protected readonly store = new Map<EntityId, TEntity>();

  public async getById(id: EntityId): Promise<Result<TEntity, AppError>> {
    try {
      const entity = this.store.get(id);
      if (!entity) {
        return fail(
          createStorageError(
            `${this.entityName} with ID "${id}" was not found`,
            undefined,
            { id, entityName: this.entityName }
          )
        );
      }
      return ok(entity);
    } catch (error) {
      return fail(
        createStorageError(
          `Failed to retrieve ${this.entityName} with ID "${id}"`,
          error instanceof Error ? error : new Error(String(error)),
          { id, entityName: this.entityName }
        )
      );
    }
  }

  public async list(): Promise<Result<readonly TEntity[], AppError>> {
    try {
      const entities = Array.from(this.store.values());
      return ok(Object.freeze(entities));
    } catch (error) {
      return fail(
        createStorageError(
          `Failed to list ${this.entityName} entries`,
          error instanceof Error ? error : new Error(String(error)),
          { entityName: this.entityName }
        )
      );
    }
  }

  public async create(entity: TEntity): Promise<Result<TEntity, AppError>> {
    try {
      if (this.store.has(entity.id)) {
        return fail(
          new AppError({
            code: ErrorCode.STORAGE,
            message: `Cannot create ${this.entityName}: An entry with ID "${entity.id}" already exists`,
            severity: 'warning',
            metadata: { id: entity.id, entityName: this.entityName },
          })
        );
      }
      this.store.set(entity.id, entity);
      return ok(entity);
    } catch (error) {
      return fail(
        createStorageError(
          `Failed to create ${this.entityName}`,
          error instanceof Error ? error : new Error(String(error)),
          { id: entity.id, entityName: this.entityName }
        )
      );
    }
  }

  public async update(entity: TEntity): Promise<Result<TEntity, AppError>> {
    try {
      if (!this.store.has(entity.id)) {
        return fail(
          createStorageError(
            `Cannot update ${this.entityName}: Entry with ID "${entity.id}" does not exist`,
            undefined,
            { id: entity.id, entityName: this.entityName }
          )
        );
      }
      this.store.set(entity.id, entity);
      return ok(entity);
    } catch (error) {
      return fail(
        createStorageError(
          `Failed to update ${this.entityName}`,
          error instanceof Error ? error : new Error(String(error)),
          { id: entity.id, entityName: this.entityName }
        )
      );
    }
  }

  public async delete(id: EntityId): Promise<Result<void, AppError>> {
    try {
      if (!this.store.has(id)) {
        return fail(
          createStorageError(
            `Cannot delete ${this.entityName}: Entry with ID "${id}" does not exist`,
            undefined,
            { id, entityName: this.entityName }
          )
        );
      }
      this.store.delete(id);
      return ok(undefined);
    } catch (error) {
      return fail(
        createStorageError(
          `Failed to delete ${this.entityName} with ID "${id}"`,
          error instanceof Error ? error : new Error(String(error)),
          { id, entityName: this.entityName }
        )
      );
    }
  }
}
