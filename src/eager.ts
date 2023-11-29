import { fail, isFailure, isSuccess, Result, succeed } from "./index.ts";

export function map<T, U, V>(
  f: (v: T) => V,
  result: Result<T, U>,
): Result<V, U> {
  if (isFailure(result)) return result;
  return succeed(f(result.value));
}

export function mapError<T, U, V>(
  f: (v: U) => V,
  result: Result<T, U>,
): Result<T, V> {
  if (isSuccess(result)) return result;
  return fail(f(result.cause));
}

export function flatMap<T, U, V, W>(
  f: (x: T) => Result<V, W>,
  result: Result<T, U>,
): Result<V, U | W> {
  if (isFailure(result)) return result;
  return f(result.value);
}

export function flatMapError<T, U, V, W>(
  f: (x: U) => Result<V, W>,
  result: Result<T, U>,
): Result<T | V, W> {
  if (isSuccess(result)) return result;
  return f(result.cause);
}
export function tryCatch<T, U, V>(
  throwableFunction: () => T,
  onRejection: (e: U) => V,
): Result<T, V> {
  try {
    return succeed(throwableFunction());
  } catch (e) {
    return fail(onRejection(e as U));
  }
}

export function tryCatchAsync<T, U, V>(
  throwableFunction: () => PromiseLike<T>,
  onRejection: (e: U) => V,
): PromiseLike<Result<T, V>> {
  return throwableFunction().then(
    (v) => succeed(v),
    (e) => fail(onRejection(e)),
  );
}
