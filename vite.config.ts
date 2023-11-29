import { resolve } from "node:path";
import { defineConfig } from "vite";

const targetBasePath = `${import.meta.dir ?? "."}/src`;
const distBasePath = `${import.meta.dir ?? "."}/dist`;

export default defineConfig({
  build: {
    outDir: `${distBasePath}/require`,
    minify: "esbuild",
    lib: {
      entry: [resolve(targetBasePath, "index.ts")],
      formats: ["cjs"],
    },
    rollupOptions: {
      output: {
        entryFileNames: "[name].cjs",
      },
    },
  },
});
