import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { PageTransition } from "./PageTransition";
import { PageLoading } from "@/shared/components/PageLoading";
import { useScrollToTop } from "@/shared/hooks/useScrollToTop";
import { useRouteFocus } from "@/shared/hooks/useRouteFocus";
import { useWarmLazyRoutes } from "@/shared/hooks/useWarmLazyRoutes";

// Global stylesheets are imported from the shell because the shell is declared
// as the SSG route `entry` — this ensures their CSS is linked into every
// prerendered route's HTML (prevents prehydration style loss).
import "@/styles/main.css";
import "@/styles/markdown.css";
import "katex/dist/katex.min.css";
import "prismjs/themes/prism-tomorrow.css";

/**
 * App shell (§13): persistent layout only — skip link, navbar, route outlet,
 * footer, global scroll restoration, and route focus management. No page-
 * specific effects live here.
 */
export function AppShell() {
  useScrollToTop();
  useRouteFocus();
  useWarmLazyRoutes();

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main-content"
        className="sr-only z-50 rounded-pill bg-footer px-4 py-2 text-page focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-on-dark"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
        <Suspense fallback={<PageLoading />}>
          <Outlet />
        </Suspense>
      </main>
      <PageTransition />
      <Footer />
    </div>
  );
}

export default AppShell;
