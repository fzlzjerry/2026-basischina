import { useRef, useState } from "react";
import type { PageCategory } from "@/config/pageData";
import {
  CategoryCover,
  CategoryLabel,
} from "@/shared/components/CategoryCover";
import { stickerStyleRaw } from "@/shared/styles/heal";
import { PawCorner } from "@/features/home/scene/Peekers";
import { ArticleBackToTop } from "./ArticleBackToTop";
import { ArticleBreadcrumbs } from "./ArticleBreadcrumbs";
import { ArticlePager } from "./ArticlePager";
import { ArticleReadingProgress } from "./ArticleReadingProgress";
import { ArticleRelatedLinks } from "./ArticleRelatedLinks";
import { ArticleTableOfContents } from "./ArticleTableOfContents";
import { useActiveHeading } from "./useActiveHeading";
import { useMarkdownEnhancements } from "./useMarkdownEnhancements";
import type { ProcessedMarkdown } from "./markdownService";

// Section cover illustrations keyed by category. Each entry preserves its
// source image's native dimensions for stable, proportional layout, and the
// category label plus the real page h1 always stay live HTML via CategoryCover:
// the art stays reusable and accessible, and no copy is baked into it.
//
// `variant` picks the masthead composition. `project` art is drawn to a 2:1
// safe zone, so its labels can sit inside the frame. The three section
// illustrations are near-4:3, drawn edge to edge and already carry their own
// hand-lettering, so they take the `plate` masthead: the artwork tipped into
// the page as the dominant object, printed onto the notebook grid past the
// article's own measure, never cropped, never written over.
//
// `artMargin` is the measured width of a source's flat, empty print margin, so
// that paper edge can dissolve into the page. wet-lab bleeds its drawing to
// every edge and engagement ships a real alpha channel, so neither sets one.
//
// `path` is a PUBLIC asset (resolved through the deploy base path at render),
// not a bundled import: MarkdownArticle is loaded eagerly by every route, so a
// static import would make vite-react-ssg preload every cover on every route.
type CoverConfig = {
  path: string;
  alt: string;
  width: number;
  height: number;
  variant?: "banner" | "plate";
  artMargin?: number;
};
const CATEGORY_COVER: Partial<Record<PageCategory, CoverConfig>> = {
  project: {
    path: "assets/project-cover.webp",
    alt: "A cat and dog mapping a pet-care project from need to testing",
    width: 1600,
    height: 800,
  },
  "wet-lab": {
    path: "assets/wet-lab-cover.jpg",
    alt: 'Two calico cats at a wet-lab bench of test tubes, a flask and a gel tray, under a speech bubble hand-lettered "Wet"',
    width: 1527,
    height: 1079,
    variant: "plate",
  },
  "dry-lab": {
    path: "assets/dry-lab-cover.webp",
    alt: 'Cats inside a retro computer desktop hand-lettered "Dry Lab": one bats at an error dialog while another naps beside a plotted line',
    width: 1600,
    height: 1132,
    variant: "plate",
    // Measured flat border: 5.0% at the narrowest (right) edge, so a 4.5%
    // dissolve still stops short of every drawn pixel.
    artMargin: 4.5,
  },
  "human-practices": {
    path: "assets/engagement-cover.webp",
    alt: 'Four calico cats among speech bubbles, loose notes and a bar chart, above hand-lettered "Engagement"',
    width: 1800,
    height: 1193,
    variant: "plate",
  },
};

interface MarkdownArticleProps {
  title: string;
  summary?: string;
  category: PageCategory;
  processed: ProcessedMarkdown;
  /** Stable key (route/content path) so enhancements re-run on navigation. */
  contentKey: string;
  pagePath: string;
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
  pagePath,
}: MarkdownArticleProps) {
  const articleRef = useRef<HTMLElement>(null);
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const activeHeading = useActiveHeading(processed.toc, contentKey);
  useMarkdownEnhancements(container, processed.hasMermaid, contentKey);

  const description = processed.meta.description ?? summary;
  const cover = CATEGORY_COVER[category];
  const heading = processed.meta.title ?? title;

  // Summary + update date. The `plate` masthead composes these itself — the
  // summary at the head of its margin, the date hand-noted at the foot — and
  // closes the header with its own full-spread rule; every other header keeps
  // them stacked under the h1 above the shared divider.
  const isPlate = cover?.variant === "plate";
  const date = processed.meta.date ? String(processed.meta.date) : undefined;
  const meta =
    description || date ? (
      <div className="space-y-2">
        {description ? (
          <p className="max-w-3xl text-lg text-ink-soft">{description}</p>
        ) : null}
        {date ? (
          <p className="text-sm text-ink-soft">
            Updated <time dateTime={date}>{date}</time>
          </p>
        ) : null}
      </div>
    ) : null;

  return (
    <div className="min-h-screen bg-page heal-grid">
      <ArticleReadingProgress articleRef={articleRef} />
      <article
        ref={articleRef}
        className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8"
      >
        <ArticleBreadcrumbs path={pagePath} />
        <header className="mb-8">
          {cover ? (
            <CategoryCover
              category={category}
              imagePath={cover.path}
              imageAlt={cover.alt}
              imageWidth={cover.width}
              imageHeight={cover.height}
              variant={cover.variant}
              artMargin={cover.artMargin}
              title={heading}
              summary={isPlate ? description : undefined}
              date={isPlate ? date : undefined}
            />
          ) : (
            <>
              <CategoryLabel category={category} className="mb-4" />
              <h1 className="pb-1 font-script text-[clamp(2.4rem,1.8rem+2.4vw,3.5rem)] font-bold leading-[1.05] text-balance text-ink">
                {heading}
              </h1>
            </>
          )}
          {!isPlate && meta ? <div className="mt-3">{meta}</div> : null}
          {/* Hand-ruled header divider: irregular ink dashes, not machine ones.
              `plate` draws its own across the wider masthead spread. */}
          {!isPlate ? (
            <div
              aria-hidden="true"
              className="heal-rule-dash mt-6 h-2 bg-sticker-ink/40"
            />
          ) : null}
        </header>

        <div className="mb-8 lg:hidden">
          <ArticleTableOfContents
            items={processed.toc}
            activeId={activeHeading}
            instanceId="toc-list-mobile"
            defaultOpen={false}
            compact
          />
        </div>

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
          <aside className="hidden lg:block">
            <div className="lg:sticky lg:top-24">
              <ArticleTableOfContents
                items={processed.toc}
                activeId={activeHeading}
                instanceId="toc-list-desktop"
              />
            </div>
          </aside>
        </div>
        <ArticleRelatedLinks paths={processed.meta.relatedPages} />
        <ArticlePager path={pagePath} />
      </article>
      <ArticleBackToTop articleRef={articleRef} />
    </div>
  );
}
