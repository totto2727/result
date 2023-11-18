# result

## 概要

このパッケージはTypeScript環境に`Result`型および関連するユーティリティを追加します。
Result(Either)型はKotlinやRust、Haskellに標準で導入されている型であり、処理が失敗する可能性を示す型です。
これにより、JavaScript標準の`try catch`の問題点である、「どのような例外が発生するのか型から判別することができない」という問題を解決できます。

## 他のResult型パッケージとの差別点

### クライアントサイドとサーバサイドの両方で利用しやすい

- クラスではなく、オブジェクトと関数で実装をしています
- 最適化により1kB程度までコードが縮小されます
- Next.js(App Router)やRemix、Qwik Cityといったクライアントサイドとサーバサイドを統合するフレームワークでも、スムーズにResult型の恩恵を受けることができます。

### 関数型プログラミングをしやすい
<!-- - 遅延評価を前提に実装されています -->
- 関数合成([remeda](https://remedajs.com/)の`pipe`関数や`flow`関数など)が容易な実装です

## インストール

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

## Example

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
import * as r from "@totto2727/result"

// NANを返すことは避けたい
function divide(dividend: number, divisor: number): Result<number, string> {
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
type OriginalResult = Result<"成功", "失敗">
```

## 基本の関数

### インスタンス生成

`Result`型を利用する際は、`succeed`関数や`fail`関数を利用するば簡単に値を生成できます。

```typescript
function returnResult(): Result<string, string> {
  // なんらかの処理
  if (error) return fail("任意のエラーに関する値");
  return succeed("処理に成功しました！");
}
```

> **Note**
>
> `fail`関数でも`Result`型の利用は可能ですが、より詳細な例外の管理のために`failTyped`関数の利用を推奨します。
> 詳細は下記の応用を参照してください。

### 型ガード関数

`isSuccess`関数と`isFailure`関数を利用すると、成功した場合、失敗した場合の処理を効率よく型安全に記述することができます。

```typescript
const result = returnResult()

if (isSuccess(result)) {
  // 処理に成功した時の処理
  // result.valueがResult<T, U>のTに推論されます
  const success = result.value;

  // ...
}

if (isFailure(result)) {
  // 処理に失敗した時の処理
  // result.causeがResult<T, U>のUに推論されます
  const failure = result.cause;

  // ...
}
```

## 応用の型

### AnyhowResult

どのような原因で失敗するかは不明な`Result`型の拡張です。
この型でも失敗の原因を絞り込み、`cause`プロパティを利用することも可能ですが、`unknown`型になるため扱い辛くなります。
そのため、失敗の詳細を知る必要がない場合や、段階的に`Result`型を導入する過程で失敗に関する型定義が不十分である場合の利用を推奨します。
厳密に失敗周りの型定義が可能な場合は、基本的に`TypedResult`型の利用を推奨します。

```typescript
export type AnyhowFailure = Failure<unknown>;

function returnAnyhowResult(): AnyhowResult<string> {
  // なんらかの処理
  // fail関数はどのような値でも取れる
  if (error1) return fail("任意のエラーに関する値");
  else if (error2) return fail(1);

  return succeed("処理に成功しました！");
}
```

### TypedResult

失敗の原因が厳密に定義されている`Result`型の拡張です。
`TypedCause`型と`failTyped`関数(下記参照)のラッパーを定義することで、絞り込みが容易な`Result`型を定義することができます。
失敗のキーと詳細はそれぞれ別のプロパティとしています。
そのため、DB由来する失敗は全て同じキーとしつつ、ユーザに提供するメッセージを個別に提供するといったことが可能です。

```typescript
// 第1引数が型絞り込み用の文字列リテラル
// 第2引数が失敗に関する任意の型
type InternalCause = TypedCause<"InternalError", string>; 

// 特定の失敗を返すためのラッパー関数
function failInternal(message: string) {
  return failTyped("InternalError", message);
}

function returnTypedResult(): TypedResult<string, InternalCause> {
  // なんらかの処理
  if (error1) return failInternal(JSON.stringify(error1))
  else if (error2) return failInternal(JSON.stringify(error2))

  return succeed("処理に成功しました！");
}
```

## 応用の関数

### failTyped

第1引数に失敗の原因を示すキー、第2引数に失敗の詳細を示す値を渡すことができます。
上記の`TypedResult`型との併用を想定しています。

## ユーティリティ型

## ユーティリティ関数

## 影響を受けた言語及びライブラリ

- Rust
  - Result
  - [anyhow](https://docs.rs/anyhow/latest/anyhow/)
- Swift
  - 命名(JS標準の例外と重複することを避けるため)
