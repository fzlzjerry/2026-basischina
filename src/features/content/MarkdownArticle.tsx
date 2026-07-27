import { useState } from "react";
import type { PageCategory } from "@/config/pageData";
import {
  CategoryCover,
  CategoryLabel,
} from "@/shared/components/CategoryCover";
import { stickerStyleRaw } from "@/shared/styles/heal";
import { PawCorner } from "@/features/home/scene/Peekers";
import { ArticleTableOfContents } from "./ArticleTableOfContents";
import { useMarkdownEnhancements } from "./useMarkdownEnhancements";
import type { ProcessedMarkdown } from "./markdownService";

// Section cover illustrations keyed by category. Every image is a native 2:1
// member of the same hand-drawn series, composed with a quiet left title zone.
// The category label and real page h1 remain live HTML via CategoryCover: art
// stays reusable and accessible, while long mobile titles can flow below it.
//
// `path` is a PUBLIC asset (resolved through the deploy base path at render),
// not a bundled import: MarkdownArticle is loaded eagerly by every route, so a
// static import would make vite-react-ssg preload every cover on every route.
type CoverConfig = {
  path: string;
  alt: string;
  width: number;
  height: number;
};
const CATEGORY_COVER: Partial<Record<PageCategory, CoverConfig>> = {
  project: {
    path: "assets/project-cover.webp",
    alt: "A cat and dog mapping a pet-care project from need to testing",
    width: 1600,
    height: 800,
  },
  "wet-lab": {
    path: "assets/wet-lab-cover.webp",
    alt: "A cat and dog carrying out a careful wet-lab experiment",
    width: 1600,
    height: 800,
  },
  "dry-lab": {
    path: "assets/dry-lab-cover-v2.webp",
    alt: "A cat and dog collaborating on modeling, software, and hardware",
    width: 1600,
    height: 800,
  },
  "human-practices": {
    path: "assets/engagement-cover-v2.webp",
    alt: "A cat and dog building a community engagement board",
    width: 1600,
    height: 800,
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
  const cover = CATEGORY_COVER[category];
  const heading = processed.meta.title ?? title;

  return (
    <div className="min-h-screen bg-page heal-grid">
      <article className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-8">
          {cover ? (
            <CategoryCover
              category={category}
              imagePath={cover.path}
              imageAlt={cover.alt}
              imageWidth={cover.width}
              imageHeight={cover.height}
              title={heading}
            />
          ) : (
            <>
              <CategoryLabel category={category} className="mb-4" />
              <h1 className="pb-1 font-script text-[clamp(2.4rem,1.8rem+2.4vw,3.5rem)] font-bold leading-[1.05] text-balance text-ink">
                {heading}
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
