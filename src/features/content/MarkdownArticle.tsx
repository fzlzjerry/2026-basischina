import { useState } from "react";
import { Card } from "@/shared/components/Card";
import { ArticleTableOfContents } from "./ArticleTableOfContents";
import { useMarkdownEnhancements } from "./useMarkdownEnhancements";
import type { ProcessedMarkdown } from "./markdownService";

interface MarkdownArticleProps {
  title: string;
  summary?: string;
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
  processed,
  contentKey,
}: MarkdownArticleProps) {
  const [container, setContainer] = useState<HTMLElement | null>(null);
  useMarkdownEnhancements(container, processed.hasMermaid, contentKey);

  const description = processed.meta.description ?? summary;

  return (
    <article className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8 border-b-2 border-border pb-6">
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
