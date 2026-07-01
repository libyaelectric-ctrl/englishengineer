import { BaseEntity, EntityId } from '../entities/entity.types';
import { Result } from '../result';
import { AppError } from '../errors';

export interface IRepository<TEntity extends BaseEntity> {
  getById(id: EntityId): Promise<Result<TEntity, AppError>>;
  list(): Promise<Result<readonly TEntity[], AppError>>;
  create(entity: TEntity): Promise<Result<TEntity, AppError>>;
  update(entity: TEntity): Promise<Result<TEntity, AppError>>;
  delete(id: EntityId): Promise<Result<void, AppError>>;
}
