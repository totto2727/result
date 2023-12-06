import { describe, expect, test } from "bun:test";

import * as r from "./index.mts";

describe("Result型のテスト", () => {
  describe("Success型のテスト", () => {
    // type check
    const x: r.Success<1> = { type: "success", value: 1 };

    test('succeed関数の返り値は`type: "success"`を持つ', () => {
      // type check
      const y: r.Success<1> = r.succeed(1);
      expect(y).toStrictEqual(x);
    });

    const title1 =
      "isSuccess function return true when Success type is taken as argument";
    test(title1, () => {
      const x = r.succeed(true);

      if (!r.isSuccess(x)) {
        throw new Error(title1);
      }
      // type check
      expect(x.value).toBe(true);
    });

    const title2 =
      "isSuccess function return false when Failure type is taken as argument";
    test(title2, () => {
      const x = r.fail(false);

      if (r.isSuccess(x)) {
        throw new Error(title2);
      }
      // type check
      expect(x.cause).toBe(false);
    });
  });

  describe("Failure型のテスト", () => {
    test('fail関数は`type: "failure"`を返す', () => {
      expect(r.fail("fuga")).toStrictEqual({ type: "failure", cause: "fuga" });
    });

    test("failTyped関数は`cause: {type: string}`を返す", () => {
      expect(r.failTyped("fuga", "")).toStrictEqual({
        type: "failure",
        cause: { type: "fuga", value: "" },
      });
    });

    test("failTyped関数は第2引数を持つとき`cause: {type: string. value: any}`を返す", () => {
      expect(r.failTyped("hoge", "fuga")).toStrictEqual({
        type: "failure",
        cause: { type: "hoge", value: "fuga" },
      });
    });

    test("isFailure関数はFailure型の時trueを返す", () => {
      expect(
        r.isFailure({
          type: "failure",
          cause: { type: "hoge" },
        }),
      ).toBe(true);
    });

    test("isFailure関数はTypedFailure型の時trueを返す", () => {
      expect(
        r.isFailure({
          type: "failure",
          cause: { type: "hoge" },
        }),
      ).toBe(true);
    });

    test("isFailure関数はSuccess型の時falseを返す", () => {
      expect(
        r.isFailure({ type: "success", value: "hoge" } as r.Success<"hoge">),
      ).toBe(false);
    });
  });

  describe("Result型のテスト", () => {
    test("ExtractSuccess型はResult型からSuccess型の型変数を抽出することができる", () => {
      type OriginalResult = r.Result<number, string>;
      const a: r.ExtractSuccess<OriginalResult> = 1;
    });

    test("ExtractFailure型はResult型からFailure型の型変数を抽出することができる", () => {
      type OriginalResult = r.Result<number, string>;
      const b: r.ExtractFailure<OriginalResult> = "1";
    });

    test("AnyhowResult型はあらゆる失敗の可能性を内包することができる", () => {
      const v: r.AnyhowResult<number> = r.fail("AnyhowError");

      if (r.isFailure(v)) {
        const v2: unknown = v.cause;
      }
    });

    test("TypedResult型は複数の例外の可能性を内包することができる", () => {
      type InvalidStartPointCause = r.TypedCause<
        "InvalidStart",
        "グリッドの生成基準点はBBoxの内部を指定してください"
      >;
      type InvalidBearingCause = r.TypedCause<
        "InvalidBearing",
        "角度は-45度から45度の範囲を代入してください"
      >;

      // type check
      const x = { type: "success", value: 1 } as r.TypedResult<
        number,
        InvalidStartPointCause | InvalidBearingCause
      >;

      // type check
      const y = r.failTyped(
        "InvalidStart",
        "グリッドの生成基準点はBBoxの内部を指定してください",
      ) as r.TypedResult<number, InvalidStartPointCause | InvalidBearingCause>;

      if (r.isSuccess(x)) {
        // type check
        const a: number = x.value;
      } else {
        if (x.cause.type === "InvalidStart") {
          // type check
          const a: InvalidStartPointCause["value"] = x.cause.value;
        } else if (x.cause.type === "InvalidBearing") {
          // type check
          const a: InvalidBearingCause["value"] = x.cause.value;
        } else {
          // type check
          const a: never = x.cause;
        }
      }

      if (r.isFailure(y)) {
        if (y.cause.type === "InvalidStart") {
          // type check
          const a: InvalidStartPointCause["value"] = y.cause.value;
        } else if (y.cause.type === "InvalidBearing") {
          // type check
          const a: InvalidBearingCause["value"] = y.cause.value;
        } else {
          // type check
          const a: never = y.cause;
        }
      } else {
        // type check
        const a: number = y.value;
      }
    });

    describe("unwrap関数のテスト", () => {
      test("unwrap関数はSuccess型の値を受け取った時、valueプロパティの値を返す", () => {
        expect(r.unwrap(r.succeed(1))).toBe(1);
      });

      test("unwrap関数はFailure型の値を受け取った時、例外を投げる", () => {
        expect(() => r.unwrap(r.fail(1))).toThrow();
      });
    });
  });

  describe("共通ユーティリティ関数のテスト", () => {
    // TODO REMOVE
    describe("map関数のテスト", () => {
      const f = r.map((v: number) => v + 1);

      test("map関数はSuccess型の値を受け取った時、引数の関数を実行してSuccess型を返す", () => {
        expect(f(r.succeed(1))).toStrictEqual(r.succeed(2));
      });

      test("map関数はFailure型の値を受け取った時、そのままFailure型を返す", () => {
        expect(f(r.fail("error"))).toStrictEqual(r.fail("error"));
      });
    });

    describe("mapError関数のテスト", () => {
      const f = r.mapError((v: number) => v + 1);

      test("mapError関数はSuccess型の値を受け取った時、そのままSuccess型を返す", () => {
        expect(f(r.succeed(1))).toStrictEqual(r.succeed(1));
      });

      test("mapError関数はFailure型の値を受け取った時、関数を実行してSuccess型を返す", () => {
        expect(f(r.fail(1))).toStrictEqual(r.succeed(2));
      });
    });

    describe("flatMap関数のテスト", () => {
      const f = r.flatMap((v: number) => {
        switch (v) {
          case 1:
            return r.succeed(v + 1);
          default:
            return r.fail("error");
        }
      });

      test("flatMap関数はSuccess型の値を受け取った時、引数の関数を実行してSuccess型を返す", () => {
        expect(f(r.succeed(1))).toStrictEqual(r.succeed(2));
      });

      test("flatMap関数はSuccess型の値を受け取った時、引数の関数を実行してFailure型を返す", () => {
        expect(f(r.succeed(2))).toStrictEqual(r.fail("error"));
      });

      test("flatMap関数はFailure型の値を受け取った時、そのままFailure型を返す", () => {
        expect(f(r.fail(1))).toStrictEqual(r.fail(1));
      });
    });

    describe("flatMapError関数のテスト", () => {
      const f = r.flatMapError((v: number) => {
        switch (v) {
          case 1:
            return r.succeed(v + 1);
          default:
            return r.fail("error");
        }
      });

      test("flatMapError関数はSuccess型の値を受け取った時、そのままSuccess型を返す", () => {
        expect(f(r.succeed(1))).toStrictEqual(r.succeed(1));
      });

      test("flatMapError関数はFailure型の値を受け取った時、引数の関数を実行してSuccess型を返す", () => {
        expect(f(r.fail(1))).toStrictEqual(r.succeed(2));
      });

      test("flatMapError関数はFailure型の値を受け取った時、引数の関数を実行してFailure型を返す", () => {
        expect(f(r.fail(2))).toStrictEqual(r.fail("error"));
      });
    });

    describe("tryCatch関数のテスト", () => {
      test("tryCatch関数は例外が投げられなければ、Success型を返す", () => {
        expect(
          r.tryCatch(
            () => 1 + 1,
            () => "error",
          ),
        ).toStrictEqual(r.succeed(2));
      });

      test("tryCatch関数は例外が投げられた時、Failure型を返す", () => {
        expect(
          r.tryCatch(
            () => {
              throw 1;
            },
            () => "error",
          ),
        ).toStrictEqual(r.fail("error"));
      });
    });

    describe("tryCatchAsync関数のテスト", () => {
      test("tryCatchAsync関数は非同期関数で例外が投げられなければ、PromiseLike<Success>型を返す", async () => {
        expect(
          await r.tryCatchAsync(
            async () => 1 + 1,
            () => "error",
          ),
        ).toStrictEqual(r.succeed(2));
      });

      test("tryCatchAsync関数は非同期関数で例外が投げられると、PromiseLike<Failure>型を返す", async () => {
        expect(
          await r.tryCatchAsync(
            async () => {
              throw 1;
            },
            () => "error",
          ),
        ).toStrictEqual(r.fail("error"));
      });
    });
  });
});
