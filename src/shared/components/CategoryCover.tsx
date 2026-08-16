import type { CSSProperties } from "react";
import {
  pageCategoryMeta,
  type CategoryAccent,
} from "@/config/pageCategoryMeta";
import type { PageCategory } from "@/config/pageData";
import { stickerStyle, stickerStyleRaw } from "@/shared/styles/heal";
import { resolveAssetUrl } from "@/shared/utils/assetUrl";

// Literal class strings keep Tailwind v4's static class discovery reliable.
const LABEL_FILL: Record<CategoryAccent, string> = {
  teal: "bg-app-teal-soft",
  blue: "bg-app-blue-soft",
  purple: "bg-app-purple-soft",
  green: "bg-app-green-soft",
  peach: "bg-app-peach-soft",
  pink: "bg-app-pink-soft",
};

const LABEL_ICON: Record<CategoryAccent, string> = {
  teal: "text-app-teal-ink",
  blue: "text-app-blue-ink",
  purple: "text-app-purple-ink",
  green: "text-app-green-ink",
  peach: "text-app-peach-ink",
  pink: "text-app-pink-ink",
};

/** Ink of the hand-ruled margin line down a `plate` masthead. */
const RULE_STROKE: Record<CategoryAccent, string> = {
  teal: "bg-app-teal",
  blue: "bg-app-blue",
  purple: "bg-app-purple",
  green: "bg-app-green",
  peach: "bg-app-peach",
  pink: "bg-app-pink",
};

interface CategoryLabelProps {
  category: PageCategory;
  className?: string;
}

/**
 * Live, accessible section label. Keeping the wording in HTML avoids baking
 * duplicate or malformed text into the generated cover artwork.
 */
