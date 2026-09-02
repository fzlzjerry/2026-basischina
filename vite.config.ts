import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { wgslVitePlugin } from "@vgpu/wgsl/loader-vite";
import { defineConfig, loadEnv, type Plugin } from "vite";
import { resolveWikiEnv } from "./src/config/envShared";

function katexWoff2Only(): Plugin {
  return {
    name: "katex-woff2-only",
    enforce: "pre",
    transform(code, id) {
      if (!id.includes("/katex/dist/katex.min.css")) return null;

      // KaTeX lists WOFF2, WOFF and TTF for every face. All supported browsers
      // understand WOFF2, so the other sources only copy 40 unused files into
      // production and can never be selected ahead of the first declaration.
      const transformed = code.replace(
        /src:([^}]+)/g,
        (declaration, sources) => {
          const woff2 = sources.match(
            /url\([^)]+\.woff2\)\s*format\(["']woff2["']\)/,
          )?.[0];
          return woff2 ? `src:${woff2}` : declaration;
        },
      );

      return { code: transformed, map: null };
    },
  };
}

function stripAutomaticPreloads(html: string): string {
  // vite-react-ssg 0.9 recursively preloads every asset in a matched entry's
  // SSR manifest. On article routes that includes fallback font formats and the
  // entire Mermaid diagram ecosystem, even though only one diagram may be used.
  // Let CSS, native image priority, and dynamic imports request actual needs.
  return html
    .replace(/<link\b(?=[^>]*\brel=["']modulepreload["'])[^>]*>/gi, "")
    .replace(
      /<link\b(?=[^>]*\brel=["']preload["'])(?=[^>]*\bas=["'](?:font|image)["'])[^>]*>/gi,
      "",
    );
}

// Vite base path is derived from the same env contract the app/router/sitemap
// use, so the deployment prefix is never hard-coded independently. See §7/§8.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const base = resolveWikiEnv(env).basePath;

  return {
    base,
    plugins: [
      katexWoff2Only(),
      react(),
      tailwindcss(),
      wgslVitePlugin({ minify: true }),
    ],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    build: {
      // Mermaid and the peelable-sticker renderer are deliberately lazy,
      // self-contained features. Their explicit 900 KiB raw / 300 KiB gzip
      // ceilings live in audit-build.ts; align Vite's warning with that policy
      // instead of emitting the generic 500 KiB warning for optional chunks.
      chunkSizeWarningLimit: 900,
    },
    ssgOptions: {
      // The wildcard route is intentionally omitted from automatic SSG route
      // discovery. Render one concrete path through it so static hosts receive
      // a real not-found document instead of hydrating the homepage shell.
      includedRoutes: (paths) => [...paths, "/404"],
      onPageRendered: (_route, html) => stripAutomaticPreloads(html),
    },
  };
});
