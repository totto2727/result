await Bun.build({
  entrypoints: ["./index.ts"],
  outdir: "./dist/browser",
  target: "browser",
  format: "esm",
  splitting: true,
  minify: true,
  naming: "[dir]/[name].[ext]",
});

await Bun.build({
  entrypoints: ["./index.ts"],
  outdir: "./dist/import",
  target: "node",
  format: "esm",
  splitting: true,
  minify: true,
  naming: "[dir]/[name].m[ext]",
});
