import { useMemo } from "react";
import type { PageSEO } from "@/config/pageData";
import {
  defaultOgImage,
  defaultKeywords,
  organizationJsonLd,
  siteName,
  twitterCard,
} from "@/config/seo";
import { wikiEnv } from "@/config/env";
import { canonicalUrl } from "@/shared/utils/url";
import type { MarkdownMeta } from "@/features/content/markdownService";

export interface PageHeadInput {
  /** Site-internal route path (never includes basePath). */
  path: string;
  title: string;
  seo: PageSEO;
  /** Optional Markdown frontmatter that can refine description/author/date. */
  frontmatter?: MarkdownMeta;
}

export interface HeadMetaTag {
  name?: string;
  property?: string;
  content: string;
}

export interface HeadModel {
  title: string;
  description: string;
  canonical: string;
  robots?: string;
  meta: HeadMetaTag[];
  jsonLd: Array<Record<string, unknown>>;
}

function asArray(value: PageSEO["jsonLd"]): Array<Record<string, unknown>> {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

/**
 * Compute the full head model for a route from PageData.seo + Markdown
 * frontmatter + wikiEnv (§17). Pure/serializable: it only derives data, it does
 * not touch the DOM. The <PageHead> component renders it via the SSR-safe head
 * manager so the tags appear in the prerendered HTML.
 */
export function usePageHead(input: PageHeadInput): HeadModel {
  const { path, seo, frontmatter } = input;

  return useMemo(() => {
    const description = frontmatter?.description ?? seo.description;
    const keywords = Array.from(
      new Set([
        ...seo.keywords,
        ...(frontmatter?.tags ?? []),
        ...defaultKeywords,
      ]),
    );
    const author = frontmatter?.author ?? wikiEnv.teamName;
    const ogType = seo.ogType ?? "website";
    const ogImage = seo.ogImage ?? defaultOgImage;
    const canonical = canonicalUrl(path);
    const title = seo.title;

    const meta: HeadMetaTag[] = [
      { name: "description", content: description },
      { name: "keywords", content: keywords.join(", ") },
      { name: "author", content: author },
      { property: "og:site_name", content: siteName },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: ogType },
      { property: "og:url", content: canonical },
      { property: "og:image", content: ogImage },
      { name: "twitter:card", content: twitterCard },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: ogImage },
    ];

    const pageJsonLd: Record<string, unknown> =
      ogType === "article"
        ? {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: frontmatter?.title ?? input.title,
            description,
            author: { "@type": "Person", name: author },
            ...(frontmatter?.date ? { datePublished: frontmatter.date } : {}),
            url: canonical,
            publisher: { "@type": "Organization", name: siteName },
          }
        : {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: title,
            description,
            url: canonical,
          };

    return {
      title,
      description,
      canonical,
      robots: seo.robots,
      meta,
      jsonLd: [organizationJsonLd, pageJsonLd, ...asArray(seo.jsonLd)],
    };
  }, [path, seo, frontmatter, input.title]);
}
