import * as esbuild from "esbuild";

const targetBasePath = `${import.meta.dir ?? "."}/src`;
const distBasePath = `${import.meta.dir ?? "."}/dist`;

// ベースディレクトリからのパス（拡張子は除く）
const files = ["index", "eager", "lazy"];

function entrypoints(files: string[], extension: "ts" | "mts" | "cts") {
  return files.map((v) => `${targetBasePath}/${v}.${extension}`);
}

const esms = entrypoints(files, "mts");
const cjss = entrypoints(files, "cts");

await Promise.all([
  // Bun.build({
  //   entrypoints: esms,
  //   outdir: `${distBasePath}/import`,
  //   target: "node",
  //   format: "esm",
  //   splitting: true,
  //   minify: true,
  //   naming: "[dir]/[name].m[ext]",
  // })
  //   .then(console.info)
  //   .catch(console.error),
  esbuild
    .build({
      entryPoints: esms,
      bundle: true,
      minify: true,
      splitting: true,
      outdir: `${distBasePath}/import`,
      platform: "neutral",
      format: "esm",
      target: "esnext",
      outExtension: { ".js": ".mjs" },
    })
    .then(console.info)
    .catch(console.error),
  esbuild
    .build({
      entryPoints: cjss,
      bundle: true,
      minify: true,
      outdir: `${distBasePath}/require`,
      platform: "node",
      format: "cjs",
      target: "esnext",
      outExtension: { ".js": ".cjs" },
    })
    .then(console.info)
    .catch(console.error),
]);