export function CategoryLabel({
  category,
  className = "",
}: CategoryLabelProps) {
  const { Icon: CategoryIcon, accent, label } = pageCategoryMeta[category];

  return (
    <span
      className={`heal-cutout inline-flex items-center gap-1.5 px-3 py-1 font-hand text-sm leading-none text-sticker-ink ${LABEL_FILL[accent]} ${className}`}
      style={stickerStyle(1)}
    >
      <CategoryIcon
        size={15}
        weight="duotone"
        className={LABEL_ICON[accent]}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}

interface CategoryCoverProps {
  category: PageCategory;
  imagePath: string;
  imageAlt: string;
  imageWidth: number;
  imageHeight: number;
  title: string;
  className?: string;
  /**
   * `banner` (default): artwork drawn to a 2:1 safe zone, so the chip and the
   * page title can sit inside the frame without hiding anything.
   * `plate`: artwork with no safe zone, tipped into the page at its native
   * ratio as the masthead's dominant object; the type is set as marginalia
   * beside it, so the illustration is never cropped and never carries copy.
   */
  variant?: "banner" | "plate";
  /**
   * `plate` only. Width of the source's flat, empty print margin as a
   * percentage, for sources that have one; the edge is then dissolved into the
   * page instead of stopping on a rectangle. Omit for artwork that bleeds its
   * drawing to the edge or that already carries a real alpha channel.
   */
  artMargin?: number;
  /** `plate` only: page summary, set under the title at the head of the margin. */
  summary?: string;
  /** `plate` only: last-updated date, hand-noted at the foot of the margin. */
  date?: string;
}

/**
 * Category masthead in two intentional compositions.
 *
 * `banner` keeps the live chip and title overlaid on 2:1 safe-zone artwork.
 *
 * `plate` is for the section illustrations that are near-4:3, drawn edge to
 * edge and already carrying their own hand-lettering. Those are treated as a
 * plate tipped into the notebook: the artwork is the masthead's dominant
 * object — oversized, tipped, and printed past the article's right measure
 * into the page margin with `multiply`, so the ruling and paper grain carry
 * through it. The live type is deliberately marginalia against it, ruled off
 * by a hand-drawn margin line in the section's own accent: chip and an
 * out-scaled title at the head, the update note at the foot. Art and type hold
 * separate grid tracks, so nothing is cropped, nothing is layered over the
 * drawing, and the two can never intersect. See `.heal-plate` in main.css.
 */
export function CategoryCover({
  category,
  imagePath,
  imageAlt,
  imageWidth,
  imageHeight,
  title,
  className = "",
  variant = "banner",
  artMargin,
  summary,
  date,
}: CategoryCoverProps) {
  if (variant === "plate") {
    const { accent } = pageCategoryMeta[category];

    return (
      <div className={`heal-plate ${className}`}>
        <div className="heal-plate-grid">
          {/* The page's margin line, hand-ruled in the section's accent. It
              spans the whole masthead, so the empty stretch between the title
              and the update note reads as measured margin, not as a gap. */}
          <span
            aria-hidden="true"
            className={`heal-plate-rule heal-rule-v w-2.5 ${RULE_STROKE[accent]}`}
          />

          {/* Head: only the chip and an out-scaled title, so the live heading
              carries the page rather than the lettering drawn into the art. */}
          <div className="heal-plate-head">
            <CategoryLabel category={category} className="mb-4" />
            <h1 className="text-balance pb-1 font-script text-[clamp(2.75rem,0.675rem+4.41vw,5rem)] font-bold leading-[0.92] text-ink">
              {title}
            </h1>
          </div>

          <img
            src={resolveAssetUrl(imagePath)}
            alt={imageAlt}
            width={imageWidth}
            height={imageHeight}
            className={`heal-plate-art heal-art-print block h-auto ${artMargin ? "heal-art-bleed" : ""}`}
            style={
              artMargin
                ? ({ "--heal-art-margin": `${artMargin}%` } as CSSProperties)
                : undefined
            }
            loading="eager"
            decoding="async"
          />

          {/* Foot: the annotation block hangs at the bottom of the margin,
              level with the foot of the plate, so the column reads as title,
              ruled silence, note — not as copy with space left over. */}
          {summary || date ? (
            <div className="heal-plate-foot">
              {summary ? (
                <p className="text-xl leading-relaxed text-ink-soft">
                  {summary}
                </p>
              ) : null}
              {date ? (
                <p className="mt-6 font-hand text-[1.05rem] leading-none text-ink-soft">
                  <span
                    aria-hidden="true"
                    className={`heal-rule mb-3 block h-2 w-14 ${RULE_STROKE[accent]}`}
                  />
                  Updated <time dateTime={date}>{date}</time>
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* Closes the masthead across the full spread — margin line to plate
            bleed — so the article column below reads as the narrower measure
            it is, rather than as more of the same block. */}
        <div
          aria-hidden="true"
          className="heal-plate-close heal-rule-dash mt-8 h-2 bg-sticker-ink/40"
        />
      </div>
    );
  }

  return (
    <div className={`relative mb-5 ${className}`}>
      <div className="relative aspect-[2/1] overflow-hidden rounded-2xl ring-1 ring-sticker-ink/10">
        <img
          src={resolveAssetUrl(imagePath)}
          alt={imageAlt}
          width={imageWidth}
          height={imageHeight}
          className="h-full w-full object-cover"
          loading="eager"
          decoding="async"
        />
        <CategoryLabel
          category={category}
          className="absolute left-3 top-3 z-10 sm:left-5 sm:top-5"
        />
      </div>
      <h1
        className="heal-cutout relative z-10 mt-4 inline-block max-w-full text-balance bg-surface px-5 py-1.5 font-script text-[clamp(1.8rem,1.35rem+1.8vw,3rem)] leading-[0.98] text-ink sm:absolute sm:bottom-5 sm:left-5 sm:mt-0 sm:max-w-[50%]"
        style={stickerStyleRaw(
          "-1deg",
          "14px 9px 16px 8px / 8px 16px 9px 14px",
        )}
      >
        {title}
      </h1>
    </div>
  );
}
