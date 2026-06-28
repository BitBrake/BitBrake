import { fileURLToPath, URL } from "node:url";
import { build } from "vite";

const resolvePath = (path) => fileURLToPath(new URL(path, import.meta.url));

await build({
  root: resolvePath("../"),
  publicDir: "public",
  build: {
    outDir: "dist-extension",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        "side-panel": resolvePath("../src/extension/side-panel.html"),
        "service-worker": resolvePath("../src/extension/service-worker.ts"),
      },
      output: {
        entryFileNames: (chunk) =>
          chunk.name === "service-worker" ? "assets/service-worker.js" : "assets/[name].js",
        chunkFileNames: "assets/[name].js",
        assetFileNames: "assets/[name][extname]",
      },
    },
  },
});
