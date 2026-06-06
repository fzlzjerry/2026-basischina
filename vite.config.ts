import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv } from "vite";
import { normalizeBasePath } from "./src/config/envShared";

// Vite base path is derived from the same env contract the app/router/sitemap
// use, so the deployment prefix is never hard-coded independently. See §7/§8.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const base = normalizeBasePath(env.VITE_BASE_PATH || "/basis-china/");

  return {
    base,
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    build: {
      // Mermaid is large; keep it out of the entry chunk (loaded on demand).
      chunkSizeWarningLimit: 1500,
    },
  };
});
