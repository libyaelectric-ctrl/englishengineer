import { Result, OkResult, FailResult } from './result';

/** Creates a successful Result with the given value. */
export function ok<T>(value: T): OkResult<T> {
  return { success: true, value };
}

/** Creates a failed Result with the given error. */
export function fail<E>(error: E): FailResult<E> {
  return { success: false, error };
}

/** Type guard that checks if a Result is successful. */
export function isOk<T, E>(result: Result<T, E>): result is OkResult<T> {
  return result.success;
}

/** Type guard that checks if a Result is a failure. */
export function isFail<T, E>(result: Result<T, E>): result is FailResult<E> {
  return !result.success;
}

/** Transforms the success value of a Result using the given mapper function. */
export function mapResult<T, U, E>(
  result: Result<T, E>,
  mapper: (value: T) => U
): Result<U, E> {
  if (isOk(result)) {
    return ok(mapper(result.value));
  }
  return result;
}

/** Returns the success value or a fallback if the Result is a failure. */
export function unwrapOr<T, E>(result: Result<T, E>, fallback: T): T {
  if (isOk(result)) {
    return result.value;
  }
  return fallback;
}
