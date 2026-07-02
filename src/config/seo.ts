/**
 * Site-wide SEO defaults (§17).
 *
 * Per-page values from PageData.seo and Markdown frontmatter are layered on top
 * of these defaults by the usePageHead hook. Kept serializable (no React) so the
 * sitemap/validation scripts could reuse it if needed.
 */
import { wikiEnv } from "./env";
import { buildAssetUrl, buildCanonicalUrl } from "./envShared";

// Same token order as every page title's "· <team> <year> iGEM" suffix, so
// og:site_name and <title> read identically in social embeds.
export const siteName = `${wikiEnv.teamName} ${wikiEnv.teamYear} iGEM`;

/** Default social share image. Override per page via PageSEO.ogImage. */
export const defaultOgImage = buildAssetUrl(
  wikiEnv.basePath,
  "assets/og-default.png",
);

export const defaultKeywords: string[] = [
  "iGEM",
  wikiEnv.teamName,
  "synthetic biology",
  wikiEnv.teamYear,
];

export const twitterCard = "summary_large_image";

/** Organization JSON-LD injected on every page as a baseline entity. */
export const organizationJsonLd: Record<string, unknown> = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteName,
  url: buildCanonicalUrl(wikiEnv.siteUrl, "/"),
  logo: defaultOgImage,
};
