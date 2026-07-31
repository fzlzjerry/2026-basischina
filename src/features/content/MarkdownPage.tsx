import { useLoaderData } from "react-router-dom";
import type { MarkdownPageConfig } from "@/config/pages";
import { PageHead } from "@/shared/components/PageHead";
import type { ProcessedMarkdown } from "./markdownService";
import { MarkdownArticle } from "./MarkdownArticle";
import "@/styles/markdown.css";
import "katex/dist/katex.min.css";
import "prismjs/themes/prism-tomorrow.css";

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
  const processed = useLoaderData() as ProcessedMarkdown;

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
