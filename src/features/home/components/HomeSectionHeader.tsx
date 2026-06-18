import type { ReactNode } from "react";

/**
 * Homepage section header grammar: a big left-aligned display headline with an
 * optional lede. Deliberately NO eyebrow label and NO ribbon — the hero keeps
 * the page's single eyebrow, and repeating little uppercase labels above every
 * section reads as scaffolding. The ribbon (`Title`) stays in use on content
 * pages; the homepage carries hierarchy through scale instead.
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
        {title}
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
