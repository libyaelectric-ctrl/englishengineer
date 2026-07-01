import { Result, OkResult, FailResult } from './result';

export function ok<T>(value: T): OkResult<T> {
  return { success: true, value };
}

export function fail<E>(error: E): FailResult<E> {
  return { success: false, error };
}

export function isOk<T, E>(result: Result<T, E>): result is OkResult<T> {
  return result.success;
}

export function isFail<T, E>(result: Result<T, E>): result is FailResult<E> {
  return !result.success;
}

export function mapResult<T, U, E>(
  result: Result<T, E>,
  mapper: (value: T) => U
): Result<U, E> {
  if (isOk(result)) {
    return ok(mapper(result.value));
  }
  return result;
}

export function unwrapOr<T, E>(result: Result<T, E>, fallback: T): T {
  if (isOk(result)) {
    return result.value;
  }
  return fallback;
}
