import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function decodeHash(hash: string): string | undefined {
  const value = hash.replace(/^#/, "");
  if (!value) return undefined;

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/**
 * Global route scroll restoration (§13). Plain routes start at the top; hash
 * routes land on their target even when the lazy route content mounts after
 * the location changes.
 */
export function useScrollToTop(): void {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const behavior: ScrollBehavior = prefersReducedMotion ? "auto" : "instant";
    const targetId = decodeHash(hash);
    const scrollToTop = () => window.scrollTo({ top: 0, left: 0, behavior });

    if (!targetId) {
      scrollToTop();
      return;
    }

    let frame: number | undefined;
    let timeout: number | undefined;
    let observer: MutationObserver | undefined;
    let cancelled = false;

    const finish = () => {
      observer?.disconnect();
      observer = undefined;
      if (timeout !== undefined) {
        window.clearTimeout(timeout);
        timeout = undefined;
      }
    };

    const scheduleHashScroll = (): void => {
      if (frame !== undefined || !document.getElementById(targetId)) return;

      frame = window.requestAnimationFrame(() => {
        frame = undefined;
        if (cancelled) return;

        // Re-query inside the frame: hydration may replace the node that first
        // triggered the observer before the browser reaches the next paint.
        const target = document.getElementById(targetId);
        if (!target) return;
        target.scrollIntoView({ block: "start", behavior });
        finish();
      });
    };

    // Avoid retaining the previous route's scroll position while its lazy
    // content loads. Prerendered pages already contain the target, so preserve
    // the browser's native fragment position until the verified scroll below.
    if (!document.getElementById(targetId)) scrollToTop();
    const root = document.getElementById("main-content") ?? document.body;
    observer = new MutationObserver(scheduleHashScroll);
    observer.observe(root, { childList: true, subtree: true });
    scheduleHashScroll();
    timeout = window.setTimeout(finish, 5000);

    return () => {
      cancelled = true;
      if (frame !== undefined) window.cancelAnimationFrame(frame);
      finish();
    };
  }, [hash, pathname]);
}
