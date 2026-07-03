import { useState } from "react";
import { pageCategoryMeta } from "@/config/pageCategoryMeta";
import type { CategoryAccent } from "@/config/pageCategoryMeta";
import type { PageCategory } from "@/config/pageData";
import { stickerStyle, stickerStyleRaw } from "@/shared/styles/heal";
import { resolveAssetUrl } from "@/shared/utils/assetUrl";
import { PawCorner } from "@/features/home/scene/Peekers";
import { ArticleTableOfContents } from "./ArticleTableOfContents";
import { useMarkdownEnhancements } from "./useMarkdownEnhancements";
import type { ProcessedMarkdown } from "./markdownService";

// Category-tinted chip surfaces. Literal class strings because Tailwind v4 only
// generates classes it can statically see (mirrors HighlightsSection's ACCENT).
const CHIP_FILL: Record<CategoryAccent, string> = {
  teal: "bg-app-teal-soft",
  blue: "bg-app-blue-soft",
  purple: "bg-app-purple-soft",
  green: "bg-app-green-soft",
  peach: "bg-app-peach-soft",
  pink: "bg-app-pink-soft",
};
const CHIP_ICON: Record<CategoryAccent, string> = {
  teal: "text-app-teal-ink",
  blue: "text-app-blue-ink",
  purple: "text-app-purple-ink",
  green: "text-app-green-ink",
  peach: "text-app-peach-ink",
  pink: "text-app-pink-ink",
};

// Section cover illustrations keyed by category. A cover REPLACES the category
// chip in the article header: the art already names its section (a baked-in
// wordmark), so a chip would just stack a redundant label. Two layouts, chosen
// per art by `variant`:
//   • "overlay" — the art carries a compact wordmark in one corner and has open
//     space elsewhere (dry-lab's retro window). We crop it to a 2:1 letterbox
//     and paste the page <h1> as a cream sticker in the OPEN corner, so type and
//     image read as one masthead.
//   • "cutout" — the art is a dense, self-titled, edge-to-edge panel that leaves
//     no clean corner for an overlay (engagement's notebook collage, "ENGAGEMENT"
//     hand-lettered across its base). Its exterior is die-cut to transparency, so
//     it sits whole on the page grid like a pasted sticker, and the page <h1>
//     follows BELOW it in normal flow (no collision with the baked-in wordmark).
// `path` is a PUBLIC asset (resolved through the deploy base path at render), not
// a bundled `import`: MarkdownArticle is loaded eagerly by every route, so a
// static import would make vite-react-ssg emit a `<link rel=preload as=image>`
// for the cover on ALL pages, not just the section's own. width/height are the
// asset's intrinsic size, set on the <img> to reserve layout height (no CLS).
// Extend to another section by adding a sibling entry.
type CoverConfig = {
  variant: "overlay" | "cutout";
  path: string;
  // Accessible name lives WITH the asset (not the category label) so a cover
  // whose baked-in wording differs from its category label can't silently
  // misdescribe itself.
  alt: string;
  width: number;
  height: number;
};
const CATEGORY_COVER: Partial<Record<PageCategory, CoverConfig>> = {
  "dry-lab": {
    variant: "overlay",
    path: "assets/dry-lab-cover.webp",
    alt: "Dry Lab",
    width: 1600,
    height: 1132,
  },
  "human-practices": {
    variant: "cutout",
    path: "assets/engagement-cover.webp",
    alt: "Engagement",
    width: 1800,
    height: 1193,
  },
};

interface MarkdownArticleProps {
  title: string;
  summary?: string;
  category: PageCategory;
  processed: ProcessedMarkdown;
  /** Stable key (route/content path) so enhancements re-run on navigation. */
  contentKey: string;
}

/**
 * Presentational article layout (§16), HEAL register. The page sits on the
 * lab-notebook grid: a Caveat page title, a sticker-cutout category chip, and
 * the sanitized Markdown rendered on an opaque sticker "page" so the prose keeps
 * its calm, high-contrast reading surface (the hand-lettering and grid stay in
 * the chrome, never behind body text). A collapsible TOC aside rides alongside;
 * DOM enhancements attach via the enhancement hook once the content mounts.
 */
