import { useMemo } from "react";
import type { PageSEO } from "@/config/pageData";
import {
  defaultOgImage,
  defaultOgImageAlt,
  defaultOgImageHeight,
  defaultOgImageWidth,
  defaultKeywords,
  organizationJsonLd,
  siteName,
  twitterCard,
} from "@/config/seo";
import { buildCanonicalUrl, wikiEnv } from "@/config/env";
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
 * og:image must be a full URL (crawlers do not resolve origin-relative
 * paths), so site-internal PageSEO.ogImage overrides are absolutized against
 * siteUrl the same way canonical URLs are built.
 */
function absoluteOgImage(value: string | undefined): string {
  if (!value) return defaultOgImage;
  if (/^https?:\/\//i.test(value)) return value;
  return buildCanonicalUrl(
    wikiEnv.siteUrl,
    value.startsWith("/") ? value : `/${value}`,
  );
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
    const ogImage = absoluteOgImage(seo.ogImage);
    const isDefaultOgImage = ogImage === defaultOgImage;
    const canonical = canonicalUrl(path);
    const title = seo.title;

    const meta: HeadMetaTag[] = [
      { name: "description", content: description },
      { name: "keywords", content: keywords.join(", ") },
      { name: "author", content: author },
      { property: "og:site_name", content: siteName },
      { property: "og:locale", content: "en_US" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: ogType },
      { property: "og:url", content: canonical },
      { property: "og:image", content: ogImage },
      // Dimensions + alt describe the default card only; a per-page override
      // supplies its own image and we cannot vouch for its size or content.
      ...(isDefaultOgImage
        ? [
            {
              property: "og:image:width",
              content: String(defaultOgImageWidth),
            },
            {
              property: "og:image:height",
              content: String(defaultOgImageHeight),
            },
            { property: "og:image:alt", content: defaultOgImageAlt },
          ]
        : []),
      { name: "twitter:card", content: twitterCard },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: ogImage },
      ...(isDefaultOgImage
        ? [{ name: "twitter:image:alt", content: defaultOgImageAlt }]
        : []),
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
