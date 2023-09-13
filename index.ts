import { isPromise } from "remeda";

export type Failure<T> = {
  type: "failure";
  cause: T;
};

export type TypedCause<TCauseType extends string, TCauseValue = undefined> = {
  type: TCauseType;
  value?: TCauseValue;
};

export type TypedFailure<TTypedCause> = TTypedCause extends TypedCause<
  infer TCauseType,
  infer TCauseValue
>
  ? Failure<TypedCause<TCauseType, TCauseValue>>
  : never;

export type AnyhowFailure = Failure<unknown>;

export type ExcludeFailure<T> = T extends Failure<infer U> ? U : never;

export function fail<const T>(cause: T): Failure<T> {
  return { type: "failure", cause };
}

export function failTyped<const TCauseType extends string, const TCauseValue>(
  type: TCauseType,
  value?: TCauseValue,
): TypedFailure<TypedCause<TCauseType, TCauseValue>> {
  if (value)
    return {
      type: "failure",
      cause: { type, value },
    };
  return {
    type: "failure",
    cause: { type },
  };
}

export function isFailure<const T>(
  result: Result<unknown, T>,
): result is Failure<T> {
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

export function isSuccess<const T>(
  result: Result<T, unknown>,
): result is Success<T> {
  return result.type === "success";
}

export type Result<T, U> = Success<T> | Failure<U>;

export type TypedResult<T, TFailure> = TFailure extends TypedCause<
  infer TCauseType,
  infer TCauseValue
>
  ? Result<T, TypedCause<TCauseType, TCauseValue>>
  : never;

export type AnyhowResult<T> = Success<T> | AnyhowFailure;

export function unwrap<T, U>(result: Result<T, U>): T {
  if (isFailure(result)) throw result;
  return result.value;
}

export function map<T, U, V>(
  f: (v: T) => U,
): (result: Result<T, V>) => Result<U, V> {
  return function (r) {
    if (isFailure(r)) return r;
    return succeed(f(r.value));
  };
}

export function mapError<T, U>(
  f: (v: U) => T,
): (result: Result<T, U>) => Success<T> {
  return function (r) {
    if (isSuccess(r)) return r;
    return succeed(f(r.cause));
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

export function flatMapError<T, U, V>(
  f: (x: U) => Result<T, V>,
): (result: Result<T, U>) => Result<T, V> {
  return function (result) {
    if (isSuccess(result)) return result;
    return f(result.cause);
  };
}

export function tryCatch<T, U = unknown, V = ExcludeFailure<AnyhowFailure>>(
  successF: () => T,
  failureF: (e: U) => V,
): T extends Promise<infer TP> ? Promise<Result<TP, V>> : Result<T, V> {
  try {
    const success = successF();
    if (isPromise(success)) {
      return success
        .then((v) => succeed(v))
        .catch((e: U) => fail(failureF(e))) as T extends Promise<infer TP>
        ? Promise<Result<TP, V>>
        : never;
    }
    return succeed(success) as T extends Promise<infer _>
      ? never
      : Result<T, V>;
  } catch (e) {
    return fail(failureF(e as U)) as T extends Promise<infer _>
      ? never
      : Result<T, V>;
  }
}

