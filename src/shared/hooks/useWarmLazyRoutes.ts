import { useEffect } from "react";
import { pages } from "@/config/pages";

/**
 * After first paint, warm the route-level lazy chunks (Home/Team) during idle
 * time. The page-transition cover only applies at navigation commit, but the
 * data router awaits a lazy chunk *before* commit — so a cold chunk would leave
 * the old page visible and uncovered during the await, making the transition
 * feel dead. Warming the importers makes that await instant (ES module imports
 * are memoised, so react-router's later `lazy` resolves from cache).
 */
export function useWarmLazyRoutes(): void {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const warm = () => {
      for (const page of pages) {
        if (page.kind === "react") void page.importer();
      }
    };

    const ric = window.requestIdleCallback;
    if (typeof ric === "function") {
      const handle = ric(warm);
      return () => window.cancelIdleCallback?.(handle);
    }
    const handle = window.setTimeout(warm, 1200);
    return () => window.clearTimeout(handle);
  }, []);
}
