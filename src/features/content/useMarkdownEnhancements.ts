import { useEffect } from "react";

/**
 * Client-side DOM enhancements for rendered Markdown (§15.5).
 *
 * Runs only in the browser, after the article HTML is in the DOM:
 *   - syntax highlighting via Prism (dynamically imported, kept out of SSR)
 *   - Mermaid diagrams (dynamically imported only when the page has them)
 *   - copy-to-clipboard buttons on code blocks
 *
 * All listeners/buttons are cleaned up on unmount or content change.
 */
async function loadPrism() {
  // Seed a manual flag BEFORE Prism core evaluates (during the dynamic import
  // below) so it does not auto-highlight the whole document on load.
  (window as unknown as { Prism?: { manual?: boolean } }).Prism = {
    manual: true,
  };
  // Relative dynamic import -> Vite code-splits Prism + grammars into their own
  // chunk (a bare-specifier dynamic import would not be analyzable).
  const Prism = (await import("./prismLanguages")).default;
  return Prism;
}

function addCopyButtons(
  container: HTMLElement,
  register: (cleanup: () => void) => void,
): void {
  const blocks = container.querySelectorAll<HTMLPreElement>(
    'pre[class*="language-"]',
  );
  blocks.forEach((pre) => {
    if (pre.querySelector(".code-copy-button")) return;
    pre.classList.add("code-block");
    const button = document.createElement("button");
    button.type = "button";
    button.className = "code-copy-button";
    button.textContent = "Copy";
    button.setAttribute("aria-label", "Copy code to clipboard");

    const onClick = async () => {
      const code = pre.querySelector("code")?.textContent ?? "";
      try {
        await navigator.clipboard.writeText(code);
        button.textContent = "Copied!";
        window.setTimeout(() => {
          button.textContent = "Copy";
        }, 1500);
      } catch {
        button.textContent = "Failed";
      }
    };

    button.addEventListener("click", onClick);
    pre.appendChild(button);
    register(() => {
      button.removeEventListener("click", onClick);
      button.remove();
    });
  });
}

export function useMarkdownEnhancements(
  container: HTMLElement | null,
  hasMermaid: boolean,
  contentKey: string,
): void {
  useEffect(() => {
    if (!container || typeof window === "undefined") return;

    let disposed = false;
    const cleanups: Array<() => void> = [];

    async function enhance() {
      const prism = await loadPrism();
      if (disposed || !container) return;
      prism.highlightAllUnder(container);

      if (hasMermaid) {
        const mermaid = (await import("mermaid")).default;
        if (disposed || !container) return;
        const prefersReducedMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: "default",
          flowchart: { useMaxWidth: true },
          ...(prefersReducedMotion ? { fontFamily: "inherit" } : {}),
        });
        const nodes = Array.from(
          container.querySelectorAll<HTMLElement>(
            "pre.mermaid:not([data-processed])",
          ),
        );
        if (nodes.length > 0) {
          try {
            await mermaid.run({ nodes });
          } catch (error) {
            console.error("Mermaid render failed:", error);
          }
        }
      }

      if (!disposed && container) {
        addCopyButtons(container, (cleanup) => cleanups.push(cleanup));
      }
    }

    void enhance();

    return () => {
      disposed = true;
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [container, hasMermaid, contentKey]);
}
