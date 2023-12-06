import { describe, expect, test } from "bun:test";
import * as rutil from "./eager.mts";
import * as r from "./index.mts";

describe("ユーティリティ関数のテスト", () => {
  describe("map関数のテスト", () => {
    test("map関数はSuccess型の値を受け取った時、引数の関数を実行してSuccess型を返す", () => {
      expect(rutil.map(r.succeed(1), (v) => v + 1)).toStrictEqual(r.succeed(2));
    });

    test("map関数はFailure型の値を受け取った時、そのままFailure型を返す", () => {
      expect(
        rutil.map(r.fail("error") as r.Result<number, "error">, (v) => v + 1),
      ).toStrictEqual(r.fail("error"));
    });
  });

  describe("mapError関数のテスト", () => {
    test("mapError関数はSuccess型の値を受け取った時、そのままSuccess型を返す", () => {
      expect(
        rutil.mapError(r.succeed(1) as r.Result<number, "error">, (v) => v + 1),
      ).toStrictEqual(r.succeed(1));
    });

    test("mapError関数はFailure型の値を受け取った時、関数を実行してFailure型を返す", () => {
      expect(rutil.mapError(r.fail(1), (v) => v + 1)).toStrictEqual(r.fail(2));
    });
  });

  describe("flatMap関数のテスト", () => {
    test("flatMap関数はSuccess型の値を受け取った時、引数の関数を実行してSuccess型を返す", () => {
      expect(
        rutil.flatMap(r.succeed(1), (v) => {
          switch (v) {
            case 1:
              return r.succeed(v + 1);
            default:
              return r.fail("error");
          }
        }),
      ).toStrictEqual(r.succeed(2));
    });

    test("flatMap関数はSuccess型の値を受け取った時、引数の関数を実行してFailure型を返す", () => {
      expect(
        rutil.flatMap(r.succeed(2 as number), (v) => {
          switch (v) {
            case 1:
              return r.succeed(v + 1);
            default:
              return r.fail("error");
          }
        }),
      ).toStrictEqual(r.fail("error"));
    });

    test("flatMap関数はFailure型の値を受け取った時、そのままFailure型を返す", () => {
      expect(
        rutil.flatMap(r.fail(1), (v: number) => {
          switch (v) {
            case 1:
              return r.succeed(v + 1);
            default:
              return r.fail("error");
          }
        }),
      ).toStrictEqual(r.fail(1));
    });
  });

  describe("flatMapError関数のテスト", () => {
    test("flatMapError関数はSuccess型の値を受け取った時、そのままSuccess型を返す", () => {
      expect(
        rutil.flatMapError(r.succeed(1), (v: number) => {
          switch (v) {
            case 1:
              return r.succeed(v + 1);
            default:
              return r.fail("error");
          }
        }),
      ).toStrictEqual(r.succeed(1));
    });

    test("flatMapError関数はFailure型の値を受け取った時、引数の関数を実行してSuccess型を返す", () => {
      expect(
        rutil.flatMapError(r.fail(1), (v: number) => {
          switch (v) {
            case 1:
              return r.succeed(v + 1);
            default:
              return r.fail("error");
          }
        }),
      ).toStrictEqual(r.succeed(2));
    });

    test("flatMapError関数はFailure型の値を受け取った時、引数の関数を実行してFailure型を返す", () => {
      expect(
        rutil.flatMapError(r.fail(2), (v: number) => {
          switch (v) {
            case 1:
              return r.succeed(v + 1);
            default:
              return r.fail("error");
          }
        }),
      ).toStrictEqual(r.fail("error"));
    });
  });

  describe("tryCatch関数のテスト", () => {
    test("tryCatch関数は例外が投げられなければ、Success型を返す", () => {
      expect(
        rutil.tryCatch(
          () => 1 + 1,
          () => "error",
        ),
      ).toStrictEqual(r.succeed(2));
    });

    test("tryCatch関数は例外が投げられた時、Failure型を返す", () => {
      expect(
        rutil.tryCatch(
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
        await rutil.tryCatchAsync(
          async () => 1 + 1,
          () => "error",
        ),
      ).toStrictEqual(r.succeed(2));
    });

    test("tryCatchAsync関数は非同期関数で例外が投げられると、PromiseLike<Failure>型を返す", async () => {
      expect(
        await rutil.tryCatchAsync(
          async () => {
            throw 1;
          },
          () => "error",
        ),
      ).toStrictEqual(r.fail("error"));
    });
  });
});
