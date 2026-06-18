import { useState } from "react";
import { pageCategoryMeta } from "@/config/pageCategoryMeta";
import type { CategoryAccent } from "@/config/pageCategoryMeta";
import type { PageCategory } from "@/config/pageData";
import { Card } from "@/shared/components/Card";
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

interface MarkdownArticleProps {
  title: string;
  summary?: string;
  category: PageCategory;
  processed: ProcessedMarkdown;
  /** Stable key (route/content path) so enhancements re-run on navigation. */
  contentKey: string;
}

/**
 * Presentational article layout (§16): the single page <h1>, optional lead, a
 * collapsible TOC aside, and the sanitized Markdown HTML. DOM enhancements are
 * attached via the enhancement hook once the content element mounts.
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

  return (
    <article className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8 border-b-2 border-border pb-6">
        <span
          className={`mb-3 inline-flex items-center gap-1.5 rounded-min px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-ink ${CHIP_FILL[accent]}`}
        >
          <CategoryIcon
            size={14}
            weight="duotone"
            className={CHIP_ICON[accent]}
            aria-hidden="true"
          />
          {label}
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          {processed.meta.title ?? title}
        </h1>
        {description ? (
          <p className="mt-3 max-w-3xl text-lg text-ink-soft">{description}</p>
        ) : null}
        {processed.meta.date ? (
          <p className="mt-2 text-sm text-ink-secondary">
            Updated{" "}
            <time dateTime={String(processed.meta.date)}>
              {String(processed.meta.date)}
            </time>
          </p>
        ) : null}
      </header>

      <div className="gap-10 lg:grid lg:grid-cols-[1fr_16rem]">
        <Card variant="plain" className="min-w-0">
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
        </Card>
        <aside className="mt-10 lg:mt-0">
          <div className="lg:sticky lg:top-24">
            <ArticleTableOfContents items={processed.toc} />
          </div>
        </aside>
      </div>
    </article>
  );
}
