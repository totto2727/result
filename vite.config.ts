import { defineConfig } from "vite";

const targetBasePath = `${import.meta.dir ?? "."}/src`;
const distBasePath = `${import.meta.dir ?? "."}/dist`;
const entry = [
  `${targetBasePath}/index.ts`,
  `${targetBasePath}/eager.ts`,
  `${targetBasePath}/lazy.ts`,
];

export default defineConfig({
  build: {
    outDir: `${distBasePath}/require`,
    minify: "esbuild",
    lib: {
      entry,
      formats: ["cjs"],
    },
    rollupOptions: {
      output: {
        entryFileNames: "[name].cjs",
      },
    },
  },
});
