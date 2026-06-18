import { useMemo } from "react";
import type { MarkdownPageConfig } from "@/config/pages";
import { PageHead } from "@/shared/components/PageHead";
import { getMarkdown } from "./markdownLoader";
import { processMarkdown } from "./markdownService";
import { MarkdownArticle } from "./MarkdownArticle";

interface MarkdownPageProps {
  page: MarkdownPageConfig;
}

/**
 * Orchestrates a Markdown route (§16): loads the raw Markdown by contentPath,
 * processes it, sets head metadata from page config + frontmatter, and renders
 * the article. Synchronous load/processing means the article HTML is present in
 * the build-time prerendered output, not just after hydration.
 */
export function MarkdownPage({ page }: MarkdownPageProps) {
  const processed = useMemo(
    () => processMarkdown(getMarkdown(page.contentPath)),
    [page.contentPath],
  );

  return (
    <>
      <PageHead
        path={page.path}
        title={page.title}
        seo={page.seo}
        frontmatter={processed.meta}
      />
      <MarkdownArticle
        title={page.title}
        summary={page.summary}
        category={page.category}
        processed={processed}
        contentKey={page.contentPath}
      />
    </>
  );
}
