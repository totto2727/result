const targetBasePath = `${import.meta.dir ?? "."}/src`;
const distBasePath = `${import.meta.dir ?? "."}/dist`;
const entrypoints = [
  `${targetBasePath}/index.ts`,
  `${targetBasePath}/eager.ts`,
  `${targetBasePath}/lazy.ts`,
];

await Bun.build({
  entrypoints,
  outdir: `${distBasePath}/browser`,
  target: "browser",
  format: "esm",
  splitting: true,
  minify: true,
  naming: "[dir]/[name].[ext]",
});

await Bun.build({
  entrypoints,
  outdir: `${distBasePath}/import`,
  target: "node",
  format: "esm",
  splitting: true,
  minify: true,
  naming: "[dir]/[name].m[ext]",
});
