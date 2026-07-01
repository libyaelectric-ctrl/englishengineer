export type Result<T, E = Error> = OkResult<T> | FailResult<E>;

export interface OkResult<T> {
  readonly success: true;
  readonly value: T;
}

export interface FailResult<E> {
  readonly success: false;
  readonly error: E;
}
