import type { RouteRecord } from "vite-react-ssg";
import { AppShell } from "@/app/shell/AppShell";
import { MarkdownPage } from "@/features/content/MarkdownPage";
import { NotFoundPage } from "@/features/content/NotFoundPage";
import { RouteErrorBoundary } from "@/shared/components/ErrorBoundary";
import { pages, type PageConfig } from "@/config/pages";

function routeForPage(page: PageConfig): RouteRecord {
  const errorElement = <RouteErrorBoundary />;

  if (page.kind === "markdown") {
    // Markdown pages render synchronously (content is in the prerender), so they
    // use a plain element — no lazy boundary needed.
    const element = <MarkdownPage page={page} />;
    return page.path === "/"
      ? { index: true, element, errorElement }
      : { path: page.path.replace(/^\//, ""), element, errorElement };
  }

  // React pages use vite-react-ssg route-level lazy: the runtime resolves the
  // chunk before hydration, so the prerendered HTML and the client match.
  const lazy = async () => ({ Component: (await page.importer()).default });
  return page.path === "/"
    ? { index: true, lazy, errorElement }
    : { path: page.path.replace(/^\//, ""), lazy, errorElement };
}

const childRoutes: RouteRecord[] = pages.map(routeForPage);
childRoutes.push({ path: "*", element: <NotFoundPage /> });

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
