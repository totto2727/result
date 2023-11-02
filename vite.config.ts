import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "./dist/require",
    minify: "esbuild",
    lib: {
      entry: [resolve(__dirname, "index.ts")],
      fileName: "index",
      formats: ["cjs"],
    },
  },
});
