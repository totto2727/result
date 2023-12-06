# result

## 概要

このパッケージはTypeScript環境に`Result`型および関連するユーティリティを追加します。
Result(Either)型はKotlinやRust、Haskellに標準で導入されている型であり、処理が失敗する可能性を示す型です。
これにより、JavaScript標準の`try catch`の問題点である、「どのような例外が発生するのか型から判別することができない」という問題を解決できます。

## 他のResult型パッケージとの差別点

### クライアントサイドとサーバサイドの両方で利用しやすい

- クラスではなく、オブジェクトと関数で実装をしています
- 最適化によりコードが数kBに縮小されます
- Next.js(App Router)やRemix、Qwik Cityといったクライアントサイドとサーバサイドを統合するフレームワークでも、スムーズにResult型の恩恵を受けることができます。

### 関数型プログラミングをしやすい

- 全てイミュータブルな実装がされています
- 遅延評価と正確評価の両方で実装されています
- 関数合成([remeda](https://remedajs.com/)の`pipe`関数や`flow`関数など)が容易な実装です

## インストール

### 前提

`tsconfig.json`は以下の設定のいずれかである必要があります。

```
"moduleResolution": "node16",
"moduleResolution": "nodenext",
"moduleResolution": "bundler",
```

### Node.js or Bun

```bash
npm add @totto2727/result
```

```bash
yarn add @totto2727/result
```

```bash
pnpm add @totto2727/result
```

```bash
bun add @totto2727/result
```

```ts
import * as r from "@totto2727/result"
import * as rEager from "@totto2727/result/eager"
import * as rLazy from "@totto2727/result/lazy"
```

### ブラウザ or Deno

```bash
import * as r from "https://esm.sh/@totto2727/result"
import * as rEager from "https://esm.sh/@totto2727/result/eager"
import * as rLazy from "https://esm.sh/@totto2727/result/lazy"
```

## Example

以下のサンプルは全てDenoおよびブラウザ環境を想定しています。

### Result型を用いない場合

```ts
// NANを返すことは避けたい
function divide(dividend: number, divisor: number): number {
    if (y === 0) {
        throw new Error("0除算は禁止されています");
    }

    return dividend / divisor;
}

// 例外発生！
const quotient = devide(1, 0);

// 実行前にアプリケーションが異常終了
console.log(quotient);

```

上記のサンプルでは、devide関数が例外を発生させる可能性を型から読み取ることはできません。
コメントやJS Docを記述することで対策は可能ですが、tscコマンドがコンパイルエラーを発生させることはありません。
誰かかがうっかり0を渡すと、アプリケーションが予期せぬ例外により終了する可能性があります。

### Result型を用いた場合

```ts
import * as r from "https://esm.sh/@totto2727/result"

// NANを返すことは避けたい
function divide(dividend: number, divisor: number): r.Result<number, string> {
    if (y === 0) {
        return r.fail("0除算は禁止されています");
    }

    return r.succeed(dividend / divisor);
}

const quotient = devide(1, 0);

// 失敗したか判別するユーザ定義型ガード
if (r.isFailure(quotient)) {
    // 以下quotientはFailure型として処理される
    consolo.log(quotient.cause)
    // output: 0除算は禁止されています
}

// 以下quotientはSuccess型として処理される
console.log(quotient.value)
// output: ${計算結果}
```

これであればどうなるでしょうか？
`divide`関数は`number`型ではなく`Result<number, string>`型を返すため、計算結果を利用するために必ず成否の確認が必要となります。
もし、成否の確認を忘れても`tsc`がコンパイルエラーを出力して確認忘れを教えてくれることでしょう。
これで予期せぬ例外によるアプリケーションの終了を避けることができました！
また、失敗の型を詳細に記述することで失敗の原因を型から読み取ったり、原因の絞り込みが容易になります。
逆にエラーの詳細を他の処理に渡す必要がなければ、`AnyhowResult`型で型の記述量を減らすこともできます。

下記では基本的な型と関数に加え、型の複雑性を解消するユーティリティ型および関数の解説を行います。

## 基本の型

```typescript
import * as r from "https://esm.sh/@totto2727/result"

type OriginalResult = r.Result<"成功", "失敗">
```

## 基本の関数

### インスタンス生成

`Result`型を利用する際は、`succeed`関数や`fail`関数を利用するば簡単に値を生成できます。

```typescript
import * as r from "https://esm.sh/@totto2727/result"

function returnResult(): r.Result<string, string> {
    // なんらかの処理
    if (error) return r.fail("任意のエラーに関する値");
    return r.succeed("処理に成功しました！");
}
```

> **Note**
>
> `fail`関数でも`Result`型の利用は可能ですが、より詳細な例外の管理のために`failTyped`関数の利用を推奨します。
> 詳細は下記の応用を参照してください。

### 型ガード関数

`isSuccess`関数と`isFailure`関数を利用すると、成功した場合、失敗した場合の処理を効率よく型安全に記述することができます。

```typescript
import * as r from "https://esm.sh/@totto2727/result"

const result = returnResult()

if (r.isSuccess(result)) {
    // 処理に成功した時の処理
    // result.valueがResult<T, U>のTに推論されます
    const success = result.value;

    // ...
}

if (r.isFailure(result)) {
    // 処理に失敗した時の処理
    // result.causeがResult<T, U>のUに推論されます
    const failure = result.cause;

    // ...
}
```

### unwrap

Result型を通常の値に変換する関数です。
フロントエンドの状態管理など、Result型のままでは扱いにくい場面で使用することで、素の値となり以降のコードをシンプルに記述する事ができます。

> **Warn**
>
> 原則、trycatch文で覆われていることが確実な状況で使用してください。
> パニックを起こす可能性や、なんらかの根拠から確実に成功することがわかっている場合は、コードの前後に必ずコメントを記述してください。
> これにより、実装者以外がコードの文脈を汲み取りやすくなります。

```ts
import * as r from "https://esm.sh/@totto2727/result"

const result = returnResultF();

// Success型であればResult型を外した値が返ってくる
// Failure型の場合、causeがthrowされる
const value = r.unwrap(result);
```

## 応用の型

### AnyhowResult

どのような原因で失敗するかは不明な`Result`型の拡張です。
この型でも失敗の原因を絞り込み、`cause`プロパティを利用することも可能ですが、`unknown`型になるため扱い辛くなります。
そのため、失敗の詳細を知る必要がない場合や、段階的に`Result`型を導入する過程で失敗に関する型定義が不十分である場合のみ利用してください。
厳密に失敗周りの型定義が可能な場合は、基本的に`TypedResult`型の利用してください。

```typescript
import * as r from "https://esm.sh/@totto2727/result"

// 実装
// type AnyhowFailure = Failure<unknown>;

function returnAnyhowResult(): r.AnyhowResult<string> {
    // なんらかの処理
    // fail関数はどのような値でも取れる
    if (error1) return r.fail("任意のエラーに関する値");
    else if (error2) return r.fail(1);

    return r.succeed("処理に成功しました！");
}
```

### TypedResult

失敗の原因が厳密に定義されている`Result`型の拡張です。
`TypedCause`型と`failTyped`関数(下記参照)のラッパーを定義することで、絞り込みが容易な`Result`型を定義することができます。
失敗のキーと詳細はそれぞれ別のプロパティとしています。
そのため、DB由来する失敗は全て同じキーとしつつ、ユーザに提供するメッセージを個別に提供するといったことが可能です。

```typescript
import * as r from "https://esm.sh/@totto2727/result"

// 第1引数が型絞り込み用の文字列リテラル
// 第2引数が失敗に関する任意の型
type InternalCause = r.TypedCause<"InternalError", string>;

// 特定の失敗を返すためのラッパー関数
function failInternal(message: string) {
    return r.failTyped("InternalError", message);
}

function returnTypedResult(): r.TypedResult<string, InternalCause> {
    // なんらかの処理
    if (error1) return failInternal(JSON.stringify(error1))
    else if (error2) return failInternal(JSON.stringify(error2))

    return r.succeed("処理に成功しました！");
}
```

## 応用の関数

### failTyped

第1引数に失敗の原因を示すキー、第2引数に失敗の詳細を示す値を渡すことができます。
上記の`TypedResult`型との併用を想定しています。

## ユーティリティ型

### ExtractSuccess

Result型からSuccess型の型変数を抽出する型関数です。

```ts
import * as r from "https://esm.sh/@totto2727/result"

type OriginalResult = r.Result<string, number>
type OriginalSuccess = r.ExtractSuccess<OriginalResult> // string
```

### ExtractFailure

Result型からFailure型の型変数を抽出する型関数です。

```ts
import * as r from "https://esm.sh/@totto2727/result"

type OriginalResult = r.Result<string, number>
type OriginalSuccess = r.ExtractFailure<OriginalResult> // number
```

## ユーティリティ関数

以下の関数には全て正格評価バージョン(`@totto2727/result/eager`)と遅延評価バージョン`@totto2727/result/lazy`が存在します。
手続的な処理は正格評価バージョン、`remeda`の`pipe`関数のような関数合成では遅延評価バージョンを利用することで効率的なプログラミングが可能です。

> **Note**
>
> 関数言語圏における`Monad`の仕組み把握しておくと、以下の関数の仕様を把握しやすくなります。
> [fp-tsを用いたMonadの解説](https://dev.to/gcanti/getting-started-with-fp-ts-monad-6k)

### map

`Result`型の値に関数を適用する関数です。
`Success`型であれば関数を適用し、`Failure`型であればそのままバイパスします。
この関数を用いることで、型ガード関数による検証なしで`Result`型の操作が可能になります。

```ts
import * as r from "https://esm.sh/@totto2727/result";
import * as rEager from "https://esm.sh/@totto2727/result/eager";
import * as rLazy from "https://esm.sh/@totto2727/result/lazy";
import * as remeda from "https://esm.sh/remeda@1.29.0";

const fn = (x: number) => `${x}`;
const fn2 = (x: number) => x + 1;
const returnResult: () => r.AnyhowResult<number> = () => r.succeed(1);

const result = returnResult(); // Success 1

const eagerMapped = rEager.map(result, fn); // Success "1"

const mappedFn: (x: r.AnyhowResult<number>) => r.AnyhowResult<string> = rLazy.map(fn);
const lazyMapped = mappedFn(result); // Success "1"

const piped = remeda.pipe(result, rLazy.map(fn2), rLazy.map(fn)) // Success "2"
```

### mapError

`Result`型の失敗の原因に関数を適用する関数です。
`Failure`型であれば関数を適用し、`Success`型であればそのままバイパスします。
この関数を用いることで、型ガード関数による検証なしで`Result`型の操作が可能になります。

```ts
import * as r from "https://esm.sh/@totto2727/result";
import * as rEager from "https://esm.sh/@totto2727/result/eager";
import * as rLazy from "https://esm.sh/@totto2727/result/lazy";
import * as remeda from "https://esm.sh/remeda@1.29.0";

const fn = (x: string) => x.length;
const fn2 = (x: string) => `${x}${x}`;
const returnResult: () => r.Result<unknown, string> = () => r.fail("error");

const result = returnResult(); // Failure "error"

const eagerMapped = rEager.mapError(result, fn); // Failure 5

const mappedFn: (x: r.Result<unknown, string>) => r.Result<unknown, number> = rLazy.mapError(fn);
const lazyMapped = mappedFn(result); // Failure 5

const piped = remeda.pipe(result, rLazy.mapError(fn2), rLazy.mapError(fn)) // Failure 10
```

### flatMap

`Result`型の値に`Result`型を返す関数を適用する関数です。
`Success`型であれば関数を適用し、`Failure`形であればそのままバイパスします。
この関数を用いることで、型ガード関数なしかつ、`Result`型をネストさせることなく、処理をチェーンさせることができます。

```ts
import * as r from "https://esm.sh/@totto2727/result";
import * as rEager from "https://esm.sh/@totto2727/result/eager";
import * as rLazy from "https://esm.sh/@totto2727/result/lazy";
import * as remeda from "https://esm.sh/remeda@1.29.0";

const fn = (x: number): r.AnyhowResult<string> => r.succeed(`${x}`);
const fn2 = (x: number): r.AnyhowResult<number> => r.succeed(x + 1);
const returnResult: () => r.AnyhowResult<number> = () => r.succeed(1);

const result = returnResult(); // Success 1

const eagerMapped = rEager.flatMap(result, fn); // Success "1"

const mappedFn: (x: r.AnyhowResult<number>) => r.AnyhowResult<string> = rLazy.flatMap(fn);
const lazyMapped = mappedFn(result); // Success "1"

const piped = remeda.pipe(result, rLazy.flatMap(fn2), rLazy.flatMap(fn)) // Success "2"
```

### flatMapError

`Result`型の失敗の原因に`Result`型を返す関数を適用する関数です。
`Failure`型であれば関数を適用し、`Success`型であればそのままバイパスします。
この関数を用いることで、型ガード関数なしかつ、`Result`型をネストさせることなく、処理をチェーンさせることができます。

```ts
import * as r from "https://esm.sh/@totto2727/result";
import * as rEager from "https://esm.sh/@totto2727/result/eager";
import * as rLazy from "https://esm.sh/@totto2727/result/lazy";
import * as remeda from "https://esm.sh/remeda@1.29.0";

const fn = (x: string) => r.fail(x.length);
const fn2 = (x: string) => r.fail(`${x}${x}`);
const returnResult: () => r.Result<unknown, string> = () => r.fail("error");

const result = returnResult(); // Failure "error"

const eagerMapped = rEager.flatMapError(result, fn); // Failure 5

const mappedFn: (x: r.Result<unknown, string>) => r.Result<unknown, number> = rLazy.flatMapError(fn);
const lazyMapped = mappedFn(result); // Failure 5

const piped = remeda.pipe(result, rLazy.flatMapError(fn2), rLazy.flatMapError(fn)) // Success 10
```

### tryCatch

例外を投げる可能性がある関数を`Result`型もしくは`Result`型を返す関数に変換する関数です。
正格評価の場合、第一引数は引数を持たない関数となります。
遅延評価の場合、第一引数は任意の引数を持つ関数となります。
どちらの場合でも、例外発生時に実行される関数の引数の型は実装者が責任を持って設定する必要があります。
どのような例外が発生するか不明な場合は、引数の型を`unknown`型に設定し、任意の`TypedCause`型を返却することで例外を扱いやすくなります。

```ts
import * as r from "https://esm.sh/@totto2727/result";
import * as rEager from "https://esm.sh/@totto2727/result/eager";
import * as rLazy from "https://esm.sh/@totto2727/result/lazy";
import * as remeda from "https://esm.sh/remeda@1.29.0";

const fn = (x: number) => `${x}`;
const fn2 = (x: number) => x + 1;
const throwableFn = (x: number) => {
    if (x % 2) {
        return x;
    } else {
        throw `${x}`;
    }
};

const result1: r.Result<number, string> = rEager.tryCatch(
    () => throwableFn(2),
    (e: unknown) => `${JSON.stringify(e)}`
);

const resultFn = rLazy.tryCatch(
    throwableFn,
    (e: unknown) => `${JSON.stringify(e)}`
);
const result2: r.Result<number, string> = resultFn(2) // result1と同等のオブジェクト
```

### tryCatchAsync

例外を投げる可能性がある非同期関数を`Result`型もしくは`Result`型を返す関数に変換する関数です。
正格評価の場合、第一引数は引数を持たない非同期関数となります。
遅延評価の場合、第一引数は任意の引数を持つ非同期関数となります。
どちらの場合でも、例外発生時に実行される関数の引数の型は実装者が責任を持って設定する必要があります。
どのような例外が発生するか不明な場合は、引数の型を`unknown`型に設定し、任意の`TypedCause`型を返却することで例外を扱いやすくなります。

> **Note**
>
> この関数は厳密には`Promise`ではなく`PromiseLike`を扱う関数です。
> これはPrismaの`PrismaPromise`クラスのような標準の`Promise`を継承していないクラスも取り扱うためです。
> しかし、この関数から返却されるオブジェクトがどのような`Promise`実装か型から判別できません。
> そのため、Prismaのトランザクションのように非標準の`Promise`に依存している処理は一つの関数にまとめた上で、`tryCatchAsync`
> 関数で覆うことを推奨します。
> これにより明確にレイヤーを分割できる上、コードも簡略かされます。

```ts
import * as r from "https://esm.sh/@totto2727/result";
import * as rEager from "https://esm.sh/@totto2727/result/eager";
import * as rLazy from "https://esm.sh/@totto2727/result/lazy";
import * as remeda from "https://esm.sh/remeda@1.29.0";

const fn = (x: number) => `${x}`;
const fn2 = (x: number) => x + 1;
const throwableFn = async (x: number) => {
    if (x % 2) {
        return x;
    } else {
        throw `${x}`;
    }
};

const result1: r.Result<number, string> = await rEager.tryCatchAsync(
    async () => await throwableFn(2),
    (e: unknown) => `${JSON.stringify(e)}`
);

const resultFn = rLazy.tryCatchAsync(
    throwableFn,
    (e: unknown) => `${JSON.stringify(e)}`
);
const result2: r.Result<number, string> = await resultFn(2) // result1と同等のオブジェクト
```

## 影響を受けた言語及びライブラリ

- Rust
    - Result
    - [anyhow](https://docs.rs/anyhow/latest/anyhow/)
- Swift
    - 命名(JS標準の例外と重複することを避けるため)

## 開発者向け

### 開発環境

- 実行環境
    - Bun >1.0.0
- エディタ
    - 現時点ではJetbrains IDEの設定のみ用意されています。
    - 今後、VSCodeの設定ファイルを追加する予定です。

### Jetbrains

- Plugin
    - [Biome](https://plugins.jetbrains.com/plugin/22761-biome)

### VSCode

TODO

### 開発手順

1. このリポジトリをフォークする
2. フォークしたリポジトリをローカルにクローンしてプロジェクトルートに移動する
3. パッケージのインストール
   ```bash
   bun i
   ```
4. 開発する
5. 変更内容を記述する
   ```bash
   bun changeset
   ```
6. コミット前
   ```bash
   bun precommit
   ```
7. コミット＆プッシュ
8. フォークしたリポジトリからプルリクエストを作成する
9. 以下は管理者がバージョンアップする場合のみ
10. バージョンの変更とプッシュ
    ```bash
    bun changeset version
    ```
11. mainブランチにマージする
12. タグをつけてプッシュ
    ```bash
    bun changeset tag
    ```
13. CI/CDが自動でNPMに公開する
