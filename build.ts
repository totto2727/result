import * as esbuild from "esbuild";

const targetBasePath = `${import.meta.dir ?? "."}/src`;
const distBasePath = `${import.meta.dir ?? "."}/dist`;
const entrypoints = [
  `${targetBasePath}/index.ts`,
  `${targetBasePath}/eager.ts`,
  `${targetBasePath}/lazy.ts`,
];

await Promise.all([
  Bun.build({
    entrypoints,
    outdir: `${distBasePath}/import`,
    target: "node",
    format: "esm",
    // splitting: true,
    minify: true,
    naming: "[dir]/[name].m[ext]",
  })
    .then(console.info)
    .catch(console.error),
  esbuild
    .build({
      entryPoints: entrypoints,
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
