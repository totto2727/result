export type Failure<T> = {
  type: "failure";
  cause: T;
};

export type TypedCause<TCauseType extends string, TCauseValue> = {
  type: TCauseType;
  value: TCauseValue;
};

export type TypedFailure<T extends TypedCause<string, unknown>> = Failure<T>;

export type AnyhowFailure = Failure<unknown>;

export type ExcludeFailure<T> = T extends Failure<infer U> ? U : never;

export function fail<const T>(cause: T): Failure<T> {
  return { type: "failure", cause };
}

export function failTyped<const TCauseType extends string, const TCauseValue>(
  type: TCauseType,
  value: TCauseValue,
): TypedFailure<TypedCause<TCauseType, TCauseValue>> {
  return {
    type: "failure",
    cause: { type, value },
  };
}

export function isFailure(
  result: Result<unknown, unknown>,
): result is Failure<unknown> {
  return result.type === "failure";
}

export type Success<T> = {
  type: "success";
  value: T;
};

export type ExcludeSuccess<T> = T extends Success<infer U> ? U : never;

export function succeed<const T>(value: T): Success<T> {
  return { type: "success", value };
}

export function isSuccess(
  result: Result<unknown, unknown>,
): result is Success<unknown> {
  return result.type === "success";
}

export type Result<T, U> = Success<T> | Failure<U>;

export type TypedResult<T, U extends TypedCause<string, unknown>> =
  | Success<T>
  | TypedFailure<U>;

export type AnyhowResult<T> = Success<T> | AnyhowFailure;

export function unwrap<T, U>(result: Result<T, U>): T {
  if (isFailure(result)) throw result;
  return result.value;
}

/**
 * @deprecated
 */
export function map<T, U, V>(
  f: (v: T) => U,
): (result: Result<T, V>) => Result<U, V> {
  return function (r) {
    if (isFailure(r)) return r;
    return succeed(f(r.value));
  };
}

/**
 * @deprecated
 */
export function mapError<T, U>(
  f: (v: U) => T,
): (result: Result<T, U>) => Success<T> {
  return function (r) {
    if (isSuccess(r)) return r;
    return succeed(f(r.cause));
  };
}

/**
 * @deprecated
 */
export function flatMap<T, U, V, W>(
  f: (x: T) => Result<V, W>,
): (result: Result<T, U>) => Result<V, U | W> {
  return function (result) {
    if (isFailure(result)) return result;
    return f(result.value);
  };
}

/**
 * @deprecated
 */
export function flatMapError<T, U, V>(
  f: (x: U) => Result<T, V>,
): (result: Result<T, U>) => Result<T, V> {
  return function (result) {
    if (isSuccess(result)) return result;
    return f(result.cause);
  };
}

/**
 * @deprecated
 */
export function tryCatch<T, U = unknown, V = unknown>(
  successF: () => T,
  failureF: (e: U) => V,
): Result<T, V> {
  try {
    return succeed(successF());
  } catch (e) {
    return fail(failureF(e as U));
  }
}

/**
 * @deprecated
 */
export function tryCatchAsync<T, U = unknown, V = unknown>(
  successF: () => PromiseLike<T>,
  failureF: (e: U) => V,
): PromiseLike<Result<T, V>> {
  return successF().then(
    (v) => succeed(v),
    (e) => fail(failureF(e)),
  );
}
