import { fail, isFailure, isSuccess, Result, succeed } from "./index.ts";

export function map<T, U, V>(
  f: (v: T) => V,
): (result: Result<T, U>) => Result<V, U> {
  return function (r) {
    if (isFailure(r)) return r;
    return succeed(f(r.value));
  };
}

export function mapError<T, U, V>(
  f: (v: U) => V,
): (result: Result<T, U>) => Result<T, V> {
  return function (r) {
    if (isSuccess(r)) return r;
    return fail(f(r.cause));
  };
}

export function flatMap<T, U, V, W>(
  f: (x: T) => Result<V, W>,
): (result: Result<T, U>) => Result<V, U | W> {
  return function (result) {
    if (isFailure(result)) return result;
    return f(result.value);
  };
}

export function flatMapError<T, U, V, W>(
  f: (x: U) => Result<V, W>,
): (result: Result<T, U>) => Result<T | V, W> {
  return function (result) {
    if (isSuccess(result)) return result;
    return f(result.cause);
  };
}

export function tryCatch<const T extends unknown[], U, V, W>(
  throwableFunction: (...x: T) => U,
  onRejection: (e: V) => W,
): (...x: T) => Result<U, W> {
  return (...x: T) => {
    try {
      return succeed(throwableFunction(...x));
    } catch (e) {
      return fail(onRejection(e as V));
    }
  };
}

export function tryCatchAsync<const T extends unknown[], U, V, W>(
  throwableFunction: (...x: T) => PromiseLike<U>,
  onRejection: (e: V) => W,
): (...x: T) => PromiseLike<Result<U, W>> {
  return (...x: T) =>
    throwableFunction(...x).then(
      (v) => succeed(v),
      (e) => fail(onRejection(e)),
    );
}
