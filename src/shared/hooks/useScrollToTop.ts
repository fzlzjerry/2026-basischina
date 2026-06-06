import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Global scroll restoration (§13): scroll to the top on each route change,
 * unless the user has requested reduced motion (then jump instantly).
 */
export function useScrollToTop(): void {
  const { pathname } = useLocation();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: prefersReducedMotion ? "auto" : "instant",
    });
  }, [pathname]);
}
