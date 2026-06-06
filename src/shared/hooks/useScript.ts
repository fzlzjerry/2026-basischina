import { useEffect, useState } from "react";

export type ScriptStatus = "idle" | "loading" | "ready" | "error";

/**
 * Load an external script on demand and report its status (§19 — used by the
 * molecule viewer to defer 3Dmol out of the main bundle). Scripts are cached by
 * src so multiple consumers share a single tag.
 */
export function useScript(src: string | null): ScriptStatus {
  const [status, setStatus] = useState<ScriptStatus>(src ? "loading" : "idle");

  useEffect(() => {
    if (!src || typeof document === "undefined") {
      setStatus("idle");
      return;
    }

    let element = document.querySelector<HTMLScriptElement>(
      `script[data-src="${src}"]`,
    );

    if (!element) {
      element = document.createElement("script");
      element.src = src;
      element.async = true;
      element.dataset.src = src;
      element.dataset.status = "loading";
      document.body.appendChild(element);
    }

    const setFromEvent = (event: Event) => {
      const next = event.type === "load" ? "ready" : "error";
      element?.setAttribute("data-status", next);
      setStatus(next);
    };

    const cached = element.getAttribute("data-status");
    if (cached === "ready" || cached === "error") {
      setStatus(cached);
    } else {
      element.addEventListener("load", setFromEvent);
      element.addEventListener("error", setFromEvent);
    }

    return () => {
      element?.removeEventListener("load", setFromEvent);
      element?.removeEventListener("error", setFromEvent);
    };
  }, [src]);

  return status;
}
