import type { RouteRecord } from "vite-react-ssg";
import { AppShell } from "@/app/shell/AppShell";
import { RouteErrorBoundary } from "@/shared/components/ErrorBoundary";
import { pages, type PageConfig } from "@/config/pages";

function routeForPage(page: PageConfig): RouteRecord {
  const errorElement = <RouteErrorBoundary />;

  if (page.kind === "markdown") {
    // Process Markdown in a route loader during SSG. vite-react-ssg serializes
    // that result for hydration/navigation, so the browser does not need the
    // Markdown parser, KaTeX renderer, sanitizer, or every article source.
    const loader = async () => {
      const [{ loadMarkdown }, { processMarkdown }] = await Promise.all([
        import("@/features/content/markdownLoader"),
        import("@/features/content/markdownService"),
      ]);
      return processMarkdown(await loadMarkdown(page.contentPath));
    };
    const lazy = async () => {
      const { MarkdownPage } = await import("@/features/content/MarkdownPage");
      return {
        Component: () => <MarkdownPage page={page} />,
      };
    };

    return page.path === "/"
      ? { index: true, loader, lazy, errorElement }
      : {
          path: page.path.replace(/^\//, ""),
          loader,
          lazy,
          errorElement,
        };
  }

  // React pages use vite-react-ssg route-level lazy: the runtime resolves the
  // chunk before hydration, so the prerendered HTML and the client match.
  const lazy = async () => ({ Component: (await page.importer()).default });
  return page.path === "/"
    ? { index: true, lazy, errorElement }
    : { path: page.path.replace(/^\//, ""), lazy, errorElement };
}

const childRoutes: RouteRecord[] = pages.map(routeForPage);
childRoutes.push({
  path: "*",
  lazy: async () => {
    const { NotFoundPage } = await import("@/features/content/NotFoundPage");
    return { Component: NotFoundPage };
  },
});

/**
 * Route tree (§11). Generated entirely from the page registry. Declared as
 * vite-react-ssg RouteRecords so every static route is prerendered to HTML at
 * build time. `entry` ties the shell's CSS to every route's prerendered output.
 */
export const routes: RouteRecord[] = [
  {
    path: "/",
    element: <AppShell />,
    entry: "src/app/shell/AppShell.tsx",
    errorElement: <RouteErrorBoundary />,
    children: childRoutes,
  },
];
