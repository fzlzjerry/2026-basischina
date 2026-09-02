import { useEffect, useRef, type RefObject } from "react";

interface ArticleReadingProgressProps {
  articleRef: RefObject<HTMLElement>;
}

export function ArticleReadingProgress({
  articleRef,
}: ArticleReadingProgressProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let frame: number | undefined;
    const update = () => {
      frame = undefined;
      const article = articleRef.current;
      const root = rootRef.current;
      const fill = fillRef.current;
      if (!article || !root || !fill) return;

      const navHeight =
        document
          .querySelector<HTMLElement>('[data-site-chrome="navbar"]')
          ?.getBoundingClientRect().height ?? 72;
      root.style.top = navHeight + "px";

      const rect = article.getBoundingClientRect();
      const start = window.scrollY + rect.top;
      const distance = Math.max(article.offsetHeight - window.innerHeight, 1);
      const value = Math.min(
        1,
        Math.max(0, (window.scrollY - start + navHeight) / distance),
      );
      fill.style.transform = "scaleX(" + value + ")";
    };
    const schedule = () => {
      if (frame === undefined) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(schedule);
    if (articleRef.current) observer?.observe(articleRef.current);

    return () => {
      if (frame !== undefined) window.cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [articleRef]);

  return (
    <div
      ref={rootRef}
      className="pointer-events-none fixed inset-x-0 z-30 h-1 bg-border-soft"
      aria-hidden="true"
      data-print-hide
    >
      <span
        ref={fillRef}
        className="block h-full origin-left bg-primary-deep"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}