export function MarkdownArticle({
  title,
  summary,
  category,
  processed,
  contentKey,
}: MarkdownArticleProps) {
  const [container, setContainer] = useState<HTMLElement | null>(null);
  useMarkdownEnhancements(container, processed.hasMermaid, contentKey);

  const description = processed.meta.description ?? summary;
  const { Icon: CategoryIcon, accent, label } = pageCategoryMeta[category];
  const cover = CATEGORY_COVER[category];

  return (
    <div className="min-h-screen bg-page heal-grid">
      <article className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-8">
          {cover?.variant === "overlay" ? (
            // Masthead: the cover is a full-width banner cropped to a clean 2:1
            // letterbox (object-cover keeps the "DRY LAB" wordmark and both cats
            // in frame), and the page title rides on it as a cream sticker label
            // overlapping the lower-left, so type and image read as one designed
            // header instead of a stacked image + title. cover.alt names the
            // section for screen readers; the overlapping <h1> is the real page
            // heading (not a duplicate). The aspect box reserves height (no CLS).
            <div className="relative mb-5">
              <div className="aspect-[2/1] overflow-hidden rounded-2xl ring-1 ring-sticker-ink/10">
                <img
                  src={resolveAssetUrl(cover.path)}
                  alt={cover.alt}
                  width={cover.width}
                  height={cover.height}
                  className="h-full w-full object-cover object-[50%_30%]"
                />
              </div>
              <h1
                className="heal-cutout absolute bottom-4 left-4 max-w-[85%] text-balance bg-surface px-5 py-1.5 font-script text-[clamp(1.9rem,1.5rem+1.8vw,3rem)] leading-none text-ink sm:bottom-6 sm:left-6"
                style={stickerStyleRaw(
                  "-1deg",
                  "14px 9px 16px 8px / 8px 16px 9px 14px",
                )}
              >
                {processed.meta.title ?? title}
              </h1>
            </div>
          ) : (
            <>
              {cover ? (
                // Cutout cover: the die-cut illustration sits whole on the page
                // grid (its transparent exterior lets the graph paper show
                // through, like a sticker pasted on the notebook), naming the
                // section in place of the chip. The page <h1> follows below.
                <div className="mb-6 w-full max-w-3xl">
                  <img
                    src={resolveAssetUrl(cover.path)}
                    alt={cover.alt}
                    width={cover.width}
                    height={cover.height}
                    className="h-auto w-full"
                  />
                </div>
              ) : (
                <span
                  className={`heal-cutout mb-4 inline-flex items-center gap-1.5 px-3 py-1 font-hand text-sm leading-none text-sticker-ink ${CHIP_FILL[accent]}`}
                  style={stickerStyle(1)}
                >
                  <CategoryIcon
                    size={15}
                    weight="duotone"
                    className={CHIP_ICON[accent]}
                    aria-hidden="true"
                  />
                  {label}
                </span>
              )}
              <h1 className="pb-1 font-script text-[clamp(2.4rem,1.8rem+2.4vw,3.5rem)] font-bold leading-[1.05] text-balance text-ink">
                {processed.meta.title ?? title}
              </h1>
            </>
          )}
          {description ? (
            <p className="mt-3 max-w-3xl text-lg text-ink-soft">
              {description}
            </p>
          ) : null}
          {processed.meta.date ? (
            <p className="mt-2 text-sm text-ink-soft">
              Updated{" "}
              <time dateTime={String(processed.meta.date)}>
                {String(processed.meta.date)}
              </time>
            </p>
          ) : null}
          {/* Hand-ruled header divider: irregular ink dashes, not machine ones. */}
          <div
            aria-hidden="true"
            className="heal-rule-dash mt-6 h-2 bg-sticker-ink/40"
          />
        </header>

        <div className="gap-10 lg:grid lg:grid-cols-[1fr_16rem]">
          <div
            className="heal-cutout min-w-0 bg-surface p-6 sm:p-8"
            style={stickerStyleRaw(
              "0deg",
              "18px 16px 18px 16px / 16px 18px 16px 18px",
            )}
          >
            <div
              ref={setContainer}
              className="markdown-body min-w-0"
              // Markdown is rendered with raw HTML disabled and sanitized when
              // enabled (§22), so the resulting HTML is safe to inject here.
              dangerouslySetInnerHTML={{ __html: processed.html }}
            />
            {/* A small mascot sign-off so the cat & dog IP survives onto content
                pages too (PRODUCT.md). Static teal paw; purely decorative. */}
            <div
              className="mt-16 flex flex-col items-center gap-3"
              aria-hidden="true"
            >
              <PawCorner className="h-10 w-10" />
              <span className="h-1 w-16 rounded-full bg-app-teal" />
            </div>
          </div>
          <aside className="mt-10 lg:mt-0">
            <div className="lg:sticky lg:top-24">
              <ArticleTableOfContents items={processed.toc} />
            </div>
          </aside>
        </div>
      </article>
    </div>
  );
}
