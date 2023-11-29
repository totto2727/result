const targetBasePath = `${import.meta.dir ?? "."}/src`;
const distBasePath = `${import.meta.dir ?? "."}/dist`;

await Bun.build({
  entrypoints: [`${targetBasePath}/index.ts`],
  outdir: `${distBasePath}/browser`,
  target: "browser",
  format: "esm",
  splitting: true,
  minify: true,
  naming: "[dir]/[name].[ext]",
});

await Bun.build({
  entrypoints: [`${targetBasePath}/index.ts`],
  outdir: `${distBasePath}/import`,
  target: "node",
  format: "esm",
  splitting: true,
  minify: true,
  naming: "[dir]/[name].m[ext]",
});
