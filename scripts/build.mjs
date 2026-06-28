import { fileURLToPath, URL } from "node:url";
import { build } from "vite";

const resolvePath = (path) => fileURLToPath(new URL(path, import.meta.url));

await build({
  root: resolvePath("../"),
  publicDir: "public",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: resolvePath("../index.html"),
    },
  },
});
