import type { ReactNode } from "react";

/**
 * Homepage section header grammar: a big left-aligned display headline with an
 * optional lede, underlined by a hand-drawn orange marker swash — the way a
 * section title gets a quick highlighter swipe in a real notebook. Deliberately
 * NO eyebrow label and NO ribbon — the hero keeps the page's single eyebrow,
 * and repeating little uppercase labels above every section reads as
 * scaffolding. The ribbon (`Title`) stays in use on content pages; the
 * homepage carries hierarchy through scale instead.
 *
 * The swash path carries a `js-swash` sentinel so section timelines can draw
 * it in with DrawSVG on reveal; with reduced motion (or no JS) the prerendered
 * stroke is already complete.
 */
interface HomeSectionHeaderProps {
  title: ReactNode;
  lede?: ReactNode;
  /** Extra classes on the wrapper (e.g. a `js-*` reveal sentinel). */
  className?: string;
  align?: "left" | "center";
}

export function HomeSectionHeader({
  title,
  lede,
  className = "",
  align = "left",
}: HomeSectionHeaderProps) {
  const centered = align === "center";
  return (
    <div className={`${centered ? "text-center" : "text-left"} ${className}`}>
      <h2 className="pb-1 font-script text-[clamp(2.6rem,1.7rem+3vw,4.25rem)] font-bold leading-[1.04] text-ink">
        {/* The inline-block wrapper shrink-wraps the rendered headline, so the
            swash below always spans exactly the title's ink — never stopping
            mid-word or overshooting a short wrapped line into empty grid. */}
        <span className="inline-block">
          {title}
          <svg
            aria-hidden="true"
            viewBox="0 0 220 12"
            preserveAspectRatio="none"
            className="mt-1 block h-3 w-full text-app-orange"
          >
            <path
              className="js-swash"
              d="M3 8.2 C 40 5.4 78 9.8 118 6.8 C 152 4.4 190 8.6 217 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="5.5"
              strokeLinecap="round"
            />
          </svg>
        </span>
      </h2>
      {lede ? (
        <p
          className={`mt-4 max-w-xl text-lg text-ink-soft ${centered ? "mx-auto" : ""}`}
        >
          {lede}
        </p>
      ) : null}
    </div>
  );
}
