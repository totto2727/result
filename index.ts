import { isPromise } from "remeda";

/**
 * 失敗の型
 */
export type Failure<T> = {
  type: "failure";
  cause: T;
};

/**
 * 型ガード可能な失敗の原因の型
 *
 * 値を持つかは任意
 */
export type TypedCause<TCauseType extends string, TCauseValue = undefined> = {
  type: TCauseType;
  value?: TCauseValue;
};

/**
 * 原因が型付けされた失敗の型
 */
export type TypedFailure<TTypedCause> = TTypedCause extends TypedCause<
  infer TCauseType,
  infer TCauseValue
>
  ? Failure<TypedCause<TCauseType, TCauseValue>>
  : never;

/**
 * 原因が型付けされていない失敗の型
 */
export type AnyhowFailure = Failure<unknown>;

/**
 * 失敗の原因の型を取得する型関数
 */
export type ExcludeFailure<T> = T extends Failure<infer U> ? U : never;

/**
 * 任意の値を持つ失敗を返す関数
 *
 * 基本的に型付けされるが、型ガードを考慮する場合はfailTyped関数を使用することを推奨
 *
 * @param {any} cause - 任意の失敗を表す値
 * @return {Failure}
 */
export function fail<const T>(cause: T): Failure<T> {
  return { type: "failure", cause };
}

/**
 * 原因が型付けされた失敗を返す関数
 *
 * @param {string} type - 型ガードに使用するリテラル
 * @param {any} value - 失敗の詳細を表す値
 * @return {TypedFailure}
 */
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

/**
 * Result型の結果が失敗であることを検証する型ガード関数
 *
 * @param {Result} result - 任意のResult型
 * @return {result is Failure} - Failか否かの型ガード
 */
export function isFailure<const T>(
  result: Result<unknown, T>,
): result is Failure<T> {
  return result.type === "failure";
}

/**
 * 成功を表す型
 */
export type Success<T> = {
  type: "success";
  value: T;
};

/**
 * 成功の型を取得する型関数
 */
export type ExcludeSuccess<T> = T extends Success<infer U> ? U : never;

/**
 * 任意の値を持った成功を返す関数
 *
 * @param {any} value - 成功した処理の返り値
 * @return {Success}
 */
export function succeed<const T>(value: T): Success<T> {
  return { type: "success", value };
}

/**
 * Result型の結果が成功であることを検証する型ガード関数
 */
export function isSuccess<const T>(
  result: Result<T, unknown>,
): result is Success<T> {
  return result.type === "success";
}

/**
 * 失敗する可能性があることを表す型
 *
 * 基本的にはTypedResultやAnyhowResult型を使用することを推奨
 * またisSuccess関数やisFailure関数の検証をした上で、使用することを想定
 */
export type Result<T, U> = Success<T> | Failure<U>;

/**
 * 失敗とその原因を返す可能性があることを示す型
 */
export type TypedResult<T, TFailure> = TFailure extends TypedCause<
  infer TCauseType,
  infer TCauseValue
>
  ? Result<T, TypedCause<TCauseType, TCauseValue>>
  : never;

/**
 * 失敗する可能性があることのみを示す型
 *
 * 型ガードすることは不可能ではないが、実装を調べる必要性があるため、基本的には失敗した理由を知る必要がない時に使用する
 */
export type AnyhowResult<T> = Success<T> | AnyhowFailure;

export type Option<T> = Result<T, undefined>;

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

/**
 * ステータスコード404を示す失敗
 */
export type NotFoundCause = TypedCause<"notfound">;

export function failNotFound(): TypedFailure<NotFoundCause> {
  return failTyped("notfound");
}

export type UnknownCause = TypedCause<"unknown", string>;

export function unknownCause(error: string): UnknownCause {
  return {
    type: "unknown",
    value: error,
  };
}
