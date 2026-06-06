import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

/**
 * Route focus management (§23): on navigation, move keyboard focus to the main
 * content region so screen-reader and keyboard users land on the new page.
 * The initial render is skipped so we don't steal focus on first paint.
 */
export function useRouteFocus(targetId = "main-content"): void {
  const { pathname } = useLocation();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const main = document.getElementById(targetId);
    if (main) main.focus();
  }, [pathname, targetId]);
}
