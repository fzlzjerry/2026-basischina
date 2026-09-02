import { CaretUp } from "@phosphor-icons/react";
import { useEffect, useState, type RefObject } from "react";
import { Icon } from "@/shared/components/Icon";

interface ArticleBackToTopProps {
  articleRef: RefObject<HTMLElement>;
}

export function ArticleBackToTop({ articleRef }: ArticleBackToTopProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let frame: number | undefined;

    const update = () => {
      frame = undefined;
      const articleTop = articleRef.current?.offsetTop ?? 0;
      const next = window.scrollY > articleTop + window.innerHeight;
      setVisible((current) => (current === next ? current : next));
    };
    const schedule = () => {
      if (frame === undefined) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      if (frame !== undefined) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [articleRef]);

  if (!visible) return null;

  const goToTop = () => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const main = document.getElementById("main-content");
    main?.focus({ preventScroll: true });
    window.scrollTo({
      top: articleRef.current?.offsetTop ?? 0,
      left: 0,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  };

  return (
    <button
      type="button"
      onClick={goToTop}
      className="heal-sticker fixed bottom-5 right-4 z-30 inline-flex min-h-11 items-center gap-2 bg-app-orange-soft px-4 py-2 font-hand text-sticker-ink shadow-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring sm:bottom-7 sm:right-7"
      data-print-hide
    >
      <Icon as={CaretUp} weight="bold" />
      Back to top
    </button>
  );
}
