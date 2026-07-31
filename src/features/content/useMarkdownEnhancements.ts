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

    const languageClass = Array.from(pre.classList).find((className) =>
      className.startsWith("language-"),
    );
    const language = languageClass?.slice("language-".length);
    const codeLabel = language ? `${language} code` : "code";
    button.setAttribute("aria-label", `Copy ${codeLabel} to clipboard`);

    const status = document.createElement("span");
    status.className = "sr-only";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    status.setAttribute("aria-atomic", "true");

    let resetTimer: number | undefined;
    let announcementFrame: number | undefined;

    const showFeedback = (visibleText: string, announcement: string) => {
      button.textContent = visibleText;
      status.textContent = "";
      if (announcementFrame !== undefined) {
        window.cancelAnimationFrame(announcementFrame);
      }
      announcementFrame = window.requestAnimationFrame(() => {
        status.textContent = announcement;
      });
      if (resetTimer !== undefined) {
        window.clearTimeout(resetTimer);
      }
      resetTimer = window.setTimeout(() => {
        button.textContent = "Copy";
      }, 1500);
    };

    const onClick = async () => {
      const code = pre.querySelector("code")?.textContent ?? "";
      try {
        await navigator.clipboard.writeText(code);
        showFeedback("Copied!", `${codeLabel} copied to clipboard.`);
      } catch {
        showFeedback("Failed", `${codeLabel} could not be copied.`);
      }
    };

    button.addEventListener("click", onClick);
    pre.appendChild(button);
    pre.appendChild(status);
    register(() => {
      button.removeEventListener("click", onClick);
      if (resetTimer !== undefined) window.clearTimeout(resetTimer);
      if (announcementFrame !== undefined) {
        window.cancelAnimationFrame(announcementFrame);
      }
      button.remove();
      status.remove();
    });
  });
}

function registerOverflowRegion(
  element: HTMLElement,
  label: string,
  register: (cleanup: () => void) => void,
): void {
  const originalAttributes = {
    ariaLabel: element.getAttribute("aria-label"),
    role: element.getAttribute("role"),
    tabIndex: element.getAttribute("tabindex"),
  };
  let active = true;

  const restoreAttribute = (
    name: "aria-label" | "role" | "tabindex",
    value: string | null,
  ) => {
    if (value === null) {
      element.removeAttribute(name);
    } else {
      element.setAttribute(name, value);
    }
  };

  const refresh = () => {
    if (!active) return;
    const isOverflowing =
      element.clientWidth > 0 &&
      element.scrollWidth > Math.ceil(element.clientWidth) + 1;

    element.classList.toggle("is-overflowing", isOverflowing);
    if (isOverflowing) {
      element.tabIndex = 0;
      element.setAttribute("role", "region");
      element.setAttribute("aria-label", `Scrollable ${label}`);
    } else {
      restoreAttribute("tabindex", originalAttributes.tabIndex);
      restoreAttribute("role", originalAttributes.role);
      restoreAttribute("aria-label", originalAttributes.ariaLabel);
    }
  };

  const frame = window.requestAnimationFrame(refresh);
  const resizeObserver =
    typeof ResizeObserver === "undefined"
      ? null
      : new ResizeObserver(() => refresh());
  resizeObserver?.observe(element);
  window.addEventListener("resize", refresh);
  void document.fonts.ready.then(refresh);

  register(() => {
    active = false;
    window.cancelAnimationFrame(frame);
    resizeObserver?.disconnect();
    window.removeEventListener("resize", refresh);
    element.classList.remove("is-overflowing");
    restoreAttribute("tabindex", originalAttributes.tabIndex);
    restoreAttribute("role", originalAttributes.role);
    restoreAttribute("aria-label", originalAttributes.ariaLabel);
  });
}

function enhanceHorizontalOverflow(
  container: HTMLElement,
  register: (cleanup: () => void) => void,
): void {
  container
    .querySelectorAll<HTMLPreElement>('pre[class*="language-"]')
    .forEach((pre) => {
      const languageClass = Array.from(pre.classList).find((className) =>
        className.startsWith("language-"),
      );
      const language = languageClass?.slice("language-".length);
      registerOverflowRegion(
        pre,
        language ? `${language} code block` : "code block",
        register,
      );
    });

  container
    .querySelectorAll<HTMLElement>(".katex-display")
    .forEach((equation) =>
      registerOverflowRegion(equation, "equation", register),
    );

  container.querySelectorAll<HTMLTableElement>("table").forEach((table) => {
    if (table.parentElement?.classList.contains("markdown-table-scroll")) {
      return;
    }

    const wrapper = document.createElement("div");
    wrapper.className = "markdown-table-scroll";
    table.before(wrapper);
    wrapper.appendChild(table);

    const caption = table.querySelector("caption")?.textContent?.trim();
    registerOverflowRegion(
      wrapper,
      caption ? `${caption} table` : "data table",
      register,
    );
    register(() => {
      if (wrapper.parentNode) {
        wrapper.replaceWith(table);
      }
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
        const rootStyles = window.getComputedStyle(document.documentElement);
        const token = (name: string) =>
          rootStyles.getPropertyValue(name).trim();
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: "base",
          flowchart: { useMaxWidth: true },
          themeVariables: {
            primaryColor: token("--color-primary-soft"),
            primaryBorderColor: token("--color-primary-deep"),
            primaryTextColor: token("--color-ink"),
            lineColor: token("--color-border"),
            secondaryColor: token("--color-surface"),
            tertiaryColor: token("--color-surface-2"),
            textColor: token("--color-ink-soft"),
            fontFamily: token("--font-body"),
            fontSize: "14px",
          },
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
        enhanceHorizontalOverflow(container, (cleanup) =>
          cleanups.push(cleanup),
        );
      }
    }

    void enhance();

    return () => {
      disposed = true;
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [container, hasMermaid, contentKey]);
}
